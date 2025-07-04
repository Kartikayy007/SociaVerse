  'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SpaceCard } from '@/components/SpaceCard'
import { SpaceFormSimple } from '@/components/SpaceFormSimple'
import { SocketTest } from '@/components/SocketTest'
import { spacesApi, Space, SpaceListResponse } from '@/lib/api/spaces'
import { Plus, Search, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SpacesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  // State management
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSpace, setEditingSpace] = useState<Space | null>(null)
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    search: '',
    worldType: '',
    theme: '',
    isPublic: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Load spaces
  const loadSpaces = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.worldType && { worldType: filters.worldType }),
        ...(filters.theme && { theme: filters.theme }),
        ...(filters.isPublic !== '' && { isPublic: filters.isPublic === 'true' }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      }

      const response: SpaceListResponse = await spacesApi.getSpaces(params)
      setSpaces(response.spaces)
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load spaces')
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page, pagination.limit])

  // Load spaces on mount and when filters/pagination change
  useEffect(() => {
    if (user) {
      loadSpaces()
    }
  }, [user, loadSpaces])

  // Handle delete space
  const handleDeleteSpace = async (space: Space) => {
    if (!confirm(`Are you sure you want to delete "${space.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      await spacesApi.deleteSpace(space.id)
      loadSpaces() // Reload spaces list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete space')
    }
  }

  // Handle view space
  const handleViewSpace = (space: Space) => {
    router.push(`/spaces/${space.id}`)
  }

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Socket Test - Remove this after testing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <SocketTest />
      </div>

      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Spaces</h1>
              <p className="text-muted-foreground">Manage your virtual collaboration spaces</p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Space
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search spaces..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">World Type</label>
                <Select value={filters.worldType || 'all'} onValueChange={(value) => handleFilterChange('worldType', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="indoor">Indoor</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                    <SelectItem value="dungeon">Dungeon</SelectItem>
                    <SelectItem value="city">City</SelectItem>
                    <SelectItem value="forest">Forest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Theme</label>
                <Select value={filters.theme || 'all'} onValueChange={(value) => handleFilterChange('theme', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All themes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All themes</SelectItem>
                    <SelectItem value="medieval">Medieval</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="futuristic">Futuristic</SelectItem>
                    <SelectItem value="nature">Nature</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Visibility</label>
                <Select value={filters.isPublic || 'all'} onValueChange={(value) => handleFilterChange('isPublic', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All spaces" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All spaces</SelectItem>
                    <SelectItem value="true">Public only</SelectItem>
                    <SelectItem value="false">Private only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadSpaces}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
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
        ) : spaces.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No spaces found</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create your first space
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Spaces Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spaces.map((space) => (
                <SpaceCard
                  key={space.id}
                  space={space}
                  onEdit={(space) => {
                    setEditingSpace(space)
                    setIsEditDialogOpen(true)
                  }}
                  onDelete={handleDeleteSpace}
                  onView={handleViewSpace}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === pagination.page ? 'default' : 'outline'}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Space Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Space</DialogTitle>
          </DialogHeader>
          <SpaceFormSimple
            onSuccess={() => {
              setIsCreateDialogOpen(false)
              loadSpaces()
            }}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Space Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Space</DialogTitle>
          </DialogHeader>
          {editingSpace && (
            <SpaceFormSimple
              space={editingSpace}
              onSuccess={() => {
                setIsEditDialogOpen(false)
                setEditingSpace(null)
                loadSpaces()
              }}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setEditingSpace(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
