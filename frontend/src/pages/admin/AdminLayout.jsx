import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Map, CalendarCheck, MessageSquare,
  Mail, LogOut, Menu, X, ChevronRight, Globe
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/tours', label: 'Tours', icon: Map },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/admin/testimonials', label: 'Testimonials', icon: MessageSquare },
  { to: '/admin/inquiries', label: 'Inquiries', icon: Mail },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-green-950 text-white">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center font-serif font-bold text-green-950 text-lg">K</div>
        <div>
          <div className="font-serif font-semibold text-sm leading-tight">Karibu Safari</div>
          <div className="text-[10px] text-amber-400 font-sans tracking-widest uppercase">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl font-sans text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500 text-green-950'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-6 space-y-1 border-t border-white/10 pt-4">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-sans text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all"
        >
          <Globe size={17} /> View Site
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-sans text-sm text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all"
        >
          <LogOut size={17} /> Logout
        </button>
        <div className="flex items-center gap-3 px-4 pt-3 mt-2 border-t border-white/10">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-sans text-xs font-bold text-green-950">
            {user?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div>
            <div className="font-sans text-xs font-semibold text-white">{user?.name ?? 'Admin'}</div>
            <div className="font-sans text-[10px] text-white/50">{user?.email}</div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 h-full">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 flex-shrink-0">
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} className="text-green-950" />
          </button>
          <div className="hidden lg:flex items-center gap-2 text-sm text-gray-400 font-sans">
            <ChevronRight size={14} />
            <span>Admin Panel</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-sans text-xs font-bold text-green-950">
              {user?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
