from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from sqlalchemy.orm import Session
from ..models.yj_attachments import YJAttachments
from ..models.yj_posts import YJPosts
from ..database import get_db
import os
from fastapi.responses import FileResponse
from typing import List
from pydantic import BaseModel
from app.utils.token import get_current_user_id
import pytz
from datetime import datetime

router = APIRouter()

UPLOAD_DIRECTORY = "./uploads"

if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)

# 한국 시간대 설정
seoul_tz = pytz.timezone('Asia/Seoul')

class AttachmentResponse(BaseModel):
    id: int
    post_no: int
    filename: str
    original_filename: str
    file_path: str
    file_size: int
    mime_type: str
    created_at: str

@router.get("/api/attachments", response_model=List[AttachmentResponse])
async def list_attachments(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    첨부파일 목록 조회 API
    - 모든 첨부파일의 정보를 반환

    Args:
        db (Session): 데이터베이스 세션
        user_id (str): 인증된 사용자 ID

    Returns:
        첨부파일 목록 (List[AttachmentResponse])
    """
    attachments = db.query(YJAttachments).all()
    return [
        {
            "id": a.seq,
            "post_no": a.post_no,
            "filename": a.file_nm,
            "original_filename": a.org_file_nm,
            "file_path": a.file_path.replace('./', '/').replace('\\', '/'),
            "file_size": a.file_size,
            "mime_type": a.mime_type,
            "created_at": a.created_at.isoformat() if a.created_at else None
        }
        for a in attachments
    ]

@router.get("/api/posts/{post_id}/attachments", response_model=List[AttachmentResponse])
async def list_post_attachments(
    post_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    게시글 첨부파일 목록 조회 API
    - 특정 게시글에 첨부된 모든 파일 정보를 반환

    Args:
        post_id (int): 게시글 ID
        db (Session): 데이터베이스 세션
        user_id (str): 인증된 사용자 ID

    Returns:
        List[AttachmentResponse]: 첨부파일 목록
    """
    # 게시물 존재 여부 확인
    post = db.query(YJPosts).filter(YJPosts.post_no == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # 해당 게시물의 첨부파일 목록 조회
    attachments = db.query(YJAttachments).filter(YJAttachments.post_no == post_id).all()
    return [
        {
            "id": a.seq,
            "post_no": a.post_no,
            "filename": a.file_nm,
            "original_filename": a.org_file_nm,
            "file_path": a.file_path,
            "file_size": a.file_size,
            "mime_type": a.mime_type,
            "created_at": a.created_at.isoformat() if a.created_at else None
        }
        for a in attachments
    ]

@router.post("/api/posts/{id}/files")
async def upload_file(
    id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    게시글 첨부파일 업로드 API
    - 게시글에 새로운 첨부파일을 업로드
    - 기존 첨부파일이 있다면 소프트 삭제 후 새로운 파일 업로드

    Args:
        id (int): 게시글 ID
        file (UploadFile): 업로드할 파일
        db (Session): 데이터베이스 세션
        user_id (str): 인증된 사용자 ID

    Returns:
        업로드된 파일 정보 (filename, id)
    """
    post = db.query(YJPosts).filter(YJPosts.post_no == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # 기존 파일 소프트 삭제 처리
    existing_files = db.query(YJAttachments).filter(
        YJAttachments.post_no == id,
        YJAttachments.is_delete == 'N'
    ).all()
    for existing_file in existing_files:
        if os.path.exists(existing_file.file_path):
            os.remove(existing_file.file_path)
        existing_file.is_delete = 'Y'
        existing_file.updated_at = datetime.now(seoul_tz)
    db.commit()

    # 새로운 파일 업로드
    file_location = os.path.join(UPLOAD_DIRECTORY, file.filename)
    with open(file_location, "wb") as buffer:
        buffer.write(await file.read())

    current_time = datetime.now(seoul_tz)  # 현재 시간을 한국 시간으로 설정
    new_file = YJAttachments(
        post_no=id,
        file_nm=file.filename,
        org_file_nm=file.filename,
        file_path=file_location,
        file_size=os.path.getsize(file_location),
        mime_type=file.content_type,
        created_at=current_time  # 한국 시간으로 저장
    )
    db.add(new_file)
    db.commit()
    db.refresh(new_file)

    return {"filename": new_file.file_nm, "id": new_file.seq}

@router.delete("/api/files/{id}")
async def delete_file(
    id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    첨부파일 삭제 API
    - 첨부파일을 소프트 삭제 처리

    Args:
        id (int): 첨부파일 ID
        db (Session): 데이터베이스 세션
        user_id (str): 인증된 사용자 ID

    Returns:
        message (str): 삭제 결과 메시지
    """
    # 첨부파일 존재 여부 확인
    file_record = db.query(YJAttachments).filter(
        YJAttachments.seq == id,
        YJAttachments.is_delete == 'N'
    ).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")

    # 게시물 작성자 확인 (선택적)
    post = db.query(YJPosts).filter(YJPosts.post_no == file_record.post_no).first()
    if post and post.author_usrid != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this file")

    try:
        # 파일 시스템에서 파일 삭제
        if os.path.exists(file_record.file_path):
            os.remove(file_record.file_path)
        
        # 데이터베이스에서 소프트 삭제 처리
        file_record.is_delete = 'Y'
        file_record.updated_at = datetime.now(seoul_tz)
        db.commit()
        
        return {"message": "File deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting file: {str(e)}")

@router.get("/api/files/{id}")
async def download_file(
    id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    첨부파일 다운로드 API
    - 첨부파일을 다운로드

    Args:
        id (int): 첨부파일 ID
        db (Session): 데이터베이스 세션
        user_id (str): 인증된 사용자 ID

    Returns:
        FileResponse: 다운로드할 파일
    """
    file_record = db.query(YJAttachments).filter(YJAttachments.seq == id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(path=file_record.file_path, filename=file_record.org_file_nm)

@router.put("/api/posts/{post_id}/attachments/{attachment_id}/delete")
async def delete_attachment(
    post_id: int,
    attachment_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    게시글 첨부파일 소프트 삭제 API
    - 첨부파일을 물리적으로 삭제하지 않고 is_delete 플래그만 변경

    Args:
        post_id (int): 게시글 ID
        attachment_id (int): 첨부파일 ID
        db (Session): 데이터베이스 세션
        user_id (str): 인증된 사용자 ID

    Returns:
        message (str): 삭제 결과 메시지
    """
    # 게시글 존재 여부 확인
    post = db.query(YJPosts).filter(YJPosts.post_no == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # 게시글 작성자 확인
    if post.author_usrid != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this attachment")

    # 첨부파일 존재 여부 확인
    attachment = db.query(YJAttachments).filter(
        YJAttachments.seq == attachment_id,
        YJAttachments.post_no == post_id,
        YJAttachments.is_delete == 'N'
    ).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")

    try:
        # 첨부파일의 is_delete 필드를 'Y'로 변경
        attachment.is_delete = 'Y'
        attachment.updated_at = datetime.now(seoul_tz)
        db.commit()
        
        return {"message": "Attachment deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting attachment: {str(e)}") 