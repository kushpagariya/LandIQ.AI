import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText, Upload, Download, Clock, CheckCircle, AlertCircle,
  Loader2, Eye, RefreshCw, X
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import {
  listProperties, uploadDocument, getOCRStatus,
  generateReport, downloadReport, triggerDownload
} from '../api/endpoints'
import type { PropertyResponse, DocumentStatusResponse, OCRExtractionResponse } from '../api/types'

interface UploadedDoc {
  documentId: string
  fileName: string
  fileType: string
  status: string
  ocrData?: OCRExtractionResponse
}

export default function Reports() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const navigate = useNavigate()

  const [properties, setProperties] = useState<PropertyResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Document upload state
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(propertyId || '')
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [selectedFileType, setSelectedFileType] = useState('7_12_extract')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Report generation state
  const [generatingReportFor, setGeneratingReportFor] = useState<string | null>(null)
  const [reportError, setReportError] = useState<string | null>(null)

  // Polling refs
  const pollingRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  useEffect(() => {
    loadProperties()
    return () => {
      // Cleanup polling intervals
      pollingRef.current.forEach(interval => clearInterval(interval))
      pollingRef.current.clear()
    }
  }, [])

  useEffect(() => {
    if (propertyId) setSelectedPropertyId(propertyId)
  }, [propertyId])

  const loadProperties = async () => {
    setLoading(true)
    setError(null)
    try {
      const props = await listProperties()
      setProperties(props)
    } catch (err: any) {
      setError(err.message || 'Failed to load properties.')
    } finally {
      setLoading(false)
    }
  }

  // --- Document Upload ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedPropertyId) return

    // Frontend validation
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg']
    if (!validTypes.includes(file.type)) {
      setUploadError('Only PDF, PNG, and JPEG files are allowed.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit.')
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      const result = await uploadDocument(selectedPropertyId, file, selectedFileType)
      const newDoc: UploadedDoc = {
        documentId: result.document_id,
        fileName: result.file_name,
        fileType: result.file_type,
        status: result.status,
      }
      setUploadedDocs(prev => [...prev, newDoc])

      // Start polling for OCR status
      startOCRPolling(selectedPropertyId, result.document_id)
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const startOCRPolling = (propId: string, docId: string) => {
    let attempts = 0
    const maxAttempts = 20

    const interval = setInterval(async () => {
      attempts++
      if (attempts > maxAttempts) {
        clearInterval(interval)
        pollingRef.current.delete(docId)
        setUploadedDocs(prev => prev.map(d =>
          d.documentId === docId ? { ...d, status: 'timeout' } : d
        ))
        return
      }

      try {
        const ocrResult = await getOCRStatus(propId, docId)
        if (ocrResult.status === 'processed' || ocrResult.status === 'failed') {
          clearInterval(interval)
          pollingRef.current.delete(docId)
          setUploadedDocs(prev => prev.map(d =>
            d.documentId === docId ? { ...d, status: ocrResult.status, ocrData: ocrResult } : d
          ))
        } else {
          setUploadedDocs(prev => prev.map(d =>
            d.documentId === docId ? { ...d, status: ocrResult.status } : d
          ))
        }
      } catch {
        // Keep polling on transient errors
      }
    }, 3000)

    pollingRef.current.set(docId, interval)
  }

  // --- Report Generation ---
  const handleGenerateReport = async (propId: string) => {
    setGeneratingReportFor(propId)
    setReportError(null)
    try {
      await generateReport(propId)
      // Immediately download
      const blob = await downloadReport(propId)
      triggerDownload(blob, `LandIQ_Report_${propId.slice(0, 8)}.pdf`)
    } catch (err: any) {
      setReportError(err.message || 'Failed to generate report.')
    } finally {
      setGeneratingReportFor(null)
    }
  }

  const handleDownloadOnly = async (propId: string) => {
    setGeneratingReportFor(propId)
    setReportError(null)
    try {
      const blob = await downloadReport(propId)
      triggerDownload(blob, `LandIQ_Report_${propId.slice(0, 8)}.pdf`)
    } catch (err: any) {
      // If download fails (404), try generating first
      try {
        await generateReport(propId)
        const blob = await downloadReport(propId)
        triggerDownload(blob, `LandIQ_Report_${propId.slice(0, 8)}.pdf`)
      } catch (err2: any) {
        setReportError(err2.message || 'Failed to download report.')
      }
    } finally {
      setGeneratingReportFor(null)
    }
  }

  // Status indicator
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'processing':
        return (
          <span className="flex items-center gap-1.5 text-blue-600 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Processing OCR...
          </span>
        )
      case 'processed':
        return (
          <span className="flex items-center gap-1.5 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" /> Processed
          </span>
        )
      case 'failed':
        return (
          <span className="flex items-center gap-1.5 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" /> Failed
          </span>
        )
      case 'timeout':
        return (
          <span className="flex items-center gap-1.5 text-yellow-600 text-sm">
            <Clock className="w-4 h-4" /> Timed Out
          </span>
        )
      default:
        return (
          <span className="flex items-center gap-1.5 text-gray-500 text-sm">
            <Clock className="w-4 h-4" /> {status}
          </span>
        )
    }
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar activePage="reports" />
        <main className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Loading properties...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activePage="reports" />

      <main className="flex-1 ml-64">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Documents</h1>
          <p className="text-gray-600">Upload documents, run OCR, and generate property reports.</p>
        </div>

        <div className="p-8">
          {/* Error Banner */}
          {(error || reportError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <strong>Error:</strong> {error || reportError}
            </div>
          )}

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase">Total Properties</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{properties.length}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase">Documents Uploaded (Session)</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{uploadedDocs.length}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase">OCR Processed</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {uploadedDocs.filter(d => d.status === 'processed').length}
              </p>
            </div>
          </div>

          {/* Document Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-8 shadow-sm mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Upload className="w-6 h-6 text-blue-600" />
              Upload Document
            </h2>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              {/* Property selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property</label>
                <select
                  value={selectedPropertyId}
                  onChange={e => setSelectedPropertyId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Property</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.survey_number} — {p.village}, {p.taluka}
                    </option>
                  ))}
                </select>
              </div>

              {/* File type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                <select
                  value={selectedFileType}
                  onChange={e => setSelectedFileType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7_12_extract">7/12 Extract</option>
                  <option value="sale_deed">Sale Deed</option>
                  <option value="title_deed">Title Deed</option>
                  <option value="mutation_entry">Mutation Entry</option>
                  <option value="encumbrance_certificate">Encumbrance Certificate</option>
                </select>
              </div>

              {/* File input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File (PDF, PNG, JPEG)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  disabled={!selectedPropertyId || uploading}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
              </div>
            </div>

            {uploading && (
              <div className="flex items-center gap-2 text-blue-600 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
              </div>
            )}
            {uploadError && (
              <p className="text-red-600 text-sm mt-2">{uploadError}</p>
            )}
          </motion.div>

          {/* Uploaded Documents */}
          {uploadedDocs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-8 shadow-sm mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Uploaded Documents</h2>
              <div className="space-y-4">
                {uploadedDocs.map((doc, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.fileName}</p>
                          <p className="text-xs text-gray-500">{doc.fileType} • ID: {doc.documentId.slice(0, 8)}...</p>
                        </div>
                      </div>
                      {getStatusIndicator(doc.status)}
                    </div>

                    {/* OCR Results */}
                    {doc.ocrData && doc.status === 'processed' && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          OCR Extracted Fields (Confidence: {(doc.ocrData.ocr_confidence * 100).toFixed(0)}%)
                        </p>
                        <div className="grid md:grid-cols-2 gap-2 text-sm">
                          {Object.entries(doc.ocrData.extracted_fields).map(([key, value]) => (
                            <div key={key} className="flex gap-2">
                              <span className="font-medium text-gray-700 capitalize">{key.replace(/_/g, ' ')}:</span>
                              <span className="text-gray-600">
                                {Array.isArray(value) ? value.join(', ') : String(value ?? '—')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Properties & Reports */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-8 shadow-sm"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Property Reports
            </h2>

            {properties.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">No Properties Yet</h3>
                <p className="text-gray-400 mb-4">Run an analysis to create your first property record.</p>
                <button
                  onClick={() => navigate('/property-analysis')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  New Analysis
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">SURVEY #</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">LOCATION</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">AREA</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">CREATED</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((prop) => (
                      <tr key={prop.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-gray-900">{prop.survey_number}</td>
                        <td className="py-4 px-4 text-gray-600">{prop.village}, {prop.taluka}</td>
                        <td className="py-4 px-4 text-gray-600">{prop.area_acre} acres</td>
                        <td className="py-4 px-4 text-gray-500">
                          {new Date(prop.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/dashboard/${prop.id}`)}
                              className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium transition"
                            >
                              <Eye className="w-3.5 h-3.5 inline mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => handleGenerateReport(prop.id)}
                              disabled={generatingReportFor === prop.id}
                              className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-medium transition disabled:opacity-50"
                            >
                              {generatingReportFor === prop.id ? (
                                <><Loader2 className="w-3.5 h-3.5 inline mr-1 animate-spin" /> Generating...</>
                              ) : (
                                <><Download className="w-3.5 h-3.5 inline mr-1" /> Report PDF</>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
