import React from 'react'

export default function PropertyAnalysis(){
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">New Property Analysis</h1>
      <div className="bg-white rounded-lg p-6 shadow grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="mb-4 text-sm text-gray-500">1 Location</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600">Taluka (Sub-district)</label>
              <select className="mt-1 w-full rounded border p-2 bg-gray-50">
                <option>Select Taluka</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Village</label>
              <select className="mt-1 w-full rounded border p-2 bg-gray-50">
                <option>Select Village</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Area (Acres)</label>
              <input className="mt-1 w-full rounded border p-2" placeholder="e.g., 5.5" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Distance to Highway (KM)</label>
              <input className="mt-1 w-full rounded border p-2" placeholder="e.g., 2.4" />
            </div>
          </div>
          <div className="mt-6 text-right">
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Next Step</button>
          </div>
        </div>
        <div>
          <img src="/src/assets/images/property_form.png" alt="property form" style={{width:'100%', borderRadius:8}} />
        </div>
      </div>
    </div>
  )
}
