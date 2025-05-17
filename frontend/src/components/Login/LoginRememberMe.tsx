import React from 'react';

interface LoginRememberMeProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  style?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  checkboxStyle?: React.CSSProperties;
}

// LoginRememberMe: 아이디 기억하기 체크박스 컴포넌트
const LoginRememberMe: React.FC<LoginRememberMeProps> = ({ checked, onChange, style, labelStyle, checkboxStyle }) => (
  <div style={style}>
    <label style={labelStyle}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)} // 체크 상태 변경 시 부모로 전달
        style={checkboxStyle}
      />
      아이디 기억하기
    </label>
  </div>
);

export default LoginRememberMe; 