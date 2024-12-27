// import { Types } from 'mongoose';

export interface OnlineMember {
  _id: string;
  username: string;
}

export interface ServerToClientEvents {
  'space:users-updated': (data: { 
    spaceId: string; 
    users: OnlineMember[];
    onlineMembersCount: number;
  }) => void;
  'space:error': (error: string) => void;
}

export interface ClientToServerEvents {
  'join-space': (data: { spaceId: string }) => void;
  'leave-space': (data: { spaceId: string }) => void;
}