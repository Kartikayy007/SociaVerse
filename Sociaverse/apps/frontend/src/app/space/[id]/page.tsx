'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Space } from '@/types/space';

export default function SpacePage() {
  const params = useParams();
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpaceDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/v1/spaces/${params.id}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setSpace(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch space');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchSpaceDetails();
    }
  }, [params.id]);

  if (loading) return <div>Loading space...</div>;
  if (error) return <div>{error}</div>;
  if (!space) return <div>Space not found</div>;

  return (
    <div className="min-h-screen bg-[#262626] text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{space.name}</h1>
          <p className="text-gray-400">{space.description}</p>
          <div className="mt-4 flex items-center gap-4">
            <div className="bg-white/10 px-4 py-2 rounded-full">
              {space.onlineMembers.length} online • {space.members.length} members
            </div>
            {space.ownerId === localStorage.getItem('userId') && (
              <div className="bg-green-600/20 text-green-500 px-4 py-2 rounded-full">
                Owner
              </div>
            )}
          </div>
        </header>
        
        <div className="bg-black/50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Members</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {space.members.map(member => (
              <div key={member._id} className="bg-white/5 rounded p-3">
                {member.username}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}