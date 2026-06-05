import React from 'react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/property', label: 'Property Analysis' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/fraud', label: 'Fraud Detection' },
  { to: '/reports', label: 'Reports' },
  { to: '/landing', label: 'Landing' }
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen px-4 py-6 hidden md:flex flex-col">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold">L</div>
        <div>
          <div className="text-blue-600 font-bold text-xl">LandIQ AI</div>
          <div className="text-xs text-gray-400">Geospatial Intel</div>
        </div>
      </div>
      <button className="mb-6 bg-blue-600 text-white py-2 px-4 rounded btn btn-primary">+ New Analysis</button>
      <nav className="flex-1">
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} className={({isActive}) => `block py-2 px-3 rounded mb-1 nav-link ${isActive? 'active':''}`}>
            {it.label}
          </NavLink>
        ))}
      </nav>
      <div className="text-sm text-gray-500 mt-6">Support</div>
    </aside>
  )
}
