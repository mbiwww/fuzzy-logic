import Icon from '../Icon'

// Daftar nomor halaman dengan "…" bila terlalu banyak.
function pageList(page, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, page - 1, page, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const out = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap-' + p)
    out.push(p)
  })
  return out
}

export default function AdminPagination({ page, totalPages, onChange, from, to, total }) {
  return (
    <div className="pager">
      <p className="pager__info">
        {total === 0 ? (
          'Tidak ada minuman'
        ) : (
          <>
            Menampilkan <strong>{from}</strong> sampai <strong>{to}</strong> dari <strong>{total}</strong>{' '}
            minuman
          </>
        )}
      </p>

      <div className="pager__buttons">
        <button
          type="button"
          className="pager__btn"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Halaman sebelumnya"
        >
          <Icon name="chevronLeft" size={18} />
        </button>

        {pageList(page, totalPages).map((p) =>
          typeof p === 'string' ? (
            <span key={p} className="pager__gap" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`pager__btn ${p === page ? 'pager__btn--active' : ''}`}
              onClick={() => onChange(p)}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          className="pager__btn"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Halaman berikutnya"
        >
          <Icon name="chevronRight" size={18} />
        </button>
      </div>
    </div>
  )
}
