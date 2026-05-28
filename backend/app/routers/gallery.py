from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_user, get_current_admin
from app.models.gallery import GalleryItem
from app.schemas.gallery import GalleryItemResponse, CreateGalleryItemRequest
from app.exceptions import NotFoundError

router = APIRouter(prefix="/gallery", tags=["gallery"])


@router.get("", response_model=List[GalleryItemResponse])
def list_gallery(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return db.query(GalleryItem).order_by(GalleryItem.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/featured", response_model=List[GalleryItemResponse])
def featured_gallery(db: Session = Depends(get_db)):
    return (
        db.query(GalleryItem)
        .filter(GalleryItem.is_featured == True)
        .order_by(GalleryItem.created_at.desc())
        .limit(8)
        .all()
    )


@router.post("", response_model=GalleryItemResponse, status_code=201)
def create_gallery_item(
    req: CreateGalleryItemRequest,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    item = GalleryItem(**req.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.post("/{item_id}/like")
def like_item(item_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    item = db.query(GalleryItem).filter(GalleryItem.id == item_id).first()
    if not item:
        raise NotFoundError("Gallery item")
    item.likes_count += 1
    db.commit()
    return {"likes_count": item.likes_count}
