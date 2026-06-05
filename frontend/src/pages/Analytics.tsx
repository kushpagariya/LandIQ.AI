import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, BarChart3, Filter, Loader2, AlertCircle, MapPin, TrendingUp, CheckCircle, ArrowRight, Shield } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Sidebar from '../components/Sidebar'
import { listProperties } from '../api/endpoints'
import type { PropertyResponse, AnalyzeResponse, PropertyCreate } from '../api/types'

interface CachedAnalysis {
  analysisResult: AnalyzeResponse
  propertyDetails: PropertyCreate
  cachedAt: string
}

interface MergedProperty {
  dbProperty: PropertyResponse
  cachedData: CachedAnalysis | null
}

function formatCurrency(value: number): string {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`
  }
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`
  }
  return `₹${new Intl.NumberFormat('en-IN').format(Math.round(value))}`
}

export default function Analytics() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [properties, setProperties] = useState<MergedProperty[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string>('All')

  // Aggregate stats
  const [totalAssessedValue, setTotalAssessedValue] = useState<number>(0)
  const [analyzedCount, setAnalyzedCount] = useState<number>(0)
  const [avgConfidence, setAvgConfidence] = useState<number>(0)
  const [totalRiskFlags, setTotalRiskFlags] = useState<number>(0)

  // Chart data states
  const [valuationTrend, setValuationTrend] = useState<any[]>([])
  const [riskDist, setRiskDist] = useState<any[]>([])
  const [classificationDist, setClassificationDist] = useState<any[]>([])
  const [confidenceDist, setConfidenceDist] = useState<any[]>([])

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Fetch properties from database
      const dbProps = await listProperties()

      // 2. Load cached analyses from localStorage
      const mergedList: MergedProperty[] = dbProps.map(prop => {
        const cachedStr = localStorage.getItem(`landiq_analysis_${prop.id}`)
        let cachedData: CachedAnalysis | null = null
        if (cachedStr) {
          try {
            cachedData = JSON.parse(cachedStr)
          } catch { /* ignore */ }
        }
        return {
          dbProperty: prop,
          cachedData
        }
      })

      setProperties(mergedList)
      calculateMetrics(mergedList)

    } catch (err: any) {
      setError(err.message || 'Failed to retrieve analytics data from backend.')
    } finally {
      setLoading(false)
    }
  }

  const calculateMetrics = (dataList: MergedProperty[]) => {
    const analyzed = dataList.filter(item => item.cachedData !== null)
    setAnalyzedCount(analyzed.length)

    if (analyzed.length === 0) {
      // Set empty/default metrics if no analysis exists
      setTotalAssessedValue(0)
      setAvgConfidence(0)
      setTotalRiskFlags(0)
      setupEmptyCharts()
      return
    }

    // 1. Stats calculation
    let totalVal = 0
    let totalConf = 0
    let totalFlags = 0

    analyzed.forEach(item => {
      const res = item.cachedData!.analysisResult
      totalVal += res.predicted_value_inr
      totalConf += res.confidence_score
      totalFlags += res.risk_flags ? res.risk_flags.length : 0
    })

    setTotalAssessedValue(totalVal)
    setAvgConfidence((totalConf / analyzed.length) * 100)
    setTotalRiskFlags(totalFlags)

    // 2. Portfolio Valuation Trend over last 6 months (based on creation date)
    const last6Months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const monthLabel = d.toLocaleString('default', { month: 'short' })
      const year = d.getFullYear()
      last6Months.push({
        month: monthLabel,
        year,
        rawValue: 0,
        value: 0
      })
    }

    analyzed.forEach(item => {
      const propDate = new Date(item.dbProperty.created_at)
      const propMonth = propDate.toLocaleString('default', { month: 'short' })
      const propYear = propDate.getFullYear()

      const match = last6Months.find(m => m.month === propMonth && m.year === propYear)
      if (match) {
        match.rawValue += item.cachedData!.analysisResult.predicted_value_inr
      }
    })

    // Convert values to Crores for the trend chart
    last6Months.forEach(m => {
      m.value = parseFloat((m.rawValue / 10000000).toFixed(2)) // in Cr
    })

    setValuationTrend(last6Months)

    // 3. Risk Distribution
    // Low: trust_score >= 75
    // Medium: trust_score >= 50 && trust_score < 75
    // High: trust_score < 50
    let lowRiskCount = 0
    let medRiskCount = 0
    let highRiskCount = 0

    analyzed.forEach(item => {
      const trust = item.cachedData!.analysisResult.trust_score
      if (trust >= 75) lowRiskCount++
      else if (trust >= 50) medRiskCount++
      else highRiskCount++
    })

    setRiskDist([
      { risk: 'Low Risk (≥75)', count: lowRiskCount, fill: '#10b981' },
      { risk: 'Moderate (50-74)', count: medRiskCount, fill: '#f59e0b' },
      { risk: 'High Risk (<50)', count: highRiskCount, fill: '#ef4444' }
    ])

    // 4. Valuation Classification Distribution
    let undervalued = 0
    let fair = 0
    let overvalued = 0

    analyzed.forEach(item => {
      const classification = item.cachedData!.analysisResult.price_classification.toLowerCase()
      if (classification === 'undervalued') undervalued++
      else if (classification === 'overvalued') overvalued++
      else fair++
    })

    const totalValEntries = undervalued + fair + overvalued
    setClassificationDist([
      { name: 'Undervalued', value: totalValEntries ? Math.round((undervalued / totalValEntries) * 100) : 0, count: undervalued, fill: '#10b981' },
      { name: 'Fairly Priced', value: totalValEntries ? Math.round((fair / totalValEntries) * 100) : 0, count: fair, fill: '#3b82f6' },
      { name: 'Overpriced', value: totalValEntries ? Math.round((overvalued / totalValEntries) * 100) : 0, count: overvalued, fill: '#ef4444' }
    ])

    // 5. Confidence Score Distribution
    let score90Plus = 0
    let score80To90 = 0
    let score70To80 = 0
    let scoreUnder70 = 0

    analyzed.forEach(item => {
      const conf = item.cachedData!.analysisResult.confidence_score
      if (conf >= 0.90) score90Plus++
      else if (conf >= 0.80) score80To90++
      else if (conf >= 0.70) score70To80++
      else scoreUnder70++
    })

    setConfidenceDist([
      { score: '90%+', count: score90Plus },
      { score: '80-90%', count: score80To90 },
      { score: '70-80%', count: score70To80 },
      { score: '<70%', count: scoreUnder70 }
    ])
  }

  const setupEmptyCharts = () => {
    // Valuation Trend empty state
    const last6Months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      last6Months.push({
        month: d.toLocaleString('default', { month: 'short' }),
        value: 0
      })
    }
    setValuationTrend(last6Months)

    setRiskDist([
      { risk: 'Low Risk (≥75)', count: 0, fill: '#10b981' },
      { risk: 'Moderate (50-74)', count: 0, fill: '#f59e0b' },
      { risk: 'High Risk (<50)', count: 0, fill: '#ef4444' }
    ])

    setClassificationDist([
      { name: 'Undervalued', value: 0, count: 0, fill: '#10b981' },
      { name: 'Fairly Priced', value: 0, count: 0, fill: '#3b82f6' },
      { name: 'Overpriced', value: 0, count: 0, fill: '#ef4444' }
    ])

    setConfidenceDist([
      { score: '90%+', count: 0 },
      { score: '80-90%', count: 0 },
      { score: '70-80%', count: 0 },
      { score: '<70%', count: 0 }
    ])
  }

  const handleRowClick = (item: MergedProperty) => {
    if (item.cachedData) {
      navigate(`/dashboard/${item.dbProperty.id}`, {
        state: {
          analysisResult: item.cachedData.analysisResult,
          propertyDetails: item.cachedData.propertyDetails
        }
      })
    } else {
      // Pre-fill logic is handled by navigation or property-analysis
      navigate(`/property-analysis`, {
        state: {
          prefilledProperty: item.dbProperty
        }
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activePage="analytics" />

      <main className="flex-1 ml-64">
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Portfolio Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">
              Macro-level intelligence across all analyzed geospatial assets.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg text-xs text-blue-700 font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Maharashtra Registry Active
            </div>
            <button
              onClick={loadAnalyticsData}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-semibold text-gray-700 transition"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600 text-lg font-medium">Aggregating portfolio statistics...</p>
          </div>
        ) : error ? (
          <div className="p-8">
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 flex flex-col items-center max-w-xl mx-auto shadow-sm">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-lg font-bold mb-2">Failed to load analytics</h3>
              <p className="text-sm text-center mb-6">{error}</p>
              <button
                onClick={loadAnalyticsData}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8">
            {/* Disclaimer & LocalStorage Cache Warning */}
            <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-800 text-sm">
              <span className="text-xl">💡</span>
              <div>
                <p className="font-semibold">Hybrid Aggregation Model Active</p>
                <p className="text-amber-700 mt-0.5">
                  Portfolio charts aggregate data from {analyzedCount} analyzed properties cached in this browser session. The total registered property count is {properties.length}. Properties must be analyzed at least once to be included in detailed charts.
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                {
                  label: 'Total Assessed Value',
                  value: formatCurrency(totalAssessedValue),
                  change: `Across ${analyzedCount} properties`,
                  icon: '📊',
                  color: 'from-blue-500 to-indigo-600'
                },
                {
                  label: 'Monitored Assets',
                  value: properties.length.toString(),
                  change: `${properties.length - analyzedCount} pending analysis`,
                  icon: '📍',
                  color: 'from-emerald-500 to-teal-600'
                },
                {
                  label: 'Average Confidence',
                  value: analyzedCount > 0 ? `${avgConfidence.toFixed(1)}%` : '0%',
                  change: 'AI Model Version 1.0.0',
                  icon: '✓',
                  color: 'from-purple-500 to-pink-600'
                },
                {
                  label: 'Risk Flags Identified',
                  value: totalRiskFlags.toString(),
                  change: 'Requiring documentation audit',
                  icon: '⚠️',
                  color: 'from-orange-500 to-red-600'
                }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.label}</span>
                      <span className="text-2xl">{stat.icon}</span>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900 mb-1">{stat.value}</p>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-3 border-t border-gray-50 pt-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {stat.change}
                  </p>
                </motion.div>
              ))}
            </div>

            {analyzedCount === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No properties analyzed yet</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Before you can view aggregate analytics and risk distributions, you must submit and run geospatial analysis on your land assets.
                </p>
                <button
                  onClick={() => navigate('/property-analysis')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm hover:shadow transition text-sm"
                >
                  Analyze Property <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                {/* Charts Grid */}
                <div className="grid lg:grid-cols-2 gap-8 mb-12">
                  {/* Valuation Trend */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Portfolio Valuation Trend</h3>
                      <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-bold">INR Crores</span>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={valuationTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs font-semibold text-gray-400" />
                          <YAxis label={{ value: 'Valuation (Cr)', angle: -90, position: 'insideLeft', offset: 0, style: { fill: '#9ca3af', fontSize: '11px', fontWeight: 'bold' } }} tickLine={false} axisLine={false} className="text-xs font-semibold text-gray-400" />
                          <Tooltip formatter={(value) => [`₹${value} Cr`, 'Assessed Value']} />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2 }}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  {/* Risk Distribution */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Legal Risk Classification</h3>
                      <span className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full font-bold">Based on Trust Score</span>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={riskDist}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <XAxis dataKey="risk" tickLine={false} axisLine={false} className="text-xs font-semibold text-gray-400" />
                          <YAxis tickLine={false} axisLine={false} className="text-xs font-semibold text-gray-400" allowDecimals={false} />
                          <Tooltip formatter={(value) => [value, 'Parcels']} />
                          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                            {riskDist.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  {/* Valuation Classification */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Market Price Classification</h3>
                    <div className="flex flex-col md:flex-row items-center justify-around h-72">
                      <div className="w-1/2 h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={classificationDist}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={85}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {classificationDist.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3 w-1/3">
                        {classificationDist.map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                              <span className="text-xs text-gray-600 font-semibold">{item.name}</span>
                            </div>
                            <div className="text-xs text-gray-900 font-extrabold">
                              {item.count} ({item.value}%)
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* AI Confidence Scores */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-6">AI Model Confidence Distribution</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={confidenceDist}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <XAxis dataKey="score" tickLine={false} axisLine={false} className="text-xs font-semibold text-gray-400" />
                          <YAxis tickLine={false} axisLine={false} className="text-xs font-semibold text-gray-400" allowDecimals={false} />
                          <Tooltip formatter={(value) => [value, 'Parcels']} />
                          <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </div>
              </>
            )}

            {/* Monitored Properties Table */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Monitored Geospatial Assets</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Complete record of registered plots in the system.</p>
                </div>
                <div className="text-xs text-gray-400 font-bold">
                  Showing {properties.length} properties
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                      <th className="px-8 py-4">Survey Number</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Area (Acres)</th>
                      <th className="px-6 py-4">Land Type</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Assessed Value</th>
                      <th className="px-6 py-4">Trust Score</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {properties.map((item, idx) => {
                      const isAnalyzed = item.cachedData !== null
                      const locationStr = `${item.dbProperty.village}, ${item.dbProperty.taluka}`
                      
                      return (
                        <tr
                          key={item.dbProperty.id}
                          className="hover:bg-gray-50/50 transition cursor-pointer"
                          onClick={() => handleRowClick(item)}
                        >
                          <td className="px-8 py-4 font-mono font-bold text-gray-900">
                            {item.dbProperty.survey_number}
                          </td>
                          <td className="px-6 py-4 text-gray-600 font-medium">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              {locationStr}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 font-bold">
                            {item.dbProperty.area_acre} ac
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full capitalize">
                              {item.dbProperty.land_type.toLowerCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {isAnalyzed ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Analyzed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            {isAnalyzed
                              ? formatCurrency(item.cachedData!.analysisResult.predicted_value_inr)
                              : '—'}
                          </td>
                          <td className="px-6 py-4 font-semibold">
                            {isAnalyzed ? (
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2.5 h-2.5 rounded-full ${
                                  item.cachedData!.analysisResult.trust_score >= 75
                                    ? 'bg-emerald-500'
                                    : item.cachedData!.analysisResult.trust_score >= 50
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                }`} />
                                <span className="text-gray-900 font-bold">
                                  {item.cachedData!.analysisResult.trust_score}/100
                                </span>
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-8 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleRowClick(item)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                                isAnalyzed
                                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              {isAnalyzed ? 'View Dashboard' : 'Run Analysis'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
