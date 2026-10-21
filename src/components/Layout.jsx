import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/', label: 'Dashboard', end: true, icon: 'M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10' },
  { to: '/applications', label: 'Applications', icon: 'M9 5h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4m0 0a2 2 0 1 1 4 0m-4 0h4M8 12h8M8 16h5' },
  { to: '/prep', label: 'Prep Tasks', icon: 'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
  { to: '/deadlines', label: 'Deadlines', icon: 'M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z' },
]

function NavIcon({ d }) {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

function SidebarContent({ onNavigate }) {
  const { user, signOut } = useAuth()
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">P</span>
        <span className="text-lg font-semibold tracking-tight text-slate-900">PlaceTrack</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <NavIcon d={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <p className="truncate text-xs text-slate-500" title={user?.email}>{user?.email}</p>
        <button
          onClick={signOut}
          className="mt-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

export default function Layout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-full bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-slate-200 bg-white lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <button onClick={() => setOpen(true)} className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100" aria-label="Open menu">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6"><path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <span className="font-semibold text-slate-900">PlaceTrack</span>
      </header>

      <main className="lg:pl-60">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
