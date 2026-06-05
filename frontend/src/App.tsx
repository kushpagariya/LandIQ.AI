import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import FraudDetection from './pages/FraudDetection'
import PropertyAnalysis from './pages/PropertyAnalysis'
import Reports from './pages/Reports'
import Landing from './pages/Landing'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="flex-1 min-h-screen">
        <Navbar />
        <main className="p-6 lg:p-10">
          <Routes>
            <Route path="/" element={<Analytics />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/fraud" element={<FraudDetection />} />
            <Route path="/property" element={<PropertyAnalysis />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
