import React from 'react';
import PostListItem, { Post as PostType } from './PostListItem';

// Author 타입 정의
interface Author {
  id: string;
  name: string;
}

// Post 타입 정의
export interface Post {
  id: number;
  title: string;
  author: Author;
  createdAt: string;
  view_cnt: number;
}

// PostListTable 컴포넌트의 props 타입 정의
interface PostListTableProps {
  posts: Post[]; // 게시글 목록
  onPostClick: (id: number) => void; // 게시글 클릭 핸들러
  calculatePostNumber: (index: number) => number; // 게시글 번호 계산 함수
  searchTerm?: string; // 검색어(없으면 전체 목록)
}

// PostListTable: 게시글 목록 테이블 컴포넌트
const PostListTable: React.FC<PostListTableProps> = ({ posts, onPostClick, calculatePostNumber, searchTerm }) => (
  <table className="w-full border-collapse">
    <thead>
      <tr>
        {/* 테이블 헤더 */}
        <th className="p-3 bg-gray-50 border-b">번호</th>
        <th className="p-3 bg-gray-50 border-b">제목</th>
        <th className="p-3 bg-gray-50 border-b">작성자</th>
        <th className="p-3 bg-gray-50 border-b">작성일</th>
        <th className="p-3 bg-gray-50 border-b">조회수</th>
      </tr>
    </thead>
    <tbody>
      {/* 게시글이 없을 때 안내 문구 */}
      {posts.length === 0 ? (
        <tr>
          <td colSpan={5} className="text-center py-8 text-gray-400">
            {searchTerm && searchTerm.trim() !== ''
              ? `"${searchTerm}"의 키워드로 검색되는 게시글이 없습니다.`
              : '게시글이 없습니다.'}
          </td>
        </tr>
      ) : (
        posts.map((post, index) => (
          <PostListItem
            key={post.id}
            post={post as PostType}
            number={post.id}
            onClick={onPostClick}
            rowClassName={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
          />
        ))
      )}
    </tbody>
  </table>
);

export default PostListTable; 