import logging
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user, get_current_admin
from app.models.studio import StudioSettings
from app.utils.cloudinary_upload import upload_image

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/studio", tags=["studio"])


def _get_or_create(db: Session) -> StudioSettings:
    settings = db.query(StudioSettings).filter(StudioSettings.id == 1).first()
    if not settings:
        settings = StudioSettings(id=1, name="Autoshine Studio")
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def _serialize(s: StudioSettings) -> dict:
    return {
        "name": s.name,
        "tagline": s.tagline,
        "logo_url": s.logo_url,
        "phone": s.phone,
        "address": s.address,
        "email": s.email,
    }


@router.get("")
def get_studio(db: Session = Depends(get_db)):
    return _serialize(_get_or_create(db))


@router.put("")
def update_studio(req: dict, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    s = _get_or_create(db)
    allowed = {"name", "tagline", "phone", "address", "email"}
    for key, value in req.items():
        if key in allowed:
            setattr(s, key, value)
    db.commit()
    db.refresh(s)
    return _serialize(s)


@router.post("/logo")
def upload_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    content = file.file.read()
    url = upload_image(content, folder="autoshine/studio")
    if not url:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="Logo upload failed. Check Cloudinary config.")
    s = _get_or_create(db)
    s.logo_url = url
    db.commit()
    return {"logo_url": url}
