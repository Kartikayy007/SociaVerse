import { Server, Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, OnlineMember } from '../types/socket';
import { Space } from '../models/Space';

export class SocketService {
  private io: Server<ClientToServerEvents, ServerToClientEvents>;

  constructor(io: Server) {
    this.io = io;
    this.handleConnection = this.handleConnection.bind(this);
  }

  public initialize(): void {
    this.io.use(this.authenticateSocket);
    this.io.on('connection', this.handleConnection);
  }

  private authenticateSocket(socket: Socket, next: (err?: Error) => void) {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    socket.data.userId = token;
    next();
  }

  private handleConnection(socket: Socket): void {
    console.log('Client connected:', socket.id);

    socket.on('join-space', async (data) => {
      try {
        const space = await Space.findById(data.spaceId);
        if (!space) throw new Error('Space not found');

        socket.join(`space:${data.spaceId}`);
        await Space.findByIdAndUpdate(data.spaceId, {
          $addToSet: { onlineMembers: data.userId }
        });

        const updatedSpace = await Space.findById(data.spaceId)
          .populate<{ onlineMembers: OnlineMember[] }>('onlineMembers', 'username');

        this.io.to(`space:${data.spaceId}`).emit('space:users-updated', {
          spaceId: data.spaceId,
          users: updatedSpace?.onlineMembers || []
        });
      } catch (error) {
        socket.emit('space:error', (error as Error).message);
      }
    });

    socket.on('disconnecting', async () => {
      const rooms = Array.from(socket.rooms);
      for (const room of rooms) {
        if (room.startsWith('space:')) {
          const spaceId = room.split(':')[1];
          await Space.findByIdAndUpdate(spaceId, {
            $pull: { onlineMembers: socket.data.userId }
          });
          
          const updatedSpace = await Space.findById(spaceId)
            .populate<{ onlineMembers: OnlineMember[] }>('onlineMembers', 'username');

          this.io.to(room).emit('space:users-updated', {
            spaceId,
            users: updatedSpace?.onlineMembers || []
          });
        }
      }
    });
  }
}