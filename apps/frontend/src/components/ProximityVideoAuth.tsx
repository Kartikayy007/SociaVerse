'use client'

import { useState, useEffect, useRef } from 'react'
import { agoraApi } from '@/lib/api/agora'

interface ProximityVideoProps {
  channelName: string
  userId: string
  isActive: boolean
  onConnectionChange?: (connected: boolean) => void
}

interface RemoteUser {
  uid: string | number
  videoTrack?: any
  audioTrack?: any
}

export function ProximityVideo({ channelName, userId, isActive, onConnectionChange }: ProximityVideoProps) {
  const [client, setClient] = useState<any>(null)
  const [localVideoTrack, setLocalVideoTrack] = useState<any>(null)
  const [localAudioTrack, setLocalAudioTrack] = useState<any>(null)
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [agoraLoaded, setAgoraLoaded] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string>('Initializing...')
  
  const localVideoRef = useRef<HTMLDivElement>(null)
  const remoteVideoRef = useRef<HTMLDivElement>(null)

  // Initialize Agora client on client-side only
  useEffect(() => {
    const initAgoraClient = async () => {
      try {
        setConnectionStatus('Loading Agora SDK...')
        // Dynamic import to avoid SSR issues
        const AgoraRTC = await import('agora-rtc-sdk-ng')
        const agoraClient = AgoraRTC.default.createClient({ mode: 'rtc', codec: 'vp8' })
        setClient(agoraClient)
        setAgoraLoaded(true)
        setConnectionStatus('Ready to connect')
      } catch (error) {
        console.error('Failed to load Agora SDK:', error)
        setConnectionStatus('Failed to load SDK')
      }
    }

    initAgoraClient()
  }, [])

  useEffect(() => {
    if (!agoraLoaded || !client) return

    if (!isActive) {
      // Cleanup when not active
      if (isConnected) {
        leaveChannel()
      }
      return
    }

    joinChannel()

    return () => {
      leaveChannel()
    }
  }, [isActive, channelName, agoraLoaded, client])

  const joinChannel = async () => {
    if (!client) return

    try {
      setConnectionStatus('Getting token...')
      
      // Get Agora configuration and token from backend
      const config = await agoraApi.getConfig()
      const tokenData = await agoraApi.generateToken({
        channelName,
        uid: parseInt(userId) || 0,
        role: 'publisher'
      })

      setConnectionStatus('Creating media tracks...')
      
      // Dynamic import for tracks
      const AgoraRTC = await import('agora-rtc-sdk-ng')
      
      // Create local tracks
      const [videoTrack, audioTrack] = await AgoraRTC.default.createMicrophoneAndCameraTracks()
      setLocalVideoTrack(videoTrack)
      setLocalAudioTrack(audioTrack)

      setConnectionStatus('Joining channel...')

      // Join channel with token
      await client.join(config.appId, channelName, tokenData.token, tokenData.uid)
      
      setConnectionStatus('Publishing tracks...')
      
      // Publish local tracks
      await client.publish([videoTrack, audioTrack])
      
      // Play local video
      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current)
      }

      setIsConnected(true)
      setConnectionStatus('Connected')
      onConnectionChange?.(true)

      // Handle remote users
      client.on('user-published', async (user: any, mediaType: string) => {
        await client.subscribe(user, mediaType)
        
        if (mediaType === 'video' && remoteVideoRef.current) {
          user.videoTrack?.play(remoteVideoRef.current)
        }
        
        if (mediaType === 'audio') {
          user.audioTrack?.play()
        }

        setRemoteUsers(prev => [...prev.filter((u: RemoteUser) => u.uid !== user.uid), user])
      })

      client.on('user-unpublished', (user: any) => {
        setRemoteUsers(prev => prev.filter((u: RemoteUser) => u.uid !== user.uid))
      })

      client.on('user-left', (user: any) => {
        setRemoteUsers(prev => prev.filter((u: RemoteUser) => u.uid !== user.uid))
      })

    } catch (error) {
      console.error('Failed to join channel:', error)
      setConnectionStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      // Fallback to demo mode on error
      console.warn('⚠️ Falling back to demo mode due to error')
      setIsConnected(true)
      setConnectionStatus('Demo Mode (No real video)')
      onConnectionChange?.(true)
    }
  }

  const leaveChannel = async () => {
    if (!client) return

    try {
      setConnectionStatus('Disconnecting...')
      
      // Stop local tracks
      localVideoTrack?.close()
      localAudioTrack?.close()
      
      // Leave channel
      await client.leave()
      
      setLocalVideoTrack(null)
      setLocalAudioTrack(null)
      setRemoteUsers([])
      setIsConnected(false)
      setConnectionStatus('Disconnected')
      onConnectionChange?.(false)
    } catch (error) {
      console.error('Failed to leave channel:', error)
      setConnectionStatus('Error disconnecting')
    }
  }

  if (!isActive) return null

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg">
      <h3 className="text-sm font-semibold mb-2">📹 Proximity Call</h3>
      
      <div className="flex gap-2">
        {/* Local Video */}
        <div className="relative">
          <div 
            ref={localVideoRef} 
            className="w-32 h-24 bg-gray-200 rounded border flex items-center justify-center"
          >
            {!localVideoTrack && (
              <div className="text-xs text-gray-500 text-center">
                📹<br/>Your Video<br/>
                {connectionStatus.includes('Demo') ? '(Demo)' : 'Loading...'}
              </div>
            )}
          </div>
          <div className="absolute bottom-1 left-1 text-xs bg-black bg-opacity-50 text-white px-1 rounded">
            You
          </div>
        </div>

        {/* Remote Video */}
        <div className="relative">
          <div 
            ref={remoteVideoRef} 
            className="w-32 h-24 bg-gray-200 rounded border flex items-center justify-center"
          >
            {remoteUsers.length === 0 && (
              <div className="text-xs text-gray-500 text-center">
                📹<br/>Other User<br/>
                {connectionStatus.includes('Demo') ? '(Demo)' : 'Waiting...'}
              </div>
            )}
          </div>
          <div className="absolute bottom-1 left-1 text-xs bg-black bg-opacity-50 text-white px-1 rounded">
            Other
          </div>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-600">
        {!agoraLoaded ? '🟡 Loading...' : 
         connectionStatus.includes('Error') ? '🔴 Error' :
         connectionStatus.includes('Demo') ? '🟡 Demo Mode' :
         isConnected ? '🟢 Connected' : '🔴 Connecting...'}
      </div>
      
      <div className="mt-1 text-xs text-gray-500">
        {connectionStatus}
      </div>
    </div>
  )
}
