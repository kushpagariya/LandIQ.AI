import React from 'react'
import StatCard from '../components/StatCard'
import RiskCard from '../components/RiskCard'
import MapCard from '../components/MapCard'
import ConfidenceMeter from '../components/ConfidenceMeter'
import { analysis } from '../mock/data'

export default function Analytics(){
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">AI Analysis Results</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-sm text-gray-500">Predicted Price Per Acre</div>
            <div className="text-4xl font-bold mt-2">{analysis.predictedPricePerAcre}</div>
            <div className="mt-4 flex gap-4">
              <RiskCard title="Ownership Risk" level="LOW" />
              <RiskCard title="Legal Risk" level="HIGH" />
              <RiskCard title="Transaction Risk" level="MEDIUM" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="font-semibold mb-2">Due Diligence Checklist</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li><label><input type="checkbox" defaultChecked/> Verify title chain</label></li>
                <li><label><input type="checkbox" defaultChecked/> Validate mutation</label></li>
                <li><label><input type="checkbox"/> Review encumbrances</label></li>
                <li><label><input type="checkbox"/> Confirm survey</label></li>
              </ul>
            </div>
            <MapCard />
          </div>
        </div>
        <div>
          <div className="bg-white rounded-lg p-6 shadow mb-6">
            <ConfidenceMeter value={Math.round(analysis.confidence)} />
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <img src="/src/assets/images/ai_results.png" alt="AI Results" style={{width:'100%', borderRadius:8}} />
          </div>
        </div>
      </div>
    </div>
  )
}
