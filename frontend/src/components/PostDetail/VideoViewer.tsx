import React from 'react';

interface VideoViewerProps {
  url: string;
  getYouTubeVideoId: (url: string) => string;
  getNaverVideoId: (url: string) => string;
}

// VideoViewer: 동영상(YouTube, Naver 등) 렌더링 컴포넌트
const VideoViewer: React.FC<VideoViewerProps> = ({ url, getYouTubeVideoId, getNaverVideoId }) => {
  if (!url) return null;

  // YouTube 동영상 렌더링
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = getYouTubeVideoId(url);
    return (
      <div className="relative pb-[56.25%] h-0">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="absolute top-0 left-0 w-full h-full rounded-lg shadow-sm"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  // 네이버 TV 동영상 렌더링
  if (url.includes('tv.naver.com/v/')) {
    const videoId = getNaverVideoId(url);
    return (
      <div className="relative pb-[56.25%] h-0">
        <iframe
          src={`https://tv.naver.com/embed/${videoId}`}
          className="absolute top-0 left-0 w-full h-full rounded-lg shadow-sm"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  // 지원하지 않는 동영상 형식 안내
  return <div className="text-gray-500 italic">지원하지 않는 동영상 형식입니다.</div>;
};

export default VideoViewer; 