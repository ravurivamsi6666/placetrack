import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button, ErrorBanner, Field, inputClass } from '../components/ui'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setNotice('')

    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Please enter a valid email address.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')

    setBusy(true)
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
      } else {
        const { data, error } = await signUp(email, password)
        if (error) throw error
        // If email confirmation is enabled in Supabase, there is no session yet.
        if (!data.session) {
          setNotice('Account created! Check your email to confirm your address, then sign in.')
          setMode('signin')
        }
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">P</span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">PlaceTrack</h1>
          <p className="mt-1 text-sm text-slate-500">Your placement season, organized.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" noValidate>
          <h2 className="text-base font-semibold text-slate-900">
            {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
          </h2>
          {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}
          <ErrorBanner message={error} />
          <Field label="Email">
            <input type="email" autoComplete="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" />
          </Field>
          <Field label="Password">
            <input
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </Field>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            className="font-medium text-indigo-600 hover:text-indigo-700"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError('')
              setNotice('')
            }}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
