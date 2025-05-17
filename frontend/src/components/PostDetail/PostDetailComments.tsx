import React from 'react';
import CommentItem, { Comment as CommentType } from './Comment/CommentItem';
import CommentForm from './Comment/CommentForm';

interface Author {
  id: string;
  name: string;
}

interface Comment {
  id: number;
  content: string;
  author: Author;
  createdAt: string;
  updatedAt: string;
  parent_id: number;
  replies: Comment[];
  isDeleted?: boolean;
}

interface PostDetailCommentsProps {
  comments: Comment[];
  comment: string;
  onChangeComment: (v: string) => void;
  onSaveComment: () => void;
  isCommentTooLong: boolean;
  visibleComments: number;
  onLoadMoreComments: () => void;
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

// PostDetailComments: 댓글 전체 영역(입력, 목록, 답글, 수정/삭제 등) 컴포넌트
const PostDetailComments: React.FC<PostDetailCommentsProps> = ({
  comments,
  comment,
  onChangeComment,
  onSaveComment,
  isCommentTooLong,
  visibleComments,
  onLoadMoreComments,
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
  return (
    <div className="border-t pt-8 mt-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">댓글</h3>
      <div className="mb-4">
        <CommentForm
          value={comment}
          onChange={onChangeComment}
          onSubmit={onSaveComment}
          placeholder="댓글을 입력하세요"
          charLimit={200}
        />
      </div>
      {comments && comments.length > 0 ? (
        <>
          {[...comments]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, visibleComments)
            .map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment as CommentType}
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
          {comments.length > visibleComments && (
            <button
              onClick={onLoadMoreComments}
              className="w-full py-2 mt-4 bg-gray-100 rounded text-gray-600 text-sm"
            >
              댓글 더보기 ({visibleComments}/{comments.length})
            </button>
          )}
        </>
      ) : (
        <div className="text-center text-gray-400 py-8">
          <div className="text-2xl mb-2">💬</div>
          <p>아직 댓글이 없습니다.</p>
          <p>첫 번째 댓글을 작성해보세요!</p>
        </div>
      )}
    </div>
  );
};

export default PostDetailComments; 