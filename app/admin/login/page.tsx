'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, User, ChevronRight } from 'lucide-react'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        setError('Invalid credentials')
        setLoading(false)
        return
      }

      router.push('/admin/dashboard')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#8B0000] tracking-tight">Admin Portal</h1>
          <p className="text-gray-500 mt-2 text-sm">Fenelon's Butcher Shop Management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username Field */}
          <div className="relative">
            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              placeholder="Username"
              className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B0000] focus:border-transparent outline-none transition-all text-gray-700"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-10 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B0000] focus:border-transparent outline-none transition-all text-gray-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-[#8B0000] transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8B0000] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#660000] active:scale-[0.98] transition-all shadow-lg shadow-red-900/20 disabled:opacity-70"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-50 flex flex-col gap-3 items-center">
          <button 
            onClick={() => router.push('/admin/forgot-password')}
            className="group text-sm font-medium text-gray-500 hover:text-[#8B0000] transition-colors flex items-center gap-1"
          >
            Forgot your password? 
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={() => router.push('/')}
            className="text-xs text-gray-400 hover:underline"
          >
            Back to Public Site
          </button>
        </div>
      </div>
    </div>
  )
}