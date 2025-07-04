'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { spacesApi, type CreateSpaceData, type UpdateSpaceData, type Space } from '@/lib/api/spaces'

interface SpaceFormSimpleProps {
  space?: Space
  onSuccess: () => void
  onCancel: () => void
}

export function SpaceFormSimple({ space, onSuccess, onCancel }: SpaceFormSimpleProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateSpaceData>({
    name: '',
    description: '',
    isPublic: true,
    password: ''
  })

  useEffect(() => {
    if (space) {
      setFormData({
        name: space.name,
        description: space.description || '',
        isPublic: space.isPublic,
        password: '' // Don't populate password for security
      })
    }
  }, [space])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Remove empty password
      const submitData = { ...formData }
      if (!submitData.password?.trim()) {
        delete submitData.password
      }

      if (space) {
        await spacesApi.updateSpace(space.id, submitData as UpdateSpaceData)
      } else {
        await spacesApi.createSpace(submitData)
      }
      onSuccess()
    } catch (error) {
      console.error('Failed to save space:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Space Name */}
      <div>
        <Label htmlFor="name">Space Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter space name"
          required
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your space..."
          rows={3}
        />
      </div>

      {/* Public/Private */}
      <div className="flex items-center space-x-2">
        <Switch
          id="isPublic"
          checked={formData.isPublic}
          onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
        />
        <Label htmlFor="isPublic">
          {formData.isPublic ? 'Public space' : 'Private space'}
        </Label>
      </div>

      {/* Password (only for private spaces) */}
      {!formData.isPublic && (
        <div>
          <Label htmlFor="password">Password (optional)</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Set a password for this space"
          />
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : space ? 'Update Space' : 'Create Space'}
        </Button>
      </div>
    </form>
  )
}
