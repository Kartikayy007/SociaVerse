'use client'

import { SpaceViewerSimple } from '@/components/SpaceViewerSimple'

export default function SocketTestPage() {
  // Mock data for testing
  const testSpace = {
    id: 'test-space-123',
    name: 'Socket Test Space'
  }
  
  const testUser = {
    id: 'test-user-456',
    email: 'test@example.com'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">🧪 Socket Connection Test</h1>
        <SpaceViewerSimple space={testSpace} user={testUser} />
      </div>
    </div>
  )
}
