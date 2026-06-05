import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import PropertyAnalysis from './pages/PropertyAnalysis'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import FraudDetection from './pages/FraudDetection'
import Reports from './pages/Reports'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/property-analysis" element={<PropertyAnalysis />} />
        <Route path="/dashboard/:propertyId?" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/fraud-detection/:propertyId?" element={<FraudDetection />} />
        <Route path="/fraud-detection" element={<FraudDetection />} />
        <Route path="/reports/:propertyId?" element={<Reports />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Router>
  )
}

export default App
