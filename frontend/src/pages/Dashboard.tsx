import { useState, useEffect } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, CheckCircle, AlertCircle, TrendingUp, Loader2, AlertTriangle, Shield } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import CircularProgress from '../components/CircularProgress'
import { generateReport, downloadReport, triggerDownload, getProperty } from '../api/endpoints'
import type { AnalyzeResponse, PropertyCreate } from '../api/types'

interface DashboardData {
  analysisResult: AnalyzeResponse
  propertyDetails: PropertyCreate
}

function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN').format(Math.round(value))
}

function getClassificationStyle(classification: string) {
  switch (classification.toLowerCase()) {
    case 'undervalued':
      return { bg: 'bg-green-100', text: 'text-green-700', label: '● Undervalued' }
    case 'overvalued':
      return { bg: 'bg-red-100', text: 'text-red-700', label: '● Overpriced' }
    case 'fair':
    default:
      return { bg: 'bg-blue-100', text: 'text-blue-700', label: '● Fairly Priced' }
  }
}

function getRiskCardData(riskFlags: string[]) {
  const cards: Array<{
    title: string
    level: string
    description: string
    borderColor: string
    badgeBg: string
    badgeText: string
  }> = []

  // Parse risk_flags strings into structured cards
  const ownershipRisks = riskFlags.filter(f =>
    f.toLowerCase().includes('owner') || f.toLowerCase().includes('share')
  )
  const docRisks = riskFlags.filter(f =>
    f.toLowerCase().includes('document') || f.toLowerCase().includes('missing')
  )
  const takeoverRisks = riskFlags.filter(f =>
    f.toLowerCase().includes('takeover')
  )
  const otherRisks = riskFlags.filter(f =>
    !ownershipRisks.includes(f) && !docRisks.includes(f) && !takeoverRisks.includes(f)
  )

  // Ownership Risk Card
  if (ownershipRisks.length > 0) {
    cards.push({
      title: 'Ownership Risk',
      level: 'WARNING',
      description: ownershipRisks.join('. '),
      borderColor: 'border-yellow-500',
      badgeBg: 'bg-yellow-100',
      badgeText: 'text-yellow-700',
    })
  } else {
    cards.push({
      title: 'Ownership Risk',
      level: 'LOW',
      description: 'No ownership-related risks detected.',
      borderColor: 'border-green-500',
      badgeBg: 'bg-green-100',
      badgeText: 'text-green-700',
    })
  }

  // Document Risk Card
  if (docRisks.length > 0) {
    cards.push({
      title: 'Document Risk',
      level: 'HIGH',
      description: docRisks.join('. '),
      borderColor: 'border-red-500',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-700',
    })
  } else {
    cards.push({
      title: 'Document Risk',
      level: 'LOW',
      description: 'All mandatory documents verified.',
      borderColor: 'border-green-500',
      badgeBg: 'bg-green-100',
      badgeText: 'text-green-700',
    })
  }

  // Takeover / Transaction Risk Card
  if (takeoverRisks.length > 0) {
    cards.push({
      title: 'Takeover Risk',
      level: 'HIGH',
      description: takeoverRisks.join('. '),
      borderColor: 'border-red-500',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-700',
    })
  } else if (otherRisks.length > 0) {
    cards.push({
      title: 'Other Risks',
      level: 'MODERATE',
      description: otherRisks.join('. '),
      borderColor: 'border-yellow-500',
      badgeBg: 'bg-yellow-100',
      badgeText: 'text-yellow-700',
    })
  } else {
    cards.push({
      title: 'Transaction Risk',
      level: 'LOW',
      description: 'No transaction-related risks detected.',
      borderColor: 'border-green-500',
      badgeBg: 'bg-green-100',
      badgeText: 'text-green-700',
    })
  }

  return cards
}

export default function Dashboard() {
  const location = useLocation()
  const { propertyId } = useParams<{ propertyId: string }>()
  const navigate = useNavigate()

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [propertyId])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    // 1. Try router state first (fastest, from navigation)
    const locState = location.state as { analysisResult?: AnalyzeResponse; propertyDetails?: PropertyCreate } | null
    if (locState?.analysisResult && locState?.propertyDetails) {
      setData({ analysisResult: locState.analysisResult, propertyDetails: locState.propertyDetails })
      setLoading(false)
      return
    }

    // 2. Try localStorage cache
    const pid = propertyId
    if (pid) {
      const cached = localStorage.getItem(`landiq_analysis_${pid}`)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (parsed.analysisResult && parsed.propertyDetails) {
            setData({ analysisResult: parsed.analysisResult, propertyDetails: parsed.propertyDetails })
            setLoading(false)
            return
          }
        } catch { /* ignore parse error */ }
      }

      // 3. Fallback: fetch property from API (won't have analysis data, but can show basic info)
      try {
        const prop = await getProperty(pid)
        // We have property data but no analysis results — show empty state
        setError('Analysis results not found. Please run a new analysis from the Property Analysis page.')
        setData(null)
      } catch {
        setError('Property not found. Please run a new analysis.')
      }
    } else {
      setError('No property selected. Please run an analysis from the Property Analysis page.')
    }

    setLoading(false)
  }

  const handleExportPDF = async () => {
    if (!data) return
    const pid = data.analysisResult.property_id
    setPdfLoading(true)
    setPdfError(null)

    try {
      await generateReport(pid)
      const blob = await downloadReport(pid)
      triggerDownload(blob, `LandIQ_Report_${pid}.pdf`)
    } catch (err: any) {
      setPdfError(err.message || 'Failed to generate PDF report.')
    } finally {
      setPdfLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar activePage="dashboard" />
        <main className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Loading analysis results...</p>
          </div>
        </main>
      </div>
    )
  }

  // Error / Empty state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar activePage="dashboard" />
        <main className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Analysis Data</h2>
            <p className="text-gray-600 mb-6">{error || 'No analysis data available.'}</p>
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

  const { analysisResult, propertyDetails } = data
  const pricePerAcre = propertyDetails.area_acre > 0
    ? analysisResult.predicted_value_inr / propertyDetails.area_acre
    : analysisResult.predicted_value_inr
  const confidencePercent = analysisResult.confidence_score * 100
  const classification = getClassificationStyle(analysisResult.price_classification)
  const riskCards = getRiskCardData(analysisResult.risk_flags)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activePage="dashboard" />

      <main className="flex-1 ml-64">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Analysis Results</h1>
            <p className="text-sm text-gray-600">
              Property ID: {analysisResult.property_id.slice(0, 8)}... • {propertyDetails.village}, {propertyDetails.district}, {propertyDetails.state}
            </p>
          </div>
          <button
            onClick={handleExportPDF}
            disabled={pdfLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-70"
          >
            {pdfLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
            ) : (
              <><Download className="w-5 h-5" /> Export PDF</>
            )}
          </button>
        </div>

        {/* PDF Error */}
        {pdfError && (
          <div className="mx-8 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <strong>PDF Error:</strong> {pdfError}
          </div>
        )}

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
              <p className="text-4xl font-bold text-gray-900 mb-2">₹ {formatINR(pricePerAcre)}</p>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600">Based on ML valuation model</span>
              </div>
            </motion.div>

            {/* Total Value */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Total Land Value ({propertyDetails.area_acre} Acres)
              </p>
              <p className="text-4xl font-bold text-gray-900">₹ {formatINR(analysisResult.predicted_value_inr)}</p>
            </motion.div>

            {/* Confidence Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm flex flex-col items-center justify-center"
            >
              <p className="text-xs font-semibold text-gray-500 uppercase mb-4">AI Confidence Score</p>
              <CircularProgress percentage={Math.round(confidencePercent * 10) / 10} />
              <p className="text-xs text-gray-600 text-center mt-4">
                Trust Score: {analysisResult.trust_score}/100
              </p>
            </motion.div>
          </div>

          {/* Classification */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-2">Classification</p>
              <div className="flex gap-2">
                <span className={`inline-block px-3 py-1 ${classification.bg} ${classification.text} text-xs font-semibold rounded`}>
                  {classification.label}
                </span>
              </div>
            </div>
          </div>

          {/* Risk Assessment Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {riskCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`bg-white rounded-xl p-6 border-l-4 ${card.borderColor} shadow-sm`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-900">{card.title}</h3>
                  <span className={`${card.badgeBg} ${card.badgeText} text-xs font-semibold px-2 py-1 rounded`}>
                    {card.level}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{card.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl p-6 mb-8 shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Analysis Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{analysisResult.summary}</p>

            {analysisResult.risk_flags.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-gray-700">Risk Flags:</p>
                {analysisResult.risk_flags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{flag}</p>
                  </div>
                ))}
              </div>
            )}

            {analysisResult.risk_flags.length === 0 && (
              <div className="mt-4 flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-700">No risk flags detected.</p>
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid md:grid-cols-3 gap-4"
          >
            <button
              onClick={() => navigate(`/fraud-detection/${analysisResult.property_id}`)}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left"
            >
              <Shield className="w-8 h-8 text-red-500 mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">Detailed Fraud Analysis</h3>
              <p className="text-sm text-gray-600">View comprehensive fraud indicators and triggered rules.</p>
            </button>
            <button
              onClick={() => navigate(`/reports/${analysisResult.property_id}`)}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left"
            >
              <Download className="w-8 h-8 text-blue-500 mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">Upload Documents</h3>
              <p className="text-sm text-gray-600">Upload land documents for OCR verification.</p>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={pdfLoading}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left disabled:opacity-70"
            >
              <TrendingUp className="w-8 h-8 text-green-500 mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">Generate Full Report</h3>
              <p className="text-sm text-gray-600">Create and download a comprehensive PDF dossier.</p>
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
