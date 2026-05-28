import logging
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.database import get_db
from app.dependencies import get_current_user, get_current_admin
from app.models.service import Service, ServiceCategory, ServiceAddon
from app.schemas.service import (
    ServiceResponse, ServiceCategoryResponse, CreateServiceRequest,
    UpdateServiceRequest, CreateCategoryRequest, ServiceAddonResponse,
)
from app.exceptions import NotFoundError

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/services", tags=["services"])
category_router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=List[ServiceResponse])
def list_services(
    category_id: Optional[int] = None,
    featured_only: bool = False,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Service).options(joinedload(Service.category), joinedload(Service.addons))
    q = q.filter(Service.is_active == True)
    if category_id:
        q = q.filter(Service.category_id == category_id)
    if featured_only:
        q = q.filter(Service.is_featured == True)
    return q.order_by(Service.display_order, Service.id).all()


@router.get("/featured", response_model=List[ServiceResponse])
def featured_services(db: Session = Depends(get_db)):
    return (
        db.query(Service)
        .options(joinedload(Service.category), joinedload(Service.addons))
        .filter(Service.is_active == True, Service.is_featured == True)
        .order_by(Service.display_order)
        .limit(6)
        .all()
    )


@router.get("/{service_id}", response_model=ServiceResponse)
def get_service(service_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    service = (
        db.query(Service)
        .options(joinedload(Service.category), joinedload(Service.addons))
        .filter(Service.id == service_id)
        .first()
    )
    if not service:
        raise NotFoundError("Service")
    return service


@router.post("", response_model=ServiceResponse, status_code=201)
def create_service(
    req: CreateServiceRequest,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    service = Service(**req.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@router.put("/{service_id}", response_model=ServiceResponse)
def update_service(
    service_id: int,
    req: UpdateServiceRequest,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise NotFoundError("Service")
    for field, value in req.model_dump(exclude_none=True).items():
        setattr(service, field, value)
    db.commit()
    db.refresh(service)
    return service


@router.delete("/{service_id}")
def deactivate_service(
    service_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise NotFoundError("Service")
    service.is_active = False
    db.commit()
    return {"message": "Service deactivated"}


@category_router.get("", response_model=List[ServiceCategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return db.query(ServiceCategory).filter(ServiceCategory.is_active == True).order_by(ServiceCategory.display_order).all()


@category_router.post("", response_model=ServiceCategoryResponse, status_code=201)
def create_category(
    req: CreateCategoryRequest,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    cat = ServiceCategory(**req.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat
