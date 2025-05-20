# Vibe Board

> 📁 **[전체 디렉터리 구조 보기](docs/DIRECTORY_STRUCTURE.md)**
>
> 본 프로젝트의 전체 폴더/파일 구조와 각 역할은 위 문서에서 확인할 수 있습니다. 신규 개발자/협업자는 반드시 참고해 주세요.

## 프로젝트 소개
Vibe Board는 React와 FastAPI를 활용한 현대적인 게시판 프로젝트입니다. 사용자 친화적인 UI/UX와 다양한 기능을 제공합니다.

## 필수 요구사항

### 개발 환경
- Python 3.13 이상
- Node.js 22.x 이상
- npm (Node.js와 함께 설치)
- Git
- 터미널 (Windows: PowerShell, macOS/Linux: 기본 터미널)

### 데이터베이스
- PostgreSQL 14 이상
- pgAdmin 4 (선택사항, 데이터베이스 관리용)

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
Vibe_Board/
├── backend/                  # FastAPI 백엔드
│   ├── app/
│   │   ├── main.py           # FastAPI 진입점
│   │   ├── database.py       # DB 연결
│   │   ├── models/           # SQLAlchemy 모델
│   │   │   ├── yj_posts.py   # 게시글 모델
│   │   │   ├── yj_users.py   # 사용자 모델
│   │   │   ├── yj_comments.py # 댓글 모델
│   │   │   ├── yj_attachments.py # 첨부파일 모델
│   │   │   └── __init__.py
│   │   ├── routers/          # API 라우터
│   │   │   ├── posts.py      # 게시글 관련 API
│   │   │   ├── comments.py   # 댓글 관련 API
│   │   │   ├── files.py      # 파일 업로드 API
│   │   │   ├── auth.py       # 인증 관련 API
│   │   │   └── __init__.py
│   │   ├── utils/            # 유틸리티 함수
│   │   │   └── token.py      # JWT 토큰 처리
│   │   └── __init__.py
│   ├── uploads/              # 첨부파일 저장 폴더
│   ├── requirements.txt      # Python 패키지 목록
│   └── test_db.py            # DB 테스트
├── frontend/                 # React 프론트엔드
│   ├── src/
│   │   ├── App.tsx           # 라우팅 설정
│   │   ├── index.tsx         # React 진입점
│   │   ├── index.css         # 글로벌/Tailwind/Quill 스타일
│   │   ├── components/       # UI 컴포넌트
│   │   │   ├── Login/        # 로그인 관련 컴포넌트
│   │   │   ├── PostList/     # 게시글 목록 관련 컴포넌트
│   │   │   ├── PostDetail/   # 게시글 상세 관련 컴포넌트
│   │   │   ├── PostForm/     # 게시글 작성/수정 관련 컴포넌트
│   │   │   ├── PostList.tsx  # 게시글 목록 메인 컴포넌트
│   │   │   ├── PostDetail.tsx # 게시글 상세 메인 컴포넌트
│   │   │   ├── PostForm.tsx  # 게시글 작성/수정 메인 컴포넌트
│   │   │   ├── PostListHeader.tsx # 게시글 목록 헤더
│   │   │   └── ...
│   │   ├── reducers/         # 상태 관리
│   │   │   └── postFormReducer.ts # 게시글 폼 상태 관리
│   │   ├── types/            # TypeScript 타입 정의
│   │   │   ├── post.ts       # 게시글 관련 타입
│   │   │   └── form.ts       # 폼 관련 타입
│   │   ├── services/         # API 통신
│   │   │   └── api.ts        # API 호출 함수
│   │   └── styles/           # 추가 스타일
│   ├── public/               # 정적 파일
│   │   └── index.html        # HTML 템플릿
│   ├── package.json          # npm 패키지 설정
│   ├── package-lock.json     # npm 패키지 잠금 파일
│   ├── tailwind.config.js    # Tailwind CSS 설정
│   ├── postcss.config.js     # PostCSS 설정
│   └── tsconfig.json         # TypeScript 설정
├── docs/                     # 프로젝트 문서
│   ├── API_SPEC.md           # API 명세서
│   ├── Cursor_Board_v1.1.md  # 화면설계서
│   └── DIRECTORY_STRUCTURE.md# 디렉터리 구조 문서
├── README.md                 # 프로젝트 설명
└── run_servers.ps1           # 서버 동시 실행 스크립트
```

## 설치 및 실행 가이드

### 전체 설치 순서
1. PostgreSQL 설치 및 데이터베이스 설정
   - PostgreSQL 14 이상 설치
   - pgAdmin 4로 vibe_board 데이터베이스 생성
   - 데이터베이스 접속 정보 확인 (사용자명, 비밀번호 등)

2. 프로젝트 클론 및 설정
   ```powershell
   git clone [프로젝트_URL]
   cd Vibe_Board
   ```

3. 백엔드 설정 (아래 상세 가이드 참조)
   - 가상환경 생성 및 활성화
   - 패키지 설치
   - 환경 변수 설정

4. 프론트엔드 설정 (아래 상세 가이드 참조)
   - npm 패키지 설치

5. 서버 실행 (아래 상세 가이드 참조)
   - 백엔드 서버 실행
   - 프론트엔드 서버 실행

### 1. 백엔드 설정

1. 가상 환경 생성 및 활성화
```powershell
# backend 디렉토리로 이동
cd backend

# 가상 환경 생성
python -m venv .venv

# 가상 환경 활성화 (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# 가상 환경 활성화 (Windows CMD)
.\.venv\Scripts\activate.bat

# 가상 환경 활성화 (Linux/Mac)
source .venv/bin/activate
```

2. 백엔드 종속성 설치
```powershell
# requirements.txt의 패키지 설치
pip install -r requirements.txt

# 추가로 필요한 패키지 설치
pip install pytz
```

3. 환경 변수 설정
```env
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

### 2. 프론트엔드 설정

```powershell
# frontend 디렉토리로 이동
cd ../frontend

# npm 패키지 설치
npm install
```

### 3. 서버 실행

1. 두 서버를 한 번에 실행하는 방법:
```powershell
# 프로젝트 루트 디렉토리에서
powershell -ExecutionPolicy Bypass -File run_servers.ps1
```

2. 각각 따로 실행하는 방법:
```powershell
# 백엔드 서버 실행 (backend 디렉토리에서)
uvicorn app.main:app --reload

# 프론트엔드 서버 실행 (frontend 디렉토리에서)
npm start
```

### 4. 접속 방법

- 백엔드 API: http://localhost:8000
- 프론트엔드: http://localhost:3000
- API 문서: http://localhost:8000/docs

### 주의사항

1. PostgreSQL이 설치되어 있어야 합니다.
2. 데이터베이스가 생성되어 있어야 합니다.
3. .env 파일의 설정값들이 실제 환경과 일치해야 합니다.
4. 가상환경이 활성화된 상태에서 백엔드 서버를 실행해야 합니다.

## API 문서
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- 상세 API 명세: [API_SPEC.md](docs/API_SPEC.md) 