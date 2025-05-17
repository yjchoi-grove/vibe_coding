import React from 'react';

// Author 타입 정의
interface Author {
  id: string;
  name: string;
}

// Post 타입 정의
export interface Post {
  id: number;
  post_no: number; // 실제 게시글 번호 추가
  title: string;
  author: Author;
  createdAt: string;
  view_cnt: number;
}

// PostListItem 컴포넌트의 props 타입 정의
interface PostListItemProps {
  post: Post; // 게시글 데이터
  number: number; // 게시글 번호
  onClick: (id: number) => void; // 게시글 클릭 핸들러
  rowClassName?: string; // tr에 적용할 추가 클래스(짝/홀수 색상)
}

// PostListItem: 개별 게시글(한 줄) 컴포넌트
const PostListItem: React.FC<PostListItemProps> = ({ post, number, onClick, rowClassName }) => {
  // 작성일 포맷팅
  const date = new Date(post.createdAt);
  const formattedDate = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Seoul'
  }).format(date);

  return (
    // 게시글 한 줄 렌더링
    <tr
      onClick={() => onClick(post.id)}
      className={`cursor-pointer hover:bg-blue-50 transition ${rowClassName || ''}`}
    >
      <td className="p-3 border-b text-center">{number}</td>
      <td className="p-3 border-b">{post.title}</td>
      <td className="p-3 border-b">{post.author.name}</td>
      <td className="p-3 border-b">{formattedDate}</td>
      <td className="p-3 border-b text-center">{post.view_cnt}</td>
    </tr>
  );
};

export default PostListItem; 