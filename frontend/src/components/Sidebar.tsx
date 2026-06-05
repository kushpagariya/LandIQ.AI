import { useNavigate } from 'react-router-dom'
import { MapPin, BarChart3, Shield, FileText, Settings, HelpCircle, LogOut, Plus } from 'lucide-react'

interface SidebarProps {
  activePage: string
}

export default function Sidebar({ activePage }: SidebarProps) {
  const navigate = useNavigate()

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
    { icon: MapPin, label: 'Property Analysis', path: '/property-analysis' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Shield, label: 'Fraud Detection', path: '/fraud-detection' },
    { icon: FileText, label: 'Reports', path: '/reports' },
  ]

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900">LandIQ AI</p>
            <p className="text-xs text-gray-500">Geospatial Intel</p>
          </div>
        </div>
      </div>

      {/* New Analysis Button */}
      <div className="p-4">
        <button
          onClick={() => navigate('/property-analysis')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-5 h-5" />
          New Analysis
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activePage === item.path.slice(1) || activePage === item.path.slice(1).replace('-', '')
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom Menu */}
      <div className="border-t border-gray-200 p-4 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Support</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  )
}
