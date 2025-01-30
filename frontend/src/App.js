import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import MergeAndLabel from './components/MergeAndLabel';
import ToolSelection from './components/ToolSelection';
import AvocadoAI from './components/AvocadoAI';
import './App.css';

function App() {
  const [token, setToken] = useState(null);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={token ? <Navigate to="/tools" /> : <Auth setToken={setToken} />} 
        />
        <Route 
          path="/tools" 
          element={token ? <ToolSelection token={token} setToken={setToken} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/merge" 
          element={token ? <MergeAndLabel token={token} setToken={setToken} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/interact" 
          element={token ? <AvocadoAI token={token} setToken={setToken} /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;