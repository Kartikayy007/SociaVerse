'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { spacesApi, Space } from '@/lib/api/spaces'
import { SpaceViewerSimple } from '@/components/SpaceViewerSimple'
// import { SpaceViewer } from '@/components/SpaceViewer'
// import { SpaceViewerTest } from '@/components/SpaceViewerTest'

export default function SpacePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [space, setSpace] = useState<Space | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !user) return

    const loadSpace = async () => {
      try {
        setLoading(true)
        const spaceData = await spacesApi.getSpace(id as string)
        setSpace(spaceData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load space')
      } finally {
        setLoading(false)
      }
    } 

    loadSpace()
  }, [id, user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading space...</div>
      </div>
    )
  }

  if (error || !space) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error || 'Space not found'}</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Please log in to view this space</div>
      </div>
    )
  }

  return <SpaceViewerSimple space={space} user={user} />


}
