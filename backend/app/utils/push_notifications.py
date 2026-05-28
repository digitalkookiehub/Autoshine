import logging
from app.config import settings

logger = logging.getLogger(__name__)


def send_push_notification(expo_push_token: str, title: str, body: str, data: dict | None = None) -> bool:
    if not expo_push_token or not expo_push_token.startswith("ExponentPushToken"):
        return False
    try:
        from exponent_server_sdk import PushClient, PushMessage
        PushClient().publish(
            PushMessage(
                to=expo_push_token,
                title=title,
                body=body,
                data=data or {},
                sound="default",
            )
        )
        return True
    except Exception as e:
        logger.error(f"Push notification failed: {e}")
        return False


def send_push_to_user(db, user_id: int, title: str, body: str, data: dict | None = None) -> bool:
    from app.models.user import User
    user = db.query(User).filter(User.id == user_id).first()
    if user and user.expo_push_token:
        return send_push_notification(user.expo_push_token, title, body, data)
    return False
