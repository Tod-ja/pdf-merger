import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import MainApp from './components/MainApp';
import './App.css';

function App() {
  const [token, setToken] = useState(null);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={token ? <Navigate to="/app" /> : <Auth setToken={setToken} />} 
        />
        <Route 
          path="/app" 
          element={token ? <MainApp token={token} setToken={setToken} /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;