import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoggingIn, loginError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login({ email, password })
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch {
      toast.error('Invalid email or password')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-text-secondary mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-border rounded-xl p-6 space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
          {loginError && <p className="text-sm text-error">Invalid email or password</p>}
          <Button type="submit" isLoading={isLoggingIn} className="w-full" size="lg">Sign In</Button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent hover:text-accent-hover font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
