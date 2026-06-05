import React from 'react'

export default function StatCard({title, value, children}:{title:string,value:string,children?:React.ReactNode}){
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-2">{value}</div>
      {children}
    </div>
  )
}
