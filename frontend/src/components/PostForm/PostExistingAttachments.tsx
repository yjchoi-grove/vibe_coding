import React from 'react';
import { Attachment } from '../../types/post';

interface Props {
  attachments: Attachment[];
  onDelete: (id: number) => void;
  formatFileSize: (bytes: number) => string;
}

// PostExistingAttachments: 기존 첨부파일 목록 및 삭제 기능 컴포넌트
const PostExistingAttachments: React.FC<Props> = ({ attachments, onDelete, formatFileSize }) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">기존 첨부파일</h3>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attachments.map((file) => (
            <li key={file.id} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              {file.mime_type.startsWith('image/') ? (
                <img
                  src={`http://127.0.0.1:8000${file.file_path}`}
                  alt={file.filename}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
                <p className="text-sm text-gray-500">{formatFileSize(file.file_size)}</p>
              </div>
              <button
                onClick={() => onDelete(file.id)} // 첨부파일 삭제 버튼
                className="px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PostExistingAttachments; 