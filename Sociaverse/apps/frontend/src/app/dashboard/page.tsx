import React from 'react'
import Navbar from '../../components/Navbar'
import { Users } from 'lucide-react'

const page = () => {
  return (
    <section className='bg-[#F5F2EC] min-h-screen relative'>

      <div className='fixed inset-0 z-0'>
        <img 
          src="/dashboard.jpg" 
          alt="background" 
          className='w-full h-full object-cover blur-md opacity-45'
        />
      </div>

      <div className='relative z-10'>
        <Navbar />
        <main className='container mx-auto px-4 pt-32'>

          <div className='flex space-x-4 mb-8'>
            <button className='px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors'>
              Last Visited
            </button>
            <button className='px-6 py-2 bg-white text-black rounded-full hover:bg-gray-100 transition-colors'>
              My Spaces
            </button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10'>
            {[1, 2, 3, 4, 5, 6,7,8].map((space) => (
              <div key={space} className='bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow'>
                <div className='h-48 overflow-hidden'>
                  <img 
                    src={`https://source.unsplash.com/random/400x300?${space}`} 
                    alt="Space cover" 
                    className='w-full h-full object-cover'
                  />
                </div>
                <div className='p-4'>
                  <h3 className='text-xl font-semibold mb-2'>Space {space}</h3>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2 text-gray-600'>
                      <Users size={18} />
                      <span>{Math.floor(Math.random() * 100) + 10} members</span>
                    </div>
                    <button className='px-4 py-1 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition-colors'>
                      Join Space
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>
    </section>
  )
}

export default page