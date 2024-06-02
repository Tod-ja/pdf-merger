import React, { useState } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaTimes } from 'react-icons/fa';

function App() {
    const [categories, setCategories] = useState({});
    const [categoryList, setCategoryList] = useState([]);
    const [startNumbers, setStartNumbers] = useState({});

    const handleCategoryInput = (event) => {
        const inputCategories = event.target.value.split(',')
            .map(c => c.trim() === '' ? `Unnamed-${Math.random().toString(36).substr(2, 9)}` : c.trim().toUpperCase())
            .filter(c => c);

        const uniqueCategories = [...new Set(inputCategories)];
        
        setCategoryList(uniqueCategories);

        const newCategoriesObj = {};
        const newStartNumbers = {};
        uniqueCategories.forEach(cat => {
            if (!categories[cat]) {
                newCategoriesObj[cat] = [];
                newStartNumbers[cat] = 1;
            } else {
                newCategoriesObj[cat] = categories[cat];
                newStartNumbers[cat] = startNumbers[cat] || 1;
            }
        });
        setCategories(newCategoriesObj);
        setStartNumbers(newStartNumbers);
    };

    const handleStartNumberChange = (category, event) => {
        setStartNumbers({ ...startNumbers, [category]: parseInt(event.target.value) });
    };

    const onDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) {
            return;
        }

        if (source.droppableId === destination.droppableId) {
            const items = reorder(
                categories[source.droppableId],
                source.index,
                destination.index
            );
            const newCategories = { ...categories, [source.droppableId]: items };
            setCategories(newCategories);
        }
    };

    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };

    const handleFileChange = (category, event) => {
        const newFiles = Array.from(event.target.files).map(file => ({
            id: file.name,
            name: file.name,
            data: file
        }));
        const updatedFiles = categories[category].concat(newFiles);
        setCategories({ ...categories, [category]: updatedFiles });
    };

    const handleMerge = async () => {
        const formData = new FormData();
        Object.keys(categories).forEach(category => {
            categories[category].forEach((file, index) => {
                formData.append('files', file.data);
                formData.append('labels', category.startsWith('Unnamed-') ? '' : category);
            });
            formData.append('start_numbers', startNumbers[category]);
        });

        try {
            const response = await axios.post('http://127.0.0.1:5000/merge', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Merged.pdf');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('There was an error!', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            } else if (error.request) {
                console.error('Request data:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
            console.error('Config:', error.config);
        }
    };

    const handleRemoveFile = (category, fileId) => {
        const updatedFiles = categories[category].filter(file => file.id !== fileId);
        setCategories({ ...categories, [category]: updatedFiles });
    };

    return (
        <div className="app-container">
            <img src="/logo.png" alt="Logo" style={{ width: '300px', marginBottom: '20px' }} />
            <input
                type="text"
                onChange={handleCategoryInput}
                placeholder="Enter categories separated by commas (e.g., A, B, C)"
                style={{ width: '430px' }}
            />
            <DragDropContext onDragEnd={onDragEnd}>
                {categoryList.map(category => (
                    <Droppable droppableId={category} key={category}>
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                <h4>Category {category.startsWith('Unnamed-') ? 'Unnamed' : category}</h4>
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileChange(category, e)}
                                />
                                <label>
                                    First file number:
                                    <input
                                        type="number"
                                        value={startNumbers[category]}
                                        onChange={(e) => handleStartNumberChange(category, e)}
                                        placeholder="Start number"
                                    />
                                </label>
                                {categories[category].map((file, index) => (
                                    <Draggable key={file.id} draggableId={file.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{
                                                    marginBottom: '8px',
                                                    backgroundColor: '#f4f4f4',
                                                    padding: '10px',
                                                    borderRadius: '4px',
                                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                    ...provided.draggableProps.style,
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                {file.name}
                                                <FaTimes
                                                    onClick={() => handleRemoveFile(category, file.id)}
                                                    style={{
                                                        color: '#888',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                ))}
            </DragDropContext>
            <button onClick={handleMerge}>Merge and Label PDFs</button>
        </div>
    );
}

export default App;
