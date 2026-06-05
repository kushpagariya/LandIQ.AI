import React from 'react'
import StatCard from '../components/StatCard'
import { overview } from '../mock/data'

export default function Dashboard(){
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Portfolio Analytics</h1>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <StatCard title="Total Assessed Value" value={overview.totalValue} />
        <StatCard title="Analyzed Parcels" value={`${overview.parcels}`} />
        <StatCard title="Avg Confidence" value={overview.avgConfidence} />
        <StatCard title="High Risk Flags" value="142" />
      </div>
      <div className="mt-8 bg-white rounded-lg p-6 shadow">
        <img src="/src/assets/images/analytics.png" alt="Analytics" style={{width:'100%', borderRadius:8}} />
      </div>
    </div>
  )
}
