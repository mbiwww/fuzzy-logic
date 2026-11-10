import Brand from '../Brand'
import Icon from '../Icon'
import { SYSTEM_NAME } from '../../config'

const MENU = [
  { id: 'minuman', to: '#/admin', label: 'Minuman', icon: 'table' },
  { id: 'pengaturan', to: '#/admin/pengaturan', label: 'Pengaturan Penilaian', icon: 'sliders' },
]

// Kerangka panel admin: sidebar hijau, bilah atas, dan isi halaman.
export default function AdminLayout({ active, onLogout, children }) {
  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <Brand href="#/admin" tone="light" sub="PANEL ADMIN" />

        <nav className="admin__nav" aria-label="Menu admin">
          {MENU.map((item) => (
            <a
              key={item.id}
              href={item.to}
              className={`admin__link ${active === item.id ? 'admin__link--active' : ''}`}
              aria-current={active === item.id ? 'page' : undefined}
            >
              <Icon name={item.icon} size={20} />
              {item.label}
            </a>
          ))}
          <a href="#/" className="admin__link" target="_blank" rel="noopener noreferrer">
            <Icon name="external" size={20} />
            Lihat Situs
          </a>
        </nav>

        <button type="button" className="admin__link admin__logout" onClick={onLogout}>
          <Icon name="logout" size={20} />
          Keluar
        </button>
      </aside>

      <div className="admin__main">
        <header className="admin__topbar">
          <p className="admin__topbar-title">{SYSTEM_NAME}</p>

          <div className="admin__topbar-actions">
            <details className="menu">
              <summary className="icon-btn" aria-label="Notifikasi">
                <Icon name="bell" size={20} />
              </summary>
              <div className="menu__panel">Tidak ada notifikasi baru.</div>
            </details>

            <details className="menu">
              <summary className="avatar" aria-label="Akun admin">
                <Icon name="user" size={18} />
              </summary>
              <div className="menu__panel">
                <strong>Admin</strong>
                <button type="button" className="menu__item" onClick={onLogout}>
                  <Icon name="logout" size={16} />
                  Keluar
                </button>
              </div>
            </details>
          </div>
        </header>

        <div className="admin__content">{children}</div>
      </div>
    </div>
  )
}
