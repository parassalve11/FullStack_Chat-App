


import { Loader2 } from 'lucide-react'
import React from 'react'

export default function Loading() {
  return (
    <div className='min-h-screen bg-gray-900 flex items-center justify-center gap-5'>
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-white text-sm sm:text-base">Loading...</span>
    </div>
  )
}
