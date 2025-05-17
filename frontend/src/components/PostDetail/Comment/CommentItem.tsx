import React from 'react';
import CommentForm from './CommentForm';

interface Author {
  id: string;
  name: string;
}

export interface Comment {
  id: number;
  content: string;
  author: Author;
  createdAt: string;
  updatedAt: string;
  parent_id: number;
  replies: Comment[];
  isDeleted?: boolean;
}

interface CommentItemProps {
  comment: Comment;
  isReply?: boolean;
  currentUserId: string;
  editingCommentId: number | null;
  editingCommentContent: string;
  onEditComment: (commentId: number, content: string) => void;
  onChangeEditingCommentContent: (v: string) => void;
  onUpdateComment: (commentId: number) => void;
  onDeleteComment: (commentId: number) => void;
  replyingTo: number | null;
  replyContent: string;
  onReply: (commentId: number) => void;
  onChangeReplyContent: (v: string) => void;
  onSaveReply: (parentCommentId: number) => void;
  onCancelReply: () => void;
}

// CommentItem: 개별 댓글/답글(수정, 삭제, 답글 등) 컴포넌트
const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  isReply = false,
  currentUserId,
  editingCommentId,
  editingCommentContent,
  onEditComment,
  onChangeEditingCommentContent,
  onUpdateComment,
  onDeleteComment,
  replyingTo,
  replyContent,
  onReply,
  onChangeReplyContent,
  onSaveReply,
  onCancelReply,
}) => {
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
    <div className={
      `${isReply ? 'ml-6 bg-gray-50 text-sm' : 'bg-white'} p-4 rounded-lg mb-3 border border-gray-200`
    }>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-gray-800">{comment.author.name}</span>
        <span className="text-xs text-gray-500">{formattedDate}</span>
      </div>
      {editingCommentId === comment.id ? (
        <div className="mb-2">
          <CommentForm
            value={editingCommentContent}
            onChange={onChangeEditingCommentContent}
            onSubmit={() => onUpdateComment(comment.id)}
            placeholder="댓글을 수정하세요"
            charLimit={200}
            onCancel={() => onEditComment(0, '')}
          />
        </div>
      ) : (
        <>
          {/* 삭제된 댓글 안내 */}
          {comment.isDeleted ? (
            <div className="mb-1 text-sm text-gray-400 italic py-2">삭제된 댓글입니다.</div>
          ) : (
            <div className="mb-1 text-sm text-gray-700 whitespace-pre-line py-2 leading-relaxed">{comment.content}</div>
          )}
          {editingCommentId !== comment.id && !comment.isDeleted && (
            <div className="flex gap-2 mb-1 justify-end">
              {!isReply && (
                <button
                  onClick={() => onReply(comment.id)}
                  className="text-xs text-blue-500 hover:underline hover:text-blue-700 px-2 py-1 rounded transition"
                  aria-label="답글"
                >
                  답글
                </button>
              )}
              {currentUserId === comment.author.id && (
                <>
                  <button
                    onClick={() => onEditComment(comment.id, comment.content)}
                    className="text-xs text-green-600 hover:underline hover:text-green-800 px-2 py-1 rounded transition"
                    aria-label="수정"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => onDeleteComment(comment.id)}
                    className="text-xs text-red-500 hover:underline hover:text-red-700 px-2 py-1 rounded transition"
                    aria-label="삭제"
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          )}
          {/* 답글 입력창 */}
          {replyingTo === comment.id && editingCommentId !== comment.id && !comment.isDeleted && (
            <div className="mt-2">
              <CommentForm
                value={replyContent}
                onChange={onChangeReplyContent}
                onSubmit={() => onSaveReply(comment.id)}
                placeholder="답글을 입력하세요"
                charLimit={200}
                onCancel={onCancelReply}
              />
            </div>
          )}
        </>
      )}
      {/* 답글 목록 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4 mt-2">
          {[...comment.replies]
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isReply={true}
                currentUserId={currentUserId}
                editingCommentId={editingCommentId}
                editingCommentContent={editingCommentContent}
                onEditComment={onEditComment}
                onChangeEditingCommentContent={onChangeEditingCommentContent}
                onUpdateComment={onUpdateComment}
                onDeleteComment={onDeleteComment}
                replyingTo={replyingTo}
                replyContent={replyContent}
                onReply={onReply}
                onChangeReplyContent={onChangeReplyContent}
                onSaveReply={onSaveReply}
                onCancelReply={onCancelReply}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem; 