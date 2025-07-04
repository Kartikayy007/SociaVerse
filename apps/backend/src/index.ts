import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import authRoutes from './routes/auth';
import spacesRoutes from './routes/spaces';
import usersRoutes from './routes/users';
import agoraRoutes from './routes/agora';
import { authMiddleware } from './middleware/auth';
import { prisma } from './lib/prisma';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true
});
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

const allowedOrigins = [
  "http://localhost:3000",
  "http://192.168.1.16:3000",
  process.env.FRONTEND_URL
].filter((origin): origin is string => Boolean(origin));

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Socket.io handling - Store user positions in memory for simplicity
const userPositions = new Map();

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('join_space', (data) => {
    const { spaceId, userId, email, position } = data;
    console.log(`📍 ${email} joining space ${spaceId}`);
    
    // Join the space room
    socket.join(`space_${spaceId}`);
    
    // Store user info
    socket.data = { spaceId, userId, email };
    
    // Store position
    userPositions.set(userId, { ...position, email });
    
    console.log(`✅ ${email} joined space ${spaceId}`);
    
    // Notify others in the space
    socket.to(`space_${spaceId}`).emit('user_joined_space', {
      userId,
      email,
      ...position
    });
  });

  socket.on('leave_space', (data) => {
    const { spaceId, userId } = data;
    console.log(`👋 User ${userId} leaving space ${spaceId}`);
    
    socket.leave(`space_${spaceId}`);
    userPositions.delete(userId);
    
    // Notify others in the space
    socket.to(`space_${spaceId}`).emit('user_left_space', { userId });
  });

  socket.on('position_update', (data) => {
    const { spaceId, userId, email, x, y } = data;
    
    // Update stored position
    userPositions.set(userId, { x, y, email });
    
    // Broadcast to others in the same space
    socket.to(`space_${spaceId}`).emit('position_broadcast', {
      userId,
      email,
      x,
      y
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    
    if (socket.data) {
      const { spaceId, userId } = socket.data;
      userPositions.delete(userId);
      
      // Notify others in the space
      socket.to(`space_${spaceId}`).emit('user_left_space', { userId });
    }
  });
});

// Public endpoints (before auth middleware)
app.get('/api/spaces/public', async (req, res) => {
  try {
    const spaces = await prisma.space.findMany({
      where: { 
        isPublic: true,
        isFeatured: true 
      },
      include: {
        creator: { select: { id: true, email: true } },
        userPositions: {
          where: { isOnline: true },
          select: { id: true }
        }
      },
      orderBy: { totalVisits: 'desc' },
      take: 10
    });

    const transformedSpaces = spaces.map((space: any) => ({
      ...space,
      currentUserCount: space.userPositions.length,
      userPositions: []
    }));

    res.json({ spaces: transformedSpaces });
  } catch (error) {
    console.error('Error fetching public spaces:', error);
    res.status(500).json({ error: 'Failed to fetch public spaces' });
  }
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/spaces', authMiddleware, spacesRoutes);
app.use('/api/users', authMiddleware, usersRoutes);
app.use('/api/agora', agoraRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'SociaVerse Backend is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    status: 'healthy'
  });
});

// Basic routes without auth for now
app.get('/api/info', (req, res) => {
  res.json({
    name: 'SociaVerse API',
    description: 'Backend for virtual world platform',
    features: [
      'Space management',
      'Real-time user positions',
      'Chat system',
      'Object interactions',
      'User authentication'
    ]
  });
});

// Handle 404 for API routes only
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

server.listen({
  port: PORT,
  host: '0.0.0.0'
}, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/api/health`);
  console.log(`🔌 Socket.io enabled for real-time communication`);
});