import React from 'react';

interface ImageViewerProps {
  url: string;
  alt?: string;
}

// ImageViewer: 이미지 렌더링 컴포넌트
const ImageViewer: React.FC<ImageViewerProps> = ({ url, alt = '첨부된 이미지' }) => {
  if (!url) return null;
  return (
    // 이미지가 없거나 에러 시 대체 이미지 표시
    <img
      src={url}
      alt={alt}
      className="max-h-[500px] w-auto mx-auto rounded-lg shadow-sm"
      onError={e => {
        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=이미지를+불러올+수+없습니다';
      }}
    />
  );
};

export default ImageViewer; 