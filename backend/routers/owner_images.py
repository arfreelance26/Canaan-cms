from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response
from sqlalchemy.orm import Session
import models, schemas
from database import get_db
import auth
from utils import compress_image

router = APIRouter()

@router.get("/", response_model=schemas.OwnerImage)
def get_owner_image(db: Session = Depends(get_db)):
    db_image = db.query(models.OwnerImage).first()
    if not db_image:
        db_image = models.OwnerImage()
        db.add(db_image)
        db.commit()
        db.refresh(db_image)
    return db_image

@router.post("/content")
async def upload_owner_image(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.AdminUser = Depends(auth.get_current_user)):
    db_image = db.query(models.OwnerImage).first()
    if not db_image:
        db_image = models.OwnerImage()
        db.add(db_image)
        db.commit()
        db.refresh(db_image)

    contents = await file.read()
    if len(contents) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum 20MB.")
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only images allowed.")
    
    contents = compress_image(contents)
    
    db_image.image_blob = contents
    db.commit()
    return {"ok": True}

@router.get("/content")
def get_owner_image_content(db: Session = Depends(get_db)):
    db_image = db.query(models.OwnerImage).first()
    if not db_image or not db_image.image_blob:
        raise HTTPException(status_code=404, detail="Image not found")
    return Response(content=db_image.image_blob, media_type="image/jpeg")
