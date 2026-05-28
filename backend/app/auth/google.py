import logging
from httpx import AsyncClient
from app.config import settings

logger = logging.getLogger(__name__)


async def verify_google_id_token(id_token: str) -> dict | None:
    try:
        async with AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
            )
            if response.status_code == 200:
                data = response.json()
                if data.get("aud") == settings.GOOGLE_CLIENT_ID:
                    return data
    except Exception as e:
        logger.error(f"Google token verify error: {e}")
    return None


async def get_google_user_info(access_token: str) -> dict | None:
    try:
        async with AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        logger.error(f"Google user info error: {e}")
    return None
