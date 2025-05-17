import React, { useRef, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  focusOnError?: boolean;
}

// PostTitleInput: 게시글 제목 입력 필드 컴포넌트
const PostTitleInput: React.FC<Props> = ({ value, onChange, error, focusOnError }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (error && focusOnError) {
      inputRef.current?.focus(); // 에러 발생 시 자동 포커스
    }
  }, [error, focusOnError]);

  return (
    <div className="mb-2">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        제목 <span className="text-red-600 ml-1">*</span>
      </label>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)} // 입력값 변경 시 부모로 전달
        className={`w-full p-2 text-sm border rounded mb-1 box-border focus:outline-none focus:ring-2 ${error ? 'border-red-500 ring-2 ring-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
        placeholder="제목을 입력하세요"
      />
      <div className="text-xs text-gray-500 text-right">{value.length}/200</div>
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  );
};

export default PostTitleInput; 