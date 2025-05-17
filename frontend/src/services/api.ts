import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const login = async (userId: string, password: string) => {
  const formData = new FormData();
  formData.append('username', userId);
  formData.append('password', password);

  const response = await axios.post(`${API_URL}/login`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}; 