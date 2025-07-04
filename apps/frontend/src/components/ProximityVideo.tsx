'use client'

import { useState, useEffect, useRef } from 'react'
import { agoraApi } from '@/lib/api/agora'

interface ProximityVideoProps {
  channelName: string
  userId: string
  isActive: boolean
  onConnectionChange?: (connected: boolean) => void
}

export function ProximityVideo({ channelName, userId, isActive, onConnectionChange }: ProximityVideoProps) {
  const [client, setClient] = useState<any>(null)
  const [localVideoTrack, setLocalVideoTrack] = useState<any>(null)
  const [localAudioTrack, setLocalAudioTrack] = useState<any>(null)
  const [remoteUsers, setRemoteUsers] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [agoraLoaded, setAgoraLoaded] = useState(false)
  const [token, setToken] = useState<string>('')
  const [isTokenLoading, setIsTokenLoading] = useState(false)
  
  const localVideoRef = useRef<HTMLDivElement>(null)
  const remoteVideoRef = useRef<HTMLDivElement>(null)

  // Agora App ID - You need to get this from agora.io dashboard
  const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || 'test-app-id'

  // Initialize Agora client on client-side only
  useEffect(() => {
    const initAgoraClient = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const AgoraRTC = await import('agora-rtc-sdk-ng')
        const agoraClient = AgoraRTC.default.createClient({ mode: 'rtc', codec: 'vp8' })
        setClient(agoraClient)
        setAgoraLoaded(true)
      } catch (error) {
        console.error('Failed to load Agora SDK:', error)
      }
    }

    initAgoraClient()
  }, [])

  // Fetch token when channel name changes
  useEffect(() => {
    if (!channelName || !isActive || !agoraLoaded) return
    
    const fetchToken = async () => {
      try {
        setIsTokenLoading(true)
        // For demo purposes, we're using a dummy token
        // In production, fetch a real token from your backend
        const dummyToken = 'demo-mode-token'
        setToken(dummyToken)
      } catch (error) {
        console.error('Failed to fetch token:', error)
      } finally {
        setIsTokenLoading(false)
      }
    }
    
    fetchToken()
  }, [channelName, isActive, agoraLoaded])

  useEffect(() => {
    if (!agoraLoaded || !client || isTokenLoading) return

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
  }, [isActive, channelName, token, agoraLoaded, client, isTokenLoading])

  const joinChannel = async () => {
    if (!client) return

    try {
      // Check if we have a valid App ID
      if (!APP_ID || APP_ID === 'test-app-id' || APP_ID === 'your-agora-app-id-here') {
        console.warn('⚠️ No valid Agora App ID found. Video call will be simulated.')
        setIsConnected(true)
        onConnectionChange?.(true)
        return
      }

      // Dynamic import for tracks
      const AgoraRTC = await import('agora-rtc-sdk-ng')
      
      try {
        // Create local tracks
        const [videoTrack, audioTrack] = await AgoraRTC.default.createMicrophoneAndCameraTracks()
        setLocalVideoTrack(videoTrack)
        setLocalAudioTrack(audioTrack)

        // In demo mode, use null as token
        // In production, use a real token from your backend
        console.log(`Joining channel ${channelName} with ${token ? 'token' : 'null token'}`);
        await client.join(APP_ID, channelName, token || null, userId)
        
        // Publish local tracks
        await client.publish([videoTrack, audioTrack])
        
        // Play local video
        if (localVideoRef.current) {
          videoTrack.play(localVideoRef.current)
        }

        setIsConnected(true)
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

          setRemoteUsers(prev => [...prev.filter((u: any) => u.uid !== user.uid), user])
        })

        client.on('user-unpublished', (user: any) => {
          setRemoteUsers(prev => prev.filter((u: any) => u.uid !== user.uid))
        })
      } catch (error) {
        console.error('Error during join:', error)
        // If token error, we could try to refresh the token here
      }
    } catch (error) {
      console.error('Failed to create tracks:', error)
    }
  }

  const leaveChannel = async () => {
    if (!client) return

    try {
      // Check if we're in demo mode
      if (!APP_ID || APP_ID === 'test-app-id' || APP_ID === 'your-agora-app-id-here') {
        setIsConnected(false)
        onConnectionChange?.(false)
        return
      }

      // Stop local tracks
      localVideoTrack?.close()
      localAudioTrack?.close()
      
      // Leave channel
      await client.leave()
      
      setLocalVideoTrack(null)
      setLocalAudioTrack(null)
      setRemoteUsers([])
      setIsConnected(false)
      onConnectionChange?.(false)
    } catch (error) {
      console.error('Failed to leave channel:', error)
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
                {!agoraLoaded ? 'Loading...' : 
                 isTokenLoading ? 'Getting token...' :
                 (!APP_ID || APP_ID === 'test-app-id') ? '(Demo Mode)' : 'Ready'}
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
                {!agoraLoaded ? 'Loading...' : 
                 (!APP_ID || APP_ID === 'test-app-id') ? '(Demo Mode)' : 'Waiting...'}
              </div>
            )}
          </div>
          <div className="absolute bottom-1 left-1 text-xs bg-black bg-opacity-50 text-white px-1 rounded">
            Other
          </div>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-600">
        {!agoraLoaded ? '🟡 Loading Agora...' : 
         isTokenLoading ? '🟡 Getting token...' :
         isConnected ? '🟢 Connected' : '🔴 Connecting...'}
      </div>
    </div>
  )
}
