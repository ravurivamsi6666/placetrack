import { STATUSES, STATUS_STYLES } from '../lib/constants'

// Hand-rolled SVG donut chart (no chart library needed).
export default function StatusChart({ applications }) {
  const counts = STATUSES.map((status) => ({
    status,
    count: applications.filter((a) => a.status === status).length,
  }))
  const total = applications.length

  const radius = 52
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative h-40 w-40 shrink-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90" role="img" aria-label="Application status distribution">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="18" />
          {total > 0 &&
            counts
              .filter((c) => c.count > 0)
              .map((c) => {
                const length = (c.count / total) * circumference
                const circle = (
                  <circle
                    key={c.status}
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke={STATUS_STYLES[c.status].color}
                    strokeWidth="18"
                    strokeDasharray={`${length} ${circumference - length}`}
                    strokeDashoffset={-offset}
                  />
                )
                offset += length
                return circle
              })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-slate-900">{total}</span>
          <span className="text-xs text-slate-500">total</span>
        </div>
      </div>

      <ul className="w-full space-y-2 text-sm">
        {counts.map((c) => (
          <li key={c.status} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_STYLES[c.status].color }} />
              {c.status}
            </span>
            <span className="font-medium text-slate-900">
              {c.count}
              <span className="ml-1.5 text-xs font-normal text-slate-400">
                {total ? Math.round((c.count / total) * 100) : 0}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
