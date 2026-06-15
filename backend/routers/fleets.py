from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db
import auth
from utils import compress_image

router = APIRouter()

@router.get("/", response_model=List[schemas.Fleet])
def read_fleets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Fleet).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.Fleet)
def create_fleet(fleet: schemas.FleetCreate, db: Session = Depends(get_db), current_user: models.AdminUser = Depends(auth.get_current_user)):
    db_fleet = models.Fleet(**fleet.model_dump())
    db.add(db_fleet)
    db.commit()
    db.refresh(db_fleet)
    return db_fleet

@router.put("/{fleet_id}", response_model=schemas.Fleet)
def update_fleet(fleet_id: int, fleet: schemas.FleetCreate, db: Session = Depends(get_db), current_user: models.AdminUser = Depends(auth.get_current_user)):
    db_fleet = db.query(models.Fleet).filter(models.Fleet.id == fleet_id).first()
    if not db_fleet:
        raise HTTPException(status_code=404, detail="Fleet not found")
    for key, value in fleet.model_dump().items():
        setattr(db_fleet, key, value)
    db.commit()
    db.refresh(db_fleet)
    return db_fleet

@router.delete("/{fleet_id}")
def delete_fleet(fleet_id: int, db: Session = Depends(get_db), current_user: models.AdminUser = Depends(auth.get_current_user)):
    db_fleet = db.query(models.Fleet).filter(models.Fleet.id == fleet_id).first()
    if not db_fleet:
        raise HTTPException(status_code=404, detail="Fleet not found")
    db.delete(db_fleet)
    db.commit()
    return {"ok": True}

@router.post("/{fleet_id}/image")
async def upload_fleet_image(fleet_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.AdminUser = Depends(auth.get_current_user)):
    db_fleet = db.query(models.Fleet).filter(models.Fleet.id == fleet_id).first()
    if not db_fleet:
        raise HTTPException(status_code=404, detail="Fleet not found")
    contents = await file.read()
    if len(contents) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum 20MB.")
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only images allowed.")
    contents = compress_image(contents)
    db_fleet.image_blob = contents
    db.commit()
    return {"ok": True}

@router.get("/{fleet_id}/image")
def get_fleet_image(fleet_id: int, db: Session = Depends(get_db)):
    db_fleet = db.query(models.Fleet).filter(models.Fleet.id == fleet_id).first()
    if not db_fleet or not db_fleet.image_blob:
        raise HTTPException(status_code=404, detail="Image not found")
    return Response(content=db_fleet.image_blob, media_type="image/jpeg")
