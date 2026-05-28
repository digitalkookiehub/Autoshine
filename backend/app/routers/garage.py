from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from app.models.vehicle import UserVehicle
from app.models.booking import Booking
from app.schemas.vehicle import CreateVehicleRequest, UpdateVehicleRequest, VehicleResponse
from app.schemas.booking import BookingResponse
from app.exceptions import NotFoundError, ForbiddenError

router = APIRouter(prefix="/garage", tags=["garage"])


@router.get("", response_model=List[VehicleResponse])
def list_vehicles(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(UserVehicle).filter(UserVehicle.user_id == current_user.id).all()


@router.post("", response_model=VehicleResponse, status_code=201)
def add_vehicle(
    req: CreateVehicleRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    vehicle = UserVehicle(user_id=current_user.id, **req.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: int,
    req: UpdateVehicleRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    vehicle = db.query(UserVehicle).filter(UserVehicle.id == vehicle_id).first()
    if not vehicle:
        raise NotFoundError("Vehicle")
    if vehicle.user_id != current_user.id:
        raise ForbiddenError("Not your vehicle")
    for field, value in req.model_dump(exclude_none=True).items():
        setattr(vehicle, field, value)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.delete("/{vehicle_id}")
def remove_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    vehicle = db.query(UserVehicle).filter(UserVehicle.id == vehicle_id).first()
    if not vehicle:
        raise NotFoundError("Vehicle")
    if vehicle.user_id != current_user.id:
        raise ForbiddenError("Not your vehicle")
    db.delete(vehicle)
    db.commit()
    return {"message": "Vehicle removed"}


@router.get("/{vehicle_id}/history", response_model=List[BookingResponse])
def vehicle_history(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    vehicle = db.query(UserVehicle).filter(UserVehicle.id == vehicle_id).first()
    if not vehicle or vehicle.user_id != current_user.id:
        raise NotFoundError("Vehicle")
    return (
        db.query(Booking)
        .filter(Booking.vehicle_id == vehicle_id)
        .order_by(Booking.created_at.desc())
        .all()
    )
