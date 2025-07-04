import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AuthenticatedSocket extends Socket {
  userId?: string;
  currentSpaceId?: string;
}

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('No token provided'));
      }

      // Verify token with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return next(new Error('Invalid token'));
      }

      socket.userId = user.id;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected`);

    // Join a space
    socket.on('join-space', async (data: { spaceId: string }) => {
      try {
        const { spaceId } = data;

        // Verify user has access to space
        const space = await prisma.space.findUnique({
          where: { id: spaceId },
          include: {
            permissions: {
              where: { userId: socket.userId! }
            }
          }
        });

        if (!space) {
          socket.emit('error', { message: 'Space not found' });
          return;
        }

        // Check access permissions
        if (!space.isPublic && space.creatorId !== socket.userId && space.permissions.length === 0) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Leave previous space if any
        if (socket.currentSpaceId) {
          socket.leave(`space:${socket.currentSpaceId}`);
          
          // Broadcast user left to previous space
          socket.to(`space:${socket.currentSpaceId}`).emit('user-left', {
            userId: socket.userId,
            spaceId: socket.currentSpaceId
          });
        }

        // Join new space room
        socket.join(`space:${spaceId}`);
        socket.currentSpaceId = spaceId;

        // Get current user position
        const position = await prisma.userPosition.findUnique({
          where: {
            userId_spaceId: {
              userId: socket.userId!,
              spaceId
            }
          },
          include: {
            user: { select: { id: true, email: true } }
          }
        });

        // Broadcast user joined to space
        socket.to(`space:${spaceId}`).emit('user-joined', {
          userId: socket.userId,
          spaceId,
          position
        });

        // Send current space users to the joining user
        const spaceUsers = await prisma.userPosition.findMany({
          where: {
            spaceId,
            isOnline: true,
            userId: { not: socket.userId }
          },
          include: {
            user: { select: { id: true, email: true } }
          }
        });

        socket.emit('space-joined', {
          spaceId,
          users: spaceUsers,
          yourPosition: position
        });

      } catch (error) {
        console.error('Error joining space:', error);
        socket.emit('error', { message: 'Failed to join space' });
      }
    });

    // Update user position
    socket.on('update-position', async (data: {
      spaceId: string;
      x: number;
      y: number;
      z?: number;
      velocityX?: number;
      velocityY?: number;
      direction?: number;
      avatarState?: string;
    }) => {
      try {
        if (socket.currentSpaceId !== data.spaceId) {
          socket.emit('error', { message: 'Not in this space' });
          return;
        }

        // Update position in database
        const updatedPosition = await prisma.userPosition.update({
          where: {
            userId_spaceId: {
              userId: socket.userId!,
              spaceId: data.spaceId
            }
          },
          data: {
            x: data.x,
            y: data.y,
            z: data.z,
            velocityX: data.velocityX,
            velocityY: data.velocityY,
            direction: data.direction,
            avatarState: data.avatarState,
            lastUpdate: new Date()
          }
        });

        // Broadcast position update to other users in space
        socket.to(`space:${data.spaceId}`).emit('position-updated', {
          userId: socket.userId,
          position: updatedPosition
        });

      } catch (error) {
        console.error('Error updating position:', error);
        socket.emit('error', { message: 'Failed to update position' });
      }
    });

    // Send chat message
    socket.on('send-message', async (data: {
      spaceId: string;
      content: string;
      messageType?: 'text' | 'emote';
      x?: number;
      y?: number;
      isProximityBased?: boolean;
    }) => {
      try {
        if (socket.currentSpaceId !== data.spaceId) {
          socket.emit('error', { message: 'Not in this space' });
          return;
        }

        // Save message to database
        const message = await prisma.spaceChatMessage.create({
          data: {
            spaceId: data.spaceId,
            userId: socket.userId!,
            content: data.content,
            messageType: data.messageType || 'TEXT',
            x: data.x,
            y: data.y,
            isProximityBased: data.isProximityBased || false
          },
          include: {
            user: { select: { id: true, email: true } }
          }
        });

        // Broadcast message to space
        socket.to(`space:${data.spaceId}`).emit('message-received', message);
        
        // Send confirmation to sender
        socket.emit('message-sent', message);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle object interactions
    socket.on('interact-object', async (data: {
      spaceId: string;
      objectId: string;
      interactionType: string;
    }) => {
      try {
        if (socket.currentSpaceId !== data.spaceId) {
          socket.emit('error', { message: 'Not in this space' });
          return;
        }

        // Get object details
        const object = await prisma.spaceObject.findUnique({
          where: { id: data.objectId }
        });

        if (!object || !object.isInteractive) {
          socket.emit('error', { message: 'Object not interactive' });
          return;
        }

        // Broadcast interaction to space
        socket.to(`space:${data.spaceId}`).emit('object-interacted', {
          userId: socket.userId,
          objectId: data.objectId,
          interactionType: data.interactionType,
          object
        });

      } catch (error) {
        console.error('Error handling object interaction:', error);
        socket.emit('error', { message: 'Failed to interact with object' });
      }
    });

    // Handle portal traversal
    socket.on('use-portal', async (data: {
      spaceId: string;
      portalId: string;
    }) => {
      try {
        const portal = await prisma.spacePortal.findUnique({
          where: { id: data.portalId },
          include: {
            targetSpace: { select: { id: true, name: true, slug: true } }
          }
        });

        if (!portal || !portal.isActive) {
          socket.emit('error', { message: 'Portal not available' });
          return;
        }

        // Check if user has access to target space
        const targetSpace = await prisma.space.findUnique({
          where: { id: portal.targetSpaceId },
          include: {
            permissions: {
              where: { userId: socket.userId! }
            }
          }
        });

        if (!targetSpace?.isPublic && targetSpace?.creatorId !== socket.userId && targetSpace?.permissions.length === 0) {
          socket.emit('error', { message: 'No access to target space' });
          return;
        }

        // Emit portal traversal event
        socket.emit('portal-traversed', {
          targetSpaceId: portal.targetSpaceId,
          targetX: portal.targetX,
          targetY: portal.targetY,
          targetSpace: portal.targetSpace
        });

      } catch (error) {
        console.error('Error using portal:', error);
        socket.emit('error', { message: 'Failed to use portal' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.userId} disconnected`);

      try {
        if (socket.currentSpaceId) {
          // Update user position to offline
          await prisma.userPosition.updateMany({
            where: {
              userId: socket.userId!,
              spaceId: socket.currentSpaceId
            },
            data: { isOnline: false }
          });

          // Decrease space user count
          await prisma.space.update({
            where: { id: socket.currentSpaceId },
            data: { currentUserCount: { decrement: 1 } }
          });

          // Broadcast user left to space
          socket.to(`space:${socket.currentSpaceId}`).emit('user-left', {
            userId: socket.userId,
            spaceId: socket.currentSpaceId
          });
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });
};
