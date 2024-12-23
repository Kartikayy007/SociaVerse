"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import SpaceCard from '../../components/SpaceCard';
import CreateSpaceModal from '../../components/CreateSpaceModal';
import type { Space } from '../../types/space';

const Page = () => {
  const [filter, setFilter] = useState<'lastVisited' | 'mySpaces'>('lastVisited');
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSpaces = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/v1/spaces', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSpaces(response.data.data);
    } catch (err) {
      setError('Failed to fetch spaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const filteredSpaces = filter === 'mySpaces' 
    ? spaces.filter(space => space.isOwner)
    : spaces.sort((a, b) => new Date(b.lastVisited).getTime() - new Date(a.lastVisited).getTime());

  if (loading) return (
    <div className="min-h-screen bg-[#262626] flex items-center justify-center">
      <div className="text-white text-xl">Loading spaces...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#262626] flex items-center justify-center">
      <div className="text-red-500 text-xl">{error}</div>
    </div>
  );

  return (
    <section className='bg-[#262626] min-h-screen relative'>
      <div className='relative z-10'>
        <Navbar />
        <main className='container mx-auto px-4 pt-32'>
          <div className='flex items-center justify-between mb-8'>
            <div className='flex space-x-4'>
              <button 
                className={`px-6 py-2 rounded-full transition-colors ${
                  filter === 'lastVisited' 
                    ? 'bg-black text-white' 
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
                onClick={() => setFilter('lastVisited')}
              >
                Last Visited
              </button>
              <button 
                className={`px-6 py-2 rounded-full transition-colors ${
                  filter === 'mySpaces' 
                    ? 'bg-black text-white' 
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
                onClick={() => setFilter('mySpaces')}
              >
                My Spaces
              </button>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
            >
              Create Space
            </button>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 z-10 px-4 md:px-6'>
            {filteredSpaces.map(space => (
              <div key={space.id} className="flex justify-center">
                <SpaceCard space={space} />
              </div>
            ))}
          </div>
        </main>
      </div>
      <CreateSpaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          // Refresh spaces after creation
          fetchSpaces();
        }}
      />
    </section>
  );
};

export default Page;