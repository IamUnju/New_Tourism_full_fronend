import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, X, Check, Search } from 'lucide-react'
import { toursApi } from '../../api/tours'

const EMPTY_FORM = {
  title: '', slug: '', subtitle: '', description: '', category: '',
  location: '', duration: '', group_size: '', price: '', rating: '',
  is_active: true, is_featured: false,
}

function TourFormModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...form,
      price: parseFloat(form.price) || 0,
      rating: parseFloat(form.rating) || 0,
    })
  }

  const fields = [
    { key: 'title', label: 'Title', span: 2 },
    { key: 'slug', label: 'Slug (URL)' },
    { key: 'category', label: 'Category' },
    { key: 'location', label: 'Location' },
    { key: 'subtitle', label: 'Subtitle', span: 2 },
    { key: 'duration', label: 'Duration (e.g. 7 Days)' },
    { key: 'group_size', label: 'Group Size' },
    { key: 'price', label: 'Price (USD)', type: 'number' },
    { key: 'rating', label: 'Rating (0-5)', type: 'number' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-serif text-xl font-bold text-green-950">
            {initial ? 'Edit Tour' : 'Add New Tour'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {fields.map(({ key, label, span, type }) => (
              <div key={key} className={span === 2 ? 'col-span-2' : ''}>
                <label className="block font-sans text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">{label}</label>
                <input
                  type={type ?? 'text'}
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 font-sans text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block font-sans text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 font-sans text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              />
            </div>
            <div className="flex items-center gap-6">
              {[['is_active', 'Active'], ['is_featured', 'Featured']].map(([k, l]) => (
                <label key={k} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!form[k]} onChange={(e) => set(k, e.target.checked)}
                    className="w-4 h-4 accent-amber-500" />
                  <span className="font-sans text-sm text-gray-700">{l}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 font-sans text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-green-950 text-white font-sans text-sm font-semibold hover:bg-amber-500 transition-colors">
              {initial ? 'Save Changes' : 'Create Tour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminTours() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // null | 'create' | tour object

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tours', search],
    queryFn: () => toursApi.list({ q: search, per_page: 50 }),
  })

  const tours = data?.items ?? []

  const createMutation = useMutation({
    mutationFn: toursApi.create,
    onSuccess: () => { qc.invalidateQueries(['admin-tours']); setModal(null) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => toursApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['admin-tours']); setModal(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: toursApi.delete,
    onSuccess: () => qc.invalidateQueries(['admin-tours']),
  })

  const handleSave = (formData) => {
    if (modal && modal !== 'create') {
      updateMutation.mutate({ id: modal.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-sans text-sm text-gray-400">{data?.total ?? 0} tours total</p>
        <button onClick={() => setModal('create')}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-sans text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm">
          <Plus size={15} /> Add Tour
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" placeholder="Search tours…"
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                {['Tour', 'Category', 'Location', 'Price', 'Rating', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tours.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 font-sans text-sm text-gray-400">No tours found</td></tr>
              ) : tours.map((tour) => (
                <tr key={tour.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-sans text-sm font-semibold text-gray-900">{tour.title}</div>
                    <div className="font-sans text-xs text-gray-400">{tour.duration}</div>
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-gray-600">{tour.category}</td>
                  <td className="px-4 py-3 font-sans text-sm text-gray-600">{tour.location}</td>
                  <td className="px-4 py-3 font-sans text-sm font-semibold text-gray-900">${(tour.price ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 font-sans text-sm text-gray-600">{tour.rating ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {tour.is_active && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-semibold">Active</span>}
                      {tour.is_featured && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-semibold">Featured</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => setModal(tour)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-gray-400 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => deleteMutation.mutate(tour.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <TourFormModal
          initial={modal !== 'create' ? modal : null}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
