import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from '../axiosConfig';
import './MergeAndLabel.css';

const Category = ({ category, onRemove, onNameChange, onFilesChange, onStartNumberChange, onRemoveFile }) => {
  return (
    <div className="category">
      <div className="category-header">
        <input
          type="text"
          className="category-name-input"
          value={category.name}
          onChange={(e) => onNameChange(category.id, e.target.value)}
          placeholder="Category name"
        />
        <button className="remove-category" onClick={() => onRemove(category.id)}>×</button>
      </div>
      <div className="category-content">
        <div className="file-upload-section">
          <label htmlFor={`file-upload-${category.id}`} className="file-upload-label">
            Choose files for this category
          </label>
          <input
            id={`file-upload-${category.id}`}
            type="file"
            onChange={(e) => onFilesChange(category.id, Array.from(e.target.files))}
            multiple
            className="file-input"
          />
        </div>
        {category.files.length > 0 && (
          <Droppable droppableId={`category-${category.id}`}>
            {(provided) => (
              <div 
                className="file-list"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {category.files.map((file, index) => (
                  <Draggable 
                    key={`${file.name}-${index}`}
                    draggableId={`${file.name}-${index}`}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="file-item"
                      >
                        <span className="file-name">{file.name}</span>
                        <button 
                          className="remove-file"
                          onClick={() => onRemoveFile(category.id, index)}
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}
        <div className="start-number-section">
          <input
            type="text"
            className="start-number-input"
            value={category.startNumber}
            onChange={(e) => onStartNumberChange(category.id, e.target.value)}
            placeholder="Start number for labeling (optional)"
          />
        </div>
      </div>
    </div>
  );
};

const MergeAndLabel = ({ token, setToken }) => {
  const [categories, setCategories] = useState([{
    id: Date.now(),
    name: 'Category 1',
    files: [],
    startNumber: ''
  }]);
  const [nextCategoryNumber, setNextCategoryNumber] = useState(2);
  const navigate = useNavigate();

  const handleAddCategory = () => {
    const newCategory = {
      id: Date.now(),
      name: `Category ${nextCategoryNumber}`,
      files: [],
      startNumber: ''
    };
    setCategories([...categories, newCategory]);
    setNextCategoryNumber(nextCategoryNumber + 1);
  };

  const handleRemoveCategory = (categoryId) => {
    setCategories(categories.filter(category => category.id !== categoryId));
  };

  const handleCategoryNameChange = (categoryId, newName) => {
    setCategories(categories.map(category =>
      category.id === categoryId ? { ...category, name: newName } : category
    ));
  };

  const handleCategoryFilesChange = (categoryId, files) => {
    setCategories(categories.map(category =>
      category.id === categoryId ? { ...category, files } : category
    ));
  };

  const handleStartNumberChange = (categoryId, startNumber) => {
    setCategories(categories.map(category =>
      category.id === categoryId ? { ...category, startNumber } : category
    ));
  };

  const handleRemoveFile = (categoryId, fileIndex) => {
    setCategories(categories.map(category =>
      category.id === categoryId
        ? {
            ...category,
            files: category.files.filter((_, index) => index !== fileIndex)
          }
        : category
    ));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const categoryId = parseInt(result.source.droppableId.split('-')[1]);
    const category = categories.find(cat => cat.id === categoryId);
    
    const newFiles = Array.from(category.files);
    const [reorderedFile] = newFiles.splice(result.source.index, 1);
    newFiles.splice(result.destination.index, 0, reorderedFile);

    setCategories(categories.map(cat =>
      cat.id === categoryId ? { ...cat, files: newFiles } : cat
    ));
  };

  const handleMerge = async () => {
    const formData = new FormData();
    categories.forEach(category => {
      category.files.forEach(file => {
        formData.append('files', file);
        formData.append('labels', category.name);
        formData.append('start_numbers', category.startNumber || 'none');
      });
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
      
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      
      link.setAttribute('download', `merged_${date}_${time}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLabelOnly = async () => {
    const formData = new FormData();
    categories.forEach(category => {
      category.files.forEach(file => {
        formData.append('files', file);
        formData.append('labels', category.name);
        formData.append('start_numbers', category.startNumber || '');
      });
    });

    try {
      const response = await axios.post('/api/label', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });

      // Create blob with correct MIME type for ZIP
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      
      link.setAttribute('download', `labeled_files_${date}_${time}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url); // Clean up the URL object
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const hasStartNumbers = categories.some(category => category.startNumber !== '');

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="main-app">
        <button className="back-btn" onClick={() => navigate('/tools')}>
          ← Back to Tools
        </button>

        <button className="logout-btn" onClick={() => {
          setToken(null);
          navigate('/');
        }}>Logout</button>

        <div className="content">
          <div className="header">
            <div className="title-container">
              <img src="/logo.png" alt="Logo" className="main-logo" />
              <h1>Merge & Label</h1>
            </div>
          </div>

          <div className="categories-container">
            <div className={`categories-grid ${categories.length === 1 ? 'single-category' : ''}`}>
              {categories.map((category, index) => (
                <div key={category.id} className="category-wrapper">
                  <Category
                    category={category}
                    onRemove={handleRemoveCategory}
                    onNameChange={handleCategoryNameChange}
                    onFilesChange={handleCategoryFilesChange}
                    onStartNumberChange={handleStartNumberChange}
                    onRemoveFile={handleRemoveFile}
                  />
                  {index === categories.length - 1 && categories.length < 6 && (
                    <button className="add-category-btn" onClick={handleAddCategory} title="Add Category">
                      +
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {categories.length > 0 && (
            <div className="action-buttons">
              <button onClick={handleMerge}>
                {hasStartNumbers ? 'Merge and Label Files' : 'Merge Files'}
              </button>
              {hasStartNumbers && (
                <button onClick={handleLabelOnly}>
                  Label Only
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </DragDropContext>
  );
};

export default MergeAndLabel;
