import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import PostDetailHeader from './PostDetail/PostDetailHeader';
import PostDetailContent from './PostDetail/PostDetailContent';
import PostDetailComments from './PostDetail/PostDetailComments';

// 게시글 타입 정의
interface Post {
  id: number;
  title: string;
  content: string;
  videoUrl?: string;
  imgUrl?: string;  // 이미지 URL 필드 추가
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  view_cnt: number;
  attachments: Array<{
    id: number;
    filename: string;
    file_size: number;
    file_path: string;
    mime_type: string;
  }>;
  comments: Comment[];  // Comment 인터페이스를 사용하도록 수정
}

// 댓글 응답 타입
interface CommentResponse {
  content: string;
}

// 댓글 타입 정의
interface Comment {
  id: number;
  content: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  parent_id: number;
  replies: Comment[];
  isDeleted?: boolean;
}

// 게시글 상세 페이지 컴포넌트
const PostDetail: React.FC = () => {
  // 라우터 파라미터 및 상태 정의
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null); // 게시글 데이터
  const navigate = useNavigate();
  const [comment, setComment] = useState(''); // 댓글 입력값
  const [currentUserId, setCurrentUserId] = useState<string>(''); // 현재 로그인 유저 ID
  const [visibleComments, setVisibleComments] = useState(5); // 초기에 보여줄 댓글 수
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null); // 수정 중인 댓글 ID
  const [editingCommentContent, setEditingCommentContent] = useState(''); // 수정 중인 댓글 내용
  const [replyingTo, setReplyingTo] = useState<number | null>(null); // 답글 대상 댓글 ID
  const [replyContent, setReplyContent] = useState(''); // 답글 입력값

  // 쿼리 파라미터 추출
  const queryParams = new URLSearchParams(window.location.search);
  const currentPage = queryParams.get('page') || '1';
  const searchTerm = queryParams.get('search') || '';
  const searchType = queryParams.get('type') || 'all';
  const searchParams = useSearchParams()[0];

  // 게시글 상세 정보를 가져오는 함수
  const fetchPostDetail = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:8000/api/posts/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // setPost로 게시글 데이터 저장
      setPost(response.data as Post);
      setIsLoading(false);
    } catch (error) {
      // 에러 발생 시 처리
      setIsLoading(false);
      alert('해당 게시글이 존재하지 않습니다.');
      navigate('/posts');
    }
  };

  // 마운트 시 유저 정보 및 게시글 상세 불러오기
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setCurrentUserId(userId);
    }
    fetchPostDetail();
  }, [id]);

  // 게시글 수정 페이지로 이동
  const handleEdit = () => {
    navigate(`/posts/${id}/edit`);
  };

  // 게시글 삭제 처리
  const handleDelete = async () => {
    if (!post) return;
    if (post.comments && post.comments.length > 0) {
      alert('댓글이 있는 게시글은 삭제할 수 없습니다.');
      return;
    }
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`http://localhost:8000/api/posts/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        alert('게시글이 삭제되었습니다.');
        navigate(`/posts?page=${currentPage}`);
      } catch (error) {
        alert('게시글 삭제에 실패했습니다.');
      }
    }
  };

  // 게시글 목록으로 돌아가기
  const handleBackToList = () => {
    const params = new URLSearchParams();
    const page = searchParams.get('page');
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder');
    
    // 페이지 정보가 있으면 그대로 사용, 없으면 1로 설정
    params.set('page', page || '1');
    if (search) params.set('search', search);
    if (type) params.set('type', type);
    if (sortBy) params.set('sortBy', sortBy);
    if (sortOrder) params.set('sortOrder', sortOrder);
    
    navigate(`/posts?${params.toString()}`);
  };

  // 로딩 중 처리
  if (!post) {
    return <div>Loading...</div>;
  }

  // 작성일 포맷팅
  const date = new Date(post.createdAt);
  const formattedDate = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Seoul'
  }).format(date);

  // 댓글 저장 처리
  const handleSaveComment = async () => {
    if (comment.trim() === '') {
      alert('댓글을 입력하세요.');
      return;
    }
    if (window.confirm('댓글을 저장하시겠습니까?')) {
      try {
        const formData = new FormData();
        formData.append('content', comment);
        await axios.post(
          `http://localhost:8000/api/posts/${id}/comments`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        alert('댓글이 저장되었습니다.');
        setComment(''); // 입력 필드 초기화
        fetchPostDetail(); // 게시글 상세 정보 다시 불러오기
      } catch (error) {
        alert('댓글 저장에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  // 댓글 길이 제한 체크
  const isCommentTooLong = comment.length > 200;

  // YouTube URL에서 video ID를 추출하는 함수
  const getYouTubeVideoId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  // 네이버 비디오 ID를 추출하는 함수
  const getNaverVideoId = (url: string): string => {
    if (url.includes('tv.naver.com/v/')) {
      const match = url.match(/\/v\/(\d+)/);
      return match ? match[1] : '';
    }
    return '';
  };

  // 댓글 더보기 처리
  const handleLoadMoreComments = () => {
    setVisibleComments(prev => prev + 5); // 5개씩 더 보여주기
  };

  // 첨부파일 다운로드 처리
  const handleDownload = async (fileId: number, filename: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:8000/api/posts/${id}/attachments/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'  // 파일 다운로드를 위해 blob 타입으로 응답 받기
      });
      // 다운로드 링크 생성 및 클릭
      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);  // 원본 파일명으로 다운로드
      document.body.appendChild(link);
      link.click();
      // 생성된 링크 제거
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('파일 다운로드에 실패했습니다.');
    }
  };

  // 게시글 클릭 시 상세 페이지 이동
  const handlePostClick = (postId: number) => {
    navigate(`/posts/${postId}?page=${currentPage}`);
  };

  // 댓글 수정 시작
  const handleEditComment = (commentId: number, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditingCommentContent(currentContent);
  };

  // 댓글 수정 완료 처리
  const handleUpdateComment = async (commentId: number) => {
    if (editingCommentContent.trim() === '') {
      alert('댓글 내용을 입력하세요.');
      return;
    }
    if (window.confirm('댓글을 수정하시겠습니까?')) {
      try {
        const formData = new FormData();
        formData.append('content', editingCommentContent);
        await axios.put(
          `http://localhost:8000/api/comments/${commentId}`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        alert('댓글이 수정되었습니다.');
        setEditingCommentId(null);
        setEditingCommentContent('');
        setReplyingTo(null);
        fetchPostDetail();
      } catch (error) {
        alert('댓글 수정에 실패했습니다.');
      }
    }
  };

  // 댓글 삭제 처리
  const handleDeleteComment = async (commentId: number) => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      try {
        await axios.delete(`http://localhost:8000/api/comments/${commentId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        alert('댓글이 삭제되었습니다.');
        fetchPostDetail();
      } catch (error) {
        alert('댓글 삭제에 실패했습니다.');
      }
    }
  };

  // 답글 입력 시작
  const handleReply = (commentId: number) => {
    setReplyingTo(commentId);
    setReplyContent('');
  };

  // 답글 저장 처리
  const handleSaveReply = async (parentCommentId: number) => {
    if (replyContent.trim() === '') {
      alert('답글을 입력하세요.');
      return;
    }
    if (window.confirm('답글을 저장하시겠습니까?')) {
      try {
        const formData = new FormData();
        formData.append('content', replyContent);
        formData.append('parent_comment_id', parentCommentId.toString());
        await axios.post(
          `http://localhost:8000/api/posts/${id}/comments`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        alert('답글이 저장되었습니다.');
        setReplyingTo(null);
        setReplyContent('');
        fetchPostDetail();
      } catch (error) {
        alert('답글 저장에 실패했습니다.');
      }
    }
  };

  // 댓글 렌더링 함수
  const renderComment = (comment: Comment, isReply: boolean = false) => {
    const date = new Date(comment.createdAt);
    const formattedDate = new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Seoul'
    }).format(date);
    return (
      <div key={comment.id} style={{
        ...(isReply ? styles.replyComment : styles.comment),
        marginLeft: isReply ? '16px' : '0',
      }}>
        <div style={styles.commentHeader}>
          <div style={styles.commentAuthor}>
            <div style={styles.authorAvatar}>
              {comment.author.name.charAt(0).toUpperCase()}
            </div>
            <span>{comment.author.name}</span>
          </div>
          <span style={styles.commentDate}>{formattedDate}</span>
        </div>
        {editingCommentId === comment.id ? (
          <div style={styles.editCommentContainer}>
            <textarea
              value={editingCommentContent}
              onChange={(e) => setEditingCommentContent(e.target.value)}
              style={styles.editCommentInput}
            />
            <div style={styles.editCommentButtons}>
              <button
                onClick={() => handleUpdateComment(comment.id)}
                style={styles.updateButton}
              >
                수정 완료
              </button>
              <button
                onClick={() => {
                  setEditingCommentId(null);
                  setEditingCommentContent('');
                }}
                style={styles.cancelButton}
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={styles.commentContent}>
              <div style={styles.commentText}>{comment.content}</div>
              <div style={styles.commentActions}>
                {!isReply && (
                  <button
                    onClick={() => handleReply(comment.id)}
                    style={styles.replyButton}
                  >
                    답글
                  </button>
                )}
                {currentUserId === comment.author.id && (
                  <>
                    <button
                      onClick={() => handleEditComment(comment.id, comment.content)}
                      style={styles.editButton}
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      style={styles.deleteButton}
                    >
                      삭제
                    </button>
                  </>
                )}
              </div>
            </div>
            {/* 답글 입력창 */}
        {replyingTo === comment.id && (
              <div style={styles.replyInputContainer}>
            <textarea
              value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  style={styles.replyInput}
                  placeholder="답글을 입력하세요."
                />
              <button
                  onClick={() => handleSaveReply(comment.id)}
                  style={styles.saveReplyButton}
              >
                  답글 저장
              </button>
              <button
                  onClick={() => setReplyingTo(null)}
                  style={styles.cancelButton}
              >
                  취소
              </button>
          </div>
        )}
            {/* 대댓글(답글) 렌더링 */}
        {comment.replies && comment.replies.length > 0 && (
              <div style={styles.replyList}>
                {comment.replies.map(reply => renderComment(reply, true))}
          </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6 bg-white rounded-lg shadow mt-8">
      {/* 게시글 상단 정보 분리 */}
      <PostDetailHeader
        title={post.title}
        authorName={post.author.name}
        createdAt={formattedDate}
        viewCnt={post.view_cnt}
        isAuthor={currentUserId === post.author.id}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBackToList={handleBackToList}
      />
      {/* 본문 영역 분리 */}
      <PostDetailContent
        content={post.content}
        videoUrl={post.videoUrl}
        imgUrl={post.imgUrl}
        attachments={post.attachments}
        getYouTubeVideoId={getYouTubeVideoId}
        getNaverVideoId={getNaverVideoId}
        onDownload={handleDownload}
        formatFileSize={formatFileSize}
      />
      {/* 댓글 영역 분리 */}
      <PostDetailComments
        comments={post.comments}
        comment={comment}
        onChangeComment={setComment}
        onSaveComment={handleSaveComment}
        isCommentTooLong={isCommentTooLong}
        visibleComments={visibleComments}
        onLoadMoreComments={handleLoadMoreComments}
        currentUserId={currentUserId}
        editingCommentId={editingCommentId}
        editingCommentContent={editingCommentContent}
        onEditComment={(id, content) => {
          if (id === 0) {
            setEditingCommentId(null);
            setEditingCommentContent('');
          } else {
            setEditingCommentId(id);
            setEditingCommentContent(content);
          }
        }}
        onChangeEditingCommentContent={setEditingCommentContent}
        onUpdateComment={handleUpdateComment}
        onDeleteComment={handleDeleteComment}
        replyingTo={replyingTo}
        replyContent={replyContent}
        onReply={handleReply}
        onChangeReplyContent={setReplyContent}
        onSaveReply={handleSaveReply}
        onCancelReply={() => {
          setReplyingTo(null);
          setReplyContent('');
        }}
      />
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '32px auto 0',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  header: {
    marginBottom: '32px',
    borderBottom: '2px solid #e0e0e0',
    paddingBottom: '24px',
  },
  title: {
    fontSize: '28px',
    marginBottom: '16px',
    color: '#1a1a1a',
    fontWeight: '600',
    lineHeight: '1.4',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  metaLabel: {
    color: '#888',
    fontWeight: '500',
  },
  metaValue: {
    color: '#333',
  },
  metaDivider: {
    width: '1px',
    height: '12px',
    backgroundColor: '#e0e0e0',
  },
  content: {
    marginBottom: '40px',
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#333',
    padding: '24px',
    backgroundColor: '#fafafa',
    borderRadius: '8px',
  },
  videoPlayer: {
    marginBottom: '24px',
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto 24px',
  },
  videoWrapper: {
    position: 'relative' as const,
    paddingBottom: '56.25%', // 16:9 비율
    height: 0,
    overflow: 'hidden',
  },
  videoIframe: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  textContent: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#333',
    marginBottom: '24px',
  },
  attachments: {
    backgroundColor: '#f8f9fa',
    padding: '16px',
    marginBottom: '24px',
    borderRadius: '4px',
  },
  attachmentList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  attachmentItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #e0e0e0',
  },
  fileName: {
    flex: 1,
    marginRight: '8px',
  },
  fileSize: {
    color: '#666',
    fontSize: '14px',
  },
  thumbnail: {
    maxWidth: '100px',
    maxHeight: '100px',
    marginRight: '8px',
    borderRadius: '4px',
  },
  comments: {
    borderTop: '2px solid #e0e0e0',
    paddingTop: '32px',
    marginTop: '32px',
  },
  commentsTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '24px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e0e0e0',
  },
  commentInputContainer: {
    position: 'relative' as const,
    marginBottom: '10px',
  },
  commentInput: {
    width: '100%',
    height: '40px',
    padding: '8px',
    fontSize: '16px',
  },
  commentList: {
    marginBottom: '20px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  backButton: {
    padding: '10px 24px',
    backgroundColor: '#6c757d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  editButton: {
    padding: '4px 8px',
    backgroundColor: 'transparent',
    color: '#1976d2',
    border: '1px solid #1976d2',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s',
    fontWeight: '500',
    ':hover': {
      backgroundColor: '#e3f2fd',
    },
  },
  deleteButton: {
    padding: '4px 8px',
    backgroundColor: 'transparent',
    color: '#d32f2f',
    border: '1px solid #d32f2f',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s',
    fontWeight: '500',
    ':hover': {
      backgroundColor: '#ffebee',
    },
  },
  saveButton: {
    backgroundColor: '#17a2b8',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  warningText: {
    fontSize: '12px',
    color: '#dc3545',
    marginRight: '8px',
  },
  commentItem: {
    borderBottom: '1px solid #e0e0e0',
    padding: '10px 0',
    marginBottom: '10px',
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid #f0f0f0',
  },
  commentHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  commentAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  authorAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#e3f2fd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1976d2',
    fontWeight: '600',
    fontSize: '14px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  },
  commentDate: {
    fontSize: '12px',
    color: '#666',
    backgroundColor: '#f5f5f5',
    padding: '3px 6px',
    borderRadius: '4px',
  },
  commentContent: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#333',
    padding: '0 0 12px 0',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  },
  commentText: {
    flex: 1,
  },
  commentActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexShrink: 0,
  },
  loadMoreButton: {
    width: '100%',
    padding: '12px',
    marginTop: '16px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#666',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#e9ecef',
      color: '#333',
    },
  },
  imagePreview: {
    width: '100px',
    height: '100px',
    overflow: 'hidden',
    borderRadius: '4px',
    marginRight: '8px',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  fileInfo: {
    flex: 1,
  },
  downloadButton: {
    padding: '6px 12px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginLeft: '12px',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#0056b3',
    },
  },
  editCommentContainer: {
    marginTop: '8px',
  },
  editCommentInput: {
    width: '100%',
    padding: '8px',
    marginBottom: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  editCommentButtons: {
    display: 'flex',
    gap: '8px',
  },
  updateButton: {
    padding: '6px 12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '6px 12px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  editCommentButton: {
    padding: '2px 6px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  deleteCommentButton: {
    padding: '2px 6px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  imageContainer: {
    marginBottom: '24px',
    textAlign: 'center' as const,
  },
  postImage: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '4px',
  },
  charCount: {
    fontSize: '12px',
    color: '#666',
    marginRight: '8px',
  },
  comment: {
    marginBottom: '12px',
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    border: '1px solid #eaeaea',
    transition: 'all 0.2s ease',
    ':hover': {
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
    },
  },
  replyComment: {
    marginBottom: '12px',
    padding: '16px',
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    border: '1px solid #eaeaea',
    transition: 'all 0.2s ease',
    ':hover': {
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
    },
  },
  replyButton: {
    padding: '6px 12px',
    backgroundColor: '#f5f5f5',
    color: '#666',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s',
    fontWeight: '500',
    ':hover': {
      backgroundColor: '#e0e0e0',
      color: '#333',
    },
  },
  replyInputContainer: {
    marginTop: '8px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
  },
  replyInput: {
    width: '100%',
    minHeight: '60px',
    padding: '8px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    marginBottom: '8px',
    resize: 'vertical' as const,
    fontSize: '13px',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s',
    ':focus': {
      outline: 'none',
      borderColor: '#1976d2',
      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
    },
  },
  replyList: {
    marginTop: '8px',
    paddingLeft: '16px',
  },
  saveReplyButton: {
    padding: '6px 12px',
    backgroundColor: '#1976d2',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#1565c0',
    },
  },
};

// 파일 크기 포맷팅 함수 추가
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default PostDetail;
