import { useEffect, useMemo, useState } from 'react'
import CategoryBadge from '../components/CategoryBadge'
import DrinkThumb from '../components/DrinkThumb'
import Icon from '../components/Icon'
import { GIZI_DOMAIN_MAX, HARGA_DOMAIN_MAX, SITE_NAME } from '../config'
import { CATEGORIES, GIZI_TAGS, HARGA_TAGS } from '../lib/categories'
import { evaluate } from '../lib/fuzzy'
import { formatDegree, formatNumber, formatRupiah, parseNumber, toIndex } from '../lib/format'
import { redirect } from '../lib/useHashRoute'

const CATEGORY_ICON = { dibeli: 'checkCircle', pertimbangkan: 'info', tidak: 'xCircle' }

// Tiga minuman dari data yang paling mirip (harga dan gizi terdekat).
// Diutamakan yang berkategori Dibeli; bila kurang, dilengkapi peringkat teratas lainnya.
function pickSimilar(ranked, harga, gizi) {
  const distance = (d) =>
    Math.hypot((d.harga - harga) / HARGA_DOMAIN_MAX, (d.gizi - gizi) / GIZI_DOMAIN_MAX)

  const others = ranked.filter((d) => !(d.harga === harga && d.gizi === gizi))
  const preferred = others.filter((d) => d.category === 'dibeli').sort((a, b) => distance(a) - distance(b))
  const rest = others.filter((d) => d.category !== 'dibeli')
  return [...preferred, ...rest].slice(0, 3)
}

function IndexRing({ value, category }) {
  const radius = 17
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(Math.max(value, 0), 100) / 100)
  return (
    <svg className={`ring ring--${category}`} width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
      <circle className="ring__track" cx="22" cy="22" r={radius} />
      <circle
        className="ring__value"
        cx="22"
        cy="22"
        r={radius}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 22 22)"
      />
    </svg>
  )
}

export default function ResultPage({ query, ranked, settings }) {
  const harga = parseNumber(query.get('harga'))
  const gizi = parseNumber(query.get('gizi'))
  const valid =
    Number.isFinite(harga) && harga > 0 && Number.isFinite(gizi) && gizi >= 0 && gizi <= GIZI_DOMAIN_MAX

  const [status, setStatus] = useState('')

  // Alamat hasil tidak lengkap: kembali ke form.
  useEffect(() => {
    if (!valid) redirect('#/rekomendasi')
  }, [valid])

  const result = useMemo(() => (valid ? evaluate(harga, gizi, settings) : null), [valid, harga, gizi, settings])
  const similar = useMemo(() => (valid ? pickSimilar(ranked, harga, gizi) : []), [valid, ranked, harga, gizi])

  if (!result) return null

  const info = CATEGORIES[result.category]
  const index = toIndex(result.degree)

  const summary = `Hasil rekomendasi ${SITE_NAME}: ${info.label} (indeks ${index}/100) untuk harga ${formatRupiah(harga)} dan nilai gizi total ${gizi}.`

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: `Hasil rekomendasi ${SITE_NAME}`, text: summary, url })
        setStatus('Hasil dibagikan.')
      } else {
        await navigator.clipboard.writeText(`${summary}\n${url}`)
        setStatus('Tautan hasil disalin ke papan klip.')
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        setStatus('Tautan tidak bisa disalin otomatis. Salin alamat dari bilah browser.')
      }
    }
  }

  const handleSave = () => {
    const lines = [
      `${SITE_NAME} - Hasil evaluasi minuman kaleng`,
      '',
      `Rekomendasi          : ${info.label} (${info.taraf})`,
      `Derajat keanggotaan  : ${formatDegree(result.degree)}`,
      `Indeks kelayakan     : ${index}/100`,
      `Harga                : ${formatRupiah(harga)}`,
      `Nilai gizi total     : ${gizi}`,
      '',
      info.description,
      '',
      `Tautan hasil: ${window.location.href}`,
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `hasil-rekomendasi-${harga}-${gizi}.txt`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setStatus('Hasil evaluasi disimpan sebagai berkas teks.')
  }

  return (
    <section className="page">
      <div className="container container--narrow">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="#/">
            <Icon name="home" size={16} />
            Beranda
          </a>
          <Icon name="chevronRight" size={14} />
          <a href="#/rekomendasi">Cek Rekomendasi</a>
          <Icon name="chevronRight" size={14} />
          <strong aria-current="page">Hasil Rekomendasi</strong>
        </nav>

        <article className="result-card">
          <p className="result-card__eyebrow">Rekomendasi untuk minuman Anda</p>

          <div className={`verdict verdict--${result.category}`}>
            <span className="verdict__label">{info.label.toUpperCase()}</span>
            <span className="verdict__taraf">
              <Icon name={CATEGORY_ICON[result.category]} size={16} />
              {info.taraf}
            </span>
          </div>

          <p className="result-card__desc">{info.description}</p>

          <dl className="stats">
            <div className="stats__item">
              <dt>Perkiraan Harga</dt>
              <dd className="stats__value">{formatRupiah(harga)}</dd>
              <dd className="stats__tag">{HARGA_TAGS[result.hargaDominan]}</dd>
            </div>
            <div className="stats__item">
              <dt>Gizi Total</dt>
              <dd className="stats__value">{formatNumber(gizi)} pts</dd>
              <dd className="stats__tag">{GIZI_TAGS[result.giziDominan]}</dd>
            </div>
            <div className="stats__item">
              <dt>Indeks Kelayakan</dt>
              <dd className="stats__value stats__value--ring">
                <IndexRing value={index} category={result.category} />
                {index}/100
              </dd>
              <dd className="stats__tag">{info.ratio}</dd>
            </div>
          </dl>

          <div className="result-card__actions">
            <a href="#/rekomendasi" className="btn btn--outline">
              <Icon name="refresh" size={17} />
              Cek Minuman Lain
            </a>
            <a href="#/top" className="btn btn--outline">
              <Icon name="chart" size={17} />
              Lihat Top Recommendation
            </a>
          </div>

          <div className="result-card__more">
            <button type="button" className="btn btn--ghost" onClick={handleShare}>
              <Icon name="share" size={17} />
              Bagikan Hasil
            </button>
            <button type="button" className="btn btn--ghost" onClick={handleSave}>
              <Icon name="bookmark" size={17} />
              Simpan Hasil Evaluasi
            </button>
          </div>

          <p className="result-card__status" role="status">
            {status}
          </p>
        </article>

        <section className="similar" aria-labelledby="similar-title">
          <h2 id="similar-title" className="similar__title">
            Minuman Serupa yang Direkomendasikan
          </h2>
          <p className="similar__lead">
            Pilihan alternatif dari data kami dengan harga dan nilai gizi yang mendekati minuman Anda.
          </p>

          {similar.length === 0 ? (
            <p className="empty">Belum ada minuman lain untuk dibandingkan.</p>
          ) : (
            <ul className="similar-grid">
              {similar.map((drink, i) => (
                <li key={drink.id} className="similar-card">
                  <div className="similar-card__media">
                    <DrinkThumb drink={drink} index={i} className="similar-card__img" />
                    <span className="similar-card__tag">
                      <Icon name="star" size={13} />
                      Peringkat #{drink.rank}
                    </span>
                  </div>
                  <div className="similar-card__body">
                    <div className="similar-card__row">
                      <h3 className="similar-card__name">{drink.nama}</h3>
                      <span className="similar-card__pts">{formatNumber(drink.gizi)} pts</span>
                    </div>
                    <p className="similar-card__meta">
                      Indeks kelayakan {toIndex(drink.degree)}/100 · {CATEGORIES[drink.category].label}
                    </p>
                    <div className="similar-card__row similar-card__foot">
                      <span className="similar-card__price">{formatRupiah(drink.harga)}</span>
                      <span className={`similar-card__verdict similar-card__verdict--${drink.category}`}>
                        <Icon name={CATEGORY_ICON[drink.category]} size={15} />
                        {CATEGORIES[drink.category].cardLabel}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  )
}
