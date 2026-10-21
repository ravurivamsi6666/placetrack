export const STATUSES = ['Applied', 'Assessment', 'Interview', 'Offer', 'Rejected']

export const IN_PROGRESS_STATUSES = ['Applied', 'Assessment', 'Interview']

export const SUBJECTS = [
  'DSA',
  'SQL',
  'OOP',
  'DBMS',
  'Machine Learning',
  'Operating Systems',
  'Computer Networks',
  'Aptitude',
  'HR / Behavioral',
  'Other',
]

// Tailwind classes per status (badge) and hex color (chart)
export const STATUS_STYLES = {
  Applied: { badge: 'bg-sky-50 text-sky-700 ring-sky-600/20', color: '#0ea5e9' },
  Assessment: { badge: 'bg-amber-50 text-amber-700 ring-amber-600/20', color: '#f59e0b' },
  Interview: { badge: 'bg-violet-50 text-violet-700 ring-violet-600/20', color: '#8b5cf6' },
  Offer: { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', color: '#10b981' },
  Rejected: { badge: 'bg-rose-50 text-rose-700 ring-rose-600/20', color: '#f43f5e' },
}
