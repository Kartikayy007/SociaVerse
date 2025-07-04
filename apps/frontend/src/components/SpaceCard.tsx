'use client'

import { Space } from '@/lib/api/spaces'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Users, Edit, Trash2, Eye } from 'lucide-react'

interface SpaceCardProps {
  space: Space
  onEdit?: (space: Space) => void
  onDelete?: (space: Space) => void
  onView?: (space: Space) => void
}

const worldTypeColors = {
  indoor: 'bg-blue-100 text-blue-800',
  outdoor: 'bg-green-100 text-green-800',
  dungeon: 'bg-gray-100 text-gray-800',
  city: 'bg-purple-100 text-purple-800',
  forest: 'bg-emerald-100 text-emerald-800',
}

const themeColors = {
  medieval: 'bg-amber-100 text-amber-800',
  modern: 'bg-slate-100 text-slate-800',
  futuristic: 'bg-cyan-100 text-cyan-800',
  nature: 'bg-lime-100 text-lime-800',
}

export function SpaceCard({ space, onEdit, onDelete, onView }: SpaceCardProps) {
  const { user } = useAuth()
  const isOwner = user?.id === space.creatorId

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{space.name}</CardTitle>
            <CardDescription className="mt-1">
              {space.description || 'No description provided'}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-1">
            <Badge 
              variant="secondary" 
              className={worldTypeColors[space.worldType]}
            >
              {space.worldType}
            </Badge>
            {space.theme && (
              <Badge 
                variant="outline" 
                className={themeColors[space.theme]}
              >
                {space.theme}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Space Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{space.currentUserCount}/{space.maxUsers}</span>
            </div>
            <div>
              {space.width} x {space.height}
            </div>
            <div>
              {space.totalVisits} visits
            </div>
          </div>

          {/* Creator Info */}
          <div className="text-sm text-muted-foreground">
            Created by {space.creator?.email || 'Unknown'}
          </div>

          {/* Status Badges */}
          <div className="flex gap-2">
            <Badge variant={space.isPublic ? 'default' : 'secondary'}>
              {space.isPublic ? 'Public' : 'Private'}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => onView?.(space)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              Enter Space
            </Button>
            
            {isOwner && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit?.(space)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => onDelete?.(space)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
