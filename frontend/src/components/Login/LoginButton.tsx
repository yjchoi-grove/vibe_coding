import React from 'react';

interface LoginButtonProps {
  style?: React.CSSProperties;
}

// LoginButton: 로그인 버튼 컴포넌트
const LoginButton: React.FC<LoginButtonProps> = ({ style }) => (
  <button type="submit" style={style}>
    로그인
  </button>
);

export default LoginButton; 