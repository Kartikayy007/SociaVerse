'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export function SocketTest() {
  const [connected, setConnected] = useState(false)
  const [socketId, setSocketId] = useState<string>('')
  
  useEffect(() => {
    console.log('🧪 Testing socket connection...')
    
    const socket = io('http://localhost:3001', {
      transports: ['polling']
    })
    
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id)
      setConnected(true)
      setSocketId(socket.id || '')
      
      // Test sending join_space event
      socket.emit('join_space', {
        spaceId: 'test-space',
        userId: 'test-user',
        email: 'test@example.com',
        position: { x: 50, y: 50 }
      })
    })
    
    socket.on('connect_error', (error) => {
      console.error('❌ Socket error:', error)
      setConnected(false)
    })
    
    socket.on('user_joined_space', (data) => {
      console.log('👥 User joined:', data)
    })
    
    return () => {
      socket.close()
    }
  }, [])
  
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="font-bold mb-2">Socket Test</h2>
      <div>Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}</div>
      <div>Socket ID: {socketId}</div>
      <div className="text-sm text-gray-600 mt-2">Check console for logs</div>
    </div>
  )
}
