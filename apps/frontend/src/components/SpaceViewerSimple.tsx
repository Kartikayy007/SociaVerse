'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ProximityVideo } from './ProximityVideo'

interface User {
  id: string
  email: string
}

interface Space {
  id: string
  name: string
}

interface SpaceViewerSimpleProps {
  space: Space
  user: User 
}

interface UserPosition {
  userId: string
  email: string
  x: number
  y: number
}

export function SpaceViewerSimple({ space, user }: SpaceViewerSimpleProps) {
  const [socket, setSocket] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  const [connected, setConnected] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [otherUsers, setOtherUsers] = useState<UserPosition[]>([])
  const [inProximity, setInProximity] = useState<string[]>([]) // Users we're close to
  const [videoCallActive, setVideoCallActive] = useState(false)
  const [videoChannelName, setVideoChannelName] = useState<string>('')
  const keysRef = useRef<Set<string>>(new Set())
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Grid dimensions
  const gridWidth = 800
  const gridHeight = 600
  const gridSize = 50

  const addLog = useCallback((message: string) => {
    console.log(message)
    setLogs(prev => [...prev.slice(-10), `${new Date().toLocaleTimeString()}: ${message}`])
  }, [])

  // Draw the grid and players
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw grid
    ctx.strokeStyle = '#ddd'
    ctx.lineWidth = 1
    
    // Vertical lines
    for (let x = 0; x <= gridWidth; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, gridHeight)
      ctx.stroke()
    }
    
    // Horizontal lines
    for (let y = 0; y <= gridHeight; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(gridWidth, y)
      ctx.stroke()
    }
    
    // Draw current player (blue)
    ctx.fillStyle = '#3498db'
    ctx.beginPath()
    ctx.arc(position.x, position.y, 10, 0, Math.PI * 2)
    ctx.fill()
    
    // Draw proximity circle if in call
    if (videoCallActive) {
      ctx.strokeStyle = '#3498db'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.arc(position.x, position.y, 100, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
    }
    
    // Draw label for current player
    ctx.fillStyle = '#333'
    ctx.font = '12px Arial'
    ctx.fillText('You', position.x + 15, position.y + 5)
    
    // Draw other players (red)
    otherUsers.forEach(otherUser => {
      if (otherUser.userId === user.id) return // Skip self
      
      // Check if user is in proximity
      const distance = Math.sqrt(
        Math.pow(position.x - otherUser.x, 2) + 
        Math.pow(position.y - otherUser.y, 2)
      )
      const isInProximity = distance < 100
      
      ctx.fillStyle = isInProximity ? '#27ae60' : '#e74c3c' // Green if close, red if far
      ctx.beginPath()
      ctx.arc(otherUser.x, otherUser.y, 10, 0, Math.PI * 2)
      ctx.fill()
      
      // Draw label
      ctx.fillStyle = '#333'
      ctx.font = '12px Arial'
      const displayName = otherUser.email?.split('@')[0] || 'User'
      ctx.fillText(displayName, otherUser.x + 15, otherUser.y + 5)
    })
  }, [position, otherUsers, user.id, gridWidth, gridHeight, gridSize, videoCallActive])

  // Proximity detection
  const checkProximity = useCallback(() => {
    const PROXIMITY_THRESHOLD = 100 // pixels
    const usersInRange = otherUsers.filter(otherUser => {
      const distance = Math.sqrt(
        Math.pow(position.x - otherUser.x, 2) + 
        Math.pow(position.y - otherUser.y, 2)
      )
      return distance < PROXIMITY_THRESHOLD
    })

    const wasInCall = videoCallActive
    const shouldBeInCall = usersInRange.length > 0

    if (shouldBeInCall && !wasInCall) {
      // Start video call
      const channelName = `proximity_${space.id}_${Date.now()}`
      setVideoChannelName(channelName)
      setVideoCallActive(true)
      setInProximity(usersInRange.map(u => u.userId))
      addLog(`📹 Starting video call with ${usersInRange.length} user(s)`)
    } else if (!shouldBeInCall && wasInCall) {
      // End video call
      setVideoCallActive(false)
      setVideoChannelName('')
      setInProximity([])
      addLog(`📹 Ending video call`)
    }
  }, [position, otherUsers, videoCallActive, space.id, addLog])
  
  // Redraw canvas when position changes
  useEffect(() => {
    drawCanvas()
    checkProximity() // Check proximity on every position change
  }, [position, otherUsers, drawCanvas, checkProximity])

  // Socket connection - exact same pattern as SimpleSocketTest
  useEffect(() => {
    const initSocket = async () => {
      try {
        addLog('📦 Importing socket.io-client...')
        const { io } = await import('socket.io-client')
        
        addLog('🔌 Creating socket connection...')
        const newSocket = io('http://localhost:3001', {
          transports: ['websocket'],
          autoConnect: true,
          forceNew: true
        })
        
        newSocket.on('connect', () => {
          addLog(`✅ Connected! Socket ID: ${newSocket.id}`)
          setConnected(true)
          
          // Join the space room
          addLog(`📍 Joining space: ${space.id}`)
          newSocket.emit('join_space', {
            spaceId: space.id,
            userId: user.id,
            email: user.email,
            position: position
          })
          addLog('📍 Sent join_space event')
        })
        
        newSocket.on('connect_error', (error) => {
          addLog(`❌ Connection error: ${error.message}`)
          setConnected(false)
        })
        
        newSocket.on('disconnect', (reason) => {
          addLog(`🔌 Disconnected: ${reason}`)
          setConnected(false)
        })
        
        newSocket.on('user_joined_space', (data) => {
          addLog(`👥 User joined: ${JSON.stringify(data)}`)
          // Add user to otherUsers state
          setOtherUsers(prev => [
            ...prev.filter(u => u.userId !== data.userId), 
            {
              userId: data.userId,
              email: data.email,
              x: data.x || 100,
              y: data.y || 100
            }
          ])
        })
        
        newSocket.on('user_left_space', (data) => {
          addLog(`👋 User left: ${JSON.stringify(data)}`)
          // Remove user from otherUsers state
          setOtherUsers(prev => prev.filter(u => u.userId !== data.userId))
        })
        
        newSocket.on('position_broadcast', (data) => {
          addLog(`📍 Position update: ${JSON.stringify(data)}`)
          // Update user position in otherUsers state
          setOtherUsers(prev => [
            ...prev.filter(u => u.userId !== data.userId),
            {
              userId: data.userId,
              email: data.email,
              x: data.x,
              y: data.y
            }
          ])
        })
        
        setSocket(newSocket)
        addLog('🚀 Socket setup complete, waiting for connection...')
        
        return () => {
          newSocket.close()
        }
      } catch (error) {
        addLog(`💥 Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    initSocket()
  }, []) // Empty deps to avoid recreation

  // Move player with WASD/arrow keys
  const movePlayer = useCallback((dx: number, dy: number) => {
    setPosition(prev => {
      const newX = Math.max(0, Math.min(gridWidth, prev.x + dx))
      const newY = Math.max(0, Math.min(gridHeight, prev.y + dy))
      
      const newPosition = { x: newX, y: newY }
      
      if (socket && connected) {
        socket.emit('position_update', {
          spaceId: space.id,
          userId: user.id,
          email: user.email,
          ...newPosition
        })
      }
      
      return newPosition
    })
  }, [socket, connected, space.id, user.id, user.email, gridWidth, gridHeight])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase())
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase())
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    const moveInterval = setInterval(() => {
      const keys = keysRef.current
      let dx = 0
      let dy = 0

      if (keys.has('w') || keys.has('arrowup')) dy -= 5
      if (keys.has('s') || keys.has('arrowdown')) dy += 5
      if (keys.has('a') || keys.has('arrowleft')) dx -= 5
      if (keys.has('d') || keys.has('arrowright')) dx += 5

      if (dx !== 0 || dy !== 0) {
        movePlayer(dx, dy)
      }
    }, 50)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      clearInterval(moveInterval)
    }
  }, [movePlayer])

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl">
      <h2 className="text-xl font-bold mb-4">🎮 Space: {space.name}</h2>
      
      {/* Connection Status */}
      <div className="mb-4">
        <span className="font-semibold">Status: </span>
        <span className={`px-2 py-1 rounded text-sm ${
          connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {connected ? '🟢 Connected' : '🔴 Disconnected'}
        </span>
        <span className="ml-4 text-sm">
          Users online: {otherUsers.length + 1}
        </span>
      </div>
      
      {/* Grid Canvas */}
      <div className="mb-4 border border-gray-300">
        <canvas 
          ref={canvasRef}
          width={gridWidth}
          height={gridHeight}
          className="bg-white"
        />
      </div>

      {/* Movement Controls */}
      <div className="mb-4 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Movement Controls</h3>
        <div className="text-sm text-gray-600 mb-2">
          Use <span className="font-mono bg-gray-200 px-1">WASD</span> or arrow keys to move
        </div>
        <div className="text-sm text-gray-600">
          Position: x={Math.round(position.x)}, y={Math.round(position.y)}
        </div>
      </div>
      
      {/* Logs */}
      <div className="bg-gray-100 p-4 rounded h-40 overflow-y-auto">
        <h3 className="font-semibold mb-2">Socket Logs:</h3>
        {logs.map((log, i) => (
          <div key={i} className="text-sm font-mono mb-1">{log}</div>
        ))}
        {logs.length === 0 && (
          <div className="text-gray-500 text-sm">No logs yet...</div>
        )}
      </div>

      {/* Proximity Video Call */}
      <ProximityVideo
        channelName={videoChannelName}
        userId={user.id}
        isActive={videoCallActive}
        onConnectionChange={(connected) => {
          addLog(connected ? '📹 Video call connected' : '📹 Video call disconnected')
        }}
      />
    </div>
  )
}
