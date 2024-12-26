import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import spaceRoutes from './routes/space';
import connectDB from './config/database';
import { SocketService } from './services/SocketService';
import path from 'path';

// Initialize environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 4000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/spaces', spaceRoutes);

// Initialize SocketService
const socketService = new SocketService(io);
socketService.initialize();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('👤 New client connected:', socket.id);

  // Handle joining a space
  socket.on('join_space', (spaceId: string) => {
    socket.join(spaceId);
    console.log(`User ${socket.id} joined space: ${spaceId}`);
  });

  // Handle leaving a space
  socket.on('leave_space', (spaceId: string) => {
    socket.leave(spaceId);
    console.log(`User ${socket.id} left space: ${spaceId}`);
  });

  // Handle messages in a space
  socket.on('message', (data: { spaceId: string; message: any }) => {
    io.to(data.spaceId).emit('message', data.message);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('👋 Client disconnected:', socket.id);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});