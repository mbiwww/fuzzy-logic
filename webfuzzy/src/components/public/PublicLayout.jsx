import Brand from '../Brand'
import { SITE_NAME, SITE_TAGLINE } from '../../config'

const NAV = [
  { to: '/', label: 'Beranda', match: ['/', '/top'] },
  { to: '/rekomendasi', label: 'Cek Rekomendasi', match: ['/rekomendasi', '/hasil'] },
]

export default function PublicLayout({ path, children }) {
  return (
    <div className="site">
      <header className="site-header">
        <div className="container site-header__inner">
          <Brand />

          <nav className="site-nav" aria-label="Menu utama">
            {NAV.map((item) => {
              const active = item.match.includes(path)
              return (
                <a
                  key={item.to}
                  href={`#${item.to}`}
                  className={`site-nav__link ${active ? 'site-nav__link--active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </a>
              )
            })}
            <a href="#/admin">Masuk Admin</a>
          </nav>
        </div>
      </header>

      <main className="site__main">{children}</main>

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <p>
            {SITE_NAME} · {SITE_TAGLINE}
          </p>
        </div>
      </footer>
    </div>
  )
}
