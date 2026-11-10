import { useEffect, useState } from 'react'

// Routing sederhana berbasis hash (tanpa library):
//   #/                    Beranda
//   #/top                 Beranda, langsung ke Top Recommendation
//   #/rekomendasi         Cek rekomendasi (form)
//   #/hasil?harga=..&gizi=..   Hasil rekomendasi
//   #/login               Masuk admin
//   #/admin ...           Panel admin
const read = () => window.location.hash.replace(/^#/, '') || '/'

export default function useHashRoute() {
  const [raw, setRaw] = useState(read)

  useEffect(() => {
    const onChange = () => setRaw(read())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const [path, search = ''] = raw.split('?')
  return { path, query: new URLSearchParams(search) }
}

export const navigate = (to) => {
  window.location.hash = to
}

// Pindah tanpa menambah riwayat browser (dipakai untuk pengalihan otomatis).
export const redirect = (to) => {
  window.location.replace(to)
}
