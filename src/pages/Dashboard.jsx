import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { fetchApplications, fetchTasks } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import { IN_PROGRESS_STATUSES } from '../lib/constants'
import { daysUntil, formatDate } from '../lib/dates'
import StatusChart from '../components/StatusChart'
import { DeadlineBadge, ErrorBanner, PageHeader, Spinner, StatCard } from '../components/ui'

async function loadDashboard() {
  const [applications, tasks] = await Promise.all([fetchApplications(), fetchTasks()])
  return { applications, tasks }
}

export default function Dashboard() {
  const { data, loading, error, reload } = useAsync(loadDashboard)

  const stats = useMemo(() => {
    if (!data) return null
    const { applications, tasks } = data
    const upcoming = applications
      .filter((a) => a.deadline && daysUntil(a.deadline) >= 0 && a.status !== 'Rejected' && a.status !== 'Offer')
      .sort((a, b) => a.deadline.localeCompare(b.deadline))
      .slice(0, 5)
    return {
      total: applications.length,
      inProgress: applications.filter((a) => IN_PROGRESS_STATUSES.includes(a.status)).length,
      interviews: applications.filter((a) => a.status === 'Interview').length,
      offers: applications.filter((a) => a.status === 'Offer').length,
      upcoming,
      pendingTasks: tasks.filter((t) => !t.is_completed).length,
      doneTasks: tasks.filter((t) => t.is_completed).length,
    }
  }, [data])

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Your placement progress at a glance." />

      {loading && <Spinner />}
      {error && <ErrorBanner message={error} onRetry={reload} />}

      {stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total applications" value={stats.total} />
            <StatCard label="In progress" value={stats.inProgress} hint="Applied, Assessment, Interview" accent="text-sky-600" />
            <StatCard label="Interviews" value={stats.interviews} accent="text-violet-600" />
            <StatCard label="Offers" value={stats.offers} accent="text-emerald-600" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-slate-900">Status distribution</h2>
              {stats.total === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  No applications yet.{' '}
                  <Link to="/applications" className="font-medium text-indigo-600 hover:text-indigo-700">Add your first one</Link>
                </p>
              ) : (
                <StatusChart applications={data.applications} />
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Upcoming deadlines</h2>
                <Link to="/deadlines" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View all</Link>
              </div>
              {stats.upcoming.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No upcoming deadlines. You're all caught up.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {stats.upcoming.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{a.company_name}</p>
                        <p className="truncate text-xs text-slate-500">{a.job_role} · {formatDate(a.deadline)}</p>
                      </div>
                      <DeadlineBadge date={a.deadline} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Preparation</h2>
              <Link to="/prep" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Open tracker</Link>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{stats.pendingTasks}</span> pending ·{' '}
              <span className="font-semibold text-slate-900">{stats.doneTasks}</span> completed
            </p>
            {stats.pendingTasks + stats.doneTasks > 0 && (
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all"
                  style={{ width: `${(stats.doneTasks / (stats.pendingTasks + stats.doneTasks)) * 100}%` }}
                />
              </div>
            )}
          </section>
        </div>
      )}
    </>
  )
}
