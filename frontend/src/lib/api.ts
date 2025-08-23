import axios from 'axios';

/**
 * Create an Axios instance with a base URL from environment variables.
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

/**
 * Request interceptor to automatically attach JWT token
 * to every outgoing request if it exists in localStorage.
 */
api.interceptors.request.use(
  (config) => {
    // Retrieve token from localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      // Add token to Authorization header
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Reject the promise if request configuration fails
    return Promise.reject(error);
  }
);

export default api;
