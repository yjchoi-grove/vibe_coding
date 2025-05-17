# 게시판 시스템 화면설계서 (v0.3)

<div style="text-align: center; padding: 50px;">
<h1 style="font-size: 2.5em;">게시판 시스템<br>화면설계서</h1>

<p style="font-size: 1.5em; margin: 30px 0;">Version 0.3</p>

<div style="margin: 50px 0; line-height: 1.8;">
작성자: 최윤지<br>
작성일: 2025년 4월<br>
문서 상태: 최신화<br>
문서 분류: 토이프로젝트
</div>

<p style="margin-top: 100px;">
본 문서는 게시판 시스템의 화면설계 명세를 담고 있으며,<br>
학습 및 포트폴리오 목적으로 작성되었습니다.
</p>
</div>

<div style="page-break-after: always;"></div>

<!-- TOC -->

- [게시판-시스템-화면설계서](#게시판-시스템-화면설계서)
- [개요](#개요)
  - [문서-이력](#문서-이력)
  - [문서-목적](#문서-목적)
  - [적용-범위](#적용-범위)
- [시스템-구성](#시스템-구성)
- [화면-구성](#화면-구성)
  - [로그인-화면](#로그인-화면)
  - [게시판-목록-화면](#게시판-목록-화면)
  - [게시글-상세-화면](#게시글-상세-화면)
  - [게시글-작성수정-화면](#게시글-작성수정-화면)
  - [화면-레이아웃-상세-설계](#화면-레이아웃-상세-설계)
- [데이터-구조](#데이터-구조)
- [API-엔드포인트-상세](#api-엔드포인트-상세)
- [보안-요구사항](#보안-요구사항)
- [화면-이동-흐름도](#화면-이동-흐름도)
- [부록](#부록)

<!-- /TOC -->

<div style="page-break-after: always;"></div>

# 개요

본 문서는 게시판 시스템의 화면 설계 명세서로서, 사용자 인터페이스와 기능적 요구사항을 상세히 기술합니다.

## 문서-이력
<div style="page-break-inside: avoid;">

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|------------|
| 1.0 | 2025.04 | 최윤지 | 최초 작성 |
| 1.1 | 2025.05 | 최윤지 | 수정 |

</div>

## 문서-목적

본 화면설계서의 목적은 다음과 같습니다:
1. 게시판 시스템의 UI/UX 표준 정의
2. 프론트엔드 개발 가이드라인 제공
3. 백엔드 API 설계 기준 제시
4. 데이터베이스 설계를 위한 요구사항 명세

## 적용-범위

본 문서는 다음 항목에 대한 설계 내용을 포함합니다:
- 사용자 인터페이스 레이아웃
- 화면 흐름도
- 기능 명세
- 데이터 구조
- API 명세
- 보안 요구사항

<div style="page-break-after: always;"></div>

# 시스템-구성
- Frontend: React
- Backend: Python (FastAPI)
- Database: PostgreSQL

<div style="page-break-after: always;"></div>

# 화면-구성

## 로그인-화면
- 경로: `/login`
- 구성 요소:
  - 아이디 입력 필드
  - 비밀번호 입력 필드
  - 로그인 버튼
  - 아이디/비밀번호 기억하기(체크박스)
- 기능:
  1. 사용자가 아이디/비밀번호 입력 후 로그인 버튼 클릭 시 로그인 API 호출
  2. 로그인 성공 시:
     - JWT 토큰, userId, userName을 Local Storage에 저장
     - "아이디/비밀번호 기억하기" 체크 시 해당 정보도 Local Storage에 저장
     - 게시판 목록(`/posts`)으로 이동
  3. 로그인 실패 시:
     - "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요." alert 표시
  4. 컴포넌트 마운트 시:
     - "아이디/비밀번호 기억하기"가 체크되어 있으면 Local Storage에서 값 불러와 자동 입력
  5. 세션 관리는 JWT 토큰(Local Storage)로 처리
- UI/UX:
  - 중앙 정렬, 최대 너비 400px, 흰색 배경, 그림자, 라운드 처리
  - 입력 필드: 100% 너비, 48px 높이, 테두리, 포커스 시 파란색
  - 로그인 버튼: 100% 너비, 파란색 배경, 흰색 글씨, hover 시 색상 변화
  - "아이디/비밀번호 기억하기"는 체크박스와 라벨로 좌측 정렬

## 게시판-목록-화면 (v1.1 최신화)
- 경로: `/posts`
- 구성 요소:
  - 상단 헤더: 검색바(검색어, 검색타입: 전체/제목/내용/작성자), 정렬(최신/오래된/조회수), 총 게시글 수, 새 글 작성 버튼
  - 게시글 목록 테이블: 번호, 제목, 작성자, 작성일, 조회수(짝/홀수 행 색상, 클릭 시 상세 이동)
  - 페이지네이션: 5개씩 묶음, 현재 페이지 하이라이트, 이전/다음 묶음 이동
- 기능:
  - 검색: 제목+내용/제목/내용/작성자 선택, 검색어 입력, 엔터/버튼으로 검색, 검색어/타입 URL 반영
  - 정렬: 최신/오래된/조회수순, 드롭다운 선택, URL 반영
  - 목록: 10개씩 페이지네이션, 총 게시글 수 표시, 짝/홀수 행 색상, 클릭 시 상세 이동(검색/정렬/페이지 상태 유지)
  - 새 글 작성: 버튼 클릭 시 `/posts/new` 이동
  - 작성자 클릭: 해당 작성자 게시글만 필터(토글)
  - 로딩/빈 목록/검색결과 없음 안내
- UI/UX:
  - Tailwind 기반 반응형, 상단 헤더/검색/정렬/버튼 그룹화
  - 테이블: 컬럼별 정렬, 짝/홀수 행 색상, hover 시 파란 배경
  - 페이지네이션: 5개씩, 현재 페이지 강조, 이전/다음 묶음 버튼
  - 모바일/데스크탑 모두 최적화

## 게시글-상세-화면
- 경로: `/posts/:id`
- 구성 요소:
  - 게시글 정보(헤더)
    - 제목, 작성자, 작성일시, 조회수
    - [목록] [수정] [삭제] 버튼 (작성자만 수정/삭제 노출)
  - 본문 영역
    - 동영상(YouTube, 네이버TV 등 임베드 지원, 미지원시 안내)
    - 이미지(첨부 이미지 미리보기)
    - 내용(HTML 렌더링, XSS 방지)
    - 첨부파일(파일명, 크기, 다운로드, 이미지 썸네일)
  - 댓글 영역
    - 댓글 입력폼(200자 제한, 실시간 글자수, Shift+Enter 줄바꿈)
    - 댓글 목록(최신순, 5개씩 더보기, 삭제/수정/답글, 삭제시 "삭제된 댓글입니다" 안내)
    - 대댓글 1단계, 답글 입력폼(200자 제한)
    - 본인 댓글만 수정/삭제 가능, 수정시 인라인 폼
- 기능:
  - 게시글 상세 조회(토큰 필요)
  - 첨부파일 다운로드(이미지/비이미지 구분)
  - 동영상 URL 자동 임베드(YouTube, 네이버TV)
  - 댓글/대댓글 작성, 수정, 삭제(본인만, 삭제시 소프트 삭제)
  - 댓글 200자 제한, 실시간 글자수, Shift+Enter 줄바꿈
  - 댓글 더보기(5개씩), 대댓글 1단계만 허용
  - 댓글 없는 게시글만 삭제 가능, 삭제시 확인창
  - 목록 이동 시 검색/페이지 상태 유지
- UI/UX:
  - Tailwind 기반 반응형, 카드/섹션별 그림자/라운드
  - 헤더: 제목(크게), 작성자/날짜/조회수(작게), 버튼 그룹
  - 본문: 동영상/이미지/내용/첨부파일 순서, 각 영역 구분
  - 첨부파일: 이미지 썸네일, 파일명/크기, 다운로드 버튼
  - 댓글: 입력폼 상단, 목록 하단, 삭제/수정/답글 버튼 우측 정렬
  - 삭제된 댓글은 회색 이탤릭 안내문구
  - 댓글 입력/수정/답글 폼은 포커스 시 파란 테두리, 글자수 초과시 경고
  - 모바일/데스크탑 모두 최적화

## 게시글-작성수정-화면 (v1.1 최신화)
- 경로: `/posts/new` 또는 `/posts/:id/edit`
- 구성 요소:
  - 제목 입력 필드(200자 제한, 에러 시 포커스, 실시간 글자수, 필수)
  - 내용 입력 필드(React-Quill 기반 에디터, 2000자 제한, 실시간 글자수, 포커스/에러 스타일, XSS 방지)
  - 동영상 URL 입력(YouTube/네이버TV 지원, 입력 시 미리보기, 유효성 안내)
  - 이미지 URL 입력(입력 시 미리보기, 에러 안내)
  - 첨부파일 업로드(드래그앤드롭, 다중, 이미지 썸네일, 파일명/크기, 삭제, 10MB/50MB 제한)
  - 기존 첨부파일 목록(수정 시, 이미지 썸네일, 삭제)
  - 저장/취소 버튼(우측 정렬, 작성/수정 모드 구분)
- 기능:
  - 필수 입력값(제목, 내용) 유효성 검사 및 에러 표시
  - 본문 에디터: React-Quill, 포커스/블러/에러 시 스타일, 파란 테두리/그림자
  - 동영상 URL 입력 시 자동 미리보기(YouTube/네이버TV), 미지원 안내
  - 이미지 URL 입력 시 미리보기, 에러 안내
  - 첨부파일: 드래그앤드롭, 다중 업로드, 이미지/비이미지 구분, 썸네일, 삭제, 용량/형식 제한
  - 기존 첨부파일(수정 시) 목록/삭제
  - 저장/취소 버튼: 작성/수정 모드에 따라 텍스트 변경
  - 저장 시 전체 유효성 검사, 에러 시 해당 입력 포커스
- UI/UX:
  - Tailwind 기반 반응형, 카드/섹션별 그림자/라운드
  - 제목/에디터/동영상/이미지/첨부파일 순서, 각 영역 구분
  - 입력 필드: 포커스 시 파란 테두리, 에러 시 빨간 테두리/메시지
  - 에디터: 툴바/본문 일체형, 포커스/블러/에러 스타일 일관성
  - 동영상/이미지: 미리보기 카드, 에러 안내문구
  - 첨부파일: 썸네일, 파일명/크기, 삭제 버튼, 업로드 진행률(추가 구현 가능)
  - 저장/취소 버튼: 우측 정렬, 색상/상태 구분
  - 모바일/데스크탑 모두 최적화

## 화면-레이아웃-상세-설계

### 화면-레이아웃-상세-설계

### 3.5.1 공통 레이아웃
- 헤더 영역 (모든 페이지 공통)
  - 높이: 60px
  - 좌측: 서비스 로고 (클릭 시 목록으로 이동)
  - 우측: 로그인 상태 표시 및 로그아웃 버튼
  - 반응형 브레이크포인트: 768px (모바일)
  - 배경색: #ffffff
  - 그림자 효과: 0 2px 4px rgba(0,0,0,0.1)

### 3.5.2 로그인 화면 레이아웃
```
+------------------------+
|        로그인         |
+------------------------+
|                       |
|   +----------------+  |
|   |  아이디 입력   |  |
|   +----------------+  |
|                       |
|   +----------------+  |
|   | 비밀번호 입력  |  |
|   +----------------+  |
|                       |
|   +----------------+  |
|   |   로그인 버튼   |  |
|   +----------------+  |
|                       |
+------------------------+
```
- 중앙 정렬 컨테이너
  - 최대 너비: 400px
  - 패딩: 40px
  - 배경색: #ffffff
  - 그림자 효과: 0 4px 6px rgba(0,0,0,0.1)
- 입력 필드
  - 너비: 100%
  - 높이: 40px
  - 마진: 하단 16px
  - 테두리: 1px solid #e0e0e0
  - 폰트 크기: 14px
- 로그인 버튼
  - 너비: 100%
  - 높이: 48px
  - 배경색: #007bff
  - 텍스트 색상: #ffffff
  - 폰트 크기: 16px
  - hover 효과: 밝기 10% 감소

### 3.5.3 게시판 목록 화면 레이아웃
```
+------------------------+
|     검색 & 버튼       |
| +------------------+  |
| |    검색 입력     |  |
| +------------------+  |
|              [새글쓰기]|
+------------------------+
|     게시글 목록       |
| +------------------+  |
| | 번호 제목 작성자  |  |
| | 날짜     조회수  |  |
| +------------------+  |
| |       ...        |  |
| +------------------+  |
+------------------------+
```
- 검색 영역
  - 상단 여백: 24px
  - 검색창 너비: 300px (모바일: 100%)
  - 검색창 높이: 40px
  - 우측 새글쓰기 버튼
    - 너비: 100px
    - 높이: 40px
    - 배경색: #28a745
- 게시글 목록 테이블
  - 반응형 테이블 레이아웃
  - 열 구성 및 너비
    - 번호: 8%
    - 제목: 50%
    - 작성자: 15%
    - 작성일: 15%
    - 조회수: 12%
  - 행 높이: 48px
  - 짝수/홀수 행 구분 배경색
  - hover 효과: 배경색 변경

### 3.5.4 게시글 상세 화면 레이아웃
```
+------------------------+
|     게시글 정보       |
| 제목                  |
| 작성자 | 날짜 | 조회수 |
+------------------------+
|     본문 영역         |
|                       |
| [동영상 플레이어]     |
|                       |
| 텍스트 내용          |
|                       |
+------------------------+
|     첨부파일          |
| - 파일1.pdf          |
| - 파일2.jpg          |
+------------------------+
|     댓글 영역         |
| +------------------+  |
| |    댓글 입력     |  |
| +------------------+  |
|                       |
| 댓글 목록            |
| - 댓글1              |
| - 댓글2              |
+------------------------+
```
- 게시글 헤더
  - 제목 영역
    - 폰트 크기: 24px
    - 여백: 하단 16px
  - 메타 정보 영역
    - 폰트 크기: 14px
    - 색상: #666666
- 본문 영역
  - 최대 너비: 900px
  - 여백: 상하 40px
  - 동영상 플레이어
    - 비율: 16:9
    - 최대 너비: 100%
  - 텍스트 컨텐츠
    - 폰트 크기: 16px
    - 줄 간격: 1.6
- 첨부파일 영역
  - 배경색: #f8f9fa
  - 패딩: 16px
  - 파일 아이콘: 좌측 배치
- 댓글 영역
  - 상단 구분선
  - 댓글 입력
    - 높이: 100px
    - 여백: 하단 24px
  - 댓글 목록
    - 개별 댓글 패딩: 16px
    - 댓글 간 구분선

### 3.5.5 게시글 작성/수정 화면 레이아웃
```
+------------------------+
|     글쓰기/수정       |
| +------------------+  |
| |    제목 입력     |  |
| +------------------+  |
|                       |
| +------------------+  |
| |  동영상 URL 입력 |  |
| +------------------+  |
|                       |
| +------------------+  |
| |    본문 에디터    |  |
| |                  |  |
| |                  |  |
| +------------------+  |
|                       |
| [파일 첨부 영역]      |
|                       |
| [저장] [취소]        |
+------------------------+
```
- 입력 폼 레이아웃
  - 최대 너비: 1000px
  - 중앙 정렬
  - 여백: 상하 40px
- 제목 입력
  - 높이: 48px
  - 폰트 크기: 18px
  - 여백: 하단 24px
- 동영상 URL 입력
  - 높이: 40px
  - URL 유효성 검증 표시
- 본문 에디터
  - 높이: 최소 400px
  - 툴바 높이: 40px
  - 여백: 상하 24px
- 첨부파일 영역
  - 드래그 앤 드롭 영역
  - 높이: 120px
  - 파일 목록 표시
- 버튼 영역
  - 우측 정렬
  - 버튼 간격: 16px
  - 버튼 크기: 120px x 40px

### 3.6 주요 기능 상세 명세

#### 3.6.1 인증 시스템
- 로그인 프로세스
  - Local Storage 기반 사용자 정보 관리
    - 저장 데이터: { userId, username, token, loginTime }
    - 토큰 만료 시간: 12시간
  - 로그인 실패 처리
    - 3회 연속 실패 시 1분간 로그인 시도 제한
    - 실패 메시지 표시: "아이디 또는 비밀번호가 일치하지 않습니다"
  - 자동 로그아웃
    - 토큰 만료 시 자동 로그아웃
    - 세션 만료 3분 전 갱신 알림 표시

#### 3.6.2 게시글 검색 시스템
- 검색 기능 상세
  - 검색 대상 필드: 제목, 내용
  - 실시간 검색 (타이핑 후 300ms 딜레이)
  - 검색어 최소 길이: 2자
  - 검색 결과 정렬
    - 기본: 최신 등록순
    - 정렬 옵션: 조회수순, 댓글많은순
  - 검색어 하이라이팅 처리
  - 최근 검색어 5개 저장 및 표시

#### 3.6.3 파일 업로드 시스템
- 파일 업로드 제한사항
  - 최대 파일 크기: 개별 10MB, 총 50MB
  - 허용 파일 형식
    - 이미지: jpg, jpeg, png, gif
    - 문서: pdf, doc, docx, xls, xlsx
    - 압축: zip, rar
  - 파일명 처리
    - 한글 파일명 허용
    - 특수문자 자동 제거
    - 중복 파일명 처리 (숫자 자동 추가)
- 업로드 UI/UX
  - 드래그 앤 드롭 지원
  - 업로드 진행률 표시
  - 썸네일 미리보기 (이미지 파일)
  - 파일 크기/형식 즉시 검증

#### 3.6.4 동영상 URL 처리
- 지원 플랫폼
  - YouTube
  - Vimeo
  - 네이버 TV
- URL 처리 방식
  - 자동 포맷 감지 및 변환
  - 임베드 코드 자동 생성
  - 썸네일 자동 추출
- 플레이어 기능
  - 반응형 크기 조절
  - 자동재생 옵션 (기본값: OFF)
  - 플레이어 컨트롤 커스터마이징

#### 3.6.5 댓글 시스템
- 댓글 작성
  - 텍스트 제한: 500자
  - 줄바꿈 허용 (최대 3줄)
  - 이모지 지원
  - 실시간 글자수 표시
- 댓글 표시
  - 페이지당 20개 댓글 표시
  - 더보기 방식의 페이징
  - 대댓글 1단계만 허용
- 댓글 정렬
  - 기본: 최신순
  - 옵션: 과거순
- 댓글 수정/삭제
  - 수정 시 수정 시간 표시
  - 삭제 시 "삭제된 댓글입니다" 표시
  - 수정 가능 시간: 작성 후 24시간 이내

#### 3.6.6 게시글 관리
- 임시저장 기능
  - 자동 저장 간격: 1분
  - 최대 5개 임시저장 글 유지
  - 브라우저 종료 시에도 유지
- 게시글 삭제
  - 삭제 확인 대화상자 표시
  - 첨부파일 자동 삭제
  - 관련 댓글 일괄 삭제
- 게시글 수정
  - 수정 이력 관리
  - 버전 관리 (최근 3개 버전)
  - 수정일시 표시

#### 3.6.7 반응형 동작
- 모바일 최적화
  - 터치 기반 UI 조정
    - 버튼 크기: 최소 44x44px
    - 터치 간격: 최소 8px
  - 모바일 테이블 최적화
    - 중요 컬럼 우선 표시
    - 가로 스크롤 제거
  - 이미지 최적화
    - 자동 리사이징
    - 지연 로딩 적용
- 태블릿 최적화
  - 화면 분할 레이아웃
  - 사이드바 동적 표시/숨김
- 데스크톱 최적화
  - 단축키 지원
  - 드래그 앤 드롭 강화
  - 멀티컬럼 레이아웃

<div style="page-break-after: always;"></div>

# 데이터-구조

## 4.1 사용자 정보 (users)
<div style="page-break-inside: avoid;">

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,  -- 암호화된 비밀번호
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    login_attempts INTEGER DEFAULT 0,
    CONSTRAINT username_length CHECK (char_length(username) >= 3)
);
```

</div>

## 4.2 게시글 (posts)
<div style="page-break-inside: avoid;">

```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    video_url VARCHAR(500),
    author_id INTEGER NOT NULL REFERENCES users(id),
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    CONSTRAINT title_length CHECK (char_length(title) >= 2),
    CONSTRAINT content_length CHECK (char_length(content) >= 10)
);

CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_author ON posts(author_id);
```

</div>

## 4.3 첨부파일 (attachments)
<div style="page-break-inside: avoid;">

```sql
CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    CONSTRAINT file_size_check CHECK (file_size > 0 AND file_size <= 10485760)  -- 10MB
);

CREATE INDEX idx_attachments_post ON attachments(post_id);
```

</div>

## 4.4 댓글 (comments)
<div style="page-break-inside: avoid;">

```sql
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id),
    author_id INTEGER NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    parent_id INTEGER REFERENCES comments(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    CONSTRAINT content_length CHECK (char_length(content) <= 500),
    CONSTRAINT valid_parent CHECK (parent_id != id)  -- 자기 자신을 부모로 설정 불가
);

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_author ON comments(author_id);
```

</div>

<div style="page-break-after: always;"></div>

# API-엔드포인트-상세

## 5.1 인증 API
<div style="page-break-inside: avoid;">

```typescript
// POST /api/login
interface LoginRequest {
    username: string;
    password: string;
}

interface LoginResponse {
    token: string;
    user: {
        id: number;
        username: string;
    };
    expiresIn: number;  // 초 단위
}

// POST /api/logout
interface LogoutResponse {
    message: string;
}
```

</div>

## 5.2 게시글 API
<div style="page-break-inside: avoid;">

```typescript
// GET /api/posts
interface PostListRequest {
    page?: number;      // 기본값: 1
    search?: string;    // 검색어
    sort?: 'latest' | 'views' | 'comments';  // 정렬 기준
}

interface PostListResponse {
    posts: Array<{
        id: number;
        title: string;
        author: {
            id: number;
            username: string;
        };
        createdAt: string;
        viewCount: number;
        commentCount: number;
    }>;
    total: number;
}

// GET /api/posts/{id}
interface PostDetailResponse {
    id: number;
    title: string;
    content: string;
    videoUrl?: string;
    author: {
        id: number;
        username: string;
    };
    createdAt: string;
    updatedAt: string;
    viewCount: number;
    attachments: Array<{
        id: number;
        filename: string;
        size: number;
        mimeType: string;
    }>;
    comments: Array<CommentType>;
}

// POST /api/posts
interface CreatePostRequest {
    title: string;
    content: string;
    videoUrl?: string;
    attachments?: Array<{
        file: File;
    }>;
}

// PUT /api/posts/{id}
interface UpdatePostRequest {
    title?: string;
    content?: string;
    videoUrl?: string;
    attachmentsToAdd?: Array<{
        file: File;
    }>;
    attachmentsToRemove?: number[];  // 삭제할 첨부파일 ID 목록
}
```

</div>

## 5.3 첨부파일 API
<div style="page-break-inside: avoid;">

```typescript
// POST /api/posts/{id}/files
interface UploadFilesRequest {
    files: Array<File>;
}

interface UploadFilesResponse {
    files: Array<{
        id: number;
        filename: string;
        size: number;
        mimeType: string;
        url: string;
    }>;
}

// GET /api/files/{id}
// 파일 다운로드 응답
// Content-Disposition: attachment; filename="원본파일명"
```

</div>

## 5.4 댓글 API
<div style="page-break-inside: avoid;">

```typescript
// GET /api/posts/{id}/comments
interface CommentListRequest {
    page?: number;  // 기본값: 1
    sort?: 'latest' | 'oldest';
}

interface CommentType {
    id: number;
    content: string;
    author: {
        id: number;
        username: string;
    };
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    replies?: Array<CommentType>;
}

// POST /api/posts/{id}/comments
interface CreateCommentRequest {
    content: string;
    parentId?: number;  // 대댓글인 경우
}

// PUT /api/comments/{id}
interface UpdateCommentRequest {
    content: string;
}
```

</div>

## 5.5 API 응답 형식
<div style="page-break-inside: avoid;">

```typescript
// 성공 응답 형식
interface SuccessResponse<T> {
    success: true;
    data: T;
}

// 에러 응답 형식
interface ErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
    };
}

// 에러 코드 정의
enum ErrorCode {
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    NOT_FOUND = 'NOT_FOUND',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    INTERNAL_ERROR = 'INTERNAL_ERROR'
}
```

</div>

## 5.6 API 상태 코드
<div style="page-break-inside: avoid;">

| 상태 코드 | 설명 |
|----------|------|
| 200 | 성공 |
| 201 | 리소스 생성 성공 |
| 400 | 잘못된 요청 (입력값 오류 등) |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 리소스를 찾을 수 없음 |
| 500 | 서버 내부 오류 |

</div>

<div style="page-break-after: always;"></div>

# 보안-요구사항

## 6.1 인증 및 인가
- 토큰 기반 인증
  - JWT(JSON Web Token) 사용
  - 토큰 구성
    ```typescript
    interface JWTPayload {
        userId: number;
        username: string;
        iat: number;  // 발급 시간
        exp: number;  // 만료 시간
    }
    ```
  - 토큰 관리
    - Access Token 유효기간: 12시간
    - 토큰 저장: Local Storage
    - 토큰 갱신: 만료 3분 전 자동 갱신
  - 보안 헤더
    ```
    Authorization: Bearer <token>
    ```

- 권한 관리
  - 리소스 접근 제어
    - 게시글: 작성자만 수정/삭제 가능
    - 댓글: 작성자만 수정/삭제 가능
    - 첨부파일: 게시글 작성자만 관리 가능
  - API 엔드포인트 보호
    - 인증 필요 엔드포인트 명시
    - 권한 검증 미들웨어 적용

## 6.2 입력 데이터 검증
- XSS(Cross-Site Scripting) 방지
  - HTML 태그 이스케이프 처리
  - React의 기본 XSS 방지 활용
  - 동적 컨텐츠 렌더링 시 DOMPurify 사용
  ```typescript
  import DOMPurify from 'dompurify';
  
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target']
  });
  ```

- SQL Injection 방지
  - PreparedStatement 사용
  - ORM(SQLAlchemy) 활용
  - 입력값 파라미터화
  ```python
  # FastAPI with SQLAlchemy
  @app.get("/posts/{post_id}")
  async def get_post(post_id: int):
      post = db.query(Post).filter(Post.id == post_id).first()
      if not post:
          raise HTTPException(status_code=404, detail="Post not found")
      return post
  ```

- 입력값 유효성 검증
  ```python
  from pydantic import BaseModel, constr, HttpUrl
  
  class CreatePostRequest(BaseModel):
      title: constr(min_length=2, max_length=200)
      content: constr(min_length=10)
      video_url: Optional[HttpUrl]
  ```

## 6.3 파일 업로드 보안
- 파일 업로드 제한사항
  - 허용된 MIME 타입만 수용
    ```python
    ALLOWED_MIME_TYPES = {
        'image/jpeg', 'image/png', 'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/zip', 'application/x-rar-compressed'
    }
    ```
  - 파일 크기 제한
    - 개별 파일: 10MB
    - 총 업로드: 50MB
  - 파일명 보안
    - 확장자 검증
    - 안전한 파일명 생성
    ```python
    import uuid
    def secure_filename(filename: str) -> str:
        ext = filename.rsplit('.', 1)[1].lower()
        return f"{uuid.uuid4()}.{ext}"
    ```

## 6.4 CSRF 방지
- CSRF 토큰 적용
  ```typescript
  // API 요청 시 CSRF 토큰 포함
  axios.defaults.headers.common['X-CSRF-TOKEN'] = getCsrfToken();
  ```
- SameSite 쿠키 정책
  ```python
  # FastAPI CORS 설정
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["http://localhost:3000"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"]
  )
  ```

## 6.5 보안 헤더
```python
# FastAPI 보안 헤더 설정
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["example.com"])
app.add_middleware(HTTPSRedirectMiddleware)

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response
```

## 6.6 에러 처리 및 로깅
- 보안 관련 에러 로깅
  ```python
  import logging
  
  logger = logging.getLogger("security")
  
  @app.exception_handler(SecurityException)
  async def security_exception_handler(request, exc):
      logger.warning(
          f"Security violation: {exc.detail}",
          extra={
              "ip": request.client.host,
              "path": request.url.path,
              "user_id": request.state.user.id if hasattr(request.state, "user") else None
          }
      )
      return JSONResponse(
          status_code=exc.status_code,
          content={"error": "Security violation", "detail": exc.detail}
      )
  ```

- 민감한 정보 보호
  - 에러 메시지에서 시스템 정보 제외
  - 프로덕션 환경에서 상세 에러 스택 트레이스 비활성화
  - 로그에서 민감한 정보 마스킹
  ```python
  def mask_sensitive_data(data: dict) -> dict:
      masked = data.copy()
      if "password" in masked:
          masked["password"] = "********"
      return masked
  ```

## 6.7 보안 모니터링
- 로그인 시도 모니터링
  - 연속 실패 횟수 제한
  - IP 기반 차단
  - 의심스러운 활동 탐지
- 파일 업로드 모니터링
  - 업로드 패턴 분석
  - 악성 파일 스캔
- 비정상 접근 탐지
  - 요청 빈도 제한
  - IP 블랙리스트 관리

<div style="page-break-after: always;"></div>

# 화면-이동-흐름도
```
로그인 화면 -> 게시판 목록
                |
                ├-> 게시글 상세 -> 게시글 수정
                |
                └-> 게시글 작성
```

<div style="page-break-after: always;"></div>

# 부록

## A.1 용어 정의
<div style="page-break-inside: avoid;">

| 용어 | 설명 |
|------|------|
| JWT | JSON Web Token의 약자로, 웹에서 사용되는 토큰 기반 인증 방식 |
| XSS | Cross-Site Scripting의 약자로, 웹 애플리케이션 보안 취약점 |
| CSRF | Cross-Site Request Forgery의 약자로, 웹 보안 공격 유형 |
| API | Application Programming Interface의 약자로, 애플리케이션 간 통신 인터페이스 |

</div>

## A.2 참고 문헌
1. React 공식 문서: https://reactjs.org/
2. FastAPI 공식 문서: https://fastapi.tiangolo.com/
3. PostgreSQL 공식 문서: https://www.postgresql.org/docs/ 


 <!-- 최종 피드백 계선 필요 -->
1. 검색조건 : 제목, 본문검색, 작성자
2. 정렬 : 작성일, 조회수
3. 내용 : 에디터로 수정
4. 댓글 : 댓글 작성되어 있는 글은 삭제 안되게 수정
5. 디렉터리 구조 문서 작성
6. 테일윈드 : css 라이브러리 tailwind
7. 사용한 라이브러리 설명 문서 작성

## 기타 주요 컴포넌트 (폴더 제외 단일 파일)

### PostForm.tsx (게시글 작성/수정 통합 폼)
- 역할: 게시글 작성/수정 통합 폼, useReducer로 상태 일괄 관리, 제목/동영상/이미지/내용/첨부파일 등 입력 지원, 임시저장/유효성/수정모드 등 다양한 기능 포함
- 주요 기능:
  - useReducer로 입력값/첨부파일/에러 등 상태 일괄 관리
  - 제목, 동영상, 이미지, 본문, 첨부파일 입력 및 유효성 검사
  - React-Quill 에디터(포커스/에러/글자수/스타일)
  - 임시저장(로컬스토리지, 페이지 이탈 경고)
  - 수정모드: 기존 데이터 불러오기, 기존 첨부파일 삭제
  - 저장/취소 버튼(작성/수정 모드 구분)
  - 각 입력별 에러 시 포커스, 실시간 글자수, 입력 제한
  - Tailwind 기반 반응형, 카드/섹션별 그림자/라운드

### PostListHeader.tsx (게시글 목록 상단 헤더)
- 역할: 게시글 목록 상단(검색, 정렬, 총 게시글 수 등) UI/UX 제공
- 주요 기능:
  - 검색어 입력, 검색타입(전체/제목/내용/작성자) 드롭다운
  - 정렬(최신/오래된/조회수) 드롭다운
  - 총 게시글 수 표시
  - 반응형 레이아웃(모바일/데스크탑)
  - Tailwind 기반 스타일, 버튼/입력/드롭다운 일관성

## 프론트엔드 루트 파일(App.tsx, index.tsx, index.css)

### App.tsx
- 역할: 전체 앱의 라우팅 담당, 주요 페이지(로그인, 게시글 목록, 상세, 작성/수정) 라우트 정의
- 주요 기능:
  - react-router-dom의 Routes/Route로 각 경로별 컴포넌트 연결
  - / → /login 리다이렉트, /login, /posts, /posts/:id, /posts/new, /posts/:id/edit 등 라우팅

### index.tsx
- 역할: 앱 진입점, ReactDOM으로 루트 렌더링, BrowserRouter로 라우팅 적용
- 주요 기능:
  - index.css 글로벌 스타일 적용
  - <Router>로 <App /> 전체 감싸기

### index.css
- 역할: Tailwind CSS 기반 글로벌 스타일, Quill 에디터 커스텀 스타일 포함
- 주요 기능:
  - @tailwind base/components/utilities로 Tailwind 전체 적용
  - Quill 에디터 포커스/에러/툴바/본문 등 커스텀 스타일
  - 에디터 포커스 시 파란 테두리, 에러 시 빨간 테두리 등 UI 일관성

</rewritten_file> 