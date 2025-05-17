import React from 'react';

// PostListPagination 컴포넌트의 props 타입 정의
interface PostListPaginationProps {
  currentPage: number; // 현재 페이지 번호
  totalPages: number; // 전체 페이지 수
  onPageChange: (page: number) => void; // 페이지 변경 핸들러
}

// PostListPagination: 게시글 목록 페이지네이션 컴포넌트
const PostListPagination: React.FC<PostListPaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  // 5개씩 묶어서 페이지네이션 표시
  const pageGroup = Math.floor((currentPage - 1) / 5);
  const startPage = pageGroup * 5 + 1;
  const endPage = Math.min(startPage + 4, totalPages);

  // 페이지가 1개 이하일 경우 페이지네이션 표시 안 함
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center mt-5 gap-1">
      {/* 이전 묶음: 첫 묶음이 아니면 표시 */}
      {startPage > 1 && (
        <button
          onClick={() => onPageChange(startPage - 1)}
          className="px-3 py-2 rounded bg-gray-200 text-gray-700 font-semibold transition hover:bg-gray-300"
        >
          이전
        </button>
      )}
      {/* 페이지 번호 버튼들 */}
      {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
        const pageNum = startPage + i;
        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`px-3 py-2 rounded font-semibold mx-0.5 transition ${pageNum === currentPage ? 'bg-blue-500 text-white shadow' : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50'}`}
          >
            {pageNum}
          </button>
        );
      })}
      {/* 다음 묶음: 마지막 묶음이 아니면 표시 */}
      {endPage < totalPages && (
        <button
          onClick={() => onPageChange(endPage + 1)}
          className="px-3 py-2 rounded bg-gray-200 text-gray-700 font-semibold transition hover:bg-gray-300"
        >
          다음
        </button>
      )}
    </div>
  );
};

export default PostListPagination; 