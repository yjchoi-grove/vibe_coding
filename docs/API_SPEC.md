# Vibe Board API 명세서

---

## 인증 (auth.py)

### 사용자 로그인
- **POST** `/api/login`
- **설명**: 사용자 로그인(JWT 토큰 발급)
- **인증 필요**: X
- **Request (application/x-www-form-urlencoded)**
  - `username` (string, 필수): 아이디
  - `password` (string, 필수): 비밀번호
- **Response (200)**
```json
{
  "access_token": "<JWT 토큰>",
  "token_type": "bearer",
  "userName": "홍길동"
}
```
- **실패 예시 (401)**
```json
{
  "detail": "아이디 또는 비밀번호가 일치하지 않습니다"
}
```
- **필드 설명**
  - `access_token`: 인증에 사용할 JWT 토큰
  - `token_type`: 항상 "bearer"
  - `userName`: 로그인한 사용자의 이름

---

## 게시글 (posts.py)

### 게시글 목록 조회
- **GET** `/api/posts`
- **설명**: 게시글 목록 조회 (페이지네이션, 검색, 정렬 지원)
- **인증 필요**: O (Bearer Token)
- **Query**
  - `page` (int, 기본 1): 페이지 번호
  - `search` (string, optional): 검색어
  - `search_type` (string, optional: title, content, author): 검색 타입
  - `author_id` (string, optional): 작성자 ID
  - `sortBy` (string, 기본 createdAt): 정렬 기준
  - `sortOrder` (string, 기본 desc): 정렬 순서
- **Response (200)**
```json
{
  "posts": [
    {
      "id": 1,
      "title": "제목",
      "author": {"id": "user1", "name": "홍길동"},
      "createdAt": "2025-05-14T10:00:00",
      "view_cnt": 10,
      "commentCount": 2
    }
  ],
  "total": 1
}
```
- **필드 설명**
  - `id`: 게시글 고유번호
  - `title`: 게시글 제목
  - `author`: 작성자 정보 (id, name)
  - `createdAt`: 작성일시(ISO8601)
  - `view_cnt`: 조회수
  - `commentCount`: 댓글 수
  - `total`: 전체 게시글 수
- **에러 예시**
  - 인증 실패 시 401

### 게시글 상세 조회
- **GET** `/api/posts/{id}`
- **설명**: 게시글, 첨부파일, 댓글(대댓글 포함) 정보 반환
- **인증 필요**: O (Bearer Token)
- **Path**
  - `id` (int, 게시글 ID)
- **Response (200)**
```json
{
  "id": 1,
  "title": "제목",
  "content": "내용",
  "videoUrl": "https://youtube.com/...",
  "imgUrl": "https://...jpg",
  "author": {"id": "user1", "name": "홍길동"},
  "createdAt": "2025-05-14T10:00:00",
  "updatedAt": "2025-05-14T10:00:00",
  "view_cnt": 10,
  "attachments": [
    {
      "id": 1,
      "filename": "file.jpg",
      "original_filename": "file.jpg",
      "file_path": "./uploads/file.jpg",
      "file_size": 12345,
      "mime_type": "image/jpeg"
    }
  ],
  "comments": [
    {
      "id": 1,
      "content": "댓글 내용",
      "author": {"id": "user2", "name": "김철수"},
      "createdAt": "2025-05-14T10:01:00",
      "updatedAt": "2025-05-14T10:01:00",
      "isDeleted": false,
      "parent_id": 0,
      "replies": []
    }
  ]
}
```
- **필드 설명**
  - `id`: 게시글 고유번호
  - `title`: 게시글 제목
  - `content`: 게시글 본문
  - `videoUrl`: 동영상 URL
  - `imgUrl`: 이미지 URL
  - `author`: 작성자 정보 (id, name)
  - `createdAt`, `updatedAt`: 작성/수정일시(ISO8601)
  - `view_cnt`: 조회수
  - `attachments`: 첨부파일 목록
  - `comments`: 댓글/대댓글 목록
- **에러 예시**
  - 404: 게시글이 존재하지 않을 때
  - 401: 인증 실패

### 게시글 생성
- **POST** `/api/posts`
- **설명**: 게시글 생성 (제목, 내용, 동영상/이미지 URL, 첨부파일 업로드)
- **인증 필요**: O (Bearer Token)
- **Request (multipart/form-data)**
  - `title` (string, 필수): 1~200자, 공백 불가
  - `content` (string, 필수): 공백 불가
  - `video_url` (string, optional): YouTube/네이버TV만 허용
  - `img_url` (string, optional): jpg/png/gif/webp 등 이미지 확장자만 허용
  - `files` (List[UploadFile], optional): 10MB 이하, 허용 확장자만
- **Response (200)**: 게시글 상세 정보(위와 동일)
- **에러 예시**
  - 400: 필수값 누락, 허용되지 않는 파일/URL
  - 401: 인증 실패
  - 422: 잘못된 요청 형식

### 게시글 수정
- **PUT** `/api/posts/{id}`
- **설명**: 게시글 수정 (제목, 내용, 동영상/이미지 URL, 첨부파일 수정)
- **인증 필요**: O (Bearer Token)
- **Request (multipart/form-data)**
  - `title` (string, 필수)
  - `content` (string, 필수)
  - `video_url` (string, optional)
  - `img_url` (string, optional)
  - `files` (List[UploadFile], optional)
- **Response (200)**: 게시글 상세 정보(위와 동일)
- **에러 예시**
  - 404: 게시글이 존재하지 않을 때
  - 403: 작성자만 수정 가능
  - 401: 인증 실패

### 게시글 삭제
- **DELETE** `/api/posts/{id}`
- **설명**: 게시글과 첨부파일을 소프트 삭제 처리
- **인증 필요**: O (Bearer Token)
- **Path**
  - `id` (int, 게시글 ID)
- **Response (200)**
```json
{
  "message": "Post and its attachments deleted successfully"
}
```
- **에러 예시**
  - 404: 게시글이 존재하지 않을 때
  - 403: 작성자만 삭제 가능
  - 401: 인증 실패

---

## 첨부파일 (files.py)

### 첨부파일 목록 조회
- **GET** `/api/attachments`
- **설명**: 모든 첨부파일 목록 조회
- **인증 필요**: O (Bearer Token)
- **Response (200)**
```json
[
  {
    "id": 1,
    "post_no": 1,
    "filename": "file.jpg",
    "original_filename": "file.jpg",
    "file_path": "./uploads/file.jpg",
    "file_size": 12345,
    "mime_type": "image/jpeg",
    "created_at": "2025-05-14T10:00:00"
  }
]
```
- **필드 설명**
  - `id`: 첨부파일 고유번호
  - `post_no`: 게시글 번호
  - `filename`: 저장된 파일명
  - `original_filename`: 원본 파일명
  - `file_path`: 파일 경로
  - `file_size`: 파일 크기 (byte)
  - `mime_type`: MIME 타입
  - `created_at`: 업로드 일시

### 게시글 첨부파일 목록 조회
- **GET** `/api/posts/{post_id}/attachments`
- **설명**: 특정 게시글의 첨부파일 목록 조회
- **인증 필요**: O (Bearer Token)
- **Path**
  - `post_id` (int, 게시글 ID)
- **Response (200)**: 위와 동일

### 첨부파일 업로드
- **POST** `/api/posts/{id}/files`
- **설명**: 게시글에 첨부파일 업로드 (기존 첨부파일 소프트 삭제 후 새 파일 업로드)
- **인증 필요**: O (Bearer Token)
- **Path**
  - `id` (int, 게시글 ID)
- **Request (multipart/form-data)**
  - `file` (UploadFile, 필수)
- **Response (200)**
```json
{
  "filename": "file.jpg",
  "id": 1
}
```
- **에러 예시**
  - 404: 게시글이 존재하지 않을 때
  - 400: 파일 크기/확장자 오류
  - 401: 인증 실패

### 첨부파일 삭제
- **DELETE** `/api/files/{id}`
- **설명**: 첨부파일 소프트 삭제
- **인증 필요**: O (Bearer Token)
- **Path**
  - `id` (int, 첨부파일 ID)
- **Response (200)**
```json
{
  "message": "File deleted successfully"
}
```
- **에러 예시**
  - 404: 첨부파일이 존재하지 않을 때
  - 403: 작성자만 삭제 가능
  - 401: 인증 실패

### 첨부파일 다운로드
- **GET** `/api/files/{id}`
- **설명**: 첨부파일 다운로드
- **인증 필요**: O (Bearer Token)
- **Path**
  - `id` (int, 첨부파일 ID)
- **Response**: 파일 다운로드
- **에러 예시**
  - 404: 첨부파일이 존재하지 않을 때
  - 401: 인증 실패

### 게시글 첨부파일 소프트 삭제
- **PUT** `/api/posts/{post_id}/attachments/{attachment_id}/delete`
- **설명**: 첨부파일을 물리적으로 삭제하지 않고 is_delete 플래그만 변경
- **인증 필요**: O (Bearer Token)
- **Path**
  - `post_id` (int, 게시글 ID)
  - `attachment_id` (int, 첨부파일 ID)
- **Response (200)**
```json
{
  "message": "Attachment deleted successfully"
}
```
- **에러 예시**
  - 404: 게시글/첨부파일이 존재하지 않을 때
  - 403: 작성자만 삭제 가능
  - 401: 인증 실패

---

## 댓글 (comments.py)

### 댓글 목록 조회
- **GET** `/api/posts/{id}/comments`
- **설명**: 게시글의 모든 댓글과 대댓글을 계층 구조로 반환
- **인증 필요**: O (Bearer Token)
- **Path**
  - `id` (int, 게시글 ID)
- **Response (200)**
```json
[
  {
    "id": 1,
    "content": "댓글 내용",
    "author": {"id": "user2", "name": "김철수"},
    "createdAt": "2025-05-14T10:01:00",
    "updatedAt": "2025-05-14T10:01:00",
    "isDeleted": false,
    "parent_id": 0,
    "replies": []
  }
]
```
- **필드 설명**
  - `id`: 댓글 고유번호
  - `content`: 댓글 내용
  - `author`: 작성자 정보 (id, name)
  - `createdAt`, `updatedAt`: 작성/수정일시
  - `isDeleted`: 소프트 삭제 여부
  - `parent_id`: 부모 댓글 ID (0이면 일반 댓글)
  - `replies`: 대댓글 목록
- **에러 예시**
  - 404: 게시글이 존재하지 않을 때
  - 401: 인증 실패

### 댓글 작성
- **POST** `/api/posts/{post_id}/comments`
- **설명**: 게시글에 댓글/대댓글 작성
- **인증 필요**: O (Bearer Token)
- **Path**
  - `post_id` (int, 게시글 ID)
- **Request (multipart/form-data)**
  - `content` (string, 필수): 공백 불가
  - `parent_comment_id` (int, optional, 기본 0): 대댓글인 경우 부모 댓글 ID
- **Response (200)**
```json
{
  "message": "Comment created successfully",
  "comment_id": 1
}
```
- **에러 예시**
  - 404: 게시글/부모댓글이 존재하지 않을 때
  - 401: 인증 실패

### 댓글 수정
- **PUT** `/api/comments/{comment_id}`
- **설명**: 댓글 내용 수정
- **인증 필요**: O (Bearer Token)
- **Path**
  - `comment_id` (int, 댓글 ID)
- **Request (multipart/form-data)**
  - `content` (string, 필수)
- **Response (200)**
```json
{
  "message": "Comment updated successfully"
}
```
- **에러 예시**
  - 404: 댓글이 존재하지 않을 때
  - 403: 작성자만 수정 가능
  - 401: 인증 실패

### 댓글 삭제
- **DELETE** `/api/comments/{comment_id}`
- **설명**: 댓글 소프트 삭제
- **인증 필요**: O (Bearer Token)
- **Path**
  - `comment_id` (int, 댓글 ID)
- **Response (200)**
```json
{
  "message": "Comment deleted successfully"
}
```
- **에러 예시**
  - 404: 댓글이 존재하지 않을 때
  - 403: 작성자만 삭제 가능
  - 401: 인증 실패 