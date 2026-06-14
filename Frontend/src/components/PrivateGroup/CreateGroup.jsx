import React, { useState } from 'react';
import axios from '../../utils/axios';

// Icon for the button
const AddGroupIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 9h2l-2 3h-2l-2-3h2V9z" />
    </svg>
);

export default function CreateGroup({ onClose, onGroupCreated }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        const trimmedName = name.trim();
        if (!trimmedName) {
            setError("Group name is required.");
            return;
        }

        setIsSubmitting(true);

        try {
            await axios.post('/private-group/create', {
                name: trimmedName,
                description: description.trim(),
            });

            // Success: Close modal and notify parent to refresh groups
            if (onGroupCreated) onGroupCreated();
            if (onClose) onClose();

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to create group. Check console for details.';
            setError(errorMessage);
            console.error("Group Creation Error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-2xl border-2 border-purple-200 w-full max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-purple-700 border-b pb-3">Create New Family Circle</h2>
            
            <form onSubmit={handleSubmit}>
                
                {/* Name Input */}
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Circle Name (Required)
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., The Smith Family Memories"
                        className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm p-3 focus:ring-purple-500 focus:border-purple-500"
                        required
                        disabled={isSubmitting}
                    />
                </div>

                {/* Description Input */}
                <div className="mb-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder="A short description of the group's purpose or members."
                        className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm p-3 focus:ring-purple-500 focus:border-purple-500"
                        disabled={isSubmitting}
                    ></textarea>
                </div>
                
                {/* Error and Action Buttons */}
                {error && (
                    <p className="text-sm text-red-600 mb-4 p-2 bg-red-50 border border-red-200 rounded-md">{error}</p>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 text-base font-medium text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex items-center px-6 py-2 text-base font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors disabled:bg-purple-400 shadow-md"
                        disabled={isSubmitting || !name.trim()}
                    >
                        <AddGroupIcon />
                        {isSubmitting ? 'Creating...' : 'Create Circle'}
                    </button>
                </div>
            </form>
        </div>
    );
}
