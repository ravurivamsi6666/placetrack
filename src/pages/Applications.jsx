import { useMemo, useState } from 'react'
import {
  createApplication,
  deleteApplication,
  fetchApplications,
  updateApplication,
} from '../lib/api'
import { useAsync } from '../lib/useAsync'
import { STATUSES } from '../lib/constants'
import { formatDate } from '../lib/dates'
import ApplicationForm from '../components/ApplicationForm'
import {
  Button,
  ConfirmDialog,
  DeadlineBadge,
  EmptyState,
  ErrorBanner,
  Modal,
  PageHeader,
  Spinner,
  StatusBadge,
  inputClass,
} from '../components/ui'

const SORTS = {
  newest: 'Newest applied',
  oldest: 'Oldest applied',
  deadline: 'Nearest deadline',
}

function sortApps(list, sort) {
  const copy = [...list]
  if (sort === 'oldest') return copy.sort((a, b) => a.application_date.localeCompare(b.application_date))
  if (sort === 'deadline') {
    // Applications without a deadline go to the bottom
    return copy.sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return a.deadline.localeCompare(b.deadline)
    })
  }
  return copy.sort((a, b) => b.application_date.localeCompare(a.application_date))
}

export default function Applications() {
  const { data, setData, loading, error, reload } = useAsync(fetchApplications)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sort, setSort] = useState('newest')
  const [editing, setEditing] = useState(null) // null | 'new' | application object
  const [deleting, setDeleting] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [actionError, setActionError] = useState('')

  const visible = useMemo(() => {
    if (!data) return []
    const q = search.trim().toLowerCase()
    const filtered = data.filter((a) => {
      if (statusFilter !== 'All' && a.status !== statusFilter) return false
      if (!q) return true
      return a.company_name.toLowerCase().includes(q) || a.job_role.toLowerCase().includes(q)
    })
    return sortApps(filtered, sort)
  }, [data, search, statusFilter, sort])

  async function handleSave(values) {
    if (editing === 'new') {
      const created = await createApplication(values)
      setData((prev) => [created, ...(prev ?? [])])
    } else {
      const updated = await updateApplication(editing.id, values)
      setData((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
    }
    setEditing(null)
  }

  async function handleStatusChange(app, status) {
    setActionError('')
    const previous = data
    // Optimistic update, rolled back if the request fails
    setData((prev) => prev.map((a) => (a.id === app.id ? { ...a, status } : a)))
    try {
      await updateApplication(app.id, { status })
    } catch (err) {
      setData(previous)
      setActionError(`Could not update status: ${err.message}`)
    }
  }

  async function handleDelete() {
    setDeleteBusy(true)
    setDeleteError('')
    try {
      await deleteApplication(deleting.id)
      setData((prev) => prev.filter((a) => a.id !== deleting.id))
      setDeleting(null)
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleteBusy(false)
    }
  }

  const hasFilters = search.trim() !== '' || statusFilter !== 'All'

  return (
    <>
      <PageHeader
        title="Applications"
        subtitle="Every company you've applied to, in one place."
        action={<Button onClick={() => setEditing('new')}>+ Add application</Button>}
      />

      {loading && <Spinner />}
      {error && <ErrorBanner message={error} onRetry={reload} />}

      {data && (
        <div className="space-y-4">
          <ErrorBanner message={actionError} />

          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <input
              type="search"
              className={inputClass}
              placeholder="Search by company or role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search applications"
            />
            <select className={inputClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
              <option value="All">All statuses</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select className={inputClass} value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort applications">
              {Object.entries(SORTS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>

          {data.length === 0 ? (
            <EmptyState
              title="No applications yet"
              message="Start tracking by adding the first company you've applied to."
              action={<Button onClick={() => setEditing('new')}>+ Add application</Button>}
            />
          ) : visible.length === 0 ? (
            <EmptyState
              title="No matching applications"
              message="Try a different search term or status filter."
              action={hasFilters && (
                <Button variant="secondary" onClick={() => { setSearch(''); setStatusFilter('All') }}>Clear filters</Button>
              )}
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Company / Role</th>
                      <th className="px-4 py-3">Applied</th>
                      <th className="px-4 py-3">Deadline</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visible.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{a.company_name}</p>
                          <p className="text-slate-500">{a.job_role}</p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(a.application_date)}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {a.deadline ? (
                            <div className="flex flex-col items-start gap-1">
                              <span className="text-slate-600">{formatDate(a.deadline)}</span>
                              {a.status !== 'Offer' && a.status !== 'Rejected' && <DeadlineBadge date={a.deadline} />}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={a.status}
                            onChange={(e) => handleStatusChange(a, e.target.value)}
                            className="rounded-md border-0 bg-transparent py-0.5 pl-0 pr-6 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-600"
                            aria-label={`Status for ${a.company_name}`}
                          >
                            {STATUSES.map((s) => <option key={s}>{s}</option>)}
                          </select>
                          <div className="mt-0.5"><StatusBadge status={a.status} /></div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          {a.job_url && (
                            <a href={a.job_url} target="_blank" rel="noopener noreferrer" className="mr-3 text-sm font-medium text-slate-500 hover:text-slate-800">Posting</a>
                          )}
                          <button onClick={() => setEditing(a)} className="mr-3 text-sm font-medium text-indigo-600 hover:text-indigo-800">Edit</button>
                          <button onClick={() => { setDeleteError(''); setDeleting(a) }} className="text-sm font-medium text-rose-600 hover:text-rose-800">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <ul className="space-y-3 md:hidden">
                {visible.map((a) => (
                  <li key={a.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{a.company_name}</p>
                        <p className="truncate text-sm text-slate-500">{a.job_role}</p>
                      </div>
                      <StatusBadge status={a.status} />
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <div><dt>Applied</dt><dd className="mt-0.5 text-sm text-slate-700">{formatDate(a.application_date)}</dd></div>
                      <div>
                        <dt>Deadline</dt>
                        <dd className="mt-0.5 flex flex-wrap items-center gap-1.5 text-sm text-slate-700">
                          {formatDate(a.deadline)}
                          {a.deadline && a.status !== 'Offer' && a.status !== 'Rejected' && <DeadlineBadge date={a.deadline} />}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                      <select
                        value={a.status}
                        onChange={(e) => handleStatusChange(a, e.target.value)}
                        className="rounded-lg border-0 py-1 text-sm text-slate-700 ring-1 ring-inset ring-slate-300"
                        aria-label={`Status for ${a.company_name}`}
                      >
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                      <div className="flex gap-3 text-sm font-medium">
                        <button onClick={() => setEditing(a)} className="text-indigo-600">Edit</button>
                        <button onClick={() => { setDeleteError(''); setDeleting(a) }} className="text-rose-600">Delete</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Add application' : 'Edit application'} onClose={() => setEditing(null)} wide>
          <ApplicationForm
            initial={editing === 'new' ? null : editing}
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete application?"
          message={`This will permanently remove your application to ${deleting.company_name} (${deleting.job_role}). This can't be undone.`}
          busy={deleteBusy}
          error={deleteError}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
