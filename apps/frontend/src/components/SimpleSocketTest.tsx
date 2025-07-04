'use client'

import { useEffect, useState } from 'react'

export function SimpleSocketTest() {
  const [status, setStatus] = useState('Initializing...')
  const [logs, setLogs] = useState<string[]>([])
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-10), `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    const testSocket = async () => {
      try {
        addLog('📦 Importing socket.io-client...')
        const { io } = await import('socket.io-client')
        
        addLog('🔌 Creating socket connection...')
        const socket = io('http://localhost:3001', {
          transports: ['polling'],
          autoConnect: true,
          forceNew: true
        })
        
        socket.on('connect', () => {
          addLog(`✅ Connected! Socket ID: ${socket.id}`)
          setStatus('Connected')
          
          // Test join_space event
          socket.emit('join_space', {
            spaceId: 'test-space-123',
            userId: 'test-user-456',
            email: 'test@example.com',
            position: { x: 100, y: 100 }
          })
          addLog('📍 Sent join_space event')
        })
        
        socket.on('connect_error', (error) => {
          addLog(`❌ Connection error: ${error.message}`)
          setStatus('Connection Error')
        })
        
        socket.on('disconnect', (reason) => {
          addLog(`🔌 Disconnected: ${reason}`)
          setStatus('Disconnected')
        })
        
        socket.on('user_joined_space', (data) => {
          addLog(`👥 User joined: ${JSON.stringify(data)}`)
        })
        
        // Test connection
        addLog('🚀 Socket created, waiting for connection...')
        
        return () => {
          socket.close()
        }
      } catch (error) {
        addLog(`💥 Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setStatus('Error')
      }
    }
    
    testSocket()
  }, [])
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl">
      <h2 className="text-xl font-bold mb-4">🧪 Socket Connection Test</h2>
      <div className="mb-4">
        <span className="font-semibold">Status: </span>
        <span className={`px-2 py-1 rounded text-sm ${
          status === 'Connected' ? 'bg-green-100 text-green-800' : 
          status.includes('Error') ? 'bg-red-100 text-red-800' : 
          'bg-yellow-100 text-yellow-800'
        }`}>
          {status}
        </span>
      </div>
      
      <div className="bg-gray-100 p-4 rounded h-64 overflow-y-auto">
        <h3 className="font-semibold mb-2">Logs:</h3>
        {logs.map((log, i) => (
          <div key={i} className="text-sm font-mono mb-1">{log}</div>
        ))}
        {logs.length === 0 && (
          <div className="text-gray-500 text-sm">No logs yet...</div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>🎯 This should connect to backend and send a join_space event.</p>
        <p>📝 Check browser console for additional details.</p>
      </div>
    </div>
  )
}
