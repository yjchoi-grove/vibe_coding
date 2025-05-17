// 게시글 작성/수정 폼 컴포넌트
// - useReducer로 상태를 일괄 관리
// - 제목, 동영상, 이미지, 내용, 첨부파일 등 다양한 입력을 지원
// - 임시 저장, 유효성 검사, 수정 모드 등 다양한 기능 포함

import React, { useReducer, useEffect, useRef, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PostTitleInput from './PostForm/PostTitleInput';
import PostVideoInput from './PostForm/PostVideoInput';
import PostImageInput from './PostForm/PostImageInput';
import PostFileInput from './PostForm/PostFileInput';
import PostExistingAttachments from './PostForm/PostExistingAttachments';
import { Post } from '../types/post';
import { PostFormState, PostFormAction } from '../types/form';
import { postFormReducer } from '../reducers/postFormReducer';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import PostFormEditor from './PostForm/PostFormEditor';
import PostFormButtons from './PostForm/PostFormButtons';

const MAX_CONTENT_LENGTH = 2000;

// 상태 관리 reducer 함수
function reducer(state: PostFormState, action: PostFormAction): PostFormState {
  switch (action.type) {
    case 'SET_TITLE':
      return { ...state, title: action.payload };
    case 'SET_VIDEO_URL':
      return { ...state, videoUrl: action.payload };
    case 'SET_CONTENT':
      return { ...state, content: action.payload };
    case 'SET_IMG_URL':
      return { ...state, imgUrl: action.payload };
    case 'SET_ATTACHMENTS':
      return { ...state, attachments: action.payload };
    case 'SET_EXISTING_ATTACHMENTS':
      return { ...state, existingAttachments: action.payload };
    case 'SET_PREVIEW_VIDEO':
      return { ...state, previewVideoId: action.payload.id, previewType: action.payload.type };
    case 'SET_LAST_SAVED':
      return { ...state, lastSaved: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'FOCUS_TITLE':
      return { ...state, focusTitle: true };
    case 'BLUR_TITLE':
      return { ...state, focusTitle: false };
    default:
      return state;
  }
}

// 폼의 초기 상태
const initialState: PostFormState = {
  title: '',
  videoUrl: '',
  content: '',
  imgUrl: '',
  attachments: [],
  existingAttachments: [],
  previewVideoId: null,
  previewType: null,
  lastSaved: null,
  error: null,
  focusTitle: false,
};

// 스타일 객체 정의
const styles = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '32px auto 0', // 상단 여백 32px 추가
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  // ... 나머지 스타일 ...
};

const PostForm: React.FC = () => {
  // 라우팅 관련
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const token = localStorage.getItem('token');

  // 에디터 ref 및 상태 관리
  const quillRef = useRef<ReactQuill>(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [contentError, setContentError] = useState(false);

  // HTML에서 순수 텍스트만 추출하는 함수 (유효성 검사, 글자수 체크용)
  const getTextContent = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || '';
  };

  // 내용 길이 초과 여부
  const isContentTooLong = getTextContent(state.content).length > MAX_CONTENT_LENGTH;

  // 에디터 내용 변경 핸들러
  const handleEditorChange = useCallback((content: string) => {
    dispatch({ type: 'SET_CONTENT', payload: content });
    if (getTextContent(content).trim()) {
      setContentError(false);
    }
  }, []);

  // Quill 에디터 툴바/포맷 옵션
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
      matchers: []
    },
    keyboard: {
      bindings: {
        tab: false
      }
    },
    history: {
      delay: 2000,
      maxStack: 500,
      userOnly: true
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link', 'image'
  ];

  // 임시 저장된 데이터 불러오기 (처음 마운트 시)
  useEffect(() => {
    const savedData = localStorage.getItem(`post_draft_${id || 'new'}`);
    if (savedData) {
      const { title: savedTitle, content: savedContent, videoUrl: savedVideoUrl, lastSaved: savedLastSaved } = JSON.parse(savedData);
      // 임시 저장 데이터가 있으면 사용자에게 불러올지 물어봄
      if (window.confirm('임시 저장된 내용이 있습니다. 불러오시겠습니까?')) {
        dispatch({ type: 'SET_TITLE', payload: savedTitle });
        dispatch({ type: 'SET_CONTENT', payload: savedContent });
        dispatch({ type: 'SET_VIDEO_URL', payload: savedVideoUrl });
        dispatch({ type: 'SET_LAST_SAVED', payload: new Date(savedLastSaved) });
        // 비디오 URL이 있으면 미리보기 설정
        if (savedVideoUrl) {
          if (savedVideoUrl.includes('youtube.com') || savedVideoUrl.includes('youtu.be')) {
            const videoId = getYouTubeVideoId(savedVideoUrl);
            if (videoId) {
              dispatch({ type: 'SET_PREVIEW_VIDEO', payload: { id: videoId, type: 'youtube' } });
            }
          } else if (savedVideoUrl.includes('tv.naver.com/v/')) {
            const videoId = getNaverVideoId(savedVideoUrl);
            if (videoId) {
              dispatch({ type: 'SET_PREVIEW_VIDEO', payload: { id: videoId, type: 'naver' } });
            }
          }
        }
      } else {
        // 불러오지 않으면 임시 저장 데이터 삭제
        localStorage.removeItem(`post_draft_${id || 'new'}`);
      }
    }
  }, [id]);

  // 제목/내용/동영상이 바뀔 때마다 임시 저장
  useEffect(() => {
    if (state.title || state.content || state.videoUrl) {
      const draftData = {
        title: state.title,
        content: state.content,
        videoUrl: state.videoUrl,
        lastSaved: new Date()
      };
      localStorage.setItem(`post_draft_${id || 'new'}`, JSON.stringify(draftData));
      dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });
    }
  }, [state.title, state.content, state.videoUrl, id]);

  // 페이지 벗어날 때 경고
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.title || state.content || state.videoUrl) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.title, state.content, state.videoUrl]);

  // 수정 모드일 때 기존 게시글 데이터 불러오기
  useEffect(() => {
    if (isEditMode && id) {
      axios.get<Post>(`http://localhost:8000/api/posts/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        const post = response.data;
        dispatch({ type: 'SET_TITLE', payload: post.title });
        dispatch({ type: 'SET_CONTENT', payload: post.content });
        dispatch({ type: 'SET_VIDEO_URL', payload: post.videoUrl || '' });
        dispatch({ type: 'SET_IMG_URL', payload: post.imgUrl || '' });
        dispatch({ type: 'SET_EXISTING_ATTACHMENTS', payload: post.attachments });
        // 동영상 미리보기 설정
        if (post.videoUrl) {
          if (post.videoUrl.includes('youtube.com') || post.videoUrl.includes('youtu.be')) {
            const videoId = getYouTubeVideoId(post.videoUrl);
            if (videoId) {
              dispatch({ type: 'SET_PREVIEW_VIDEO', payload: { id: videoId, type: 'youtube' } });
            }
          } else if (post.videoUrl.includes('tv.naver.com/v/')) {
            const videoId = getNaverVideoId(post.videoUrl);
            if (videoId) {
              dispatch({ type: 'SET_PREVIEW_VIDEO', payload: { id: videoId, type: 'naver' } });
            }
          }
        }
      })
      .catch(error => {
        // 게시글 불러오기 실패 시 목록으로 이동
        console.error('There was an error fetching the post details!', error);
        alert('게시글을 불러오는데 실패했습니다.');
        navigate('/posts');
      });
    }
  }, [id, isEditMode, token, navigate]);

  // 게시글 저장(작성/수정) 핸들러
  const handleSave = async () => {
    // 제목/내용 유효성 검사
    if (!state.title.trim()) {
      dispatch({ type: 'SET_ERROR', payload: '제목을 입력해주세요.' });
      dispatch({ type: 'FOCUS_TITLE' });
      alert('제목을 입력해주세요.');
      return;
    }
    if (!getTextContent(state.content).trim()) {
      alert('내용을 입력해주세요.');
      setContentError(true);
      // 에디터로 포커스 이동
      // @ts-ignore
      quillRef.current?.focus();
      return;
    }
    if (state.title.length > 200) {
      alert('제목은 200자를 초과할 수 없습니다.');
      return;
    }
    if (getTextContent(state.content).length > MAX_CONTENT_LENGTH) {
      alert(`내용은 ${MAX_CONTENT_LENGTH}자를 초과할 수 없습니다.`);
      return;
    }

    // 폼 데이터 생성
    const formData = new FormData();
    formData.append('title', state.title);
    formData.append('content', state.content);
    if (state.videoUrl) {
      formData.append('video_url', state.videoUrl);
    }
    if (state.imgUrl) {
      formData.append('img_url', state.imgUrl);
    }
    // 기존 첨부파일 id를 모두 추가 (백엔드에서 이 id만 남기고 나머지는 삭제)
    state.existingAttachments.forEach(file => {
      formData.append('existing_files', String(file.id));
    });
    // 새 첨부파일 추가
    state.attachments.forEach(file => {
      formData.append('files', file);
    });

    try {
      if (isEditMode) {
        await axios.put(`http://localhost:8000/api/posts/${id}`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('게시글이 성공적으로 수정되었습니다.');
      } else {
        await axios.post('http://localhost:8000/api/posts', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('게시글이 성공적으로 작성되었습니다.');
      }
      // 저장 성공 시 임시 저장 데이터 삭제
      localStorage.removeItem(`post_draft_${id || 'new'}`);
      navigate('/posts');
    } catch (error: any) {
      // 저장 실패 시 에러 처리
      console.error('There was an error saving the post!', error);
      if (error.response?.data?.detail) {
        alert(error.response.data.detail);
      } else {
        alert('게시글 저장에 실패했습니다.');
      }
    }
  };

  // 취소 버튼 핸들러
  const handleCancel = () => {
    if (window.confirm('작성 중인 내용이 있습니다. 정말로 나가시겠습니까?')) {
      localStorage.removeItem(`post_draft_${id || 'new'}`);
      navigate('/posts');
    }
  };

  // 첨부파일 추가/삭제 핸들러
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      dispatch({ type: 'SET_ATTACHMENTS', payload: [...state.attachments, ...Array.from(event.target.files || [])] });
    }
  };
  const handleRemoveFile = (index: number) => {
    dispatch({ type: 'SET_ATTACHMENTS', payload: state.attachments.filter((_, i) => i !== index) });
  };

  // 이미지 파일 여부 확인
  const isImageFile = (file: File) => file.type.startsWith('image/');

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // YouTube/Naver 동영상 ID 추출 함수
  const getYouTubeVideoId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };
  const getNaverVideoId = (url: string): string => {
    if (url.includes('tv.naver.com/v/')) {
      const match = url.match(/\/v\/(\d+)/);
      return match ? match[1] : '';
    }
    return '';
  };

  // 동영상 URL 변경 시 미리보기 처리
  const handleVideoUrlChange = (url: string) => {
    dispatch({ type: 'SET_VIDEO_URL', payload: url });
    // YouTube/Naver 미리보기 설정
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = getYouTubeVideoId(url);
      if (videoId) {
        dispatch({ type: 'SET_PREVIEW_VIDEO', payload: { id: videoId, type: 'youtube' } });
        return;
      }
    } else if (url.includes('tv.naver.com/v/')) {
      const videoId = getNaverVideoId(url);
      if (videoId) {
        dispatch({ type: 'SET_PREVIEW_VIDEO', payload: { id: videoId, type: 'naver' } });
        return;
      }
    }
    // 유효하지 않은 URL이면 미리보기 해제
    dispatch({ type: 'SET_PREVIEW_VIDEO', payload: { id: null, type: null } });
  };

  // 기존 첨부파일 삭제 핸들러
  const handleDeleteExistingAttachment = async (fileId: number) => {
    if (window.confirm('이 첨부파일을 삭제하시겠습니까?')) {
      try {
        await axios.put(`http://localhost:8000/api/posts/${id}/attachments/${fileId}/delete`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        alert('첨부파일이 삭제되었습니다.');
        dispatch({ type: 'SET_EXISTING_ATTACHMENTS', payload: state.existingAttachments.filter(file => file.id !== fileId) });
      } catch (error) {
        console.error('첨부파일 삭제 중 오류가 발생했습니다:', error);
        alert('첨부파일 삭제에 실패했습니다.');
      }
    }
  };

  // 실제 렌더링
  return (
    <div className="max-w-[1200px] mx-auto p-6 bg-white rounded-lg shadow mt-8">
      <h1 className="text-2xl mb-6 text-gray-800 font-semibold">{id ? '게시글 수정' : '새 게시글 작성'}</h1>
      {/* 마지막 임시 저장 시간 표시 */}
      {state.lastSaved && (
        <div className="text-sm text-gray-500 mb-4 italic">
          마지막 저장: {state.lastSaved.toLocaleString('ko-KR')}
        </div>
      )}
      <div className="flex flex-col gap-4">
        {/* 제목 입력 */}
        <PostTitleInput
          value={state.title}
          onChange={(v: string) => {
            dispatch({ type: 'SET_TITLE', payload: v });
            if (state.error) {
              dispatch({ type: 'SET_ERROR', payload: null });
            }
          }}
          error={state.error}
          focusOnError={state.focusTitle}
        />
        {/* 동영상 URL 입력 */}
        <PostVideoInput
          value={state.videoUrl}
          onChange={handleVideoUrlChange}
          previewId={state.previewVideoId}
          previewType={state.previewType}
        />
        {/* 이미지 URL 입력 */}
        <PostImageInput
          value={state.imgUrl}
          onChange={(v: string) => dispatch({ type: 'SET_IMG_URL', payload: v })}
        />
        {/* 에디터(내용) 입력 */}
        <PostFormEditor
          value={state.content}
          onChange={handleEditorChange}
          quillRef={quillRef}
          error={contentError}
          maxLength={MAX_CONTENT_LENGTH}
          isContentTooLong={isContentTooLong}
          modules={modules}
          formats={formats}
        />
        {/* 기존 첨부파일(수정 모드) */}
        {isEditMode && state.existingAttachments.length > 0 && (
          <PostExistingAttachments
            attachments={state.existingAttachments}
            onDelete={handleDeleteExistingAttachment}
            formatFileSize={formatFileSize}
          />
        )}
        {/* 첨부파일 업로드 */}
        <PostFileInput
          files={state.attachments}
          onChange={(files: File[]) => dispatch({ type: 'SET_ATTACHMENTS', payload: files })}
          onRemove={handleRemoveFile}
          isImageFile={isImageFile}
          formatFileSize={formatFileSize}
        />
        {/* 작성/수정/취소 버튼 */}
        <PostFormButtons
          isEditMode={isEditMode}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default PostForm; 