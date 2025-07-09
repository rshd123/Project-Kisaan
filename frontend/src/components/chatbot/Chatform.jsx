import React from 'react';
import { useState,useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function Chatform({ onSendMessage, onBotMessage, isLoading = false}) {
    const { translate } = useLanguage();
    const [message, setMessage] = useState('');

    const handleFormSubmit = (e) => {
        try {
            e.preventDefault();
            if (message.trim() && !isLoading) {
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
                    placeholder={isLoading ? translate('thinking') : translate('typeMessage')} 
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    required 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isLoading}
                />
                <button 
                    type="submit" 
                    disabled={isLoading || !message.trim()}
                    className={`px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                        isLoading || !message.trim() 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                >
                    {isLoading ? (
                        <i className="fa-solid fa-spinner fa-spin"></i>
                    ) : (
                        <i className="fa-solid fa-paper-plane"></i>
                    )}
                </button>
            </form>
        </div>
    );
}