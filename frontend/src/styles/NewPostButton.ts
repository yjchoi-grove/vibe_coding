import styled from 'styled-components';

export const NewPostButton = styled.button`
  position: absolute;
  bottom: 30px;
  right: 30px;
  padding: 0 20px;
  height: 40px;
  background-color: #28a745;
  color: #ffffff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background-color: #218838;
    transform: scale(1.1);
  }
`; 