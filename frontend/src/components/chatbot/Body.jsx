import React, { useEffect, useRef } from "react";

// Function to format message text with better readability
const formatMessage = (text) => {
    if (!text) return '';
    
    // Remove duplicate text if it exists
    const lines = text.split('\n');
    const uniqueLines = [];
    const seenLines = new Set();
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !seenLines.has(trimmedLine)) {
            seenLines.add(trimmedLine);
            uniqueLines.push(line);
        } else if (!trimmedLine) {
            // Keep empty lines for spacing
            uniqueLines.push(line);
        }
    }
    
    let formattedText = uniqueLines.join('\n');
    
    // Handle bullet points and formatting
    formattedText = formattedText
        .replace(/\* \*\*(.*?)\*\*/g, '• $1')  // Convert **bold** bullet points
        .replace(/\* (.*?):/g, '• $1:')        // Convert regular bullet points
        .replace(/\*\*(.*?)\*\*/g, '$1')       // Remove remaining bold markers
        .replace(/\n\s*\n\s*\n/g, '\n\n')     // Reduce multiple line breaks
        .trim();
    
    return formattedText;
};

export default function Body({ messages, isLoading = false }) {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
                <div className={`flex items-start space-x-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`} key={index}>
                    {msg.sender === 'bot' && (
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <i className="fa-solid fa-robot text-white text-sm"></i>
                        </div>
                    )}
                    <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.sender === 'bot' 
                                ? 'bg-white text-gray-800 border border-gray-200' 
                                : 'bg-blue-500 text-white'
                        }`}
                    >
                        <div className="whitespace-pre-wrap break-words">
                            {formatMessage(msg.text)}
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
                <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <i className="fa-solid fa-robot text-white text-sm"></i>
                    </div>
                    <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-200">
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
}