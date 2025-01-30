import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import './AvocadoAI.css';

const AvocadoAI = ({ token, setToken }) => {
  const [files, setFiles] = useState([]);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (files.length === 0 || !query) return;

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('question', query);

    setLoading(true);
    try {
      const response = await axios.post('/api/document-interaction', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      setResponse(response.data.response);
    } catch (error) {
      console.error('Error:', error);
      if (error.response) {
        setResponse(`Error: ${error.response.data.error || 'An error occurred while processing your request.'}`);
      } else {
        setResponse('An error occurred while processing your request.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="document-interaction-container">
      <button className="back-btn" onClick={() => navigate('/tools')}>
        ← Back to Tools
      </button>
      
      <button className="logout-btn" onClick={() => {
        setToken(null);
        navigate('/');
      }}>Logout</button>

      <div className="header">
        <div className="title-container">
          <img src="/logo.png" alt="Logo" className="main-logo" />
          <h1>Avocado AI</h1>
        </div>
      </div>

      <div className="interaction-form">
        <div className="upload-section">
          <h3>1. Select your documents</h3>
          <div className="file-upload-section">
            <label htmlFor="file-upload" className="file-upload-label">
              Choose documents
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
              className="file-input"
              multiple
            />
          </div>

          {files.length > 0 && (
            <div className="file-list">
              <h4>Selected Documents:</h4>
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-name">{file.name}</span>
                  <button 
                    className="remove-file-btn"
                    onClick={() => handleRemoveFile(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="query-section">
          <h3>2. Ask anything about your documents</h3>
          <textarea
            value={query}
            onChange={handleQueryChange}
            placeholder="Example: What are the main topics discussed in these documents? Or: Compare the key points from all documents..."
            className="query-input"
          />
        </div>

        <button 
          onClick={handleSubmit}
          disabled={files.length === 0 || !query || loading}
          className="submit-button"
        >
          {loading ? 'Processing...' : 'Ask Avocado AI'}
        </button>

        {response && (
          <div className="response-section">
            <h3>Response from Avocado AI:</h3>
            <div className="response-content">
              {response}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvocadoAI;
