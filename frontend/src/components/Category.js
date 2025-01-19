// frontend/src/components/Category.js

import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { FaTimes } from 'react-icons/fa';

const Category = ({
  category,
  files,
  startNumber,
  onFileChange,
  onStartNumberChange,
  onRemoveFile
}) => (
  <Droppable droppableId={category}>
    {(provided) => (
      <div {...provided.droppableProps} ref={provided.innerRef} className="category-container">
        <h4 className="category-title">Category {category.startsWith('Unnamed-') ? 'Unnamed' : category}</h4>
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={onFileChange}
          className="file-input"
        />
        <label className="start-number-label">
          First file number (or None if no labeling is required):
          <input
            type="text"
            value={startNumber}
            onChange={onStartNumberChange}
            placeholder="Start number or None"
            className="start-number-input"
          />
        </label>
        {files.map((file, index) => (
          <Draggable key={file.id} draggableId={file.id} index={index}>
            {(provided) => (
              <div
                className="file-item"
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                {file.name}
                <FaTimes
                  onClick={() => onRemoveFile(file.id)}
                  className="remove-icon"
                />
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
);

export default Category;
