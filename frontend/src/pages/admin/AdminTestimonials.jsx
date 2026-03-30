import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, Trash2, Star } from 'lucide-react'
import { testimonialsApi } from '../../api/testimonials'

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={12} className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  )
}

export default function AdminTestimonials() {
  const qc = useQueryClient()

  const { data: pending, isLoading: loadingPending } = useQuery({
    queryKey: ['admin-testimonials-pending'],
    queryFn: () => testimonialsApi.list({ approved: false, per_page: 50 }),
  })

  const { data: approved, isLoading: loadingApproved } = useQuery({
    queryKey: ['admin-testimonials-approved'],
    queryFn: () => testimonialsApi.list({ approved: true, per_page: 50 }),
  })

  const approveMutation = useMutation({
    mutationFn: testimonialsApi.approve,
    onSuccess: () => {
      qc.invalidateQueries(['admin-testimonials-pending'])
      qc.invalidateQueries(['admin-testimonials-approved'])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: testimonialsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries(['admin-testimonials-pending'])
      qc.invalidateQueries(['admin-testimonials-approved'])
    },
  })

  const pendingList = Array.isArray(pending) ? pending : pending?.items ?? []
  const approvedList = Array.isArray(approved) ? approved : approved?.items ?? []

  const TestimonialCard = ({ t, showApprove }) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center font-sans text-sm font-bold text-amber-700">
            {t.author_name?.[0]?.toUpperCase() ?? 'G'}
          </div>
          <div>
            <div className="font-sans text-sm font-semibold text-green-950">{t.author_name}</div>
            <div className="font-sans text-xs text-gray-400">{t.author_location}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={t.rating} />
          <span className="font-sans text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      <p className="font-sans text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3">"{t.text}"</p>
      {t.tour_title && (
        <div className="font-sans text-xs text-amber-600 mb-3">📍 {t.tour_title}</div>
      )}
      <div className="flex gap-2">
        {showApprove && (
          <button
            onClick={() => approveMutation.mutate(t.id)}
            disabled={approveMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl font-sans text-xs font-semibold transition-colors"
          >
            <CheckCircle size={13} /> Approve
          </button>
        )}
        <button
          onClick={() => deleteMutation.mutate(t.id)}
          disabled={deleteMutation.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl font-sans text-xs font-semibold transition-colors"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-green-950">Testimonials</h1>
        <p className="font-sans text-sm text-gray-500 mt-1">Moderate guest reviews</p>
      </div>

      {/* Pending */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-serif text-lg font-semibold text-green-950">Pending Approval</h2>
          {pendingList.length > 0 && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-sans text-xs font-bold">{pendingList.length}</span>
          )}
        </div>
        {loadingPending ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pendingList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
            <p className="font-sans text-sm text-gray-400">No pending reviews — all caught up!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pendingList.map((t) => <TestimonialCard key={t.id} t={t} showApprove />)}
          </div>
        )}
      </div>

      {/* Approved */}
      <div>
        <h2 className="font-serif text-lg font-semibold text-green-950 mb-4">Approved ({approvedList.length})</h2>
        {loadingApproved ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {approvedList.map((t) => <TestimonialCard key={t.id} t={t} showApprove={false} />)}
          </div>
        )}
      </div>
    </div>
  )
}
