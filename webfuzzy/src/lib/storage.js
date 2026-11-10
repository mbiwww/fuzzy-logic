import { useEffect, useState } from 'react'

// useState yang otomatis tersimpan di localStorage browser.
// Selama belum ada backend, data admin disimpan di browser ini.
// `sanitize` memeriksa data lama; bila bentuknya tidak cocok dipakai nilai awal.
export function usePersistentState(key, initial, sanitize) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw !== null) {
        const parsed = JSON.parse(raw)
        return sanitize ? sanitize(parsed, initial) : parsed
      }
    } catch {
      /* penyimpanan diblokir atau rusak: pakai nilai awal */
    }
    return initial
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* penyimpanan penuh atau diblokir: data hanya tersimpan selama halaman terbuka */
    }
  }, [key, value])

  return [value, setValue]
}
