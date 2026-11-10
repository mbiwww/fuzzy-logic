import { useEffect, useMemo, useState } from 'react'
import './public.css'
import './admin.css'
import useHashRoute, { navigate, redirect } from './lib/useHashRoute'
import { isLoggedIn, logout } from './lib/auth'
import { usePersistentState } from './lib/storage'
import { rankDrinks } from './lib/fuzzy'
import { DEFAULT_SETTINGS, sanitizeSettings } from './lib/settings'
import { SEED_DRINKS, nextDrinkId, sanitizeDrinks } from './data/drinks'
import PublicLayout from './components/public/PublicLayout'
import HomePage from './pages/HomePage'
import RecommendPage from './pages/RecommendPage'
import ResultPage from './pages/ResultPage'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'

function App() {
  const { path, query } = useHashRoute()

  // Data tersimpan di browser (localStorage) selama belum ada backend.
  const [drinks, setDrinks] = usePersistentState('teguksehat.drinks.v1', SEED_DRINKS, sanitizeDrinks)
  const [settings, setSettings] = usePersistentState(
    'teguksehat.settings.v1',
    DEFAULT_SETTINGS,
    sanitizeSettings,
  )
  const [loggedIn, setLoggedIn] = useState(isLoggedIn)

  // Semua penilaian dihitung dari data dan pengaturan yang sama.
  const ranked = useMemo(() => rankDrinks(drinks, settings), [drinks, settings])

  const isAdminRoute = path.startsWith('/admin')

  // Halaman baru selalu dimulai dari atas (kecuali tautan ke Top Recommendation).
  useEffect(() => {
    if (path !== '/top') window.scrollTo(0, 0)
  }, [path])

  // Penjaga rute: panel admin hanya untuk yang sudah masuk.
  // Alamat dibaca langsung dari browser: saat menekan Keluar, alamat sudah pindah ke beranda
  // walau `path` di sini belum diperbarui, dan pengguna tidak boleh dilempar ke halaman login.
  useEffect(() => {
    if (isAdminRoute && !loggedIn && window.location.hash.startsWith('#/admin')) {
      redirect('#/login')
    }
  }, [isAdminRoute, loggedIn])

  const handleLogout = () => {
    logout()
    setLoggedIn(false)
    navigate('#/')
  }

  const saveDrink = (values, id) => {
    setDrinks((prev) =>
      id === null
        ? [...prev, { id: nextDrinkId(prev), ...values }]
        : prev.map((d) => (d.id === id ? { ...d, ...values } : d)),
    )
  }

  const deleteDrink = (id) => setDrinks((prev) => prev.filter((d) => d.id !== id))

  if (path === '/login') {
    return <LoginPage loggedIn={loggedIn} onLogin={() => setLoggedIn(true)} />
  }

  if (isAdminRoute) {
    if (!loggedIn) return null // sedang dialihkan ke halaman login
    return (
      <AdminPage
        path={path}
        drinks={drinks}
        ranked={ranked}
        settings={settings}
        onSaveDrink={saveDrink}
        onDeleteDrink={deleteDrink}
        onSaveSettings={setSettings}
        onLogout={handleLogout}
      />
    )
  }

  let page
  if (path === '/rekomendasi') page = <RecommendPage />
  else if (path === '/hasil') page = <ResultPage query={query} ranked={ranked} settings={settings} />
  else page = <HomePage ranked={ranked} scrollToTop={path === '/top'} />

  return <PublicLayout path={path}>{page}</PublicLayout>
}

export default App
