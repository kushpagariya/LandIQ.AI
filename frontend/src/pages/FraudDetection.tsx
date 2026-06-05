import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, AlertTriangle, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { runFraudCheck } from '../api/endpoints'
import type { FraudAnalysisResponse } from '../api/types'

function getRiskColor(risk: string) {
  switch (risk) {
    case 'high': return { stroke: '#dc2626', text: 'text-red-600', fill: '#dc2626' }
    case 'medium': return { stroke: '#f59e0b', text: 'text-yellow-600', fill: '#f59e0b' }
    default: return { stroke: '#10b981', text: 'text-green-600', fill: '#10b981' }
  }
}

function getRiskLabel(risk: string) {
  switch (risk) {
    case 'high': return 'HIGH RISK'
    case 'medium': return 'MODERATE RISK'
    default: return 'LOW RISK'
  }
}

function getIndicatorStyle(status: string) {
  switch (status) {
    case 'high_risk':
      return { border: 'border-red-500', bg: 'bg-red-50', icon: AlertTriangle, iconColor: 'text-red-600', badge: 'bg-red-600 text-white' }
    case 'warning':
      return { border: 'border-yellow-500', bg: 'bg-yellow-50', icon: AlertCircle, iconColor: 'text-yellow-600', badge: 'bg-yellow-500 text-white' }
    default:
      return { border: 'border-green-500', bg: 'bg-green-50', icon: CheckCircle, iconColor: 'text-green-600', badge: 'bg-green-600 text-white' }
  }
}

export default function FraudDetection() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const navigate = useNavigate()

  const [fraudData, setFraudData] = useState<FraudAnalysisResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (propertyId) {
      loadFraudData(propertyId)
    } else {
      setLoading(false)
      setError('No property selected. Please run an analysis first.')
    }
  }, [propertyId])

  const loadFraudData = async (pid: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await runFraudCheck(pid)
      setFraudData(result)
    } catch (err: any) {
      setError(err.message || 'Failed to run fraud check.')
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar activePage="fraud-detection" />
        <main className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Running fraud analysis...</p>
          </div>
        </main>
      </div>
    )
  }

  // Error / Empty state
  if (error || !fraudData) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar activePage="fraud-detection" />
        <main className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Fraud Data</h2>
            <p className="text-gray-600 mb-6">{error || 'No fraud analysis data available.'}</p>
            <button
              onClick={() => navigate('/property-analysis')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Run New Analysis
            </button>
          </div>
        </main>
      </div>
    )
  }

  const riskStyle = getRiskColor(fraudData.overall_fraud_risk)
  const riskLabel = getRiskLabel(fraudData.overall_fraud_risk)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activePage="fraud-detection" />

      <main className="flex-1 ml-64">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fraud Detection Intelligence</h1>
            <p className="text-gray-600">Property ID: {fraudData.property_id.toString().slice(0, 8)}...</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => propertyId && navigate(`/dashboard/${propertyId}`)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              ← Back to Dashboard
            </button>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium ${
              fraudData.overall_fraud_risk === 'low' ? 'bg-green-100 text-green-700' :
              fraudData.overall_fraud_risk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                fraudData.overall_fraud_risk === 'low' ? 'bg-green-600' :
                fraudData.overall_fraud_risk === 'medium' ? 'bg-yellow-600' :
                'bg-red-600'
              }`}></span>
              {riskLabel}
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
                      cx="100" cy="100" r="90" fill="none"
                      stroke={riskStyle.stroke}
                      strokeWidth="20"
                      strokeDasharray={`${(fraudData.risk_score / 100) * Math.PI * 180} ${Math.PI * 180}`}
                      strokeLinecap="round"
                      transform="rotate(-90 100 100)"
                    />
                    <text x="100" y="105" textAnchor="middle" fontSize="48" fontWeight="bold" fill={riskStyle.fill}>
                      {fraudData.risk_score}
                    </text>
                    <text x="100" y="135" textAnchor="middle" fontSize="14" fill="#6b7280">
                      {riskLabel}
                    </text>
                  </svg>
                </div>
              </div>
              <p className="text-center text-gray-600 text-sm">
                Overall fraud risk: {fraudData.overall_fraud_risk}. {fraudData.triggered_rules.length} rule(s) triggered.
              </p>
            </motion.div>

            {/* Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Fraud Indicators</h2>
              <div className="space-y-4">
                {fraudData.indicators.map((indicator, i) => {
                  const style = getIndicatorStyle(indicator.status)
                  const IconComponent = style.icon
                  return (
                    <div key={i} className={`p-4 rounded-lg border-l-4 ${style.border} ${style.bg}`}>
                      <div className="flex items-start gap-3">
                        <IconComponent className={`w-5 h-5 mt-1 flex-shrink-0 ${style.iconColor}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-gray-900">{indicator.name}</p>
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${style.badge}`}>
                              {indicator.status === 'high_risk' ? 'High' :
                               indicator.status === 'warning' ? 'Warning' : 'Clear'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{indicator.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Triggered Rules */}
          {fraudData.triggered_rules.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Triggered Rules</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">RULE ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">STATUS</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">DESCRIPTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fraudData.triggered_rules.map((rule, i) => {
                      const matchingIndicator = fraudData.indicators.find(ind =>
                        ind.status !== 'clear'
                      )
                      return (
                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 font-medium text-gray-900">{rule}</td>
                          <td className="py-4 px-4">
                            <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                              Triggered
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {fraudData.indicators[i]?.description || 'Rule triggered during analysis.'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* No Rules Triggered */}
          {fraudData.triggered_rules.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-green-50 rounded-xl p-8 border border-green-200"
            >
              <div className="flex items-center gap-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
                <div>
                  <h3 className="text-xl font-bold text-green-800">All Clear</h3>
                  <p className="text-green-700">No fraud rules were triggered for this property. All indicators are clear.</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
