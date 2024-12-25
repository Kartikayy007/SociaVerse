import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import spaceRoutes from './routes/space';
import connectDB from './config/database';
import { MessageService } from './services/MessageService';
import messageRoutes from './routes/message';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 4000;

connectDB();

const messageService = new MessageService(io);
messageService.initialize();

app.use(cors());
app.use(express.json());
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/spaces', spaceRoutes);
app.use('/api/v1/messages', messageRoutes);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});