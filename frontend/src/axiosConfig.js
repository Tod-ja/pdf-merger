import axios from 'axios';

// Set the base URL based on the environment
const baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://pdf-merger-app.azurewebsites.net'  // In production, use the full domain without /api
  : 'http://localhost:5000'; // In development, use the local backend server

console.log('Environment:', process.env.NODE_ENV);
console.log('Base URL:', baseURL);

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosInstance;
