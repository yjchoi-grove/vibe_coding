# Vibe Board - 현대적인 게시판 프로젝트

> 📁 **[전체 디렉터리 구조 보기](docs/DIRECTORY_STRUCTURE.md)**
>
> 본 프로젝트의 전체 폴더/파일 구조와 각 역할은 위 문서에서 확인할 수 있습니다. 신규 개발자/협업자는 반드시 참고해 주세요.

## 프로젝트 소개
Vibe Board는 React와 FastAPI를 활용한 현대적인 게시판 프로젝트입니다. 사용자 친화적인 UI/UX와 다양한 기능을 제공합니다.

## 주요 기능
- 게시글 CRUD (작성, 조회, 수정, 삭제)
- 댓글 기능
- 이미지 URL 미리보기
- 검색 및 정렬
- 페이지네이션
- 소프트 삭제
- 반응형 디자인

## 기술 스택
### 프론트엔드
- React 18
- TypeScript
- Tailwind CSS
- Axios
- React Router

### 백엔드
- FastAPI
- SQLAlchemy
- PostgreSQL
- Python 3.9+

## 프로젝트 구조
```
vibe-board/
├── frontend/
│   ├── src/
│   │   ├── components/     # 컴포넌트
│   │   │   ├── PostList/   # 게시글 목록 관련 컴포넌트
│   │   │   ├── PostDetail/ # 게시글 상세 관련 컴포넌트
│   │   │   ├── PostForm/   # 게시글 작성/수정 관련 컴포넌트
│   │   │   └── Login/      # 로그인 관련 컴포넌트
│   │   ├── services/       # API 통신 관련 코드
│   │   ├── types/          # TypeScript 타입 정의
│   │   └── reducers/       # 상태 관리
│   └── public/            # 정적 파일
└── backend/
    ├── app/
    │   ├── models/        # 데이터베이스 모델
    │   ├── routers/       # API 라우터
    │   ├── utils/         # 유틸리티 함수
    │   └── main.py        # FastAPI 애플리케이션
    └── uploads/           # 업로드된 파일 저장소
```

## 시작하기

### 필수 요구사항
- Python 3.x
- Node.js 및 npm
- PowerShell

### 설치 및 실행

1. 가상 환경 생성 및 활성화
```powershell
cd backend
python -m venv .venv
& .\.venv\Scripts\Activate
```

2. 백엔드 종속성 설치
```powershell
pip install -r requirements.txt
```

3. 환경 변수 설정

백엔드 설정:
```bash
# backend 폴더에 .env 파일 생성
# 다음 내용을 복사하여 .env 파일에 붙여넣기
DATABASE_URL=postgresql+psycopg2://[username]:[password]@[host]:[port]/[database]?options=-csearch_path%3Dvibecoding
SECRET_KEY=[your-secret-key]

# 환경 변수 설정:
ASYNC_DB_USER=데이터베이스_사용자_이름
ASYNC_DB_PASSWORD=데이터베이스_비밀번호
ASYNC_DB_HOST=데이터베이스_호스트_주소
ASYNC_DB_PORT=데이터베이스_포트_번호
ASYNC_DB_NAME=데이터베이스_이름
ASYNC_DB_SCHEMA=데이터베이스_스키마_이름
```

4. 프론트엔드 종속성 설치
```powershell
cd ../frontend
npm install
```

5. 서버 동시 실행
```powershell
powershell -ExecutionPolicy Bypass -File run_servers.ps1
```
이 명령어를 사용하면 백엔드와 프론트엔드 서버가 동시에 실행됩니다.

### 서버 주소
- 백엔드 Swagger UI: http://localhost:8000/docs
- 프론트엔드 애플리케이션: http://localhost:3000

## API 문서
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- 상세 API 명세: [API_SPEC.md](docs/API_SPEC.md) 