import { motion } from 'framer-motion'
import { Download, FileText, Eye, Filter, Search, Share2, Trash2 } from 'lucide-react'
import Sidebar from '../components/Sidebar'

const reportsList = [
  {
    id: 1,
    parcelId: '894-A2-XYZ',
    location: 'Nashik, Maharashtra',
    date: 'Jun 5, 2024',
    value: '₹67.5L',
    confidence: '98.8%',
    status: 'Completed'
  },
  {
    id: 2,
    parcelId: 'MH-4521-B',
    location: 'Sinnar, Maharashtra',
    date: 'Jun 3, 2024',
    value: '₹45.2L',
    confidence: '95.2%',
    status: 'Completed'
  },
  {
    id: 3,
    parcelId: 'KA-7834-X',
    location: 'Belgaum, Karnataka',
    date: 'Jun 1, 2024',
    value: '₹102.3L',
    confidence: '92.5%',
    status: 'Completed'
  },
  {
    id: 4,
    parcelId: 'UP-2156-Y',
    location: 'Lucknow, Uttar Pradesh',
    date: 'May 28, 2024',
    value: '₹56.8L',
    confidence: '94.1%',
    status: 'Processing'
  }
]

export default function Reports() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activePage="reports" />

      <main className="flex-1 ml-64">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analysis Reports</h1>
              <p className="text-gray-600">Comprehensive documentation of all valuation findings and assessments.</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Reports', value: '124', icon: '📊' },
              { label: 'Avg Confidence', value: '95.2%', icon: '✓' },
              { label: 'This Month', value: '34', icon: '📈' },
              { label: 'Pending', value: '5', icon: '⏳' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Reports Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Parcel ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Analysis Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Est. Value</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">AI Confidence</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportsList.map((report, i) => (
                    <motion.tr
                      key={report.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">{report.parcelId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{report.location}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{report.date}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{report.value}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: report.confidence
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{report.confidence}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          report.status === 'Completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600" title="Download">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600" title="Share">
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-red-100 rounded-lg transition text-red-600" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">Showing 1-4 of 124 reports</p>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-white transition">Previous</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">1</button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-white transition">2</button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-white transition">3</button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-white transition">Next</button>
              </div>
            </div>
          </motion.div>

          {/* Export Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-8 border border-blue-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Bulk Export</h3>
                <p className="text-gray-600">Download multiple reports and generate custom analysis compilations.</p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition">
                <Download className="w-5 h-5" />
                Export Selected
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
