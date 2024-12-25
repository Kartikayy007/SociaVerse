import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useSocket } from '../context/socket/SocketContext';
import type { Message } from '../types/message';

interface ChatProps {
  type: 'personal' | 'group';
  chatId: string;
  currentUserId: string;
}

const Chat = ({ type, chatId, currentUserId }: ChatProps) => {
  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg">
      <div className="px-4 py-3 bg-gray-800 rounded-t-lg">
        <h3 className="text-white font-semibold">Chat temporarily disabled</h3>
      </div>
      <div className="flex-1 p-4">
        <p className="text-gray-400">Chat functionality coming soon...</p>
      </div>
    </div>
  );
};

export default Chat;