import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { register, isRegistering } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    try {
      await register({ email, password, full_name: fullName })
      toast.success('Account created!')
      navigate('/')
    } catch {
      toast.error('Registration failed')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
          <p className="text-text-secondary mt-2">Join Nexmart today</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-border rounded-xl p-6 space-y-4">
          <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required />
          <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" required />
          <Button type="submit" isLoading={isRegistering} className="w-full" size="lg">Create Account</Button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-accent-hover font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
