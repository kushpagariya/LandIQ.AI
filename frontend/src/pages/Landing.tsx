import React from 'react'

export default function Landing(){
  return (
    <div className="max-w-7xl mx-auto text-center py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <div>
          <h1 className="text-4xl font-bold">AI-Powered Land Valuation & Ownership Intelligence</h1>
          <p className="mt-4 text-gray-600">Analyze agricultural properties using machine learning, ownership intelligence, and legal risk assessment.</p>
          <div className="mt-8 flex justify-start gap-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded btn btn-primary">Analyze Property</button>
            <button className="bg-white border px-6 py-3 rounded">View Demo Report</button>
          </div>
        </div>
        <div>
          <img src="/src/assets/images/landing.png" alt="Landing" style={{width:'100%', borderRadius:12}} />
        </div>
      </div>
    </div>
  )
}
