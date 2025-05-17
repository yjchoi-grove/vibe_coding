from fastapi import FastAPI
from app.routers import auth, posts, files, comments
import asyncpg
import asyncio
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from app.models.yj_users import YJUsers
from app.database import get_db, init_db
from fastapi.openapi.utils import get_openapi
from fastapi.staticfiles import StaticFiles

# 🔹 .env 파일 로드
load_dotenv()

app = FastAPI()

# 🔹 커스텀 OpenAPI 설정
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Vibe Board API",
        version="1.0.0",
        description="Vibe Board Swagger Docs with Token Auth",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "OAuth2PasswordBearer": {
            "type": "oauth2",
            "flows": {
                "password": {
                    "tokenUrl": "/api/login",
                    "scopes": {}
                }
            }
        }
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method["security"] = [{"OAuth2PasswordBearer": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

# 🔹 Swagger 문서에 인증 정보 적용
app.openapi = custom_openapi

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(files.router)
app.include_router(comments.router)

# 정적 파일 경로 설정
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# 🔄 DB 연결 함수 (환경 변수 사용)
async def connect_to_db():
    conn = await asyncpg.connect(
        user=os.getenv("ASYNC_DB_USER"),
        password=os.getenv("ASYNC_DB_PASSWORD"),
        database=os.getenv("ASYNC_DB_NAME"),
        host=os.getenv("ASYNC_DB_HOST"),
        port=int(os.getenv("ASYNC_DB_PORT"))
    )
    print("데이터베이스에 연결되었습니다!")
    return conn

# 서버 시작 시 DB 연결 및 테이블 생성
@app.on_event("startup")
async def startup_event():
    app.state.db = await connect_to_db()
    init_db()

# 서버 종료 시 DB 연결 종료
@app.on_event("shutdown")
async def shutdown_event():
    await app.state.db.close()
    print("데이터베이스 연결이 종료되었습니다.")
