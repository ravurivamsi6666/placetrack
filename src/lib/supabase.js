import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isConfigured = Boolean(url && anonKey)

// Only the public (anon / publishable) key belongs in frontend code.
// Row Level Security in the database is what protects each user's data.
export const supabase = isConfigured
  ? createClient(url, anonKey)
  : null
