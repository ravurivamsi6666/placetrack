import { supabase } from './supabase'

// Every helper throws an Error with a readable message on failure,
// so pages can simply try/catch and show the message.

function check({ data, error }) {
  if (error) throw new Error(error.message || 'Something went wrong. Please try again.')
  return data
}

// Convert empty strings from forms to null so optional columns stay clean
function clean(obj) {
  const out = {}
  for (const [key, value] of Object.entries(obj)) {
    out[key] = typeof value === 'string' ? (value.trim() === '' ? null : value.trim()) : value
  }
  return out
}

// ---------- Applications ----------
export async function fetchApplications() {
  return check(
    await supabase.from('applications').select('*').order('created_at', { ascending: false }),
  )
}

export async function createApplication(values) {
  return check(await supabase.from('applications').insert(clean(values)).select().single())
}

export async function updateApplication(id, values) {
  return check(
    await supabase.from('applications').update(clean(values)).eq('id', id).select().single(),
  )
}

export async function deleteApplication(id) {
  return check(await supabase.from('applications').delete().eq('id', id))
}

// ---------- Preparation tasks ----------
export async function fetchTasks() {
  return check(
    await supabase.from('preparation_tasks').select('*').order('created_at', { ascending: false }),
  )
}

export async function createTask(values) {
  return check(await supabase.from('preparation_tasks').insert(clean(values)).select().single())
}

export async function updateTask(id, values) {
  return check(
    await supabase.from('preparation_tasks').update(clean(values)).eq('id', id).select().single(),
  )
}

export async function deleteTask(id) {
  return check(await supabase.from('preparation_tasks').delete().eq('id', id))
}
