import React from 'react';

interface PostFormButtonsProps {
  isEditMode: boolean;
  onSave: () => void;
  onCancel: () => void;
}

// PostFormButtons: 게시글 작성/수정, 취소 버튼 컴포넌트
const PostFormButtons: React.FC<PostFormButtonsProps> = ({ isEditMode, onSave, onCancel }) => (
  <div className="flex gap-3 mt-6">
    <button onClick={onSave} className="px-6 py-2 bg-green-600 text-white rounded font-medium">{isEditMode ? '수정하기' : '작성하기'}</button>
    <button onClick={onCancel} className="px-6 py-2 bg-gray-600 text-white rounded font-medium">취소</button>
  </div>
);

export default PostFormButtons; 