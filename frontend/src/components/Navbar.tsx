import React from 'react'

export default function Navbar(){
  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <input className="w-80 rounded-full bg-gray-100 px-4 py-2 text-sm" placeholder="Search properties, reports..." />
      </div>
      <div className="flex items-center gap-4">
        <button className="text-sm text-blue-600">Support</button>
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">JD</div>
      </div>
    </header>
  )
}
