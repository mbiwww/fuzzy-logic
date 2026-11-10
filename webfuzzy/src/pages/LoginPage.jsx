import { useEffect, useState } from 'react'
import Brand from '../components/Brand'
import Icon from '../components/Icon'
import { SITE_NAME, SYSTEM_NAME } from '../config'
import { login } from '../lib/auth'
import { navigate, redirect } from '../lib/useHashRoute'

export default function LoginPage({ loggedIn, onLogin }) {
  const [identity, setIdentity] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'error' | 'info', text }
  const [loading, setLoading] = useState(false)

  // Sudah masuk? langsung ke panel admin.
  useEffect(() => {
    if (loggedIn) redirect('#/admin')
  }, [loggedIn])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (identity.trim() === '' || password === '') {
      setMessage({ type: 'error', text: 'Isi username atau email dan kata sandi.' })
      return
    }

    setLoading(true)
    setMessage(null)
    const ok = await login(identity, password, remember)
    setLoading(false)

    if (!ok) {
      setMessage({ type: 'error', text: 'Username atau kata sandi salah.' })
      return
    }
    onLogin()
    navigate('#/admin')
  }

  const handleForgot = () => {
    setMessage({
      type: 'info',
      text: 'Untuk mengatur ulang kata sandi, hubungi pengembang atau administrator sistem.',
    })
  }

  return (
    <div className="login">
      <header className="login__header">
        <div className="container login__header-inner">
          <Brand href="#/" badge="Panel Admin" sub={SYSTEM_NAME} />
          <a href="#/" className="back-link">
            <Icon name="chevronLeft" size={18} />
            Kembali ke beranda
          </a>
        </div>
      </header>

      <main className="login__main">
        <form className="login__card" onSubmit={handleSubmit} noValidate>
          <h1 className="login__title">Masuk Admin</h1>
          <p className="login__lead">
            Halaman ini khusus admin untuk mengelola data minuman dan pengaturan penilaian.
            Pengunjung biasa tidak perlu masuk.
          </p>

          <div className="field">
            <label className="field__label" htmlFor="identity">
              Username atau email <span className="req">*</span>
            </label>
            <input
              id="identity"
              className="input"
              type="text"
              autoComplete="username"
              placeholder="admin@teguksehat.id"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="password">
              Kata sandi <span className="req">*</span>
            </label>
            <div className="password-row">
              <input
                id="password"
                className="input"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="btn"
                aria-pressed={showPassword}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? 'Sembunyikan' : 'Tampilkan'}
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`notice ${message.type === 'error' ? 'notice--error' : ''}`}
              role={message.type === 'error' ? 'alert' : 'status'}
            >
              <Icon name="info" size={18} />
              <p>{message.text}</p>
            </div>
          )}

          <div className="login__options">
            <label className="check">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Ingat saya di perangkat ini
            </label>
            <button type="button" className="link-button" onClick={handleForgot}>
              Lupa sandi?
            </button>
          </div>

          <button type="submit" className="btn btn--primary btn--large btn--block" disabled={loading}>
            {loading ? 'Memeriksa…' : 'Masuk ke Panel Admin'}
            {!loading && <Icon name="arrowRight" size={18} />}
          </button>

          <p className="login__secure">
            <Icon name="lock" size={15} />
            Akses khusus administrator. Sesi hanya berlaku di browser ini.
          </p>
        </form>
      </main>

      <footer className="login__footer">
        <strong>
          {SITE_NAME} • {SYSTEM_NAME}
        </strong>
        Hak Cipta © {new Date().getFullYear()}. Akses Terbatas Khusus Administrator Terdaftar.
      </footer>
    </div>
  )
}
