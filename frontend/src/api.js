import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

// Add request interceptor to include token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Only log API errors if they're not expected 401s
      if (error.response.status !== 401) {
        console.error('API Error:', {
          status: error.response.status,
          message: error.response.data?.message || 'Unknown error',
          data: error.response.data,
          url: error.config?.url
        });
      }
      
      if (error.response.status === 401) {
        // Check if we have a token before logging authentication error
        const token = localStorage.getItem('token');
        if (token) {
          console.log('Authentication error - token may be invalid');
          // For production, uncomment the lines below:
          // localStorage.removeItem('token');
          // window.location.href = '/login';
        } else {
          console.log('No authentication token provided');
        }
      }
    } else if (error.code === 'ERR_NETWORK') {
      console.error('Network Error: Cannot connect to backend server');
      console.error('Make sure backend is running on:', API_BASE_URL);
    }
    return Promise.reject(error);
  }
);

export default api;
