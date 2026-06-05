import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { MapPin, Shield, TrendingUp, AlertTriangle, BarChart3, FileText, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPin className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">LandIQ AI</span>
          </div>
          <div className="hidden md:flex gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
            <a href="#solutions" className="text-gray-600 hover:text-gray-900 font-medium">Solutions</a>
            <a href="#impact" className="text-gray-600 hover:text-gray-900 font-medium">Impact</a>
          </div>
          <button
            onClick={() => navigate('/property-analysis')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            Log In
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4"
            >
              ✨ Next-Gen Spatial Analytics
            </motion.div>
            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-4">
              AI-Powered Land <span className="text-blue-600">Valuation & Ownership</span> Intelligence
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Analyze agricultural properties using machine learning, ownership intelligence, legal risk assessment, and market valuation with institutional precision.
            </p>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/property-analysis')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
              >
                Analyze Property <ArrowRight className="w-5 h-5" />
              </motion.button>
              <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg font-semibold transition">
                📊 View Demo Report
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              ✓ Trusted by leading financial institutions & governments
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-400 to-teal-500 rounded-2xl p-8 text-white shadow-2xl"
          >
            <div className="space-y-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-sm opacity-80">EST. MARKET VALUE</p>
                <p className="text-3xl font-bold">$4.2M - $4.8M</p>
                <p className="text-sm opacity-80">High Confidence (94%)</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white bg-opacity-10 rounded-lg p-3">
                  <p className="text-xs opacity-80">Legal Risk</p>
                  <p className="font-semibold">✓ Clear</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-3">
                  <p className="text-xs opacity-80">Soil Quality</p>
                  <p className="font-semibold">Premium</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Unprecedented Analytical Depth</h2>
            <p className="text-xl text-gray-600">
              Our proprietary models combine geospatial data, public records, and machine learning to deliver institutional-grade intelligence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: 'Fair Price Prediction',
                desc: 'Algorithmic valuation models utilizing historical sales, zoning laws, and micro-market trends to establish definitive baseline pricing.'
              },
              {
                icon: Shield,
                title: 'Ownership Verification',
                desc: 'Automated cross-referencing of municipal registries and title deeds to ensure clear, uncontested ownership trails.'
              },
              {
                icon: AlertTriangle,
                title: 'Risk Detection',
                desc: 'Identification of encumbrances, environmental hazards, pending litigations, and regulatory zoning risks before acquisition.'
              },
              {
                icon: MapPin,
                title: 'Fraud Detection',
                desc: 'Advanced pattern recognition to flag synthetic identities, shell company ownership structures, and irregular transaction velocities.'
              },
              {
                icon: BarChart3,
                title: 'Market Analytics',
                desc: 'Macro-level demographic shifts, infrastructure development overlays, and crop yield forecasting for agricultural zones.'
              },
              {
                icon: FileText,
                title: 'Automated Reports',
                desc: 'Generate comprehensive, boardroom-ready PDF dossiers combining satellite imagery, financial models, and legal summaries instantly.'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="border-l-4 border-blue-600 bg-blue-50 p-6 rounded-lg hover:shadow-lg transition"
              >
                <feature.icon className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="solutions" className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center px-4"
        >
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Land Valuation Process?</h2>
          <p className="text-lg opacity-90 mb-8">
            Leverage AI-powered insights for faster, more accurate property assessments.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/property-analysis')}
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-bold transition"
          >
            Start Your Analysis Now
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer id="impact" className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 LandIQ AI. Advanced land valuation powered by artificial intelligence.</p>
        </div>
      </footer>
    </div>
  )
}
