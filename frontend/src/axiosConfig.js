import axios from 'axios';

// Set the base URL based on the environment
const baseURL = process.env.NODE_ENV === 'production' 
  ? '/api'  // In production, use relative path which will be handled by Azure's reverse proxy
  : 'http://localhost:5000'; // In development, use the local backend server

axios.defaults.baseURL = baseURL;

export default axios;
