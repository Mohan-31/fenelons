'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, User, Lock, HelpCircle } from 'lucide-react'

export default function AdminSetup() {
  const [username, setUsername] = useState('') // Added username
  const [password, setPassword] = useState('')
  const [securityAnswer, setSecurityAnswer] = useState('') // Matches backend key
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          password, 
          securityAnswer 
        }),
      })

      if (res.ok) {
        router.push('/admin/login')
      } else {
        const data = await res.json()
        alert(data.error || "Setup failed")
      }
    } catch (err) {
      alert("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] p-4">
      <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-red-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-[#8B0000]" size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 uppercase italic leading-tight">System Initialization</h1>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-2">Create Master Admin</p>
        </div>

        <form onSubmit={handleSetup} className="space-y-5">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 flex items-center gap-1">
              <User size={12}/> Admin Username
            </label>
            <input 
              type="text" 
              className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-[#8B0000] font-bold" 
              onChange={e => setUsername(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 flex items-center gap-1">
              <Lock size={12}/> Master Password
            </label>
            <input 
              type="password" 
              className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-[#8B0000] font-bold" 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>

          <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
            <label className="text-[10px] font-black uppercase text-[#8B0000] tracking-widest flex items-center gap-1 mb-2">
              <HelpCircle size={12}/> Recovery Question
            </label>
            <p className="text-xs font-bold text-gray-700 mb-3 italic">What is your favorite teacher's name?</p>
            <input 
              type="text" 
              placeholder="Your Answer"
              className="w-full p-3 bg-white border-0 rounded-xl outline-[#8B0000] font-bold text-sm" 
              onChange={e => setSecurityAnswer(e.target.value)} 
              required 
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-[#8B0000] text-white py-5 rounded-[24px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-red-900/20 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Initialize System'}
          </button>
        </form>
      </div>
    </div>
  )
}