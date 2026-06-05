import React from 'react'
import { fraudAlerts } from '../mock/data'

export default function FraudDetection(){
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Fraud Detection Intelligence</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow">
          <h2 className="font-semibold mb-4">Critical Alerts</h2>
          <div className="space-y-4">
            {fraudAlerts.map(a => (
              <div key={a.id} className="border rounded p-4 bg-gray-50">
                <div className="flex justify-between"><div className="font-medium">{a.title}</div><div className="text-sm text-gray-500">{a.severity}</div></div>
                <div className="text-xs text-gray-400 mt-2">{a.time}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="font-semibold">System Risk Assessment</h3>
          <div className="text-4xl font-bold text-red-600 mt-4">78</div>
          <div className="text-xs text-gray-500 mt-2">High Risk</div>
          <div className="mt-6">
            <img src="/src/assets/images/fraud.png" alt="Fraud" style={{width:'100%', borderRadius:8}} />
          </div>
        </div>
      </div>
    </div>
  )
}
