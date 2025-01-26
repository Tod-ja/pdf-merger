import React, { useState } from 'react';
import axios from 'axios';
import { DragDropContext } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';
import Category from './Category';
import './MainApp.css';

function MainApp({ token }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState({});
  const [categoryList, setCategoryList] = useState([]);
  const [startNumbers, setStartNumbers] = useState({});

  // Redirect to login if no token
  if (!token) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleCategoryInput = (event) => {
    const inputCategories = event.target.value
      .split(',')
      .map((c, index) => {
        const trimmed = c.trim();
        return trimmed === '' ? `${index + 1}` : trimmed;
      })
      .map(c => c.toUpperCase());

    const uniqueCategories = Array.from(new Set(inputCategories));
    setCategoryList(uniqueCategories);

    const updatedCategories = {};
    const updatedStartNumbers = {};

    uniqueCategories.forEach((cat) => {
      updatedCategories[cat] = categories[cat] || [];
      updatedStartNumbers[cat] = startNumbers[cat] || 'None';
    });

    setCategories(updatedCategories);
    setStartNumbers(updatedStartNumbers);
  };

  const handleStartNumberChange = (category, event) => {
    const value = event.target.value;
    setStartNumbers((prev) => ({ ...prev, [category]: value }));
  };

  const handleFileChange = (category, event) => {
    const newFiles = Array.from(event.target.files).map((file) => ({
      id: `${file.name}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      data: file
    }));

    setCategories((prev) => ({
      ...prev,
      [category]: prev[category].concat(newFiles)
    }));
  };

  const handleRemoveFile = (category, fileId) => {
    setCategories((prev) => ({
      ...prev,
      [category]: prev[category].filter((file) => file.id !== fileId)
    }));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      const reorderedFiles = Array.from(categories[source.droppableId]);
      const [movedFile] = reorderedFiles.splice(source.index, 1);
      reorderedFiles.splice(destination.index, 0, movedFile);

      setCategories((prev) => ({
        ...prev,
        [source.droppableId]: reorderedFiles
      }));
    }
  };

  const handleMerge = async () => {
    const formData = new FormData();
    categoryList.forEach((category) => {
      categories[category].forEach((file) => {
        formData.append('files', file.data);
        formData.append('labels', category.startsWith('Unnamed-') ? '' : category);
      });
      formData.append('start_numbers', startNumbers[category]);
    });

    try {
      const response = await axios.post('/api/merge', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Merged.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error during merging:', error);
      if (error.response?.status === 400) {
        alert('Error: Please make sure all required fields are filled correctly');
      } else {
        alert('Error during merging. Please try again.');
      }
    }
  };

  const handleLabelOnly = async () => {
    const formData = new FormData();
    categoryList.forEach((category) => {
      categories[category].forEach((file) => {
        formData.append('files', file.data);
        formData.append('labels', category.startsWith('Unnamed-') ? '' : category);
      });
      formData.append('start_numbers', startNumbers[category]);
    });

    try {
      const response = await axios.post('/api/label', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'LabeledFiles.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error during labeling:', error);
      if (error.response?.status === 400) {
        alert('Error: Please make sure all required fields are filled correctly');
      } else {
        alert('Error during labeling. Please try again.');
      }
    }
  };

  const allStartNumbersNone = Object.values(startNumbers).every((num) => num.toLowerCase() === 'none');

  return (
    <div className="main-app">
      <div className="header">
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>

      <div className="content">
        <div className="main-title">
          <img src="/logo.png" alt="Logo" className="main-logo" />
          <h1>Avocado</h1>
        </div>
        
        <input
          type="text"
          onChange={handleCategoryInput}
          placeholder="Enter categories separated by commas (e.g., A, B, C)"
          className="category-input"
        />

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="categories-container">
            {categoryList.map((category) => (
              <Category
                key={category}
                category={category}
                files={categories[category]}
                startNumber={startNumbers[category]}
                onFileChange={(e) => handleFileChange(category, e)}
                onStartNumberChange={(e) => handleStartNumberChange(category, e)}
                onRemoveFile={(fileId) => handleRemoveFile(category, fileId)}
              />
            ))}
          </div>
        </DragDropContext>

        <div className="action-buttons">
          <button onClick={handleMerge} disabled={categoryList.length === 0}>
            {allStartNumbersNone ? 'Merge PDFs' : 'Merge and Label PDFs'}
          </button>
          {!allStartNumbersNone && (
            <button onClick={handleLabelOnly} disabled={categoryList.length === 0}>
              Label Only
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainApp;
