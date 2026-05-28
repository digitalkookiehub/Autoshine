import logging
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.jwt import decode_token
from app.exceptions import UnauthorizedError, ForbiddenError

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/verify-otp", auto_error=False)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    from app.models.user import User
    if not token:
        raise UnauthorizedError("No token provided")

    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise UnauthorizedError("Invalid or expired token")

    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedError("Invalid token payload")

    user = db.query(User).filter(User.id == int(user_id), User.is_active == True).first()
    if not user:
        raise UnauthorizedError("User not found or inactive")

    return user


def get_current_admin(current_user=Depends(get_current_user)):
    from app.models.user import UserRole
    if current_user.role != UserRole.admin:
        raise ForbiddenError("Admin access required")
    return current_user


def get_current_staff_or_admin(current_user=Depends(get_current_user)):
    from app.models.user import UserRole
    if current_user.role not in [UserRole.admin, UserRole.staff]:
        raise ForbiddenError("Staff or admin access required")
    return current_user
