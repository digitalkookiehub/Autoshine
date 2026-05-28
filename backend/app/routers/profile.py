from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/referrals")
def referral_stats(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    referred = db.query(User).filter(User.referred_by_id == current_user.id).count()
    return {
        "referral_code": current_user.referral_code,
        "total_referrals": referred,
        "points_earned": referred * 100,
    }


@router.post("/referrals/share")
def generate_share_link(current_user=Depends(get_current_user)):
    link = f"https://autoshine.app/join?ref={current_user.referral_code}"
    return {"link": link, "code": current_user.referral_code}
