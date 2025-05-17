import React, { useState } from 'react';

interface PostImageInputProps {
  value: string;
  onChange: (url: string) => void;
}

// PostImageInput: 이미지 URL 입력 및 미리보기 컴포넌트
const PostImageInput: React.FC<PostImageInputProps> = ({ value, onChange }) => {
  const [error, setError] = useState<string | null>(null);

  const handleImageError = () => {
    setError('이미지를 불러올 수 없습니다.'); // 이미지 로드 실패 시 에러 표시
  };

  const handleImageLoad = () => {
    setError(null); // 이미지 정상 로드 시 에러 해제
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">이미지 URL</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)} // 입력값 변경 시 부모로 전달
        placeholder="이미지 URL을 입력하세요"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {value && (
        <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">미리보기</div>
          <div className="relative w-full max-w-2xl mx-auto">
            {error ? (
              <div className="p-4 text-red-500 bg-red-50 rounded-lg">
                {error}
              </div>
            ) : (
              <img
                src={value}
                alt="미리보기"
                onError={handleImageError} // 이미지 로드 실패 시
                onLoad={handleImageLoad} // 이미지 정상 로드 시
                className="max-h-[400px] w-auto mx-auto rounded-lg shadow-md"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostImageInput; 