import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { isConfigured } from './lib/supabase'
import Layout from './components/Layout'
import { Spinner } from './components/ui'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Applications from './pages/Applications'
import Prep from './pages/Prep'
import Deadlines from './pages/Deadlines'

function SetupNotice() {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <h1 className="text-lg font-semibold">Supabase isn't configured yet</h1>
        <p className="mt-2">
          Copy <code className="rounded bg-amber-100 px-1">.env.example</code> to{' '}
          <code className="rounded bg-amber-100 px-1">.env</code>, add your project URL and anon key,
          then restart the dev server. See the README for step-by-step instructions.
        </p>
      </div>
    </div>
  )
}

function ProtectedRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Login />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="applications" element={<Applications />} />
        <Route path="prep" element={<Prep />} />
        <Route path="deadlines" element={<Deadlines />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  if (!isConfigured) return <SetupNotice />

  return (
    <AuthProvider>
      <BrowserRouter>
        <ProtectedRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
