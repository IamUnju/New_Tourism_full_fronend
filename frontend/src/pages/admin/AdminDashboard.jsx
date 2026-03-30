import { useQuery } from '@tanstack/react-query'
import { Users, Map, CalendarCheck, DollarSign, Clock, CheckCircle, MessageSquare, Mail } from 'lucide-react'
import { adminApi } from '../../api/admin'

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <div className="font-sans text-2xl font-bold text-green-950">{value ?? '—'}</div>
        <div className="font-sans text-sm font-medium text-gray-700 mt-0.5">{label}</div>
        {sub && <div className="font-sans text-xs text-gray-400 mt-1">{sub}</div>}
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
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const cards = [
    { icon: Users, label: 'Total Users', value: stats?.total_users, color: 'bg-blue-50 text-blue-600' },
    { icon: Map, label: 'Active Tours', value: stats?.active_tours, sub: `${stats?.total_tours} total`, color: 'bg-amber-50 text-amber-600' },
    { icon: CalendarCheck, label: 'Total Bookings', value: stats?.total_bookings, color: 'bg-green-50 text-green-600' },
    { icon: DollarSign, label: 'Total Revenue', value: `$${(stats?.total_revenue ?? 0).toLocaleString()}`, color: 'bg-purple-50 text-purple-600' },
    { icon: Clock, label: 'Pending Bookings', value: stats?.pending_bookings, color: 'bg-orange-50 text-orange-600' },
    { icon: CheckCircle, label: 'Confirmed Bookings', value: stats?.confirmed_bookings, color: 'bg-teal-50 text-teal-600' },
    { icon: MessageSquare, label: 'Pending Testimonials', value: stats?.pending_testimonials, color: 'bg-pink-50 text-pink-600' },
    { icon: Mail, label: 'Pending Inquiries', value: stats?.pending_inquiries, color: 'bg-indigo-50 text-indigo-600' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-green-950">Dashboard</h1>
        <p className="font-sans text-sm text-gray-500 mt-1">Welcome back — here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Quick actions */}
      <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-green-950 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Add New Tour', href: '/admin/tours' },
            { label: 'View Bookings', href: '/admin/bookings' },
            { label: 'Moderate Reviews', href: '/admin/testimonials' },
            { label: 'Check Inquiries', href: '/admin/inquiries' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="px-4 py-2 bg-green-950 text-white font-sans text-sm font-medium rounded-xl hover:bg-amber-500 transition-colors duration-200"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
