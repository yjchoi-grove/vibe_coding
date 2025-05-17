import React from 'react';
import VideoViewer from './VideoViewer';
import ImageViewer from './ImageViewer';
import AttachmentList from './AttachmentList';

interface Attachment {
  id: number;
  filename: string;
  file_size: number;
  file_path: string;
  mime_type: string;
}

interface PostDetailContentProps {
  content: string;
  videoUrl?: string;
  imgUrl?: string;
  attachments: Attachment[];
  getYouTubeVideoId: (url: string) => string;
  getNaverVideoId: (url: string) => string;
  onDownload: (fileId: number, filename: string) => void;
  formatFileSize: (bytes: number) => string;
}

// PostDetailContent: 게시글 본문(동영상, 이미지, 내용, 첨부파일) 영역 컴포넌트
const PostDetailContent: React.FC<PostDetailContentProps> = ({
  content,
  videoUrl,
  imgUrl,
  attachments,
  getYouTubeVideoId,
  getNaverVideoId,
  onDownload,
  formatFileSize,
}) => (
  <div>
    {/* 동영상 URL 영역 */}
    {videoUrl && (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">동영상</h3>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <VideoViewer url={videoUrl} getYouTubeVideoId={getYouTubeVideoId} getNaverVideoId={getNaverVideoId} />
        </div>
      </div>
    )}

    {/* 이미지 URL 영역 */}
    {imgUrl && (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">이미지</h3>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <ImageViewer url={imgUrl} alt="첨부된 이미지" />
        </div>
      </div>
    )}

    {/* 내용 영역 */}
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">내용</h3>
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>

    {/* 첨부파일 영역 */}
    {attachments && attachments.length > 0 && (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">첨부파일</h3>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <AttachmentList attachments={attachments} onDownload={onDownload} formatFileSize={formatFileSize} />
        </div>
      </div>
    )}
  </div>
);

export default PostDetailContent; 