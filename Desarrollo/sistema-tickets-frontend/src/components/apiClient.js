import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://heron-eminent-starling.ngrok-free.app/',  // La URL base de tu API Django
    headers: {
      'ngrok-skip-browser-warning': 'any-value',
      'Content-Type': 'application/json',
      },
  });
export default apiClient; 