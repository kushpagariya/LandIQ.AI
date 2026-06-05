import { motion } from 'framer-motion'
import { Download, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'
import Sidebar from '../components/Sidebar'

export default function FraudDetection() {
  const riskScore = 78

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activePage="fraud-detection" />

      <main className="flex-1 ml-64">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fraud Detection Intelligence</h1>
            <p className="text-gray-600">Real-time analysis of property anomalies and document authenticity.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              Live Monitoring
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* System Risk Assessment */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                System Risk Assessment
              </h2>
              <div className="flex justify-center mb-6">
                <div className="w-48 h-48">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="20"
                      strokeDasharray={`${(78 / 100) * Math.PI * 180} ${Math.PI * 180}`}
                      strokeLinecap="round"
                      transform="rotate(-90 100 100)"
                    />
                    <text x="100" y="105" textAnchor="middle" fontSize="48" fontWeight="bold" fill="#dc2626">
                      78
                    </text>
                    <text x="100" y="135" textAnchor="middle" fontSize="14" fill="#6b7280">
                      HIGH RISK
                    </text>
                  </svg>
                </div>
              </div>
              <p className="text-center text-gray-600 text-sm">Based on 142 anomalies detected in the last 30 days across active portfolios.</p>
            </motion.div>

            {/* Critical Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Critical Alerts</h2>
              <div className="text-right mb-4">
                <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All →</a>
              </div>
              <div className="space-y-4">
                {[
                  {
                    icon: AlertTriangle,
                    title: 'Title Deed Forgery Suspected',
                    desc: 'Property ID: #TX-4829. Cryptographic signature mismatch on uploaded deed.',
                    time: '2 mins ago',
                    severity: 'High'
                  },
                  {
                    icon: AlertCircle,
                    title: 'Rapid Ownership Transfer',
                    desc: 'Asset #FL-992 transferred 3 times within 45 days. Investigating shell company links.',
                    time: '1 hour ago',
                    severity: 'Medium'
                  },
                  {
                    icon: AlertTriangle,
                    title: 'Unusual Valuation Spike',
                    desc: 'Valuation for Parcel 88A increased by 45% post-zoning rumor. Awaiting manual review.',
                    time: '4 hours ago',
                    severity: 'Low'
                  }
                ].map((alert, i) => (
                  <div key={i} className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === 'High' ? 'border-red-500 bg-red-50' :
                    alert.severity === 'Medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-green-500 bg-green-50'
                  }`}>
                    <div className="flex items-start gap-3">
                      <alert.icon className={`w-5 h-5 mt-1 flex-shrink-0 ${
                        alert.severity === 'High' ? 'text-red-600' :
                        alert.severity === 'Medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900">{alert.title}</p>
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${
                            alert.severity === 'High' ? 'bg-red-600 text-white' :
                            alert.severity === 'Medium' ? 'bg-yellow-500 text-white' :
                            'bg-green-600 text-white'
                          }`}>{alert.severity}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{alert.desc}</p>
                        <p className="text-xs text-gray-500">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Suspicious Transaction Patterns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-8 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Suspicious Transaction Patterns</h2>
              <button className="text-gray-500 hover:text-gray-700">⋮</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">TRANSACTION ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">PROPERTY</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">RISK MARKERS</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">CONFIDENCE</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: 'TXN-8892-A',
                      property: '1420 Geo Lane, NV',
                      markers: ['Wash Trading', 'Offshore Entity'],
                      confidence: '92%'
                    },
                    {
                      id: 'TXN-7104-B',
                      property: 'Parcel 4B, AZ Desert',
                      markers: ['Straw Buyer'],
                      confidence: '65%'
                    }
                  ].map((txn, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{txn.id}</td>
                      <td className="py-4 px-4 text-gray-700">{txn.property}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2 flex-wrap">
                          {txn.markers.map((marker, j) => (
                            <span key={j} className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                              {marker}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-900">{txn.confidence}</td>
                      <td className="py-4 px-4">
                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">Review</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
