import React from 'react';

interface PostDetailHeaderProps {
  title: string;
  authorName: string;
  createdAt: string;
  viewCnt: number;
  isAuthor: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onBackToList: () => void;
}

// PostDetailHeader: 게시글 상단 정보(제목, 작성자, 날짜, 조회수, 버튼 등) 컴포넌트
const PostDetailHeader: React.FC<PostDetailHeaderProps> = ({
  title,
  authorName,
  createdAt,
  viewCnt,
  isAuthor,
  onEdit,
  onDelete,
  onBackToList,
}) => (
  <div className="mb-6 border-b pb-4 flex flex-col gap-2">
    {/* 게시글 제목 */}
    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    {/* 작성자, 날짜, 조회수 */}
    <div className="flex items-center gap-4 text-sm text-gray-600">
      <span>작성자: {authorName}</span>
      <span>작성일: {createdAt}</span>
      <span>조회수: {viewCnt}</span>
    </div>
    {/* 목록, 수정, 삭제 버튼 */}
    <div className="flex gap-2 mt-2">
      <button onClick={onBackToList} className="px-3 py-1 bg-gray-200 rounded">목록</button>
      {isAuthor && (
        <>
          <button onClick={onEdit} className="px-3 py-1 bg-blue-500 text-white rounded">수정</button>
          <button onClick={onDelete} className="px-3 py-1 bg-red-500 text-white rounded">삭제</button>
        </>
      )}
    </div>
  </div>
);

export default PostDetailHeader; 