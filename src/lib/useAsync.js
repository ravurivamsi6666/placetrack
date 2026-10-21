import { useCallback, useEffect, useState } from 'react'

// Tiny data-loading hook: runs `fn` on mount, exposes loading / error / reload.
export function useAsync(fn) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await fn())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [fn])

  useEffect(() => {
    load()
  }, [load])

  return { data, setData, loading, error, reload: load }
}
