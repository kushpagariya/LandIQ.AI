import React from 'react'

export default function RiskCard({title, level}:{title:string,level:'LOW'|'MEDIUM'|'HIGH'}){
  const color = level === 'HIGH' ? 'border-red-300' : level === 'MEDIUM' ? 'border-yellow-200' : 'border-green-200'
  return (
    <div className={`rounded-lg border p-4 ${color} bg-white`}>
      <div className="text-sm font-medium">{title}</div>
      <div className="text-xs text-gray-500 mt-2">{level} Risk</div>
    </div>
  )
}
