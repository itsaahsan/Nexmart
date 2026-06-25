import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import toast from 'react-hot-toast'
import { MapPin, Plus, Trash2, Star } from 'lucide-react'
import type { Address } from '../types/cart'

export default function Addresses() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'US',
  })

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await api.get('/api/addresses')
      return res.data as Address[]
    },
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/api/addresses', form)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      setShowForm(false)
      setForm({ full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'US' })
      toast.success('Address added')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Address deleted')
    },
  })

  const defaultMutation = useMutation({
    mutationFn: (id: string) => api.post(`/api/addresses/${id}/set-default`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Default address updated')
    },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">My Addresses</h1>
        <Button onClick={() => setShowForm(true)} size="sm" className="gap-1">
          <Plus size={16} /> Add Address
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className={`bg-white border rounded-xl p-4 ${addr.is_default ? 'border-accent' : 'border-border'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-accent" />
                  {addr.is_default && <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">Default</span>}
                </div>
                <div className="flex gap-2">
                  {!addr.is_default && (
                    <button onClick={() => defaultMutation.mutate(addr.id)} className="text-xs text-text-secondary hover:text-accent">
                      <Star size={14} />
                    </button>
                  )}
                  <button onClick={() => deleteMutation.mutate(addr.id)} className="text-text-secondary hover:text-error">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="font-medium text-sm mt-2">{addr.full_name}</p>
              <p className="text-sm text-text-secondary">{addr.address_line1}</p>
              {addr.address_line2 && <p className="text-sm text-text-secondary">{addr.address_line2}</p>}
              <p className="text-sm text-text-secondary">{addr.city}, {addr.state} {addr.postal_code}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-text-secondary">No saved addresses</p>
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Address">
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate() }} className="space-y-3">
          <Input label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <Input label="Address Line 1" value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} required />
          <Input label="Address Line 2" value={form.address_line2} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            <Input label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
          </div>
          <Input label="Postal Code" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} required />
          <Button type="submit" isLoading={createMutation.isPending} className="w-full">Save Address</Button>
        </form>
      </Modal>
    </div>
  )
}
