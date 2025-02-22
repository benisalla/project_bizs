import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './EditableText.css';
import { Edit } from '@mui/icons-material';
import { Save } from '@mui/icons-material';

const EditableText = ({ initialText = '', onChange }) => {
    const [content, setContent] = useState(initialText);
    const [isEditing, setIsEditing] = useState(false);

    const handleChange = (value) => {
        setContent(value);
        if (onChange) {
            onChange(value);
        }
    };

    const toggleEditing = () => {
        setIsEditing(prev => !prev);
    };

    return (
        <div className="editable-text-container">
            {isEditing ? (
                <ReactQuill
                    value={content}
                    onChange={handleChange}
                    theme="snow"
                    className="rich-text-editor"
                />
            ) : (
                <div
                    className="rich-text-display"
                    dangerouslySetInnerHTML={{ __html: content || '<p>Your content goes here...</p>' }}
                />
            )}

            <button
                onClick={toggleEditing}
                className="toggle-editing-btn"
                title={isEditing ? 'Disable Editing' : 'Enable Editing'}
            >
                {isEditing ? <Save /> : <Edit />}
            </button>
        </div>
    );
};

export default EditableText;
