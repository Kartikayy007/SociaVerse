// API service for space management
import { createClient } from '@/lib/supabase/client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Space types based on backend schema
export interface Space {
  id: string
  name: string
  description?: string
  slug: string
  worldType: string
  theme?: string
  width: number
  height: number
  gridSize: number
  backgroundImageUrl?: string
  tilesetUrl?: string
  musicUrl?: string
  ambientSounds: Array<{
    name: string
    url: string
    volume: number
    loop: boolean
  }>
  isPublic: boolean
  maxUsers: number
  creatorId: string
  createdAt: string
  updatedAt: string
  lastActivityAt: string
  totalVisits: number
  currentUserCount: number
  creator?: {
    id: string
    email: string
  }
  userPositions?: Array<{
    id: string
    x: number
    y: number
    z?: number
    user: {
      id: string
      email: string
    }
  }>
}

export interface CreateSpaceData {
  name: string
  description?: string
  isPublic?: boolean
  password?: string
}

export interface UpdateSpaceData extends Partial<CreateSpaceData> {}

export interface SpaceListResponse {
  spaces: Space[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Get auth header with Supabase token
async function getAuthHeaders() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token && {
      'Authorization': `Bearer ${session.access_token}`
    })
  }
}

// Handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }
  return response.json()
}

export const spacesApi = {
  // GET /api/spaces - List all public spaces (with pagination)
  async getSpaces(params?: {
    page?: number
    limit?: number
    search?: string
    worldType?: string
    theme?: string
    isPublic?: boolean
    isFeatured?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<SpaceListResponse> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const url = `${API_BASE_URL}/spaces${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: await getAuthHeaders(),
    })
    
    return handleResponse<SpaceListResponse>(response)
  },

  // POST /api/spaces - Create a new space
  async createSpace(spaceData: CreateSpaceData): Promise<Space> {
    const response = await fetch(`${API_BASE_URL}/spaces`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(spaceData),
    })
    
    return handleResponse<Space>(response)
  },

  // GET /api/spaces/:id - Get specific space details
  async getSpace(id: string): Promise<Space> {
    const response = await fetch(`${API_BASE_URL}/spaces/${id}`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    })
    
    return handleResponse<Space>(response)
  },

  // PUT /api/spaces/:id - Update space (owner/admin only)
  async updateSpace(id: string, spaceData: UpdateSpaceData): Promise<Space> {
    const response = await fetch(`${API_BASE_URL}/spaces/${id}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(spaceData),
    })
    
    return handleResponse<Space>(response)
  },

  // DELETE /api/spaces/:id - Delete space (owner only)
  async deleteSpace(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/spaces/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    })
    
    return handleResponse<{ message: string }>(response)
  },
}
