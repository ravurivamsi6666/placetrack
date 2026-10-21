import { useState } from 'react'
import { STATUSES } from '../lib/constants'
import { toInputDate } from '../lib/dates'
import { Button, ErrorBanner, Field, inputClass } from './ui'

const EMPTY = {
  company_name: '',
  job_role: '',
  job_description: '',
  application_date: toInputDate(),
  deadline: '',
  interview_date: '',
  job_url: '',
  status: 'Applied',
  notes: '',
}

function validate(values) {
  const errors = {}
  if (!values.company_name.trim()) errors.company_name = 'Company name is required.'
  if (!values.job_role.trim()) errors.job_role = 'Job role is required.'
  if (!values.application_date) errors.application_date = 'Application date is required.'
  if (values.deadline && values.application_date && values.deadline < values.application_date) {
    errors.deadline = 'Deadline cannot be before the application date.'
  }
  if (values.job_url.trim()) {
    try {
      const url = new URL(values.job_url.trim())
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
    } catch {
      errors.job_url = 'Enter a valid URL starting with http:// or https://'
    }
  }
  return errors
}

export default function ApplicationForm({ initial, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => {
    if (!initial) return EMPTY
    // Replace nulls with empty strings so inputs stay controlled
    return Object.fromEntries(Object.keys(EMPTY).map((k) => [k, initial[k] ?? '']))
  })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setBusy(true)
    setSubmitError('')
    try {
      await onSubmit(values)
    } catch (err) {
      setSubmitError(err.message)
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <ErrorBanner message={submitError} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company name *" error={errors.company_name}>
          <input className={inputClass} value={values.company_name} onChange={set('company_name')} placeholder="e.g. Accenture" autoFocus />
        </Field>
        <Field label="Job role *" error={errors.job_role}>
          <input className={inputClass} value={values.job_role} onChange={set('job_role')} placeholder="e.g. Associate Software Engineer" />
        </Field>
        <Field label="Application date *" error={errors.application_date}>
          <input type="date" className={inputClass} value={values.application_date} onChange={set('application_date')} />
        </Field>
        <Field label="Status">
          <select className={inputClass} value={values.status} onChange={set('status')}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Application deadline" error={errors.deadline}>
          <input type="date" className={inputClass} value={values.deadline} onChange={set('deadline')} />
        </Field>
        <Field label="Interview date" hint="Shown on the Deadlines page">
          <input type="date" className={inputClass} value={values.interview_date} onChange={set('interview_date')} />
        </Field>
      </div>
      <Field label="Job posting URL" error={errors.job_url}>
        <input type="url" className={inputClass} value={values.job_url} onChange={set('job_url')} placeholder="https://" />
      </Field>
      <Field label="Job description">
        <textarea rows={3} className={inputClass} value={values.job_description} onChange={set('job_description')} />
      </Field>
      <Field label="Notes">
        <textarea rows={3} className={inputClass} value={values.notes} onChange={set('notes')} placeholder="Referrals, contacts, things to remember…" />
      </Field>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : initial ? 'Save changes' : 'Add application'}
        </Button>
      </div>
    </form>
  )
}
