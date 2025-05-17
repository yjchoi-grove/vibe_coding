import React from 'react';
import { useNavigate } from 'react-router-dom';

// PostListHeader 컴포넌트의 props 타입 정의
interface PostListHeaderProps {
  search: string; // 검색어
  searchType: string; // 검색 타입(전체/제목/내용/작성자)
  sort: string; // 정렬 기준
  total: number; // 총 게시글 수
  onSearch: (value: string) => void; // 검색어 변경 핸들러
  onSearchType: (value: string) => void; // 검색 타입 변경 핸들러
  onSort: (value: string) => void; // 정렬 변경 핸들러
  onSubmit: (e: React.FormEvent) => void; // 검색 폼 제출 핸들러
}

// PostListHeader: 게시글 목록 상단(검색, 정렬, 총 게시글 수 등) 컴포넌트
const PostListHeader: React.FC<PostListHeaderProps> = ({ search, searchType, sort, total, onSearch, onSearchType, onSort, onSubmit }) => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <div className="w-full mb-6">
      {/* 우측 상단: 사용자 정보 및 로그아웃 */}
      {userName && (
        <div className="flex justify-end items-center mb-2">
          <span className="text-gray-700 text-sm font-semibold mr-2">{userName} 님 환영합니다.</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
          >
            로그아웃
          </button>
        </div>
      )}
      {/* 정렬/건수 + 검색 한 줄에 배치 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 w-full">
        {/* 좌측: 정렬/총건수 */}
        <div className="flex gap-2 items-center">
          <select value={sort} onChange={e => onSort(e.target.value)} className="border px-2 py-2 rounded">
            <option value="createdAt-desc">최신순</option>
            <option value="createdAt-asc">오래된 순</option>
            <option value="view_cnt-desc">조회수 높은 순</option>
            <option value="view_cnt-asc">조회수 낮은 순</option>
          </select>
          <span className="text-gray-600 text-sm">총 <b>{total}</b>건</span>
        </div>
        {/* 우측: 검색 */}
        <form className="flex gap-2 w-full md:w-auto justify-end" onSubmit={onSubmit}>
          <select value={searchType} onChange={e => onSearchType(e.target.value)} className="border px-2 py-2 rounded">
            <option value="all">제목+내용</option>
            <option value="title">제목</option>
            <option value="content">내용</option>
            <option value="author">작성자</option>
          </select>
          <input
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="검색어 입력"
            className="border px-3 py-2 rounded w-full md:w-64"
          />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">검색</button>
        </form>
      </div>
    </div>
  );
};

export default PostListHeader; 