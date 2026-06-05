import React from 'react'

export default function ConfidenceMeter({value}:{value:number}){
  return (
    <div className="flex items-center gap-4">
      <div className="w-24 h-24 rounded-full border-4 border-blue-400 flex items-center justify-center">
        <div className="text-lg font-bold">{value}%</div>
      </div>
      <div className="text-sm text-gray-500">Based on mock geospatial data points.</div>
    </div>
  )
}
