// src/services/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api', // Your backend API base URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial for reading HTTP-Only Refresh cookies
});

// Interceptor to inject the access token on every outgoing request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle expired tokens and retry failed requests
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 Unauthorized and hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Hit the refresh endpoint we set up on your backend
        const res = await axios.post('http://localhost:5000/api/auth/refresh', {}, { withCredentials: true });
        const { accessToken } = res.data;
        
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        return apiClient(originalRequest); // Retry the original request
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login'; // Force manual login if refresh fails
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
