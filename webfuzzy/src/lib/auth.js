// Login admin sisi front end (tahap MVP, belum ada backend).
//
// PENTING: semua kode di folder src ikut terkirim ke browser, jadi username dan
// kata sandi di bawah ini bisa dibaca siapa saja yang membuka kode situsnya.
// Ini cukup untuk demo/MVP, tetapi BUKAN pengamanan sungguhan. Untuk produksi,
// ganti isi fungsi `login` dengan pemanggilan API ke server (cek di server,
// kembalikan token/sesi), dan jangan simpan kata sandi di front end.
//
// Kredensial bawaan:  admin / admin123  (atau admin@teguksehat.id / admin123)
// Bisa diganti lewat file .env di folder project:
//   VITE_ADMIN_USER=...   VITE_ADMIN_EMAIL=...   VITE_ADMIN_PASSWORD=...

const ADMIN = {
  username: import.meta.env.VITE_ADMIN_USER ?? 'admin',
  email: import.meta.env.VITE_ADMIN_EMAIL ?? 'admin@teguksehat.id',
  password: import.meta.env.VITE_ADMIN_PASSWORD ?? 'admin123',
}

const KEY = 'teguksehat-admin-session'

const has = (store) => {
  try {
    return store.getItem(KEY) === '1'
  } catch {
    return false
  }
}

// sessionStorage: sesi hilang saat tab ditutup.
// localStorage  : dipakai bila "Ingat saya di perangkat ini" dicentang.
export const isLoggedIn = () => has(window.sessionStorage) || has(window.localStorage)

// Dibuat async supaya nanti mudah diganti dengan pemanggilan API. Mengembalikan true bila berhasil.
export async function login(identity, password, remember = false) {
  const id = identity.trim().toLowerCase()
  const known = id === ADMIN.username.toLowerCase() || id === ADMIN.email.toLowerCase()
  if (!known || password !== ADMIN.password) return false

  try {
    const store = remember ? window.localStorage : window.sessionStorage
    store.setItem(KEY, '1')
  } catch {
    /* penyimpanan diblokir: sesi hanya berlaku selama halaman terbuka */
  }
  return true
}

export function logout() {
  ;[window.sessionStorage, window.localStorage].forEach((store) => {
    try {
      store.removeItem(KEY)
    } catch {
      /* abaikan */
    }
  })
}
