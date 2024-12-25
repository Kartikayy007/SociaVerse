export interface User {
  _id: string;
  username: string;
}

export interface Member {
  _id: string;
  username: string;
  avatar?: string;
}

export interface Space {
  _id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  isPublic: boolean;
  members: Member[];
  onlineMembers: Member[];
  ownerId: string;
  inviteCode: string;
  lastVisited: Date;
  createdAt: Date;
  updatedAt: Date;
}