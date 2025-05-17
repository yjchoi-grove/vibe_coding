import React, { useRef, useState } from 'react';

interface CommentFormProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  charLimit?: number;
  onCancel?: () => void;
  isLoading?: boolean;
}

// CommentForm: 댓글/답글 입력 폼 컴포넌트
const CommentForm: React.FC<CommentFormProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = '댓글을 입력하세요',
  disabled = false,
  charLimit = 200,
  onCancel,
  isLoading = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 엔터로 저장, Shift+엔터로 줄바꿈
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.length <= charLimit && !isLoading) {
        onSubmit();
      }
    }
  };

  // 자동 높이조절
  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    // 200자까지만 입력 허용
    if (textarea.value.length <= charLimit) {
      onChange(textarea.value);
    } else {
      onChange(textarea.value.slice(0, charLimit));
    }
  };

  // 포커스 시 스타일
  const textareaClass = `w-full p-2 border rounded mb-1 text-sm transition-all resize-none md:text-base md:p-3 ${
    isFocused
      ? 'border-blue-400 bg-blue-50 focus:ring-2 focus:ring-blue-200'
      : 'border-gray-300 bg-white'
  }`;

  return (
    <div className="mb-4">
      {/* 입력 textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        className={textareaClass}
        placeholder={placeholder}
        aria-label="댓글 입력"
        aria-disabled={disabled || isLoading}
        rows={1}
        style={{ minHeight: '28px', maxHeight: '112px', fontSize: 'inherit', lineHeight: '28px' }}
        disabled={disabled || isLoading}
      />
      {/* 글자수, 경고, 취소/저장 버튼 */}
      <div className="flex flex-wrap gap-2 justify-between items-center mt-1">
        <div className="flex items-center gap-2 text-xs">
          <span className={value.length > charLimit ? 'text-red-500' : 'text-gray-500'}>
            {value.length}/{charLimit}
          </span>
          <span className={value.length > charLimit ? 'text-red-500' : 'text-gray-400'}>
            · Shift+Enter로 줄바꿈이 가능합니다.
          </span>
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1 bg-gray-400 text-white rounded text-sm md:text-base"
              type="button"
              aria-label="댓글 입력 취소"
              disabled={isLoading}
            >
              취소
            </button>
          )}
          <button
            onClick={onSubmit}
            className={`px-4 py-1 rounded text-sm md:text-base font-semibold transition-colors flex items-center gap-2 ${
              disabled || value.length > charLimit || isLoading
                ? 'bg-blue-200 text-white cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            disabled={disabled || value.length > charLimit || isLoading}
            type="button"
            aria-label="댓글 저장"
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4 mr-1 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            저장
          </button>
        </div>
      </div>
      {value.length > charLimit && (
        <span className="ml-2 text-xs text-red-500">글자수 제한을 초과했습니다.</span>
      )}
    </div>
  );
};

export default CommentForm; 