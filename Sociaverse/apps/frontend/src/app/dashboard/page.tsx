"use client";
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import SpaceCard from '../../components/SpaceCard';
import CreateSpaceModal from '../../components/CreateSpaceModal';
import JoinSpaceModal from '../../components/JoinSpaceModal';
import type { Space } from '../../types/space';

const Page = () => {
  const [filter, setFilter] = useState<'lastVisited' | 'mySpaces'>('lastVisited');
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

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

  const filteredSpaces = useMemo(() => {
    if (!spaces.length) return [];
    
    switch(filter) {
      case 'mySpaces':
        return spaces.filter(space => space.isOwner);
      case 'lastVisited':
        return [...spaces].sort((a, b) => {
          const dateA = new Date(a.lastVisited).getTime();
          const dateB = new Date(b.lastVisited).getTime();
          return dateB - dateA;
        });
      default:
        return spaces;
    }
  }, [spaces, filter]);

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

  if (spaces.length === 0) return (
    <section className='bg-[#262626] min-h-screen relative'>
      <div className='relative z-10'>
        <Navbar onCreateSpace={() => setIsModalOpen(true)} />
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
            <div className='flex space-x-4'>
              <button
                onClick={() => setIsJoinModalOpen(true)}
                className='px-6 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700'
              >
                Join Space
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className='px-6 py-2 rounded-full bg-green-600 text-white hover:bg-green-700'
              >
                Create Space
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center min-h-[400px] text-white">
            <p className="text-2xl mb-4">No spaces found</p>
            <p className="text-gray-400 mb-6">Create your first space to get started</p>
          </div>
        </main>
      </div>
      <CreateSpaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchSpaces}
      />
      <JoinSpaceModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSuccess={fetchSpaces}
      />
    </section>
  );

  return (
    <section className='bg-[#262626] min-h-screen relative'>
      <div className='relative z-10'>
        <Navbar onCreateSpace={() => setIsModalOpen(true)} />
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
            <div className='flex space-x-4'>
              <button
                onClick={() => setIsJoinModalOpen(true)}
                className='px-6 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700'
              >
                Join Space
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className='px-6 py-2 rounded-full bg-green-600 text-white hover:bg-green-700'
              >
                Create Space
              </button>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 z-10 px-4 md:px-6'>
            {filteredSpaces.map(space => (
              <div key={space._id} className="flex justify-center">
                <SpaceCard 
                  space={space} 
                  onUpdate={fetchSpaces}
                />
              </div>
            ))}
          </div>
        </main>
      </div>
      <CreateSpaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchSpaces();
        }}
      />
      <JoinSpaceModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSuccess={fetchSpaces}
      />
    </section>
  );
};

export default Page;