export interface OnlineMember {
  _id: string;
  username: string;
}

export interface ServerToClientEvents {
  'space:users-updated': (data: { spaceId: string; users: OnlineMember[] }) => void;
  'space:message': (data: { spaceId: string; message: any }) => void;
  'space:error': (error: string) => void;
}

export interface ClientToServerEvents {
  'join-space': (data: { spaceId: string; userId: string }) => void;
  'leave-space': (data: { spaceId: string; userId: string }) => void;
  'send-message': (data: { spaceId: string; message: string }) => void;
}