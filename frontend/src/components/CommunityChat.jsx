import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAppContext } from '../context/AppContext.jsx';

const CommunityChat = () => {
  const { user } = useAppContext();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      
      // Join community chat
      newSocket.emit('join-community', {
        name: user.name,
        email: user.email
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    // Chat event handlers
    newSocket.on('receive-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('chat-history', (history) => {
      setMessages(history);
    });

    newSocket.on('users-updated', (users) => {
      setOnlineUsers(users);
    });

    newSocket.on('user-typing', ({ userName, isTyping }) => {
      if (isTyping) {
        setTypingUsers(prev => [...prev.filter(name => name !== userName), userName]);
      } else {
        setTypingUsers(prev => prev.filter(name => name !== userName));
      }
    });

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, [user]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket && isConnected) {
      socket.emit('send-message', { message: newMessage.trim() });
      setNewMessage('');
      
      // Stop typing indicator
      socket.emit('typing', false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (socket && isConnected) {
      socket.emit('typing', true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', false);
      }, 1000);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageStyle = (messageType, messageUser) => {
    if (messageType === 'system') {
      return 'bg-gray-100 text-gray-600 text-center text-sm py-1 px-2 rounded italic';
    }
    
    if (messageUser === user?.name) {
      return 'bg-green-500 text-white ml-auto max-w-xs lg:max-w-md px-4 py-2 rounded-lg rounded-br-none';
    }
    
    return 'bg-white text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg rounded-bl-none shadow-sm';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-[600px] flex">
      {/* Online Users Sidebar */}
      <div className="w-1/4 bg-gray-50 rounded-l-lg border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            Online Users ({onlineUsers.length})
          </h3>
        </div>
        <div className="p-4 space-y-2 overflow-y-auto h-full">
          {onlineUsers.map((onlineUser) => (
            <div
              key={onlineUser.id}
              className={`flex items-center space-x-2 p-2 rounded ${
                onlineUser.name === user?.name ? 'bg-green-100' : 'hover:bg-gray-100'
              }`}
            >
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {onlineUser.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  onlineUser.name === user?.name ? 'text-green-700' : 'text-gray-700'
                }`}>
                  {onlineUser.name} {onlineUser.name === user?.name && '(You)'}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTime(onlineUser.joinedAt)}
                </p>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          ))}
          {onlineUsers.length === 0 && (
            <p className="text-gray-500 text-sm text-center">No users online</p>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-green-50">
          <h2 className="text-lg font-semibold text-green-800 flex items-center">
            💬 Community Chat
            {!isConnected && (
              <span className="ml-2 text-sm text-red-600 font-normal">
                (Connecting...)
              </span>
            )}
          </h2>
          <p className="text-sm text-green-600">
            Connect with fellow farmers and share knowledge
          </p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
              <p className="text-lg">👋 Welcome to the Community Chat!</p>
              <p className="text-sm mt-2">Start a conversation with your fellow farmers</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex ${message.type === 'system' ? 'justify-center' : message.user === user?.name ? 'justify-end' : 'justify-start'}`}
            >
              <div className={getMessageStyle(message.type, message.user)}>
                {message.type !== 'system' && message.user !== user?.name && (
                  <p className="text-xs text-gray-500 mb-1 font-medium">
                    {message.user}
                  </p>
                )}
                <p className="break-words">{message.message}</p>
                {message.type !== 'system' && (
                  <p className={`text-xs mt-1 ${message.user === user?.name ? 'text-green-100' : 'text-gray-400'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-600">
                {typingUsers.length === 1 
                  ? `${typingUsers[0]} is typing...`
                  : `${typingUsers.length} people are typing...`
                }
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={sendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder={isConnected ? "Type your message..." : "Connecting..."}
              disabled={!isConnected}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !isConnected}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send • Max 500 characters
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommunityChat;
