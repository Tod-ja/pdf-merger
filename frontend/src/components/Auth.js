import React, { useState } from 'react';
import axios from '../axiosConfig';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function Auth({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      console.log('Attempting to register user...');
      const response = await axios.post('/api/register', { username, password });
      console.log('Registration response:', response);
      alert("Registration successful! You can now log in.");
    } catch (error) {
      console.error("Registration failed:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
        }
      });
      const errorMessage = error.response?.data?.error || 
        `Registration failed: ${error.message}. Status: ${error.response?.status || 'unknown'}`;
      alert(errorMessage);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('/api/login', { username, password });
      setToken(response.data.access_token);
      navigate('/app');
    } catch (error) {
      console.error("Login failed:", error);
      alert("Invalid credentials");
    }
  };

  return (
    <div className="auth-container">
      <img src="/logo.png" alt="Logo" className="auth-logo" />
      <div className="auth-form">
        <h2>Welcome to Avocado</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="auth-buttons">
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleRegister}>Register</button>
        </div>
      </div>
    </div>
  );
}

export default Auth;
