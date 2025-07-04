import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import diagnosisRoutes from './routes/diagnosis.js';
import pricesRoutes from './routes/prices.js';
import voiceRoutes from './routes/voice.js';
import dataRoutes from './routes/data.js';
import authRoutes from './routes/auth.js';
import { chatStorage } from './utils/chatStorage.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite dev server
    methods: ["GET", "POST"], 
    credentials: true
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for audio files
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Project Kisan API is running!', 
    status: 'OK',
    features: ['Voice AI', 'Crop Diagnosis', 'Price Information'],
    timestamp: new Date().toISOString()
  });
});

app.use('/api/diagnose', diagnosisRoutes);
app.use('/api/prices', pricesRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/auth', authRoutes);

// Store connected users
const connectedUsers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining the community chat
  socket.on('join-community', (userData) => {
    // Store user info
    connectedUsers.set(socket.id, {
      id: socket.id,
      name: userData.name,
      email: userData.email,
      joinedAt: new Date()
    });

    // Join the community room
    socket.join('community');

    // Send recent chat history to the new user
    const recentMessages = chatStorage.getRecentMessages(20);
    socket.emit('chat-history', recentMessages);

    // Broadcast updated user list to all users
    const userList = Array.from(connectedUsers.values());
    io.to('community').emit('users-updated', userList);

    // Notify others that user joined
    const joinMessage = chatStorage.addMessage({
      message: `${userData.name} joined the community chat`,
      type: 'system'
    });
    socket.broadcast.to('community').emit('receive-message', joinMessage);

    console.log(`${userData.name} joined community chat`);
  });

  // Handle chat messages
  socket.on('send-message', (messageData) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      const message = chatStorage.addMessage({
        user: user.name,
        message: messageData.message,
        type: 'user'
      });

      // Broadcast message to all users in community
      io.to('community').emit('receive-message', message);
      console.log(`Message from ${user.name}: ${messageData.message}`);
    }
  });

  // Handle user typing
  socket.on('typing', (isTyping) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      socket.broadcast.to('community').emit('user-typing', {
        userName: user.name,
        isTyping
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      connectedUsers.delete(socket.id);

      // Broadcast updated user list
      const userList = Array.from(connectedUsers.values());
      io.to('community').emit('users-updated', userList);

      // Notify others that user left
      const leaveMessage = chatStorage.addMessage({
        message: `${user.name} left the community chat`,
        type: 'system'
      });
      socket.broadcast.to('community').emit('receive-message', leaveMessage);

      console.log(`${user.name} left community chat`);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
