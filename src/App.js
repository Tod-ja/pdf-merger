import React, { useState } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


function App() {
    const [categories, setCategories] = useState({});
    const [categoryList, setCategoryList] = useState([]);

    const handleCategoryInput = (event) => {
        let newCategories = event.target.value.split(',').map(c => c.trim().toUpperCase()).filter(c => c);
        setCategoryList(newCategories);
        newCategories.forEach(cat => {
            if (!categories[cat]) {
                categories[cat] = [];
                setCategories({ ...categories });
            }
        });
    };

    const onDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) {
            return; // dropped outside the list
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
                formData.append('labels', `${category}${index + 1}`);
            });
        });

        const response = await axios.post('http://localhost:5000/merge', formData, {
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
    };

    return (
        <div className="App">
            <input type="text" onChange={handleCategoryInput} placeholder="Enter categories separated by commas (e.g., A, B, C)" />
            <DragDropContext onDragEnd={onDragEnd}>
                {categoryList.map(category => (
                    <Droppable droppableId={category} key={category}>
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                <h4>Category {category}</h4>
                                <input type="file" multiple onChange={(e) => handleFileChange(category, e)} />
                                {categories[category].map((file, index) => (
                                    <Draggable key={file.id} draggableId={file.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{ marginBottom: '8px', backgroundColor: '#f4f4f4', padding: '10px' }}
                                            >
                                                {file.name}
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
