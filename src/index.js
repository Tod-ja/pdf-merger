import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'; // Importing App component from App.js
import './index.css'; // Import a CSS file for global styles (optional)

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root') // Mounts the App component to the div element with id 'root' in index.html
);
