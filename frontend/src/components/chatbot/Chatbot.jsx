import React, { useState,useEffect } from 'react' 
import { API_BASE_URL } from '../../config.js'

import Body from './Body.jsx'
import Chatform from './Chatform.jsx'

function Chatbot() {
  const [messages, setMessages] = useState([]); 
  const [started, setStarted] = useState(true);
  const [userId] = useState(() => {
    // Generate a unique user ID or use from localStorage
    return localStorage.getItem('chatUserId') || (() => {
      const newUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('chatUserId', newUserId);
      return newUserId;
    })();
  });
  const [isLoading, setIsLoading] = useState(false);

  const clearChat = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot/history/${userId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  const addMessage = (messageText) => {
    const newMessage = {
      text: messageText,
      sender: "user",
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Generate bot response immediately after adding user message
    generateBotResponse(messageText);
  };

  const addBotMessage = (messageText) => {
    const newMessage = {
      text: messageText,
      sender: "bot",
    };
    setMessages(prev => [...prev, newMessage]);
  };


  const generateBotResponse = async (userMessage) => {
    try {
      setIsLoading(true);
      
      const requestOptions = {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: userId,
          message: userMessage 
        })
      };

      const response = await fetch(`${API_BASE_URL}/api/chatbot/chat`, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        addBotMessage(data.response);
      } else {
        throw new Error(data.error || 'Failed to get response from chatbot');
      }
      
    } catch (error) {
      console.error("Error in chatbot API request:", error);
      addBotMessage("Sorry, I encountered an error connecting to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load conversation history when component mounts
    const loadConversationHistory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/chatbot/history/${userId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.history) {
            const formattedMessages = data.history.map(msg => ({
              text: msg.content,
              sender: msg.role === 'user' ? 'user' : 'bot'
            }));
            setMessages(formattedMessages);
          }
        }
      } catch (error) {
        console.error("Error loading conversation history:", error);
      }
    };

    if (!started) {
      loadConversationHistory();
    }
  }, [started, userId]);

  return (
    <>
      {
        started ?
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to MYGPT</h2>
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
              <div className="flex items-center space-x-2">
                <button 
                  onClick={clearChat}
                  className="text-blue-100 hover:text-white transition-colors p-1"
                  title="Clear chat"
                >
                  <i className="fa-solid fa-trash text-sm"></i>
                </button>
                <button 
                  onClick={() => setStarted(true)}
                  className="text-blue-100 hover:text-white transition-colors"
                >
                  <i className="fa-solid fa-times text-lg"></i>
                </button>
              </div>
            </div>
          </div>
          <Body messages={messages} isLoading={isLoading} />
          <Chatform onSendMessage={addMessage} onBotMessage={addBotMessage} isLoading={isLoading} />
        </div>
      }
    </>
  )
}

export default Chatbot;