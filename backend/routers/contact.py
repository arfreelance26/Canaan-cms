from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db
import auth
from limiter import limiter

router = APIRouter()

@router.post("/", response_model=schemas.ContactMessage)
@limiter.limit("5/minute")
def submit_contact_message(request: Request, payload: schemas.ContactMessageCreate, db: Session = Depends(get_db)):
    db_message = models.ContactMessage(**payload.model_dump())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@router.get("/", response_model=List[schemas.ContactMessage])
def list_contact_messages(db: Session = Depends(get_db), current_user: models.AdminUser = Depends(auth.get_current_user)):
    return db.query(models.ContactMessage).order_by(models.ContactMessage.created_at.desc()).all()

@router.post("/bulk-delete")
def bulk_delete_contact_messages(payload: schemas.BulkDeleteRequest, db: Session = Depends(get_db), current_user: models.AdminUser = Depends(auth.get_current_user)):
    db.query(models.ContactMessage).filter(models.ContactMessage.id.in_(payload.ids)).delete(synchronize_session=False)
    db.commit()
    return {"ok": True}

@router.put("/{message_id}/read", response_model=schemas.ContactMessage)
def mark_message_read(message_id: int, db: Session = Depends(get_db), current_user: models.AdminUser = Depends(auth.get_current_user)):
    db_message = db.query(models.ContactMessage).filter(models.ContactMessage.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")
    db_message.is_read = True
    db.commit()
    db.refresh(db_message)
    return db_message

@router.delete("/{message_id}")
def delete_contact_message(message_id: int, db: Session = Depends(get_db), current_user: models.AdminUser = Depends(auth.get_current_user)):
    db_message = db.query(models.ContactMessage).filter(models.ContactMessage.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(db_message)
    db.commit()
    return {"ok": True}
