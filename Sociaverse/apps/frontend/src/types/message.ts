export interface Message {
  text: string;
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  spaceId: string;
  timestamp: Date;
}

export interface SendMessagePayload {
  content: string;
  spaceId: string;
  sender: string;
}