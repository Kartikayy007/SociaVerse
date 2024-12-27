import { Server } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from '../types/socket';
import { Space } from '../models/Space';

export function initializeSocket(io: Server<ClientToServerEvents, ServerToClientEvents>) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    socket.data.userId = token;
    next();
  });

  io.on('connection', (socket) => {
    console.log('👤 Client connected:', socket.id);

    socket.on('join-space', async ({ spaceId }) => {
      try {
        const space = await Space.findOneAndUpdate(
          { _id: spaceId, 'members.userId': socket.data.userId },
          { $addToSet: { onlineMembers: socket.data.userId } },
          { new: true }
        ).populate<{ onlineMembers: { _id: string; username: string }[] }>('onlineMembers', 'username');

        if (!space) {
          throw new Error('Space not found or not a member');
        }

        socket.join(`space:${spaceId}`);
        io.to(`space:${spaceId}`).emit('space:users-updated', {
          spaceId,
          users: space.onlineMembers.map(m => ({
            _id: m._id.toString(),
            username: m.username
          })),
          onlineMembersCount: space.onlineMembers.length
        });
      } catch (error) {
        socket.emit('space:error', error instanceof Error ? error.message : 'Unknown error');
      }
    });

    // socket.on('message', (data: { spaceId: string; message: any }) => {
    //   io.to(`space:${data.spaceId}`).emit('space:message', data.message);
    // });

    socket.on('disconnecting', async () => {
      try {
        const spaceRooms = Array.from(socket.rooms)
          .filter(room => room.startsWith('space:'))
          .map(room => room.split(':')[1]);

        if (spaceRooms.length > 0) {
          await Space.updateMany(
            { _id: { $in: spaceRooms } },
            { $pull: { onlineMembers: socket.data.userId } }
          );

          spaceRooms.forEach(spaceId => {
            io.to(`space:${spaceId}`).emit('space:users-updated', {
              spaceId,
              users: [],
              onlineMembersCount: 0
            });
          });
        }
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('👋 Client disconnected:', socket.id);
    });
  });

  return io;
}