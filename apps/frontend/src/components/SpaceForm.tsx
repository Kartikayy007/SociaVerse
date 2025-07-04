'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreateSpaceData, Space } from '@/lib/api/spaces'

interface SpaceFormProps {
  space?: Space // For editing
  onSubmit: (data: CreateSpaceData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const worldTypes = [
  { value: 'indoor', label: 'Indoor' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'dungeon', label: 'Dungeon' },
  { value: 'city', label: 'City' },
  { value: 'forest', label: 'Forest' },
] as const

const themes = [
  { value: 'medieval', label: 'Medieval' },
  { value: 'modern', label: 'Modern' },
  { value: 'futuristic', label: 'Futuristic' },
  { value: 'nature', label: 'Nature' },
] as const

export function SpaceForm({ space, onSubmit, onCancel, isLoading }: SpaceFormProps) {
  const [formData, setFormData] = useState<CreateSpaceData>({
    name: space?.name || '',
    description: space?.description || '',
    slug: space?.slug || '',
    worldType: space?.worldType || 'indoor',
    theme: space?.theme || undefined,
    width: space?.width || 1000,
    height: space?.height || 1000,
    gridSize: space?.gridSize || 32,
    backgroundImageUrl: space?.backgroundImageUrl || '',
    tilesetUrl: space?.tilesetUrl || '',
    musicUrl: space?.musicUrl || '',
    isPublic: space?.isPublic ?? true,
    maxUsers: space?.maxUsers || 50,
    password: '',
    ambientSounds: space?.ambientSounds || [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens'
    }

    if (formData.width < 100 || formData.width > 5000) {
      newErrors.width = 'Width must be between 100 and 5000'
    }

    if (formData.height < 100 || formData.height > 5000) {
      newErrors.height = 'Height must be between 100 and 5000'
    }

    if (formData.maxUsers < 1 || formData.maxUsers > 100) {
      newErrors.maxUsers = 'Max users must be between 1 and 100'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Failed to submit form:', error)
    }
  }

  const updateFormData = (field: keyof CreateSpaceData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateFormData('name', e.target.value)}
            placeholder="My Awesome Space"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => updateFormData('slug', e.target.value.toLowerCase())}
            placeholder="my-awesome-space"
            className={errors.slug ? 'border-red-500' : ''}
          />
          {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          placeholder="Describe your space..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* World Type */}
        <div className="space-y-2">
          <Label>World Type *</Label>
          <Select 
            value={formData.worldType} 
            onValueChange={(value) => updateFormData('worldType', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {worldTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Theme */}
        <div className="space-y-2">
          <Label>Theme</Label>
          <Select 
            value={formData.theme || 'none'} 
            onValueChange={(value) => updateFormData('theme', value === 'none' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Theme</SelectItem>
              {themes.map((theme) => (
                <SelectItem key={theme.value} value={theme.value}>
                  {theme.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Width */}
        <div className="space-y-2">
          <Label htmlFor="width">Width *</Label>
          <Input
            id="width"
            type="number"
            min="100"
            max="5000"
            value={formData.width}
            onChange={(e) => updateFormData('width', parseInt(e.target.value) || 1000)}
            className={errors.width ? 'border-red-500' : ''}
          />
          {errors.width && <p className="text-sm text-red-500">{errors.width}</p>}
        </div>

        {/* Height */}
        <div className="space-y-2">
          <Label htmlFor="height">Height *</Label>
          <Input
            id="height"
            type="number"
            min="100"
            max="5000"
            value={formData.height}
            onChange={(e) => updateFormData('height', parseInt(e.target.value) || 1000)}
            className={errors.height ? 'border-red-500' : ''}
          />
          {errors.height && <p className="text-sm text-red-500">{errors.height}</p>}
        </div>

        {/* Max Users */}
        <div className="space-y-2">
          <Label htmlFor="maxUsers">Max Users *</Label>
          <Input
            id="maxUsers"
            type="number"
            min="1"
            max="100"
            value={formData.maxUsers}
            onChange={(e) => updateFormData('maxUsers', parseInt(e.target.value) || 50)}
            className={errors.maxUsers ? 'border-red-500' : ''}
          />
          {errors.maxUsers && <p className="text-sm text-red-500">{errors.maxUsers}</p>}
        </div>
      </div>

      {/* URLs */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="backgroundImageUrl">Background Image URL</Label>
          <Input
            id="backgroundImageUrl"
            type="url"
            value={formData.backgroundImageUrl}
            onChange={(e) => updateFormData('backgroundImageUrl', e.target.value)}
            placeholder="https://example.com/background.jpg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tilesetUrl">Tileset URL</Label>
          <Input
            id="tilesetUrl"
            type="url"
            value={formData.tilesetUrl}
            onChange={(e) => updateFormData('tilesetUrl', e.target.value)}
            placeholder="https://example.com/tileset.png"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="musicUrl">Music URL</Label>
          <Input
            id="musicUrl"
            type="url"
            value={formData.musicUrl}
            onChange={(e) => updateFormData('musicUrl', e.target.value)}
            placeholder="https://example.com/music.mp3"
          />
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) => updateFormData('isPublic', e.target.checked)}
            className="rounded border-gray-300"
          />
          <Label htmlFor="isPublic" className="cursor-pointer">
            Make this space public
          </Label>
        </div>

        {!formData.isPublic && (
          <div className="space-y-2">
            <Label htmlFor="password">Password (optional)</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => updateFormData('password', e.target.value)}
              placeholder="Enter password for private space"
            />
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Saving...' : space ? 'Update Space' : 'Create Space'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
