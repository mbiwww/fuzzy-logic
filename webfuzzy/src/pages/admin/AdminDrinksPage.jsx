import { useMemo, useState } from 'react'
import CategoryBadge from '../../components/CategoryBadge'
import DrinkThumb from '../../components/DrinkThumb'
import Icon from '../../components/Icon'
import AdminPagination from '../../components/admin/AdminPagination'
import { ADMIN_PAGE_SIZE, GIZI_DOMAIN_MAX } from '../../config'
import { formatNumber } from '../../lib/format'
import { navigate } from '../../lib/useHashRoute'

function StatCard({ label, children, icon, tone }) {
  return (
    <div className="stat">
      <div>
        <p className="stat__label">{label}</p>
        <p className={`stat__value ${tone ? `stat__value--${tone}` : ''}`}>{children}</p>
      </div>
      <span className={`stat__icon stat__icon--${tone ?? 'blue'}`}>
        <Icon name={icon} size={22} />
      </span>
    </div>
  )
}

export default function AdminDrinksPage({ ranked, onDelete }) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const stats = useMemo(
    () => ({
      total: ranked.length,
      dibeli: ranked.filter((d) => d.category === 'dibeli').length,
      pertimbangkan: ranked.filter((d) => d.category === 'pertimbangkan').length,
      maxGizi: ranked.reduce((max, d) => Math.max(max, d.gizi), 0),
    }),
    [ranked],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? ranked.filter((d) => d.nama.toLowerCase().includes(q)) : ranked
  }, [ranked, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ADMIN_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * ADMIN_PAGE_SIZE
  const rows = filtered.slice(start, start + ADMIN_PAGE_SIZE)

  const handleDelete = (drink) => {
    if (window.confirm(`Hapus minuman "${drink.nama}"?`)) onDelete(drink.id)
  }

  return (
    <>
      <header className="page-head">
        <div>
          <p className="page-head__eyebrow">
            <Icon name="archive" size={16} />
            DATABASE PRODUK
          </p>
          <h1 className="page-head__title">Kelola minuman</h1>
          <p className="page-head__lead">
            Tambah, ubah, atau hapus minuman. Hasil rekomendasi dan peringkat dihitung otomatis, dan
            tiga teratas tampil di Top Recommendation.
          </p>
        </div>
        <a href="#/admin/tambah" className="btn btn--primary btn--large">
          <Icon name="plus" size={18} />
          Tambah Minuman
        </a>
      </header>

      <div className="stats-grid">
        <StatCard label="TOTAL TERDAFTAR" icon="cup" tone="blue">
          {stats.total} Minuman
        </StatCard>
        <StatCard label="REKOMENDASI (DIBELI)" icon="checkCircle" tone="green">
          {stats.dibeli} Varian
        </StatCard>
        <StatCard label="DIPERTIMBANGKAN" icon="clipboard" tone="orange">
          {stats.pertimbangkan} Varian
        </StatCard>
        <StatCard label="SKOR GIZI TERTINGGI" icon="star" tone="blue">
          {stats.maxGizi} <small>/ {GIZI_DOMAIN_MAX}</small>
        </StatCard>
      </div>

      <section className="panel search-panel">
        <div className="field">
          <label className="field__label" htmlFor="cari">
            Cari minuman
          </label>
          <div className="search-input">
            <Icon name="search" size={18} />
            <input
              id="cari"
              className="input"
              type="search"
              placeholder="Cari berdasarkan nama atau merek minuman…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
            />
          </div>
        </div>
        <span className="total-chip">
          <Icon name="chart" size={15} />
          Total {stats.total} minuman
        </span>
      </section>

      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Peringkat</th>
                <th>Foto</th>
                <th>Nama minuman</th>
                <th>Harga</th>
                <th>Gizi total</th>
                <th>Rekomendasi</th>
                <th className="data-table__actions-head">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="data-table__empty">
                    {ranked.length === 0
                      ? 'Belum ada minuman. Klik "Tambah Minuman" untuk memulai.'
                      : 'Tidak ada minuman yang cocok dengan pencarian.'}
                  </td>
                </tr>
              )}
              {rows.map((drink) => (
                <tr key={drink.id}>
                  <td>
                    <span className={`rank ${drink.rank <= 3 ? 'rank--top' : ''}`}>#{drink.rank}</span>
                  </td>
                  <td>
                    <DrinkThumb drink={drink} index={drink.rank - 1} className="data-table__thumb" />
                  </td>
                  <td className="data-table__name">{drink.nama}</td>
                  <td className="data-table__price">Rp {formatNumber(drink.harga)}</td>
                  <td>
                    <span className={`gizi gizi--${drink.category}`}>{drink.gizi}</span>
                    <small className="gizi__max"> / {GIZI_DOMAIN_MAX}</small>
                  </td>
                  <td>
                    <CategoryBadge category={drink.category} variant="soft" />
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="btn btn--small"
                        onClick={() => navigate(`#/admin/edit/${drink.id}`)}
                      >
                        <Icon name="pencil" size={15} />
                        Edit
                      </button>
                      <button type="button" className="btn btn--small btn--danger" onClick={() => handleDelete(drink)}>
                        <Icon name="trash" size={15} />
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminPagination
        page={currentPage}
        totalPages={totalPages}
        onChange={setPage}
        from={filtered.length === 0 ? 0 : start + 1}
        to={start + rows.length}
        total={filtered.length}
      />
    </>
  )
}
