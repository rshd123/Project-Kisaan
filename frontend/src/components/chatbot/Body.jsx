import React, { useEffect, useRef } from "react";

export default function Body({ messages }) {
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
                        {msg.text}
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
}