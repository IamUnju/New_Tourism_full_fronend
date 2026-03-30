import { useQuery } from '@tanstack/react-query'
import { Users, Map, CalendarCheck, DollarSign, Clock, CheckCircle, MessageSquare, Mail, TrendingUp, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../api/admin'

function MiniChart({ color, points }) {
  const w = 120, h = 48
  const max = Math.max(...points, 1)
  const coords = points.map((v, i) => `${(i / (points.length - 1)) * w},${h - (v / max) * (h - 8)}`)
  const path = `M${coords.join(' L')}`
  const fill = `M${coords[0]} L${coords.join(' L')} L${w},${h} L0,${h} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`g-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#g-${color})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChartCard({ label, value, badge, badgeColor, chartColor, points, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
          <div className="font-sans text-3xl font-bold text-gray-900">{value ?? 0}</div>
          {sub && <div className="font-sans text-xs text-gray-400 mt-0.5">{sub}</div>}
        </div>
        {badge && (
          <span className={`text-[10px] font-bold font-sans px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
        )}
      </div>
      <div className="mt-auto">
        <MiniChart color={chartColor} points={points} />
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div>
        <div className="font-sans text-xs text-gray-400 mb-0.5">{label}</div>
        <div className="font-sans text-2xl font-bold text-gray-900">{value ?? 0}</div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.stats,
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const s = stats ?? {}

  return (
    <div className="space-y-6">
      <div>
        <p className="font-sans text-sm text-gray-400">Welcome back — here's your system overview.</p>
      </div>

      {/* Top chart cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ChartCard
          label="Total Revenue"
          value={`$${(s.total_revenue ?? 0).toLocaleString()}`}
          badge="This month"
          badgeColor="bg-green-100 text-green-700"
          chartColor="#16a34a"
          points={[2, 5, 3, 8, 6, 10, s.total_revenue ? 12 : 0]}
          sub="All confirmed bookings"
        />
        <ChartCard
          label="Total Users"
          value={s.total_users}
          badge="All users"
          badgeColor="bg-blue-100 text-blue-700"
          chartColor="#3b82f6"
          points={[1, 3, 2, 5, 4, 7, s.total_users ?? 5]}
          sub="Registered accounts"
        />
        <ChartCard
          label="Active Tours"
          value={s.active_tours}
          badge="Enabled"
          badgeColor="bg-amber-100 text-amber-700"
          chartColor="#f59e0b"
          points={[3, 4, 3, 5, 4, 6, s.active_tours ?? 4]}
          sub={`${s.total_tours ?? 0} total tours`}
        />
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard icon={Users}        label="Total Users"           value={s.total_users}           iconBg="bg-blue-50"   iconColor="text-blue-600" />
        <StatCard icon={Map}          label="Total Tours"           value={s.total_tours}           iconBg="bg-amber-50"  iconColor="text-amber-600" />
        <StatCard icon={CalendarCheck} label="Total Bookings"       value={s.total_bookings}        iconBg="bg-green-50"  iconColor="text-green-600" />
        <StatCard icon={Clock}        label="Pending Bookings"      value={s.pending_bookings}      iconBg="bg-orange-50" iconColor="text-orange-500" />
        <StatCard icon={DollarSign}   label="Confirmed Bookings"    value={s.confirmed_bookings}    iconBg="bg-teal-50"   iconColor="text-teal-600" />
        <StatCard icon={Mail}         label="Pending Inquiries"     value={s.pending_inquiries}     iconBg="bg-indigo-50" iconColor="text-indigo-600" />
        <StatCard icon={MessageSquare} label="Pending Testimonials" value={s.pending_testimonials}  iconBg="bg-pink-50"   iconColor="text-pink-600" />
        <StatCard icon={TrendingUp}   label="Trip Plans"            value={s.pending_trip_plans}    iconBg="bg-purple-50" iconColor="text-purple-600" />
        <StatCard icon={CheckCircle}  label="Active Tours"          value={s.active_tours}          iconBg="bg-green-50"  iconColor="text-green-600" />
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-sans text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add New Tour', to: '/admin/tours', color: 'bg-green-600 hover:bg-green-700' },
            { label: 'View Bookings', to: '/admin/bookings', color: 'bg-blue-600 hover:bg-blue-700' },
            { label: 'Moderate Reviews', to: '/admin/testimonials', color: 'bg-pink-600 hover:bg-pink-700' },
            { label: 'Check Inquiries', to: '/admin/inquiries', color: 'bg-indigo-600 hover:bg-indigo-700' },
          ].map(({ label, to, color }) => (
            <Link
              key={label}
              to={to}
              className={`flex items-center justify-between px-4 py-3 ${color} text-white font-sans text-sm font-medium rounded-xl transition-colors duration-200`}
            >
              {label} <ArrowRight size={14} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
