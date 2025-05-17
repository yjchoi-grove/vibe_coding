import React from 'react';

interface LoginInputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
  autoComplete?: string;
}

// LoginInput: 로그인 입력 필드 컴포넌트
const LoginInput: React.FC<LoginInputProps> = ({ type, placeholder, value, onChange, style, autoComplete }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={e => onChange(e.target.value)} // 입력값 변경 시 부모로 전달
    style={style}
    autoComplete={autoComplete}
  />
);

export default LoginInput; 