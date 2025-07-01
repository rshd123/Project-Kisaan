import React from 'react';
import { useState,useEffect } from 'react';

export default function Chatform({ onSendMessage, onBotMessage}) {
    const [message, setMessage] = useState('');

    const handleFormSubmit = (e) => {
        try {
            e.preventDefault();
            if (message.trim()) {
                onSendMessage(message);
                setMessage('');
            }
        } catch (err) {
            console.error("Error sending message:", err);
        }
    }

    return (
        <div className="p-4 bg-white border-t border-gray-200">
            <form onSubmit={handleFormSubmit} className="flex space-x-2">
                <input 
                    type="text" 
                    placeholder="Ask me anything..." 
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    required 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                    <i className="fa-solid fa-paper-plane"></i>
                </button>
            </form>
        </div>
    );
}