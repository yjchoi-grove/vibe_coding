from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt
from sqlalchemy.orm import Session
from ..models.yj_users import YJUsers
from app.database import get_db
from fastapi import Form
from fastapi.security import OAuth2PasswordRequestForm
import os
from dotenv import load_dotenv
from passlib.context import CryptContext

# .env 파일 로드
load_dotenv()

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

# 비밀번호 해시화를 위한 설정
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """비밀번호 검증"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """비밀번호 해시화"""
    return pwd_context.hash(password)

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user: dict
    expiresIn: int

def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/api/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    사용자 로그인 API
    - 아이디와 비밀번호를 받아 JWT 토큰을 발급합니다.
    - 실패 시 401 에러와 메시지를 반환합니다.

    Args:
        form_data (OAuth2PasswordRequestForm): username(아이디), password(비밀번호)
        db (Session): 데이터베이스 세션

    Returns:
        access_token (str): JWT 액세스 토큰
        token_type (str): 토큰 타입 (bearer)
        userName (str): 사용자 이름
    """
    user = db.query(YJUsers).filter(YJUsers.usr_id == form_data.username).first()

    if not user or not verify_password(form_data.password, user.pwd):
        raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 일치하지 않습니다")

    access_token = create_access_token(
        data={"userId": user.usr_id, "userName": user.usr_nm},
        expires_delta=timedelta(hours=12)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "userName": user.usr_nm
    }