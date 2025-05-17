import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import PostListHeader from './PostList/PostListHeader';
import PostListTable from './PostList/PostListTable';

// Author 타입 정의
interface Author {
  id: string;
  name: string;  // 작성자 이름
}

// Post 타입 정의
interface Post {
  id: number;
  title: string;
  author: Author;
  createdAt: string;
  view_cnt: number;
}

// API 응답 타입 정의
interface PostsResponse {
  posts: Post[];
  total: number;
}

// 게시글 목록 페이지 컴포넌트
const PostList: React.FC = () => {
  // 상태 정의
  const [posts, setPosts] = useState<Post[]>([]); // 게시글 목록
  const [searchTerm, setSearchTerm] = useState(''); // 검색어
  const [searchType, setSearchType] = useState('all'); // 검색 타입
  const [displayedSearchTerm, setDisplayedSearchTerm] = useState(''); // 실제 검색에 사용되는 검색어
  const [displayedSearchType, setDisplayedSearchType] = useState('all'); // 실제 검색에 사용되는 검색 타입
  const [sortBy, setSortBy] = useState('createdAt'); // 정렬 기준
  const [sortOrder, setSortOrder] = useState('desc'); // 정렬 순서
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const postsPerPage = 10; // 페이지당 게시글 수
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
  const [totalPosts, setTotalPosts] = useState(0); // 전체 게시글 수
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [currentUserName, setCurrentUserName] = useState<string>(''); // 현재 로그인 유저 이름
  const [currentUserId, setCurrentUserId] = useState<string>(''); // 현재 로그인 유저 ID
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null); // 작성자 필터

  // 마운트 시 유저 정보 불러오기
  useEffect(() => {
    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');
    if (userName) {
      setCurrentUserName(userName);
    }
    if (userId) {
      setCurrentUserId(userId);
    }
  }, []);

  // 정렬 변경 핸들러
  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    // 기존 파라미터를 새로 만듦
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('sortBy', newSortBy);
    params.set('sortOrder', newSortOrder);
    if (displayedSearchTerm && displayedSearchTerm.trim() !== '') {
      params.set('search', displayedSearchTerm);
      params.set('type', displayedSearchType);
    }
    setSearchParams(params);
  };

  // 컴포넌트 마운트 시와 searchParams, 정렬, 검색 등 변경 시 API 호출
  useEffect(() => {
    const page = searchParams.get('page');
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const sortByParam = searchParams.get('sortBy');
    const sortOrderParam = searchParams.get('sortOrder');

    // 상태 업데이트
    if (page) setCurrentPage(Number(page));
    if (search !== null) {
      setDisplayedSearchTerm(search);
      setSearchTerm(search); // input에도 반영
    }
    if (type !== null) {
      setDisplayedSearchType(type);
      setSearchType(type); // select에도 반영
    }
    if (sortByParam) {
      setSortBy(sortByParam);
    }
    if (sortOrderParam) {
      setSortOrder(sortOrderParam);
    }

    fetchPosts();
  }, [searchParams]);

  // URL 파라미터에서 정렬 조건 복원
  useEffect(() => {
    const sortByParam = searchParams.get('sortBy');
    const sortOrderParam = searchParams.get('sortOrder');
    if (sortByParam) {
      setSortBy(sortByParam);
    }
    if (sortOrderParam) {
      setSortOrder(sortOrderParam);
    }
  }, [searchParams]);

  // 게시글 목록을 서버에서 불러오는 함수
  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = new URL('http://localhost:8000/api/posts');
      const page = searchParams.get('page') || '1';
      url.searchParams.append('page', page);
      if (selectedAuthor) {
        url.searchParams.append('author_id', selectedAuthor);
      }
      const search = searchParams.get('search');
      const type = searchParams.get('type');
      if (search) {
        url.searchParams.append('search', search);
        url.searchParams.append('search_type', type || 'all');
      }
      const sortByParam = searchParams.get('sortBy') || sortBy;
      const sortOrderParam = searchParams.get('sortOrder') || sortOrder;
      url.searchParams.append('sortBy', sortByParam);
      url.searchParams.append('sortOrder', sortOrderParam);

      // API 호출
      const response = await axios.get<PostsResponse>(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data && response.data.posts) {
        setPosts(response.data.posts);
        setTotalPosts(response.data.total);
        setTotalPages(Math.ceil(response.data.total / postsPerPage));
      }
      setIsLoading(false);
    } catch (error) {
      console.error('API 호출 에러:', error);
      setIsLoading(false);
    }
  };

  // 게시글 번호 계산 함수
  const calculatePostNumber = (index: number) => {
    const itemsPerPage = 10;
    const page = Number(searchParams.get('page')) || 1;
    return totalPosts - ((page - 1) * itemsPerPage + index);
  };

  // 새글쓰기 버튼 클릭 시 이동
  const handleNewPost = () => {
    navigate('/posts/new');
  };

  // 작성자 클릭 시 해당 작성자 게시글만 보기
  const handleAuthorClick = (authorId: string, e: React.MouseEvent) => {
    e.stopPropagation();  // 게시글 클릭 이벤트 전파 방지
    setSelectedAuthor(selectedAuthor === authorId ? null : authorId);  // 같은 작성자를 다시 클릭하면 필터 해제
    setCurrentPage(1);  // 페이지 초기화
  };

  // 게시글 클릭 시 상세 페이지로 이동
  const handlePostClick = async (id: number) => {
    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      if (displayedSearchTerm) {
        params.set('search', displayedSearchTerm);
        params.set('type', displayedSearchType);
      }
      // 정렬 기준 추가
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      navigate(`/posts/${id}?${params.toString()}`);
    } catch (error) {
      // 예외 발생 시 무시
    }
  };

  // 페이지네이션 버튼 클릭 핸들러
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const params = new URLSearchParams();
      params.set('page', newPage.toString());
      if (displayedSearchTerm) {
        params.set('search', displayedSearchTerm);
        params.set('type', displayedSearchType);
      }
      setSearchParams(params);
      setCurrentPage(newPage);
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  // 검색 실행 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDisplayedSearchTerm(searchTerm);
    setDisplayedSearchType(searchType);
    setCurrentPage(1);
    const params = new URLSearchParams();
    params.set('page', '1');
    // 검색어가 있으면 검색 파라미터 추가
    if (searchTerm.trim()) {
      params.set('search', searchTerm);
      params.set('type', searchType);
    }
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    setSearchParams(params);
  };

  return (
    <div style={styles.container}>
      {/* 상단 영역 분리: 검색, 정렬, 총 게시글 수 */}
      <PostListHeader
        search={searchTerm}
        searchType={searchType}
        sort={`${sortBy}-${sortOrder}`}
        total={totalPosts}
        onSearch={value => setSearchTerm(value)}
        onSearchType={value => setSearchType(value)}
        onSort={handleSortChange}
        onSubmit={handleSearch}
      />
      {/* 게시글 목록 테이블 */}
      <PostListTable
        posts={posts}
        onPostClick={handlePostClick}
        calculatePostNumber={calculatePostNumber}
        searchTerm={displayedSearchTerm}
      />
      {/* 작성자 필터 활성화 시 안내 */}
      {selectedAuthor && (
        <div style={styles.filterInfo}>
          {posts[0]?.author.name}님의 게시글만 보기
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAuthor(null);
            }} 
            style={styles.clearFilterButton}
          >
            필터 해제
          </button>
        </div>
      )}
      {/* 페이지네이션과 새글쓰기 버튼을 감싸는 컨테이너 */}
      <div style={styles.paginationContainer}>
        {/* 페이지네이션 */}
        {(() => {
          const pageGroup = Math.floor((currentPage - 1) / 5);
          const startPage = pageGroup * 5 + 1;
          const endPage = Math.min(startPage + 4, totalPages);
          return (
            <div className="flex justify-center items-center mt-5 gap-1">
              {totalPages > 1 && (
                <>
                  {/* 이전 묶음: 첫 묶음이 아니면 표시 */}
                  {startPage > 1 && (
                    <button
                      onClick={() => handlePageChange(startPage - 1)}
                      className="px-3 py-2 rounded bg-gray-200 text-gray-700 font-semibold transition hover:bg-gray-300"
                    >
                      이전
                    </button>
                  )}
                  {/* 페이지 번호 버튼 */}
                  {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                    const pageNum = startPage + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded font-semibold mx-0.5 transition ${pageNum === currentPage ? 'bg-blue-500 text-white shadow' : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {/* 다음 묶음: 마지막 묶음이 아니면 표시 */}
                  {endPage < totalPages && (
                    <button
                      onClick={() => handlePageChange(endPage + 1)}
                      className="px-3 py-2 rounded bg-gray-200 text-gray-700 font-semibold transition hover:bg-gray-300"
                    >
                      다음
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })()}
        {/* 새글쓰기 버튼 */}
        <button
          onClick={handleNewPost}
          className="px-4 py-2 bg-green-600 text-white rounded-full shadow hover:bg-green-700 transition-all text-base font-semibold"
          style={styles.newPostButton}
        >
          새글쓰기
        </button>
      </div>
    </div>
  );
};

// 스타일 객체 정의
const styles = {
  container: {
    padding: '24px 24px 60px 24px',
    maxWidth: '1200px',
    margin: '32px auto 0',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    position: 'relative' as const,
  },
  filterInfo: {
    marginTop: '16px',
    padding: '8px 16px',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearFilterButton: {
    padding: '4px 8px',
    backgroundColor: '#dc3545',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '8px',
  },
  paginationContainer: {
    position: 'relative' as const,
    minHeight: '40px', // 높이를 48px에서 40px로 줄임
    marginTop: '16px', // 상단 여백도 20px에서 16px로 줄임
  },
  newPostButton: {
    position: 'absolute' as const,
    right: '0',
    bottom: '-8px', // 버튼 위치를 약간 위로 조정
    minWidth: '110px',
  },
};

export default PostList; 