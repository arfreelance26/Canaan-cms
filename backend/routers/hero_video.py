from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request, Response
from sqlalchemy.orm import Session
import models, schemas
from database import get_db
import auth

router = APIRouter()

MAX_VIDEO_SIZE = 40 * 1024 * 1024

@router.get("/", response_model=schemas.HeroVideo)
def get_hero_video(db: Session = Depends(get_db)):
    db_video = db.query(models.HeroVideo).first()
    if not db_video:
        db_video = models.HeroVideo()
        db.add(db_video)
        db.commit()
        db.refresh(db_video)
    return db_video

@router.post("/content")
async def upload_hero_video(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.AdminUser = Depends(auth.get_current_user)):
    if file.content_type != "video/mp4":
        raise HTTPException(status_code=400, detail="Invalid file type. Only MP4 videos allowed.")

    contents = await file.read()
    if len(contents) > MAX_VIDEO_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum 40MB.")

    db_video = db.query(models.HeroVideo).first()
    if not db_video:
        db_video = models.HeroVideo()
        db.add(db_video)

    db_video.video_blob = contents
    db.commit()
    return {"ok": True}

@router.get("/content")
def get_hero_video_content(request: Request, db: Session = Depends(get_db)):
    db_video = db.query(models.HeroVideo).first()
    if not db_video or not db_video.video_blob:
        raise HTTPException(status_code=404, detail="Video not found")

    data = db_video.video_blob
    file_size = len(data)
    range_header = request.headers.get("range")

    if range_header:
        try:
            range_value = range_header.strip().split("=")[1]
            start_str, end_str = range_value.split("-")
            start = int(start_str) if start_str else 0
            end = int(end_str) if end_str else file_size - 1
            end = min(end, file_size - 1)
        except (IndexError, ValueError):
            start, end = 0, file_size - 1

        chunk = data[start:end + 1]
        headers = {
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(len(chunk)),
        }
        return Response(content=chunk, status_code=206, media_type="video/mp4", headers=headers)

    headers = {"Accept-Ranges": "bytes", "Content-Length": str(file_size)}
    return Response(content=data, media_type="video/mp4", headers=headers)
