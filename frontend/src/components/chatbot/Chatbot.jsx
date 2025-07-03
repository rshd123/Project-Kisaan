import React, { useState,useEffect } from 'react' 

import Body from './Body.jsx'
import Chatform from './Chatform.jsx'

function Chatbot() {
  const [messages, setMessages] = useState([]); 
  const [started, setStarted] = useState(true);

  const addMessage = (messageText) => {
    const newMessage = {
      text: messageText,
      sender: "user",
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addBotMessage = (messageText) => {
    const newMessage = {
      text: messageText,
      sender: "bot",
    };
    setMessages(prev => [...prev, newMessage]);
  };


  const generateBotResponse = async () => {
    try {
      const apiMessages = messages.map(({ sender, text }) => ({
        role: sender === "user" ? "user" : "model",
        parts: [{ text }]
      }));
      // console.log("API Messages:", apiMessages);

      if (apiMessages.length === 0) return; 

      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: apiMessages })
      };

      const response = await fetch(import.meta.env.VITE_AI_API, requestOptions);
      const data = await response.json();

      addBotMessage(data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand that.");
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch');
      }
      
      console.log(data);

    } catch (error) {
      console.error("Error in API request:", error);
      addBotMessage("Sorry, I encountered an error. Please try again.");
    }
  };

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === "user") {
      generateBotResponse();
    }
  }, [messages]);

  return (
    <>
      {
        started ?
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4"></h2>
            <p className="text-gray-600 mb-8">Start a conversation with our AI assistant</p>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg"
              onClick={() => setStarted(false)}
            >
              <i className="fa-solid fa-play mr-2"></i>
              Start Chat
            </button>
          </div>
        </div>
        :
        <div className="flex flex-col h-full bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-500 text-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-robot text-sm"></i>
                </div>
                <div>
                  <h3 className="font-semibold">MYGPT Assistant</h3>
                  <p className="text-blue-100 text-sm">Online</p>
                </div>
              </div>
              <button 
                onClick={() => setStarted(true)}
                className="text-blue-100 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-times text-lg"></i>
              </button>
            </div>
          </div>
          <Body messages={messages} />
          <Chatform onSendMessage={addMessage} onBotMessage={addBotMessage} />
        </div>
      }
    </>
  )
}

export default Chatbot;