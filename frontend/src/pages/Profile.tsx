import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { authApi } from '../api/auth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user } = useAuth()
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await authApi.updateMe({ full_name: fullName, phone })
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setSaving(true)
    try {
      await authApi.changePassword({ current_password: currentPassword, new_password: newPassword })
      toast.success('Password changed')
      setCurrentPassword('')
      setNewPassword('')
    } catch {
      toast.error('Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Profile Settings</h1>

      <form onSubmit={handleUpdateProfile} className="bg-white border border-border rounded-xl p-6 space-y-4 mb-8">
        <h2 className="text-lg font-semibold">Personal Information</h2>
        <Input label="Email" value={user?.email || ''} disabled />
        <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Button type="submit" isLoading={saving}>Save Changes</Button>
      </form>

      <form onSubmit={handleChangePassword} className="bg-white border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Change Password</h2>
        <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <Button type="submit" isLoading={saving} variant="secondary">Change Password</Button>
      </form>
    </div>
  )
}
