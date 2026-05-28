import random
import string
import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.config import settings
from app.exceptions import RateLimitError

logger = logging.getLogger(__name__)


def generate_otp_code() -> str:
    return "".join(random.choices(string.digits, k=6))


def check_otp_rate_limit(db: Session, phone_number: str) -> None:
    from app.models.user import OTPCode
    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    recent_count = (
        db.query(OTPCode)
        .filter(OTPCode.phone_number == phone_number, OTPCode.created_at >= one_hour_ago)
        .count()
    )
    if recent_count >= settings.OTP_MAX_REQUESTS_PER_HOUR:
        raise RateLimitError("Too many OTP requests. Try again in an hour.")


def create_otp(db: Session, phone_number: str) -> str:
    from app.models.user import OTPCode
    check_otp_rate_limit(db, phone_number)
    code = generate_otp_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    otp = OTPCode(phone_number=phone_number, code=code, expires_at=expires_at)
    db.add(otp)
    db.commit()
    return code


def verify_otp(db: Session, phone_number: str, code: str) -> bool:
    from app.models.user import OTPCode
    now = datetime.now(timezone.utc)
    otp = (
        db.query(OTPCode)
        .filter(
            OTPCode.phone_number == phone_number,
            OTPCode.code == code,
            OTPCode.is_used == False,
            OTPCode.expires_at > now,
        )
        .order_by(OTPCode.created_at.desc())
        .first()
    )
    if not otp:
        return False
    otp.is_used = True
    db.commit()
    return True


def send_otp_sms(phone_number: str, code: str) -> bool:
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_PHONE_NUMBER:
        logger.warning(f"Twilio not fully configured — OTP for {phone_number}: {code}")
        return True
    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(
            body=f"Your Autoshine Studio code: {code}. Valid {settings.OTP_EXPIRE_MINUTES} min.",
            from_=settings.TWILIO_PHONE_NUMBER,
            to=phone_number,
        )
        return True
    except Exception as e:
        logger.error(f"Failed to send OTP SMS to {phone_number}: {e}")
        return False
