import { motion } from 'framer-motion'
import { Bell, BarChart3, Filter } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Sidebar from '../components/Sidebar'

const portfolioData = [
  { month: 'Jan', value: 3.2 },
  { month: 'Feb', value: 3.5 },
  { month: 'Mar', value: 3.8 },
  { month: 'Apr', value: 4.1 },
  { month: 'May', value: 4.2 },
  { month: 'Jun', value: 4.2 },
]

const valuationData = [
  { name: 'Undervalued', value: 45, fill: '#10b981' },
  { name: 'Fairly Priced', value: 35, fill: '#3b82f6' },
  { name: 'Overpriced', value: 20, fill: '#ef4444' },
]

const riskData = [
  { risk: 'Low', count: 234 },
  { risk: 'Medium', count: 156 },
  { risk: 'High', count: 45 },
]

const confidenceData = [
  { score: '90+%', count: 342 },
  { score: '80-90%', count: 189 },
  { score: '70-80%', count: 67 },
  { score: '<70%', count: 12 },
]

export default function Analytics() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activePage="analytics" />

      <main className="flex-1 ml-64">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Portfolio Analytics</h1>
            <p className="text-sm text-gray-600">Macro-level intelligence across all monitored geospatial assets.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <span>📅</span>
              <span className="text-sm font-medium">Last 12 Months</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Region: All</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="p-8">
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Assessed Value', value: '$4.2B', change: '+12.5% YoY', icon: '📊' },
              { label: 'Analyzed Parcels', value: '12,450', change: '+840 this month', icon: '📍' },
              { label: 'Avg Confidence Score', value: '94.2%', change: 'Stable across regions', icon: '✓' },
              { label: 'High Risk Flags', value: '142', change: 'Action required', icon: '⚠️' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.change}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Valuation Trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Portfolio Valuation Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={portfolioData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" />
                  <YAxis label={{ value: 'Value ($B)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Risk Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Risk Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={riskData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="risk" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Valuation Classification */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Valuation Classification</h3>
              <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={valuationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {valuationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {valuationData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                    <span className="text-sm text-gray-700">{item.name}: {item.value}%</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Confidence Scores */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">AI Confidence Score Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={confidenceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="score" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
