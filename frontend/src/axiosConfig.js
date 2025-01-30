import axios from 'axios';

// In production, the nginx proxy will handle the /api routing
// In development, we need to use the full backend URL
const baseURL = process.env.NODE_ENV === 'production'
  ? `${window.location.origin}/api`  // This ensures we use the correct domain in production
  : 'http://localhost:5000/api';     // In development, use the local backend server with /api prefix

console.log('Environment:', process.env.NODE_ENV);
console.log('Base URL:', baseURL);

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosInstance;
