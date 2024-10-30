import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8000/',  // La URL base de tu API Django
    headers: {
      'Content-Type': 'application/json',
      },
  });
export default apiClient; 