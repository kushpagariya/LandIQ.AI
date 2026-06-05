import { motion } from 'framer-motion'
import { Bell, Download, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import CircularProgress from '../components/CircularProgress'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activePage="dashboard" />

      <main className="flex-1 ml-64">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Analysis Results</h1>
            <p className="text-sm text-gray-600">Parcel ID: 894-A2-XYZ • Maharashtra, India</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition">
            <Download className="w-5 h-5" />
            Export PDF
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Predicted Price */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Predicted Price Per Acre</p>
              <p className="text-4xl font-bold text-gray-900 mb-2">₹ 5,44,485</p>
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+4.2% vs area avg</span>
              </div>
            </motion.div>

            {/* Total Value */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Total Land Value (12.6 Acres)</p>
              <p className="text-4xl font-bold text-gray-900">₹ 67,51,614</p>
            </motion.div>

            {/* Confidence Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm flex flex-col items-center justify-center"
            >
              <p className="text-xs font-semibold text-gray-500 uppercase mb-4">AI Confidence Score</p>
              <CircularProgress percentage={98.8} />
              <p className="text-xs text-gray-600 text-center mt-4">Based on 14,203 comparable geospatial data points and historical records.</p>
            </motion.div>
          </div>

          {/* Classification and Risk Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-2">Classification</p>
              <div className="flex gap-2">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">● Undervalued</span>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">● Fairly Priced</span>
                <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">● Overpriced</span>
              </div>
            </div>
          </div>

          {/* Risk Assessment Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 border-l-4 border-green-500 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-gray-900">Ownership Risk</h3>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">LOW</span>
              </div>
              <p className="text-sm text-gray-600">Clear title history for the last 30 years. No discrepancies in owner identity.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 border-l-4 border-red-500 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-gray-900">Legal Risk</h3>
                <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">HIGH</span>
              </div>
              <p className="text-sm text-gray-600">Pending litigation detected regarding eastern boundary encachment (Case #442-B).</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl p-6 border-l-4 border-yellow-500 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-gray-900">Transaction Risk</h3>
                <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded">MODERATE</span>
              </div>
              <p className="text-sm text-gray-600">Recent spike in local circle rates may affect stamp duty calculations. Awaiting final state notification.</p>
            </motion.div>
          </div>

          {/* Due Diligence Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl p-6 mb-8 shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Due Diligence Checklist
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Verify title chain', description: 'Automated validation complete against state registry.', done: true },
                { label: 'Validate mutation', description: 'Revenue records synced and verified.', done: true },
                { label: 'Review encumbrances', description: 'Bank lien check pending API response.', done: false },
                { label: 'Check litigation', description: 'Flagged: Manual review required for Case #442-B.', done: false, error: true },
                { label: 'Confirm survey', description: 'Drone imagery scheduled for next week.', done: false }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="mt-1">
                    {item.done ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : item.error ? (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${item.error ? 'text-red-600 line-through' : 'text-gray-900'}`}>{item.label}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Spatial Context */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl p-8 text-white shadow-sm"
          >
            <h3 className="text-lg font-bold mb-4">Parcel Boundary Overlay</h3>
            <div className="bg-black rounded-lg h-48 flex items-center justify-center text-gray-400">
              [Satellite imagery with parcel boundaries would be displayed here]
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
