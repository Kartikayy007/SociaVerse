"use client";
import React, { useState } from 'react'
import Navbar from '../../components/Navbar'
import SpaceCard from '../../components/SpaceCard'

const dummySpaces = [
  {
    id: 1,
    name: "Space 1",
    description: "A collaborative workspace for team projects",
    members: 23,
    lastVisited: "2024-03-20",
    isOwner: true,
    isPrivate: true,
  },
  {
    id: 2,
    name: "Space 2",
    description: "Design team discussions and resources",
    members: 15,
    lastVisited: "2024-03-19",
    isOwner: false,
    isPrivate: false,
  },
  {
    id: 3,
    name: "Space 3",
    description: "Marketing campaign planning",
    members: 8,
    lastVisited: "2024-03-18",
    isOwner: true,
    isPrivate: true,
  }
];

const Page = () => {
  const [filter, setFilter] = useState<'lastVisited' | 'mySpaces'>('lastVisited');

  const filteredSpaces = filter === 'mySpaces' 
    ? dummySpaces.filter(space => space.isOwner)
    : dummySpaces.sort((a, b) => new Date(b.lastVisited).getTime() - new Date(a.lastVisited).getTime());

  return (
    <section className='bg-[#262626] min-h-screen relative'>
      <div className='relative z-10'>
        <Navbar />
        <main className='container mx-auto px-4 pt-32'>
          <div className='flex space-x-4 mb-8'>
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

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 z-10'>
            {filteredSpaces.map(space => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        </main>
      </div>
    </section>
  )
}

export default Page