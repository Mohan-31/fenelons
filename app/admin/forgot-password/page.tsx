'use client'
import { useState } from 'react'
import { ShieldQuestion, Lock, CheckCircle2 } from 'lucide-react'

export default function ForgotPassword() {
  const [username, setUsername] = useState('') // Added username field
  const [answer, setAnswer] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [step, setStep] = useState(1) 
  const [error, setError] = useState('')

  // Step 1: Just local UI transition (or you can verify against DB here)
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    // We move to step 2 to collect the new password, then send all at once
    setStep(2)
  }

  // Step 2: Send EVERYTHING to the /api/admin/forgot-password route
  async function updatePassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/admin/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username, 
        securityAnswer: answer, 
        newPassword 
      }),
    })

    if (res.ok) {
      setStep(3)
    } else {
      const data = await res.json()
      setError(data.error || "Reset failed. Check your answer.")
      setStep(1) // Send them back to try the answer again
    }
  }

  if (step === 3) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
      <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
        <CheckCircle2 className="mx-auto text-green-500 mb-4" size={60}/>
        <h1 className="text-2xl font-black text-gray-900 uppercase italic">Password Updated!</h1>
        <p className="text-gray-500 mb-6">The database has been updated for the rush.</p>
        <button 
          onClick={() => window.location.href='/admin/login'} 
          className="w-full bg-[#8B0000] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-800 transition-colors"
        >
          Login Now
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] p-4 font-sans">
      <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md border border-gray-100">
        <div className="mb-8 text-center">
          <div className="bg-red-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Lock className="text-[#8B0000]" size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 uppercase italic leading-tight">
            {step === 1 ? 'Identity Check' : 'Set New Password'}
          </h1>
        </div>
        
        {step === 1 ? (
          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Username</label>
              <input 
                type="text" 
                placeholder="Admin username"
                className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-[#8B0000] font-bold" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 flex items-center gap-1">
                <ShieldQuestion size={12}/> Security Question
              </label>
              <p className="text-sm font-bold text-gray-700 ml-2 mb-2 italic underline decoration-[#8B0000]">What is your favorite teacher's name?</p>
              <input 
                type="text" 
                className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-[#8B0000] font-bold" 
                value={answer} 
                onChange={e => setAnswer(e.target.value)} 
                required 
              />
            </div>
            {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">{error}</p>}
            <button className="w-full bg-[#8B0000] text-white py-5 rounded-[24px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-red-900/20">
              Continue
            </button>
          </form>
        ) : (
          <form onSubmit={updatePassword} className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Secure Password</label>
              <input 
                type="password" 
                placeholder="Min. 8 characters" 
                className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-[#8B0000] font-bold" 
                onChange={e => setNewPassword(e.target.value)} 
                required 
              />
            </div>
            <button className="w-full bg-[#8B0000] text-white py-5 rounded-[24px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-red-900/20">
              Update Database
            </button>
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="w-full text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-gray-600"
            >
              Back to Security Check
            </button>
          </form>
        )}
      </div>
    </div>
  )
}