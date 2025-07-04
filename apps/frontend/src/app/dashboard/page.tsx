'use client'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SpaceForm } from '@/components/SpaceForm'
import { SpaceCard } from '@/components/SpaceCard'
import { spacesApi, Space, CreateSpaceData } from '@/lib/api/spaces'
import { useRouter } from 'next/navigation'
import { Plus, ArrowRight, Users, Globe } from 'lucide-react'

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()
  
  // State for spaces
  const [recentSpaces, setRecentSpaces] = useState<Space[]>([])
  const [loadingSpaces, setLoadingSpaces] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  // Load recent spaces
  const loadRecentSpaces = async () => {
    if (!user) {
      console.log('No user, skipping spaces load')
      return
    }
    
    try {
      setLoadingSpaces(true)
      console.log('Loading spaces for user:', user.email)
      const response = await spacesApi.getSpaces({ 
        limit: 6, 
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      })
      setRecentSpaces(response.spaces)
      console.log('Loaded spaces:', response.spaces.length)
    } catch (error) {
      console.error('Failed to load recent spaces:', error)
    } finally {
      setLoadingSpaces(false)
    }
  }

  // Load spaces on mount
  useEffect(() => {
    if (user) {
      loadRecentSpaces()
    }
  }, [user]) // loadRecentSpaces is stable enough for this use case

  // Handle create space
  const handleCreateSpace = async (spaceData: CreateSpaceData) => {
    try {
      setSubmitting(true)
      await spacesApi.createSpace(spaceData)
      setIsCreateDialogOpen(false)
      loadRecentSpaces() // Reload recent spaces
    } catch (err) {
      throw err // Let the form handle the error
    } finally {
      setSubmitting(false)
    }
  }

  // Handle view space
  const handleViewSpace = (space: Space) => {
    // TODO: Navigate to space view page
    console.log('Viewing space:', space.id)
    alert(`Entering space "${space.name}" - Space view not implemented yet`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">SociaVerse</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user.email}
              </span>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Welcome to SociaVerse!</CardTitle>
                <CardDescription>
                  Your collaborative virtual space platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Start creating and customizing your virtual spaces, invite friends for video calls, 
                  and collaborate on whiteboards.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/spaces')}
                  className="w-full"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Browse All Spaces
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create Space</CardTitle>
                <CardDescription>
                  Set up a new virtual collaboration space
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Space
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>
                  Your activity overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Spaces:</span>
                    <span className="text-sm font-medium">{recentSpaces.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Active Users:</span>
                    <span className="text-sm font-medium">
                      {recentSpaces.reduce((acc, space) => acc + space.currentUserCount, 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Spaces Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Recent Spaces</h2>
                <p className="text-muted-foreground">Your recently updated spaces</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => router.push('/spaces')}
              >
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {loadingSpaces ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : recentSpaces.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No spaces yet</p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first space
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentSpaces.map((space) => (
                  <SpaceCard
                    key={space.id}
                    space={space}
                    onView={handleViewSpace}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Account Information */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Email:</span> {user.email}
                </div>
                <div>
                  <span className="font-medium">User ID:</span> {user.id}
                </div>
                <div>
                  <span className="font-medium">Account Created:</span>{' '}
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Create Space Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Space</DialogTitle>
          </DialogHeader>
          <SpaceForm
            onSubmit={handleCreateSpace}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={submitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
