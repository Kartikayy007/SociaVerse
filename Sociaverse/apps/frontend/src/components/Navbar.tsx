import React from 'react'
import { Search } from 'lucide-react'
import { Plus } from 'lucide-react'

const Navbar = () => {
  return (
    <div>
      <div className='bg-black fixed top-0 w-full z-40'>
        <div className='flex justify-between items-center px-10 py-8'>
          <div className='flex items-center space-x-4 text-white'>
            <h1 className='text-2xl font-bold'>Sociaverse</h1>
          </div>
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2 mr-4'>
            <div className='rounded-full overflow-hidden w-10 h-10 bg-red-800'>
              <img src="/" alt="PFP" />
            </div>
            <button className='text-gray-200 hover:text-gray-300'>
              Kartikay
            </button>
            </div>  
            <div className="relative">
              <input
              type="text"
              placeholder="Search spaces"
              className="pl-10 pr-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search size={20} className="text-gray-400" />
              </div>
            </div>
            <button className='flex items-center space-x-2 bg-white px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-black'>
              <span>
                <Plus size={24} />
              </span>  
              <span>
                Create Space
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar
