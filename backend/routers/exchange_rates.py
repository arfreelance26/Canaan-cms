from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db
import auth

router = APIRouter()

@router.get("/", response_model=schemas.CustomsExchangeRate)
def get_exchange_rate(db: Session = Depends(get_db)):
    db_rate = db.query(models.CustomsExchangeRate).first()
    if not db_rate:
        # Create a default one if it doesn't exist
        db_rate = models.CustomsExchangeRate(usd="", aed="", gbp="", eur="")
        db.add(db_rate)
        db.commit()
        db.refresh(db_rate)
    return db_rate

@router.put("/", response_model=schemas.CustomsExchangeRate)
def update_exchange_rate(rate: schemas.CustomsExchangeRateCreate, db: Session = Depends(get_db), current_user: models.AdminUser = Depends(auth.get_current_user)):
    db_rate = db.query(models.CustomsExchangeRate).first()
    if not db_rate:
        db_rate = models.CustomsExchangeRate(**rate.model_dump())
        db.add(db_rate)
    else:
        for key, value in rate.model_dump().items():
            setattr(db_rate, key, value)
    db.commit()
    db.refresh(db_rate)
    return db_rate
