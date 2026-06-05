import React from 'react'

export default function Reports(){
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Reports</h1>
      <div className="bg-white rounded-lg p-6 shadow grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-600">Generated reports will appear here (mock).</p>
          <ul className="mt-4 space-y-3">
            <li className="border rounded p-3">Executive Summary Report · 2.4 MB</li>
            <li className="border rounded p-3">Topographical Survey · 15 MB</li>
            <li className="border rounded p-3">Title & Deed Analysis · 1.1 MB</li>
          </ul>
        </div>
        <div>
          <img src="/src/assets/images/location_reports.png" alt="reports" style={{width:'100%', borderRadius:8}} />
        </div>
      </div>
    </div>
  )
}
