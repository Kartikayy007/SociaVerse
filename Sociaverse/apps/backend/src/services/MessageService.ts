import { Server, Socket } from 'socket.io';
import { Message } from '../models/Message';

export class MessageService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.handleConnection = this.handleConnection.bind(this);
  }

  public initialize(): void {
    this.io.on('connection', this.handleConnection);
  }

  private handleConnection(socket: Socket): void {
    console.log('Client connected:', socket.id);

    socket.on('join-space', (spaceId: string) => {
      socket.join(spaceId);
      console.log(`User joined space: ${spaceId}`);
    });

    socket.on('leave-space', (spaceId: string) => {
      socket.leave(spaceId);
      console.log(`User left space: ${spaceId}`);
    });

    socket.on('send-message', async (data: { 
      content: string, 
      spaceId: string, 
      sender: string 
    }) => {
      try {
        const message = new Message({
          content: data.content,
          spaceId: data.spaceId,
          sender: data.sender
        });
        
        await message.save();
        
        this.io.to(data.spaceId).emit('new-message', {
          ...message.toObject(),
          createdAt: new Date()
        });
      } catch (error) {
        console.error('Error saving message:', error);
        socket.emit('error', { message: 'Error saving message' });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  }
}