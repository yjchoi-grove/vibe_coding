from fastapi import APIRouter, HTTPException, Depends, Body, Form, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from ..models.yj_comments import YJComments
from ..models.yj_posts import YJPosts
from ..database import get_db
from app.utils.token import get_current_user_id
from datetime import datetime
import pytz

router = APIRouter()

# 한국 시간대 설정
seoul_tz = pytz.timezone('Asia/Seoul')

class CommentCreateRequest(BaseModel):
    content: str

class CommentAuthor(BaseModel):
    id: str
    name: str

class CommentResponse(BaseModel):
    id: int
    content: str
    author: CommentAuthor
    createdAt: str
    updatedAt: str
    isDeleted: bool
    parent_id: int
    replies: List['CommentResponse'] = []

@router.get("/api/posts/{id}/comments")
async def get_comments(
    id: int, 
    db: Session = Depends(get_db)
):
    """
    게시글 댓글 목록 조회 API
    - 게시글의 모든 댓글과 대댓글을 계층 구조로 반환
    - 삭제되지 않은 댓글만 조회
    - 시간순으로 정렬

    Args:
        id (int): 게시글 ID
        db (Session): 데이터베이스 세션

    Returns:
        List[CommentResponse]: 댓글 목록 (대댓글 포함)
    """
    post = db.query(YJPosts).filter(YJPosts.post_no == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # 모든 댓글 조회 (시간순 정렬)
    comments = db.query(YJComments).filter(
        YJComments.post_no == id,
        YJComments.is_delete == 'N'
    ).order_by(YJComments.created_at).all()

    print("=== Comments from DB ===")
    for comment in comments:
        print(f"ID: {comment.seq}, Parent: {comment.parent_cmmt_no}, Content: {comment.contents}")

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
                "name": comment.author_usrid  # 임시로 author_usrid를 name으로 사용
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

    print("=== Structured Comments ===")
    for comment in structured_comments:
        print(f"Comment ID: {comment['id']}, Replies: {len(comment['replies'])}")
        for reply in comment['replies']:
            print(f"  Reply ID: {reply['id']}, Parent: {reply['parent_id']}")

    # 대댓글도 시간순으로 정렬
    for comment in structured_comments:
        comment["replies"].sort(key=lambda x: x["createdAt"])

    return structured_comments

@router.post("/api/posts/{post_id}/comments")
async def create_comment(
    post_id: int,
    content: str = Form(...),
    parent_comment_id: Optional[int] = Form(0),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    댓글 작성 API
    - 게시글에 새로운 댓글을 작성
    - 대댓글 작성 지원 (parent_comment_id로 지정)

    Args:
        post_id (int): 게시글 ID
        content (str): 댓글 내용
        parent_comment_id (int, optional): 부모 댓글 ID (대댓글인 경우)
        db (Session): 데이터베이스 세션
        user_id (str): 인증된 사용자 ID

    Returns:
        message (str): 작성 결과 메시지
        comment_id (int): 작성된 댓글 ID
    """
    # 게시글 존재 여부 확인
    post = db.query(YJPosts).filter(YJPosts.post_no == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # 부모 댓글이 있는 경우, 해당 댓글이 같은 게시글에 속하는지 확인
    if parent_comment_id > 0:
        parent_comment = db.query(YJComments).filter(
            YJComments.seq == parent_comment_id,
            YJComments.post_no == post_id,
            YJComments.is_delete == 'N'
        ).first()
        if not parent_comment:
            raise HTTPException(status_code=404, detail="Parent comment not found")

    # 댓글 생성
    new_comment = YJComments(
        post_no=post_id,
        author_usrid=user_id,
        contents=content,
        parent_cmmt_no=parent_comment_id,
        created_at=datetime.now(seoul_tz),
        updated_at=datetime.now(seoul_tz)
    )
    
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return {"message": "Comment created successfully", "comment_id": new_comment.seq}

@router.put("/api/comments/{comment_id}")
async def update_comment(
    comment_id: int,
    content: str = Form(...),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    댓글 수정 API
    - 작성한 댓글의 내용을 수정

    Args:
        comment_id (int): 댓글 ID
        content (str): 수정할 댓글 내용
        db (Session): 데이터베이스 세션
        user_id (str): 인증된 사용자 ID

    Returns:
        message (str): 수정 결과 메시지
    """
    print(f"Updating comment {comment_id} with content: {content}")
    
    comment = db.query(YJComments).filter(
        YJComments.seq == comment_id,
        YJComments.is_delete == 'N'
    ).first()
    
    if not comment:
        print(f"Comment {comment_id} not found")
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if comment.author_usrid != user_id:
        print(f"User {user_id} not authorized to update comment {comment_id}")
        raise HTTPException(status_code=403, detail="Not authorized to update this comment")
    
    try:
        comment.contents = content
        comment.updated_at = datetime.now(seoul_tz)
        db.commit()
        print(f"Comment {comment_id} updated successfully")
        return {"message": "Comment updated successfully"}
    except Exception as e:
        print(f"Error updating comment {comment_id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating comment: {str(e)}")

@router.delete("/api/comments/{comment_id}")
async def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    댓글 삭제 API
    - 작성한 댓글을 소프트 삭제 처리

    Args:
        comment_id (int): 댓글 ID
        db (Session): 데이터베이스 세션
        user_id (str): 인증된 사용자 ID

    Returns:
        message (str): 삭제 결과 메시지
    """
    comment = db.query(YJComments).filter(
        YJComments.seq == comment_id,
        YJComments.is_delete == 'N'
    ).first()
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if comment.author_usrid != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    # 댓글 삭제 처리 (실제로 삭제하지 않고 is_delete 플래그만 변경)
    comment.is_delete = 'Y'
    comment.updated_at = datetime.now(seoul_tz)
    
    db.commit()
    return {"message": "Comment deleted successfully"} 