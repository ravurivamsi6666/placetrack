import { useMemo, useState } from 'react'
import { createTask, deleteTask, fetchTasks, updateTask } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import { SUBJECTS } from '../lib/constants'
import { formatDate, urgency } from '../lib/dates'
import {
  Button,
  ConfirmDialog,
  DeadlineBadge,
  EmptyState,
  ErrorBanner,
  Field,
  Modal,
  PageHeader,
  Spinner,
  inputClass,
} from '../components/ui'

const TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'completed', label: 'Completed' },
  { id: 'all', label: 'All' },
]

function TaskForm({ initial, onSubmit, onCancel }) {
  const [values, setValues] = useState({
    title: initial?.title ?? '',
    subject: initial?.subject ?? SUBJECTS[0],
    due_date: initial?.due_date ?? '',
  })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [submitError, setSubmitError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const found = {}
    if (!values.title.trim()) found.title = 'Task title is required.'
    if (!values.subject.trim()) found.subject = 'Subject is required.'
    setErrors(found)
    if (Object.keys(found).length) return

    setBusy(true)
    setSubmitError('')
    try {
      await onSubmit(values)
    } catch (err) {
      setSubmitError(err.message)
      setBusy(false)
    }
  }

  // If an older task has a custom subject, keep it selectable
  const subjectOptions = SUBJECTS.includes(values.subject) ? SUBJECTS : [values.subject, ...SUBJECTS]

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <ErrorBanner message={submitError} />
      <Field label="Task title *" error={errors.title}>
        <input className={inputClass} autoFocus value={values.title} onChange={(e) => setValues({ ...values, title: e.target.value })} placeholder="e.g. Solve 10 array problems" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Subject *" error={errors.subject}>
          <select className={inputClass} value={values.subject} onChange={(e) => setValues({ ...values, subject: e.target.value })}>
            {subjectOptions.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Due date">
          <input type="date" className={inputClass} value={values.due_date} onChange={(e) => setValues({ ...values, due_date: e.target.value })} />
        </Field>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button type="submit" disabled={busy}>{busy ? 'Saving…' : initial ? 'Save changes' : 'Add task'}</Button>
      </div>
    </form>
  )
}

export default function Prep() {
  const { data, setData, loading, error, reload } = useAsync(fetchTasks)
  const [tab, setTab] = useState('pending')
  const [subject, setSubject] = useState('All')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [actionError, setActionError] = useState('')

  const counts = useMemo(() => {
    const done = (data ?? []).filter((t) => t.is_completed).length
    return { pending: (data?.length ?? 0) - done, completed: done, all: data?.length ?? 0 }
  }, [data])

  const subjectsInUse = useMemo(
    () => [...new Set((data ?? []).map((t) => t.subject))].sort(),
    [data],
  )

  const visible = useMemo(() => {
    if (!data) return []
    return data
      .filter((t) => {
        if (tab === 'pending' && t.is_completed) return false
        if (tab === 'completed' && !t.is_completed) return false
        if (subject !== 'All' && t.subject !== subject) return false
        return true
      })
      .sort((a, b) => {
        // Tasks with the earliest due date first; undated tasks last
        if (!a.due_date && !b.due_date) return b.created_at.localeCompare(a.created_at)
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return a.due_date.localeCompare(b.due_date)
      })
  }, [data, tab, subject])

  async function handleSave(values) {
    if (editing === 'new') {
      const created = await createTask({ ...values, is_completed: false })
      setData((prev) => [created, ...(prev ?? [])])
    } else {
      const updated = await updateTask(editing.id, values)
      setData((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    }
    setEditing(null)
  }

  async function toggle(task) {
    setActionError('')
    const previous = data
    setData((prev) => prev.map((t) => (t.id === task.id ? { ...t, is_completed: !t.is_completed } : t)))
    try {
      await updateTask(task.id, { is_completed: !task.is_completed })
    } catch (err) {
      setData(previous)
      setActionError(`Could not update task: ${err.message}`)
    }
  }

  async function handleDelete() {
    setDeleteBusy(true)
    setDeleteError('')
    try {
      await deleteTask(deleting.id)
      setData((prev) => prev.filter((t) => t.id !== deleting.id))
      setDeleting(null)
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Interview Prep"
        subtitle="Plan what to study and tick it off as you go."
        action={<Button onClick={() => setEditing('new')}>+ Add task</Button>}
      />

      {loading && <Spinner />}
      {error && <ErrorBanner message={error} onRetry={reload} />}

      {data && (
        <div className="space-y-4">
          <ErrorBanner message={actionError} />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-lg bg-slate-100 p-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t.label} <span className="ml-1 text-xs text-slate-400">{counts[t.id]}</span>
                </button>
              ))}
            </div>
            {subjectsInUse.length > 0 && (
              <select className={`${inputClass} !w-auto`} value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Filter by subject">
                <option value="All">All subjects</option>
                {subjectsInUse.map((s) => <option key={s}>{s}</option>)}
              </select>
            )}
          </div>

          {data.length === 0 ? (
            <EmptyState
              title="No preparation tasks yet"
              message="Add topics like DSA, SQL, OOP, DBMS or Machine Learning to build your study plan."
              action={<Button onClick={() => setEditing('new')}>+ Add task</Button>}
            />
          ) : visible.length === 0 ? (
            <EmptyState
              title={tab === 'pending' ? 'Nothing pending 🎉' : 'No tasks here'}
              message={tab === 'pending' ? 'All caught up. Add a new task to keep the momentum.' : 'Try a different tab or subject filter.'}
            />
          ) : (
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {visible.map((t) => (
                <li key={t.id} className="flex items-start gap-3 px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={t.is_completed}
                    onChange={() => toggle(t)}
                    className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                    aria-label={`Mark "${t.title}" as ${t.is_completed ? 'pending' : 'completed'}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${t.is_completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{t.title}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20">{t.subject}</span>
                      {t.due_date && <span className="text-xs text-slate-500">Due {formatDate(t.due_date)}</span>}
                      {t.due_date && !t.is_completed && urgency(t.due_date) !== 'upcoming' && <DeadlineBadge date={t.due_date} />}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-3 text-sm font-medium">
                    <button onClick={() => setEditing(t)} className="text-indigo-600 hover:text-indigo-800">Edit</button>
                    <button onClick={() => { setDeleteError(''); setDeleting(t) }} className="text-rose-600 hover:text-rose-800">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Add preparation task' : 'Edit task'} onClose={() => setEditing(null)}>
          <TaskForm initial={editing === 'new' ? null : editing} onSubmit={handleSave} onCancel={() => setEditing(null)} />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete task?"
          message={`"${deleting.title}" will be permanently removed.`}
          busy={deleteBusy}
          error={deleteError}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
