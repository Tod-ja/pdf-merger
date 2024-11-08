// frontend/src/App.js

import React, { useState } from 'react';
import axios from 'axios';
import { DragDropContext } from 'react-beautiful-dnd';
import './App.css';
import Category from './components/Category';

function App() {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [categories, setCategories] = useState({});
  const [categoryList, setCategoryList] = useState([]);
  const [startNumbers, setStartNumbers] = useState({});

  const handleCategoryInput = (event) => {
    const inputCategories = event.target.value
      .split(',')
      .map((c) => c.trim() || `Unnamed-${Math.random().toString(36).substr(2, 9)}`)
      .filter(Boolean)
      .map((c) => c.toUpperCase());

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
    const value = event.target.value.trim();
    setStartNumbers((prev) => ({ ...prev, [category]: value || 'None' }));
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
      const response = await axios.post(`${API_URL}/merge`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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
      const response = await axios.post(`${API_URL}/label`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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
    }
  };

  const allStartNumbersNone = Object.values(startNumbers).every((num) => num.toLowerCase() === 'none');

  return (
    <div className="app-container">
      <img src="/logo.png" alt="Logo" className="logo" />
      <input
        type="text"
        onChange={handleCategoryInput}
        placeholder="Enter categories separated by commas (e.g., A, B, C)"
        className="category-input"
      />
      <DragDropContext onDragEnd={onDragEnd}>
        {categoryList.map((category) => (
          <Category
            key={category}
            category={category}
            files={categories[category]}
            startNumber={startNumbers[category]}
            handleFileChange={handleFileChange}
            handleStartNumberChange={handleStartNumberChange}
            handleRemoveFile={handleRemoveFile}
          />
        ))}
      </DragDropContext>
      <button onClick={handleMerge} className="merge-button">
        {allStartNumbersNone ? 'Merge Files' : 'Merge and Label Files'}
      </button>
      {!allStartNumbersNone && (
        <button onClick={handleLabelOnly} className="label-button">
          Label Files Only
        </button>
      )}
    </div>
  );
}

export default App;
