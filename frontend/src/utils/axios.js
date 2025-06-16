import axios from 'axios';

// Create an instance of axios with custom config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Function to get tokens from localStorage
const getAccessToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');

// Function to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Decode JWT payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Check if token is expired
    return payload.exp < Date.now() / 1000;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

// Add request interceptor
api.interceptors.request.use(
  async (config) => {
    // Don't add token to auth endpoints
    if (config.url.includes('/auth/')) {
      return config;
    }
    
    const accessToken = getAccessToken();
    
    if (accessToken) {
      // Add token to headers
      config.headers.Authorization = `Bearer ${accessToken}`;
      
      // If token is expired, try to refresh it
      if (isTokenExpired(accessToken)) {
        try {
          // Attempt to refresh the token
          const refreshToken = getRefreshToken();
          
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }
          
          // Call refresh token endpoint
          // In a real app, this would be an API call
          // For mock purposes, we'll simulate a token refresh
          
          // Make a refresh token request
          // const response = await axios.post('/api/auth/refresh', { refreshToken });
          // const { accessToken: newAccessToken } = response.data;
          
          // For simulation:
          const newAccessToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
            JSON.stringify({
              sub: '1234567890',
              name: 'User',
              exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
            })
          )}.DUMMY_SIGNATURE`;
          
          // Update token in localStorage
          localStorage.setItem('accessToken', newAccessToken);
          
          // Update the current request's Authorization header
          config.headers.Authorization = `Bearer ${newAccessToken}`;
        } catch (error) {
          console.error('Error refreshing token:', error);
          // Clear auth data if refresh fails
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Redirect to login page
          window.location.href = '/admin/login';
        }
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common error responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = getRefreshToken();
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Call refresh token endpoint
        // In a real app, this would be an API call
        // For mock purposes, we'll simulate a token refresh
        
        // Make a refresh token request
        // const response = await axios.post('/api/auth/refresh', { refreshToken });
        // const { accessToken: newAccessToken } = response.data;
        
        // For simulation:
        const newAccessToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
          JSON.stringify({
            sub: '1234567890',
            name: 'User',
            exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
          })
        )}.DUMMY_SIGNATURE`;
        
        // Update token in localStorage
        localStorage.setItem('accessToken', newAccessToken);
        
        // Update the failed request and retry it
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Error refreshing token on 401:', refreshError);
        // Clear auth data if refresh fails
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle 403 Forbidden errors (insufficient permissions)
    if (error.response?.status === 403) {
      console.error('Permission denied');
      // You could redirect to an "Access Denied" page here
    }
    
    return Promise.reject(error);
  }
);

export default api; 