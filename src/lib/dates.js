// Dates from Postgres `date` columns arrive as "YYYY-MM-DD" strings.
// Parse them as LOCAL dates to avoid off-by-one-day timezone bugs.

export function parseDate(value) {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayLocal() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function toInputDate(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Whole days from today until the date (negative = overdue)
export function daysUntil(value) {
  const target = parseDate(value)
  if (!target) return null
  return Math.round((target - todayLocal()) / 86_400_000)
}

export function formatDate(value) {
  const date = parseDate(value)
  if (!date) return '—'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// 'overdue' | 'soon' (within 3 days) | 'upcoming' | null
export function urgency(value) {
  const days = daysUntil(value)
  if (days === null) return null
  if (days < 0) return 'overdue'
  if (days <= 3) return 'soon'
  return 'upcoming'
}

export function relativeLabel(value) {
  const days = daysUntil(value)
  if (days === null) return ''
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return 'Yesterday'
  if (days < 0) return `${Math.abs(days)} days overdue`
  return `In ${days} days`
}

export const URGENCY_STYLES = {
  overdue: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  soon: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  upcoming: 'bg-slate-100 text-slate-600 ring-slate-500/20',
}
