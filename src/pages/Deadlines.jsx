import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { fetchApplications, fetchTasks } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import { formatDate, urgency } from '../lib/dates'
import { DeadlineBadge, EmptyState, ErrorBanner, PageHeader, Spinner } from '../components/ui'

async function loadDeadlines() {
  const [applications, tasks] = await Promise.all([fetchApplications(), fetchTasks()])
  return { applications, tasks }
}

const KIND_STYLES = {
  'Application deadline': 'bg-sky-50 text-sky-700 ring-sky-600/20',
  Interview: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  'Prep task': 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
}

const ROW_STYLES = {
  overdue: 'border-l-4 border-l-rose-500 bg-rose-50/40',
  soon: 'border-l-4 border-l-amber-400 bg-amber-50/40',
  upcoming: 'border-l-4 border-l-transparent',
}

export default function Deadlines() {
  const { data, loading, error, reload } = useAsync(loadDeadlines)

  const items = useMemo(() => {
    if (!data) return []
    const list = []

    for (const a of data.applications) {
      // Finished applications don't need chasing
      if (a.status === 'Offer' || a.status === 'Rejected') continue
      if (a.deadline) {
        list.push({
          key: `d-${a.id}`,
          date: a.deadline,
          kind: 'Application deadline',
          title: a.company_name,
          detail: a.job_role,
          link: '/applications',
        })
      }
      if (a.interview_date) {
        list.push({
          key: `i-${a.id}`,
          date: a.interview_date,
          kind: 'Interview',
          title: a.company_name,
          detail: a.job_role,
          link: '/applications',
        })
      }
    }

    for (const t of data.tasks) {
      if (t.is_completed || !t.due_date) continue
      list.push({
        key: `t-${t.id}`,
        date: t.due_date,
        kind: 'Prep task',
        title: t.title,
        detail: t.subject,
        link: '/prep',
      })
    }

    return list.sort((a, b) => a.date.localeCompare(b.date))
  }, [data])

  const overdueCount = items.filter((i) => urgency(i.date) === 'overdue').length
  const soonCount = items.filter((i) => urgency(i.date) === 'soon').length

  return (
    <>
      <PageHeader title="Upcoming deadlines" subtitle="Application deadlines, interviews and prep tasks in date order." />

      {loading && <Spinner />}
      {error && <ErrorBanner message={error} onRetry={reload} />}

      {data && (
        <div className="space-y-4">
          {(overdueCount > 0 || soonCount > 0) && (
            <div className="flex flex-wrap gap-3 text-sm">
              {overdueCount > 0 && (
                <span className="rounded-lg bg-rose-50 px-3 py-1.5 font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20">
                  {overdueCount} overdue
                </span>
              )}
              {soonCount > 0 && (
                <span className="rounded-lg bg-amber-50 px-3 py-1.5 font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                  {soonCount} due within 3 days
                </span>
              )}
            </div>
          )}

          {items.length === 0 ? (
            <EmptyState
              title="No deadlines to show"
              message="Add a deadline or interview date to an application, or a due date to a prep task, and it will appear here."
            />
          ) : (
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {items.map((item) => (
                <li key={item.key} className={ROW_STYLES[urgency(item.date)]}>
                  <Link to={item.link} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 hover:bg-slate-50/70">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${KIND_STYLES[item.kind]}`}>{item.kind}</span>
                        <span className="truncate text-sm font-medium text-slate-900">{item.title}</span>
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-500">{item.detail} · {formatDate(item.date)}</p>
                    </div>
                    <DeadlineBadge date={item.date} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  )
}
