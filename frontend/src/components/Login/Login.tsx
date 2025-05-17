import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginInput from './LoginInput';
import LoginRememberMe from './LoginRememberMe';
import LoginButton from './LoginButton';

// 로그인 함수의 반환 타입 정의
interface LoginResponse {
  access_token: string;
  token_type: string;
  userName: string;  // 사용자 이름 필드 추가
}

const Login: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  // 컴포넌트 마운트 시 저장된 아이디만 불러오기
  useEffect(() => {
    const savedUserId = localStorage.getItem('rememberedUserId');
    const remembered = localStorage.getItem('rememberMe') === 'true';
    if (remembered && savedUserId) {
      setUserId(savedUserId);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 로그인 폼 데이터 생성
      const formData = new FormData();
      formData.append('username', userId);
      formData.append('password', password);

      // 로그인 API 요청
      const response = await axios.post<LoginResponse>('http://localhost:8000/api/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.access_token) {
        // 아이디만 저장하고 비밀번호는 저장하지 않음
        if (rememberMe) {
          localStorage.setItem('rememberedUserId', userId);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberedUserId');
          localStorage.removeItem('rememberMe');
        }

        // 토큰 및 사용자 정보 저장
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', response.data.userName);
        navigate('/posts');
      }
    } catch (error) {
      // 로그인 실패 시 에러 처리
      alert('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>  
      <div style={styles.container}>
        <h2 style={styles.title}>로그인</h2>
        <LoginInput
          type="text"
          placeholder="아이디 입력"
          value={userId}
          onChange={setUserId}
          style={styles.input}
          autoComplete="username"
        />
        <LoginInput
          type="password"
          placeholder="비밀번호 입력"
          value={password}
          onChange={setPassword}
          style={styles.input}
          autoComplete="current-password"
        />
        <LoginRememberMe
          checked={rememberMe}
          onChange={setRememberMe}
          style={styles.rememberMeContainer}
          labelStyle={styles.rememberMeLabel}
          checkboxStyle={styles.checkbox}
        />
        <LoginButton style={styles.button} />
      </div>  
    </form>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '100px auto',
    padding: '40px',
    backgroundColor: '#ffffff',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    textAlign: 'center' as const,
  },
  input: {
    width: '100%',
    height: '48px',
    marginBottom: '16px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    fontSize: '14px',
    padding: '0 16px',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s ease',
    ':focus': {
      borderColor: '#007bff',
      outline: 'none',
    },
  },
  button: {
    width: '100%',
    height: '48px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#0056b3',
    },
  },
  rememberMeContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: '24px',
    padding: '0 4px',
  },
  rememberMeLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    color: '#666',
    cursor: 'pointer',
    userSelect: 'none' as const,
  },
  checkbox: {
    marginRight: '8px',
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '32px',
  },
};

export default Login; 