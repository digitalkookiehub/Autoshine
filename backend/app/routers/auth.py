import secrets
import logging
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.auth.jwt import create_access_token, create_refresh_token, decode_token
from app.auth.otp import create_otp, verify_otp, send_otp_sms
from app.auth.google import verify_google_id_token
from app.models.user import User, OAuthAccount, RefreshToken, UserRole
from app.schemas.auth import (
    SendOtpRequest, VerifyOtpRequest, GoogleLoginRequest,
    RefreshTokenRequest, UpdateProfileRequest, TokenResponse, UserResponse,
)
from app.exceptions import UnauthorizedError, ValidationError
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])


def _create_token_pair(user: User, db: Session) -> TokenResponse:
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token_str = create_refresh_token({"sub": str(user.id)})
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_token = RefreshToken(user_id=user.id, token=refresh_token_str, expires_at=expires_at)
    db.add(db_token)
    db.commit()
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_str,
        user=UserResponse.model_validate(user),
    )


@router.post("/send-otp")
def send_otp(req: SendOtpRequest, db: Session = Depends(get_db)):
    phone = req.phone_number.strip()
    if not phone.startswith("+"):
        phone = "+91" + phone.lstrip("0")
    code = create_otp(db, phone)
    send_otp_sms(phone, code)
    logger.info(f"OTP for {phone}: {code}")
    return {"message": "OTP sent", "debug_code": code}


@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp_endpoint(req: VerifyOtpRequest, db: Session = Depends(get_db)):
    phone = req.phone_number.strip()
    if not phone.startswith("+"):
        phone = "+91" + phone.lstrip("0")
    if not verify_otp(db, phone, req.code):
        raise ValidationError("Invalid or expired OTP")

    user = db.query(User).filter(User.phone_number == phone).first()
    is_new = False
    if not user:
        user = User(
            phone_number=phone,
            role=UserRole.customer,
            referral_code=secrets.token_hex(6).upper(),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        is_new = True

    tokens = _create_token_pair(user, db)
    tokens.is_new_user = is_new
    return tokens


@router.post("/google", response_model=TokenResponse)
async def google_login(req: GoogleLoginRequest, db: Session = Depends(get_db)):
    user_info = await verify_google_id_token(req.id_token)
    if not user_info:
        raise UnauthorizedError("Invalid Google token")

    google_id = user_info.get("sub")
    email = user_info.get("email")
    name = user_info.get("name")
    picture = user_info.get("picture")

    oauth = db.query(OAuthAccount).filter(
        OAuthAccount.provider == "google",
        OAuthAccount.provider_user_id == google_id,
    ).first()

    is_new = False
    if oauth:
        user = oauth.user
    else:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                full_name=name,
                avatar_url=picture,
                role=UserRole.customer,
                referral_code=secrets.token_hex(6).upper(),
            )
            db.add(user)
            db.flush()
            is_new = True

        oauth = OAuthAccount(
            user_id=user.id,
            provider="google",
            provider_user_id=google_id,
        )
        db.add(oauth)
        db.commit()
        db.refresh(user)

    tokens = _create_token_pair(user, db)
    tokens.is_new_user = is_new
    return tokens


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise UnauthorizedError("Invalid refresh token")

    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == req.refresh_token,
        RefreshToken.revoked == False,
    ).first()
    if not db_token:
        raise UnauthorizedError("Token revoked or not found")

    db_token.revoked = True
    db.flush()

    user = db.query(User).filter(User.id == int(payload["sub"]), User.is_active == True).first()
    if not user:
        raise UnauthorizedError("User not found")

    return _create_token_pair(user, db)


@router.post("/logout")
def logout(token: str = Depends(get_current_user), db: Session = Depends(get_db)):
    return {"message": "Logged out"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_me(
    req: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if req.full_name is not None:
        current_user.full_name = req.full_name
    if req.email is not None:
        current_user.email = req.email
    if req.avatar_url is not None:
        current_user.avatar_url = req.avatar_url
    if req.expo_push_token is not None:
        current_user.expo_push_token = req.expo_push_token
    db.commit()
    db.refresh(current_user)
    return current_user
