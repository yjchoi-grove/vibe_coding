# 프로젝트 디렉터리 구조 (최신)

```
Vibe_Board/
├── backend/                  # FastAPI 백엔드
│   ├── app/
│   │   ├── main.py           # FastAPI 진입점
│   │   ├── database.py       # DB 연결
│   │   ├── models/           # SQLAlchemy 모델
│   │   │   ├── yj_posts.py
│   │   │   ├── yj_users.py
│   │   │   ├── yj_comments.py
│   │   │   ├── yj_attachments.py
│   │   │   └── __init__.py
│   │   ├── routers/          # API 라우터
│   │   │   ├── posts.py
│   │   │   ├── comments.py
│   │   │   ├── files.py
│   │   │   ├── auth.py
│   │   │   └── __init__.py
│   │   ├── utils/            # 토큰 등 유틸
│   │   │   └── token.py
│   │   └── __init__.py
│   ├── uploads/              # 첨부파일 저장 폴더
│   ├── requirements.txt      # Python 패키지 목록
│   └── test_db.py            # DB 테스트
├── frontend/                 # React 프론트엔드
│   ├── src/
│   │   ├── App.tsx           # 라우팅
│   │   ├── index.tsx         # 진입점
│   │   ├── index.css         # 글로벌/Tailwind/Quill 스타일
│   │   ├── components/       # 주요 UI 컴포넌트
│   │   │   ├── Login/
│   │   │   ├── PostList/
│   │   │   ├── PostDetail/
│   │   │   ├── PostForm/
│   │   │   ├── PostList.tsx
│   │   │   ├── PostDetail.tsx
│   │   │   ├── PostForm.tsx
│   │   │   ├── PostListHeader.tsx
│   │   │   └── ...
│   │   ├── reducers/         # 상태관리(reducer)
│   │   │   └── postFormReducer.ts
│   │   ├── types/            # 타입 정의
│   │   │   ├── post.ts
│   │   │   └── form.ts
│   │   ├── services/         # API 서비스
│   │   │   └── api.ts
│   │   └── styles/           # 추가 스타일(예: NewPostButton.ts)
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── tsconfig.json
├── docs/                     # 문서 폴더
│   ├── API_SPEC.md           # API 명세서(Markdown)ㅈ
│   ├── Cursor_Board_v1.1.md  # 화면설계서 최신본
│   ├── DIRECTORY_STRUCTURE.md# 디렉터리 구조 문서(본 파일)
│   └── ...
├── README.md                 # 프로젝트 설명
├── run_servers.ps1           # 서버 동시 실행 스크립트
└── ...
```

> 각 폴더/파일의 역할은 주석으로 표시했습니다.
> 실제 파일/폴더는 프로젝트 진행에 따라 추가/변경될 수 있습니다. 