import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Settings, Bell, User, ChevronDown, ArrowRight, ChevronLeft } from 'lucide-react'
import Sidebar from '../components/Sidebar'

const steps = ['Location', 'Characteristics', 'Infrastructure', 'Legal', 'Market']

export default function PropertyAnalysis() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    taluka: '',
    village: '',
    area: '',
    distanceToHighway: '',
    soilType: '',
    soilQuality: '',
    landType: '',
    irrigated: '',
    waterSource: '',
    roadTouch: '',
    roadWidth: '',
    ownership: '',
    unknownRegistrations: '',
    takaoverRisk: '',
    avgPrice: ''
  })

  const handleInputChange = (e: any) => {
    const { name, value } = e.target

    if (name === 'soilQuality') {
      if (value === '') {
        setFormData(prev => ({ ...prev, soilQuality: '' }))
        return
      }

      const parsed = Number(value)
      const clamped = Math.min(10, Math.max(0, parsed))
      setFormData(prev => ({ ...prev, soilQuality: String(clamped) }))
      return
    }

    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      navigate('/dashboard')
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activePage="property-analysis" />

      <main className="flex-1 ml-64">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <div>
            <input
              type="text"
              placeholder="Search properties, reports..."
              className="w-64 px-4 py-2 bg-gray-100 rounded-lg text-sm placeholder-gray-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <Bell className="w-5 h-5 text-gray-600 cursor-pointer" />
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              JD
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-w-6xl">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">New Property Analysis</h1>
            <p className="text-gray-600 mb-8">Enter property details to generate a comprehensive geospatial and valuation report.</p>

            {/* Step Indicators */}
            <div className="flex gap-4 mb-12">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                      i <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className={i === currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'}>{step}</span>
                  {i < steps.length - 1 && <div className="w-8 h-0.5 bg-gray-300 mx-2"></div>}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-xl p-8 mb-8">
              {currentStep === 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <MapPin className="w-6 h-6" /> Geographic Location
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Taluka (Sub-district)</label>
                      <select
                        name="taluka"
                        value={formData.taluka}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>Select Taluka</option>
                        <option>Chandwad</option>
                        <option>Nashik</option>
                        <option>Niphad</option>
                        <option>Sinnar</option>
                        <option>Yeola</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Village</label>
                      <select
                        name="village"
                        value={formData.village}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>Select Village</option>
                        <option>Abhona</option>
                        <option>Adgaon</option>
                        <option>Ambad</option>
                        <option>Anandwalli</option>
                        <option>Bhojapur</option>
                        <option>Borgaon</option> 
                        <option>Borwadi</option>
                        <option>Chandanpuri</option>
                        <option>Chandori</option>
                        <option>Chandrapur</option>
                        <option>Chandwad</option>
                        <option>Chinchpada</option>
                        <option>Darna</option>
                        <option>Deher</option>
                        <option>Deolali</option>
                        <option>Devdhari</option>
                        <option>Devpur</option>
                        <option>Dhodambe</option>
                        <option>Dwarka</option>
                        <option>Gangapur</option>
                        <option>Girnare</option>
                        <option>Harsul</option>
                        <option>Jategaon</option>
                        <option>Kadwa</option>
                        <option>Kalwan</option>
                        <option>Karanjkhed</option>
                        <option>Karanjwan</option>
                        <option>Kasarwadi</option>
                        <option>Kasbe Sukene</option>
                        <option>Kelzar</option>
                        <option>Khambale</option>
                        <option>Khamgaon</option>
                        <option>Kherwadi</option>
                        <option>Kotamgaon</option>
                        <option>Lasalgaon</option>
                        <option>Malegaon</option>
                        <option>Mangi</option>
                        <option>Manur</option>
                        <option>Mhasrul</option>
                        <option>Mohadi</option>
                        <option>Mulegaon</option>
                        <option>Mungse</option>
                        <option>Nagarsul</option>
                        <option>Nampur</option>
                        <option>Nandgaon</option>
                        <option>Nandur</option>
                        <option>Nandur Madhyameshwar</option>
                        <option>Nashik Road</option>
                        <option>Nimgaon</option>
                        <option>Niphad</option>
                        <option>Ozar</option>
                        <option>Pachegaon</option>
                        <option>Pale</option>
                        <option>Palkhed</option>
                        <option>Panchak</option>
                        <option>Pandavleni</option>
                        <option>Pathardi</option>
                        <option>Peth</option>
                        <option>Pimpalgaon Baswant</option>
                        <option>Pimpalgaon Dohe</option>
                        <option>Pimpalgaon Khamb</option>
                        <option>Pimpalgaon Rotha</option>
                        <option>Pimpri</option>
                        <option>Pimpri Kadu</option>
                        <option>Raipur</option>
                        <option>Saikheda</option>
                        <option>Saptashringi</option>
                        <option>Satpur</option>
                        <option>Saundane</option>
                        <option>Savargaon</option>
                        <option>Shedbol</option>
                        <option>Shirasgaon</option>
                        <option>Shirsathe</option>
                        <option>Sinnar</option>
                        <option>Sonaj</option>
                        <option>Talegaon</option>
                        <option>Tambepada</option>
                        <option>Tarsa</option>
                        <option>Thengode</option>
                        <option>Thergaon</option>
                        <option>Trimbak Road</option>
                        <option>Uchit</option>
                        <option>Umbarkhed</option>
                        <option>Umrane</option>
                        <option>Vadgaon</option>
                        <option>Vadner</option>
                        <option>Vani</option>
                        <option>Vinchur</option>
                        <option>Vithapur</option>
                        <option>Wadangali</option>
                        <option>Wadivarhe</option>
                        <option>Waghad</option>
                        <option>Wakad</option>
                        <option>Watane</option>
                        <option>Wavi</option>
                        <option>Yeola</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Area (Acres)</label>
                      <input
                        type="text"
                        name="area"
                        placeholder="e.g., 5.5"
                        value={formData.area}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Distance to Highway (KM)</label>
                      <input
                        type="text"
                        name="distanceToHighway"
                        placeholder="e.g., 2.4"
                        value={formData.distanceToHighway}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Land Characteristics</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Soil Type</label>
                      <select
                        name="soilType"
                        value={formData.soilType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>Select Soil Type</option>
                        <option>Black</option>
                        <option>Red</option>
                        <option>Black-Red</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Soil Quality Score (0-10)</label>
                      <input
                        type="number"
                        name="soilQuality"
                        placeholder="e.g., 7"
                        value={formData.soilQuality}
                        min={0}
                        max={10}
                        step={1}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Land Type</label>
                      <select
                        name="landType"
                        value={formData.landType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>Select Land Type</option>
                        <option>Agricultural Land</option>
                        <option>Commercial Land</option>
                        <option>Residential Land</option>
                        <option>NA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Is Irrigated?</label>
                      <select
                        name="irrigated"
                        value={formData.irrigated}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>Select</option>
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Water Source</label>
                      <select
                        name="waterSource"
                        value={formData.waterSource}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>Select Water Source</option>
                        <option>Borewell</option>
                        <option>Canal</option>
                        <option>River</option>
                        <option>Well</option>
                        <option>None</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Infrastructure & Connectivity</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Road Touch</label>
                      <select
                        name="roadTouch"
                        value={formData.roadTouch}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>Select</option>
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Road Width (Feet)</label>
                      <input
                        type="text"
                        name="roadWidth"
                        placeholder="e.g., 30"
                        value={formData.roadWidth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Legal & Ownership Status</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Number of Owners</label>
                      <input
                        type="number"
                        name="ownership"
                        placeholder="e.g., 1"
                        value={formData.ownership}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Unknown Registrations</label>
                      <input
                        type="text"
                        name="unknownRegistrations"
                        placeholder="e.g., 0"
                        value={formData.unknownRegistrations}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Takeover Risk</label>
                      <select
                        name="takeoverRisk"
                        value={formData.takeoverRisk}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>Select Risk Level</option>
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Market Data</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Avg Price Per Acre (Nearby)</label>
                      <input
                        type="text"
                        name="avgPrice"
                        placeholder="e.g., 450000"
                        value={formData.avgPrice}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                {currentStep === steps.length - 1 ? 'Analyze' : 'Next Step'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
