import { createClient } from '@/lib/supabase/client'

// Base API URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Types for Agora API responses
export interface AgoraTokenResponse {
  success: boolean
  token: string
  appId: string
  channelName: string
  uid: number
  role: string
  expiresAt: string
}

export interface AgoraConfigResponse {
  success: boolean
  appId: string
}

export interface GenerateTokenRequest {
  channelName: string
  uid?: number
  role?: 'publisher' | 'subscriber'
}

class AgoraApi {
  private async getAuthHeaders() {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      throw new Error('No authentication token available')
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    }
  }

  // Generate Agora RTC token
  async generateToken(data: GenerateTokenRequest): Promise<AgoraTokenResponse> {
    try {
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${API_BASE}/agora/token`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error generating Agora token:', error)
      throw error
    }
  }

  // Get Agora configuration (App ID)
  async getConfig(): Promise<AgoraConfigResponse> {
    try {
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${API_BASE}/agora/config`, {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching Agora config:', error)
      throw error
    }
  }
}

/**
 * Helper functions for Agora API integration
 */

// Fetches a token for joining an Agora channel
export const getAgoraToken = async (channelName: string, uid: string): Promise<string> => {
  try {
    const response = await fetch(`/api/agora/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channelName,
        uid
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to get token: ${response.status}`)
    }

    const data = await response.json()
    return data.token
  } catch (error) {
    console.error('Error fetching Agora token:', error)
    return ''
  }
}

export const agoraApi = {
  getToken: getAgoraToken
}
