import React, { useState } from 'react';
import { updateMark } from '../../services/markService';

const MarkEdit = ({ mark, onClose, onSuccess }) => {
    const [markValue, setMarkValue] = useState(mark.mark_value);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateMark(mark.mark_id, { mark_value: markValue });
            onSuccess();
            onClose();
        } catch (error) {
            alert('Error updating mark: ' + error.message);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h3>Edit Mark</h3>
                <form onSubmit={handleSubmit}>
                    <p>Student: {mark.student_name}</p>
                    <p>Subject: {mark.subject_name}</p>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={markValue}
                        onChange={(e) => setMarkValue(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn-primary">Save</button>
                    <button type="button" onClick={onClose}>Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default MarkEdit;
