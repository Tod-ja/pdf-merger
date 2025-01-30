import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ToolSelection.css';

const ToolSelection = ({ token, setToken }) => {
  const navigate = useNavigate();

  const handleToolSelect = (tool) => {
    navigate(`/${tool}`);
  };

  const handleLogout = () => {
    setToken(null);
    navigate('/');
  };

  return (
    <div className="tool-selection-container">
      <div className="header">
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
      
      <div className="tools-grid">
        <div className="tool-card" onClick={() => handleToolSelect('merge')}>
          <div className="tool-icon">📄</div>
          <h2>Merge & Label</h2>
          <p>Combine multiple documents and add labels</p>
        </div>

        <div className="tool-card" onClick={() => handleToolSelect('interact')}>
          <div className="tool-icon">💬</div>
          <h2>Avocado AI</h2>
          <p>Interact with your documents using AI</p>
        </div>
      </div>
    </div>
  );
};

export default ToolSelection;
