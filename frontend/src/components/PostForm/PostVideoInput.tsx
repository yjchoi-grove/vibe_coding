import React from 'react';

interface PostVideoInputProps {
  value: string;
  onChange: (url: string) => void;
  previewId: string | null;
  previewType: 'youtube' | 'naver' | null;
}

// PostVideoInput: 동영상 URL 입력 및 미리보기 컴포넌트
const PostVideoInput: React.FC<PostVideoInputProps> = ({ value, onChange, previewId, previewType }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">동영상 URL</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)} // 입력값 변경 시 부모로 전달
        placeholder="YouTube 또는 네이버 TV URL을 입력하세요"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {previewId && (
        <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">미리보기</div>
          <div className="relative w-full max-w-2xl mx-auto">
            {previewType === 'youtube' ? (
              <iframe
                width="100%"
                height="315"
                src={`https://www.youtube.com/embed/${previewId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg shadow-md"
              />
            ) : previewType === 'naver' ? (
              <iframe
                width="100%"
                height="315"
                src={`https://tv.naver.com/embed/${previewId}`}
                title="Naver TV video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg shadow-md"
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostVideoInput; 