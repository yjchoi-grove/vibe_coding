from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, HttpUrl, validator
from app.models.yj_posts import YJPosts
from app.models.yj_users import YJUsers
from app.models.yj_attachments import YJAttachments
from app.models.yj_comments import YJComments
from ..database import get_db
from app.utils.token import get_current_user_id
from datetime import datetime
import pytz
import os
import logging
from fastapi.responses import FileResponse
import re

router = APIRouter()

# 한국 시간대 설정
seoul_tz = pytz.timezone('Asia/Seoul')

UPLOAD_DIRECTORY = "./uploads"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {
    'image': ['.jpg', '.jpeg', '.png', '.gif'],
    'document': ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.ppt', '.pptx'],
    'video': ['.mp4', '.avi', '.mov']
}

if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)

logging.basicConfig(level=logging.INFO)

# Request Models
class PostCreateRequest(BaseModel):
    title: str
    content: str
    video_url: Optional[HttpUrl] = None

    @validator('title')
    def validate_title(cls, v):
        if len(v.strip()) == 0:
            raise ValueError('제목은 비어있을 수 없습니다')
        if len(v) > 200:
            raise ValueError('제목은 200자를 초과할 수 없습니다')
        return sanitize_input(v)

    @validator('content')
    def validate_content(cls, v):
        if len(v.strip()) == 0:
            raise ValueError('내용은 비어있을 수 없습니다')
        return sanitize_input(v)

class PostUpdateRequest(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

# Response Models
class PostListResponse(BaseModel):
    id: int
    title: str
    author: dict
    createdAt: str
    view_cnt: int
    commentCount: int

class PostDetailResponse(BaseModel):
    id: int
    title: str
    content: str
    videoUrl: Optional[str]
    imgUrl: Optional[str]
    author: dict
    createdAt: str
    updatedAt: str
    view_cnt: int
    attachments: List[dict]
    comments: List[dict]

class PostsResponse(BaseModel):
    posts: List[PostListResponse]
    total: int

# GET list with response formatting
@router.get("/api/posts", response_model=PostsResponse)
async def get_posts(
    page: int = 1,
    search: Optional[str] = None,
    search_type: Optional[str] = None,
    author_id: Optional[str] = None,
    sortBy: Optional[str] = 'createdAt',
    sortOrder: Optional[str] = 'desc',
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    게시글 목록 조회 API
    - 페이지네이션, 검색, 작성자 필터링, 정렬 지원

    Args:
        page (int): 페이지 번호 (기본값 1)
        search (str, optional): 검색어
        search_type (str, optional): 검색 타입 (title, content, author)
        author_id (str, optional): 작성자 ID
        sortBy (str, optional): 정렬 기준 (createdAt, view_cnt)
        sortOrder (str, optional): 정렬 순서 (asc, desc)
        db (Session): 데이터베이스 세션
        user_id (str): 인증된 사용자 ID

    Returns:
        posts (list): 게시글 목록
        total (int): 전체 게시글 수
    """
    # 페이지 번호 유효성 검사
    if page < 1:
        page = 1
    # 기본 쿼리 생성
    query = db.query(YJPosts).filter(YJPosts.is_delete == 'N')
    
    # 검색어 필터링
    if search:
        if search_type == 'title':
            query = query.filter(YJPosts.title.ilike(f'%{search}%'))
        elif search_type == 'content':
            query = query.filter(YJPosts.contents.ilike(f'%{search}%'))
        elif search_type == 'author':
            subquery = db.query(YJUsers.usr_id).filter(YJUsers.usr_nm.ilike(f'%{search}%')).subquery()
            query = query.filter(YJPosts.author_usrid.in_(subquery))
        else:
            query = query.filter(
                (YJPosts.title.ilike(f'%{search}%')) | 
                (YJPosts.contents.ilike(f'%{search}%'))
            )
    
    # 작성자 필터링
    if author_id:
        query = query.filter(YJPosts.author_usrid == author_id)
    
    # 전체 게시글 수 계산
    total_posts = query.count()
    
    # 정렬 적용
    if sortBy == 'createdAt':
        if sortOrder == 'asc':
            query = query.order_by(YJPosts.created_at.asc())
        else:
            query = query.order_by(YJPosts.created_at.desc())
    elif sortBy == 'view_cnt':
        if sortOrder == 'asc':
            query = query.order_by(YJPosts.view_cnt.asc())
        else:
            query = query.order_by(YJPosts.view_cnt.desc())
    
    # 페이지네이션 적용
    items_per_page = 10
    offset = (page - 1) * items_per_page
    posts = query.offset(offset).limit(items_per_page).all()
    
    result = []
    for post in posts:
        user = db.query(YJUsers).filter(YJUsers.usr_id == post.author_usrid).first()
        result.append({
            "id": post.post_no,
            "title": post.title,
            "author": {
                "id": post.author_usrid,
                "name": user.usr_nm if user else "Unknown"
            },
            "createdAt": post.created_at.isoformat() if post.created_at else "",
            "view_cnt": post.view_cnt,
            "commentCount": 0
        })

    return {"posts": result, "total": total_posts}

# GET detail
@router.get("/api/posts/{id}", response_model=PostDetailResponse)
async def get_post(
    id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)  # 인증 추가
):
    """
    게시글 상세 조회 API
    - 게시글, 첨부파일, 댓글(대댓글 포함) 정보를 반환

    Args:
        id (int): 게시글 ID
        db (Session): 데이터베이스 세션
        user_id (str): 인증된 사용자 ID

    Returns:
        게시글 상세 정보 (PostDetailResponse)
    """
    # 게시글 조회
    post = db.query(YJPosts).filter(YJPosts.post_no == id, YJPosts.is_delete == 'N').first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # 조회수 증가
    post.view_cnt += 1
    db.commit()

    # 작성자 정보 조회
    user = db.query(YJUsers).filter(YJUsers.usr_id == post.author_usrid).first()
    
    # 첨부파일 조회
    attachments = db.query(YJAttachments).filter(
        YJAttachments.post_no == id,
        YJAttachments.is_delete == 'N'  # 삭제되지 않은 첨부파일만 조회
    ).all()
    
    # 댓글 조회 (삭제되지 않은 댓글만, 시간순 정렬)
    comments = db.query(YJComments).filter(
        YJComments.post_no == id,
        YJComments.is_delete == 'N'
    ).order_by(YJComments.created_at.desc()).all()  # 최신순으로 정렬
    
    # 댓글 작성자 정보 조회
    comment_authors = {}
    for comment in comments:
        if comment.author_usrid not in comment_authors:
            author = db.query(YJUsers).filter(YJUsers.usr_id == comment.author_usrid).first()
            comment_authors[comment.author_usrid] = author.usr_nm if author else "Unknown"
    
    # 댓글과 대댓글을 구조화
    comment_dict = {}
    structured_comments = []

    # 먼저 모든 댓글을 딕셔너리에 저장
    for comment in comments:
        comment_dict[comment.seq] = {
            "id": comment.seq,
            "content": comment.contents,
            "author": {
                "id": comment.author_usrid,
                "name": comment_authors.get(comment.author_usrid, "Unknown")
            },
            "createdAt": comment.created_at.isoformat() if comment.created_at else "",
            "updatedAt": comment.updated_at.isoformat() if comment.updated_at else "",
            "isDeleted": comment.is_delete == 'Y',
            "parent_id": comment.parent_cmmt_no,
            "replies": []
        }

    # 댓글과 대댓글을 구조화
    for comment in comments:
        if comment.parent_cmmt_no == 0:  # 일반 댓글
            structured_comments.append(comment_dict[comment.seq])
        else:  # 대댓글
            parent = comment_dict.get(comment.parent_cmmt_no)
            if parent:
                parent["replies"].append(comment_dict[comment.seq])

    # 대댓글도 시간순으로 정렬 (최신순)
    for comment in structured_comments:
        comment["replies"].sort(key=lambda x: x["createdAt"], reverse=True)
    
    return {
        "id": post.post_no,
        "title": post.title,
        "content": post.contents,
        "videoUrl": post.video_url,
        "imgUrl": post.img_url,
        "author": {"id": post.author_usrid, "name": user.usr_nm if user else "Unknown"},
        "createdAt": post.created_at.isoformat() if post.created_at else "",
        "updatedAt": post.updated_at.isoformat() if post.updated_at else "",
        "view_cnt": post.view_cnt,
        "attachments": [
            {
                "id": a.seq,
                "filename": a.file_nm,
                "original_filename": a.org_file_nm,
                "file_path": a.file_path.replace('./', '/').replace('\\', '/'),
                "file_size": a.file_size,
                "mime_type": a.mime_type
            } for a in attachments
        ],
        "comments": structured_comments
    }

def is_valid_video_url(url: str) -> bool:
    """YouTube 또는 네이버 TV URL인지 검사"""
    if not url:
        return True  # URL이 없는 경우는 허용
    
    # YouTube URL 패턴
    youtube_pattern = r'^(https?://)?(www\.)?(youtube\.com/watch\?v=|youtu\.be/)[\w-]{11}'
    # 네이버 TV URL 패턴
    naver_pattern = r'^(https?://)?(www\.)?tv\.naver\.com/v/\d+'
    
    return bool(re.match(youtube_pattern, url) or re.match(naver_pattern, url))

# POST
@router.post("/api/posts", response_model=PostDetailResponse)
async def create_post(
    title: str = Form(...),
    content: str = Form(...),
    video_url: Optional[str] = Form(None),
    img_url: Optional[str] = Form(None),  # 이미지 URL 필드 추가
    files: List[UploadFile] = File(None),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    게시글 생성 API
    - 제목, 내용, 동영상/이미지 URL, 첨부파일 업로드 지원

    Args:
        title (str): 게시글 제목
        content (str): 게시글 내용
        video_url (str, optional): 동영상 URL
        img_url (str, optional): 이미지 URL
        files (List[UploadFile], optional): 첨부파일 리스트
        db (Session): 데이터베이스 세션
        user_id (str): 인증된 사용자 ID

    Returns:
        생성된 게시글 상세 정보 (PostDetailResponse)
    """
    # 입력값 검증
    if not title.strip() or not content.strip():
        raise HTTPException(status_code=400, detail="제목과 내용은 필수입니다")
    
    # 동영상 URL 유효성 검사
    if video_url and not is_valid_video_url(video_url):
        raise HTTPException(status_code=400, detail="유효한 YouTube 또는 네이버 TV URL을 입력해주세요")

    # 이미지 URL 유효성 검사
    if img_url and not is_valid_image_url(img_url):
        raise HTTPException(status_code=400, detail="유효한 이미지 URL을 입력해주세요")

    # 파일 검증 (파일이 있는 경우에만)
    if files:
        for file in files:
            if file.size > MAX_FILE_SIZE:
                raise HTTPException(status_code=400, detail=f"파일 크기는 {MAX_FILE_SIZE/1024/1024}MB를 초과할 수 없습니다")
            if not is_allowed_file(file.filename):
                raise HTTPException(status_code=400, detail="허용되지 않는 파일 형식입니다")

    current_time = datetime.now(seoul_tz)
    new_post = YJPosts(
        title=sanitize_input(title),
        contents=sanitize_input(content),
        video_url=video_url,
        img_url=img_url,  # 이미지 URL 저장
        author_usrid=user_id,
        created_at=current_time
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    # 첨부파일 처리 (파일이 있는 경우에만)
    if files:
        for file in files:
            # 파일명 중복 처리
            safe_filename = get_unique_filename(file.filename)
            file_location = os.path.join(UPLOAD_DIRECTORY, safe_filename)
            
            # 파일 저장
            with open(file_location, "wb") as buffer:
                content = await file.read()
                if len(content) > MAX_FILE_SIZE:
                    raise HTTPException(status_code=400, detail="파일 크기가 너무 큽니다")
                buffer.write(content)

            new_file = YJAttachments(
                post_no=new_post.post_no,
                file_nm=safe_filename,
                org_file_nm=file.filename,
                file_path=file_location,
                file_size=os.path.getsize(file_location),
                mime_type=file.content_type,
                created_at=current_time
            )
            db.add(new_file)
        db.commit()

    return {
        "id": new_post.post_no,
        "title": new_post.title,
        "content": new_post.contents,
        "videoUrl": new_post.video_url,
        "imgUrl": new_post.img_url,  # 이미지 URL 필드 추가
        "author": {"id": new_post.author_usrid},
        "createdAt": new_post.created_at.isoformat() if new_post.created_at else "",
        "updatedAt": new_post.updated_at.isoformat() if new_post.updated_at else "",
        "view_cnt": new_post.view_cnt,
        "attachments": [],  # 첨부파일 목록을 반환하도록 수정 필요
        "comments": []
    }

# PUT
@router.put("/api/posts/{id}", response_model=PostDetailResponse)
async def update_post(
    id: int,
    title: str = Form(...),
    content: str = Form(...),
    video_url: Optional[str] = Form(None),
    img_url: Optional[str] = Form(None),  # 이미지 URL 필드 추가
    files: List[UploadFile] = File(None),
    existing_files: List[int] = Form([]),  # 기존 첨부파일 id 목록 추가
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    게시글 수정 API
    - 제목, 내용, 동영상/이미지 URL, 첨부파일 수정 지원

    Args:
        id (int): 게시글 ID
        title (str): 게시글 제목
        content (str): 게시글 내용
        video_url (str, optional): 동영상 URL
        img_url (str, optional): 이미지 URL
        files (List[UploadFile], optional): 첨부파일 리스트
        existing_files (List[int], optional): 기존 첨부파일 id 목록
        db (Session): 데이터베이스 세션
        user_id (str): 인증된 사용자 ID

    Returns:
        수정된 게시글 상세 정보 (PostDetailResponse)
    """
    post = db.query(YJPosts).filter(YJPosts.post_no == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # 게시글 작성자 확인
    if post.author_usrid != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")

    # 동영상 URL 유효성 검사
    if video_url and not is_valid_video_url(video_url):
        raise HTTPException(status_code=400, detail="유효한 YouTube 또는 네이버 TV URL을 입력해주세요")

    # 이미지 URL 유효성 검사
    if img_url and not is_valid_image_url(img_url):
        raise HTTPException(status_code=400, detail="유효한 이미지 URL을 입력해주세요")

    post.title = title
    post.contents = content
    if video_url:
        post.video_url = video_url
    if img_url:
        post.img_url = img_url
    post.updated_at = datetime.now(seoul_tz)

    # 기존 첨부파일 소프트 삭제 (existing_files에 없는 것만)
    all_existing_files = db.query(YJAttachments).filter(
        YJAttachments.post_no == id,
        YJAttachments.is_delete == 'N'
    ).all()
    for existing_file in all_existing_files:
        if existing_file.seq not in existing_files:
            if os.path.exists(existing_file.file_path):
                os.remove(existing_file.file_path)
            existing_file.is_delete = 'Y'
            existing_file.updated_at = datetime.now(seoul_tz)

    # 새로운 파일 업로드
    if files:
        for file in files:
            file_location = os.path.join(UPLOAD_DIRECTORY, file.filename)
            with open(file_location, "wb") as buffer:
                buffer.write(await file.read())

            new_file = YJAttachments(
                post_no=id,
                file_nm=file.filename,
                org_file_nm=file.filename,
                file_path=file_location,
                file_size=os.path.getsize(file_location),
                mime_type=file.content_type,
                created_at=datetime.now(seoul_tz)
            )
            db.add(new_file)

    db.commit()
    db.refresh(post)

    # 첨부파일 목록 조회
    attachments = db.query(YJAttachments).filter(YJAttachments.post_no == id).all()
    user = db.query(YJUsers).filter(YJUsers.usr_id == post.author_usrid).first()

    return {
        "id": post.post_no,
        "title": post.title,
        "content": post.contents,
        "videoUrl": post.video_url,
        "imgUrl": post.img_url,  # 이미지 URL 필드 추가
        "author": {"id": post.author_usrid, "name": user.usr_nm if user else "Unknown"},
        "createdAt": post.created_at.isoformat() if post.created_at else "",
        "updatedAt": post.updated_at.isoformat() if post.updated_at else "",
        "view_cnt": post.view_cnt,
        "attachments": [
            {
                "id": a.seq,
                "filename": a.file_nm,
                "file_size": a.file_size,
                "file_path": a.file_path.replace('./', '/').replace('\\', '/'),
                "mime_type": a.mime_type
            } for a in attachments
        ],
        "comments": []
    }

@router.get("/api/posts/{post_id}/attachments/{attachment_id}")
async def download_attachment(
    post_id: int,
    attachment_id: int,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    # 게시글 존재 여부 확인
    post = db.query(YJPosts).filter(YJPosts.post_no == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # 첨부파일 존재 여부 확인
    attachment = db.query(YJAttachments).filter(
        YJAttachments.seq == attachment_id,
        YJAttachments.post_no == post_id
    ).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")

    # 파일 경로 확인
    file_path = attachment.file_path
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    # 파일 다운로드
    return FileResponse(
        path=file_path,
        filename=attachment.org_file_nm,
        media_type=attachment.mime_type
    )

# 파일 확장자 검증 함수
def is_allowed_file(filename: str) -> bool:
    ext = os.path.splitext(filename)[1].lower()
    return any(ext in exts for exts in ALLOWED_EXTENSIONS.values())

# 파일명 중복 처리 함수
def get_unique_filename(filename: str) -> str:
    name, ext = os.path.splitext(filename)
    counter = 1
    while os.path.exists(os.path.join(UPLOAD_DIRECTORY, filename)):
        filename = f"{name}_{counter}{ext}"
        counter += 1
    return filename

# XSS 방지를 위한 입력값 sanitization
def sanitize_input(text: str) -> str:
    # 제목의 경우 HTML 태그 제거
    if len(text) <= 200:  # 제목은 최대 200자
        text = re.sub(r'<[^>]+>', '', text)
        text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    # 내용의 경우 HTML 태그 보존
    return text

# 이미지 URL 유효성 검사 함수 추가
def is_valid_image_url(url: str) -> bool:
    """이미지 URL인지 검사"""
    if not url:
        return True  # URL이 없는 경우는 허용
    
    # 일반적인 이미지 URL 패턴
    image_pattern = r'^https?://.*\.(jpg|jpeg|png|gif|webp)(\?.*)?$'
    return bool(re.match(image_pattern, url, re.IGNORECASE))

# DELETE
@router.delete("/api/posts/{id}")
async def delete_post(
    id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    게시글 삭제 API
    - 게시글과 첨부파일을 소프트 삭제 처리

    Args:
        id (int): 게시글 ID
        db (Session): 데이터베이스 세션
        user_id (str): 인증된 사용자 ID

    Returns:
        message (str): 삭제 결과 메시지
    """
    # 게시글 조회
    post = db.query(YJPosts).filter(YJPosts.post_no == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # 게시글 작성자 확인
    if post.author_usrid != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    try:
        # 게시글의 is_delete 필드를 'Y'로 변경
        post.is_delete = 'Y'
        post.updated_at = datetime.now(seoul_tz)

        # 첨부파일도 소프트 삭제 처리
        attachments = db.query(YJAttachments).filter(
            YJAttachments.post_no == id,
            YJAttachments.is_delete == 'N'
        ).all()
        
        for attachment in attachments:
            attachment.is_delete = 'Y'
            attachment.updated_at = datetime.now(seoul_tz)
        
        db.commit()
        return {"message": "Post and its attachments deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting post: {str(e)}")

@router.delete("/api/comments/{comment_id}")
async def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    댓글 삭제 API
    - 댓글을 소프트 삭제 처리

    Args:
        comment_id (int): 댓글 ID
        db (Session): 데이터베이스 세션
        user_id (str): 인증된 사용자 ID

    Returns:
        message (str): 삭제 결과 메시지
    """
    # 댓글 조회
    comment = db.query(YJComments).filter(YJComments.seq == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # 댓글 작성자 확인
    if comment.author_usrid != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")

    try:
        # 댓글 소프트 삭제
        comment.is_delete = 'Y'
        comment.updated_at = datetime.now(seoul_tz)
        db.commit()
        
        return {"message": "Comment deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting comment: {str(e)}")
