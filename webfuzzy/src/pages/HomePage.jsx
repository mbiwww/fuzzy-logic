import { useEffect } from 'react'
import CategoryBadge from '../components/CategoryBadge'
import DrinkThumb from '../components/DrinkThumb'
import { CATEGORIES, CATEGORY_ORDER } from '../lib/categories'
import { formatNumber } from '../lib/format'

const STEPS = [
  {
    title: 'Masukkan data',
    text: 'Isi harga dan nilai gizi total minuman kaleng.',
  },
  {
    title: 'Sistem menilai',
    text: 'Sistem menilai kecocokan harga dengan nilai gizinya.',
  },
  {
    title: 'Terima rekomendasi',
    text: 'Hasilnya satu dari tiga pilihan di bawah ini.',
  },
]

function HeroArt() {
  return (
    <div className="hero-art" role="img" aria-label="Ilustrasi tiga minuman kaleng">
      <div className="hero-art__cans" aria-hidden="true">
        <span className="hero-can hero-can--green">HEMAT</span>
        <span className="hero-can hero-can--orange hero-can--tall">SEHAT</span>
        <span className="hero-can hero-can--teal">SEGAR</span>
      </div>
      <p className="hero-art__caption">[Ilustrasi / foto minuman kaleng]</p>
    </div>
  )
}

export default function HomePage({ ranked, scrollToTop }) {
  const top = ranked.slice(0, 3)

  // Tautan "Lihat Top Recommendation" langsung menggulir ke bagian bawah.
  useEffect(() => {
    if (scrollToTop) {
      document.getElementById('top-recommendation')?.scrollIntoView({ block: 'start' })
    }
  }, [scrollToTop])

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__text">
            <p className="eyebrow">Rekomendasi minuman kaleng</p>
            <h1 className="hero__title">Pilih minuman kaleng yang sehat dan hemat</h1>
            <p className="hero__lead">
              Masukkan harga dan nilai gizi total minuman. Kamu langsung mendapat rekomendasi:
              Dibeli, Dipertimbangkan, atau Tidak Dibeli.
            </p>
            <div className="hero__actions">
              <a href="#/rekomendasi" className="btn btn--primary btn--large">
                Cek Rekomendasi
              </a>
              <a href="#/top" className="btn btn--outline btn--large">
                Lihat Top Recommendation
              </a>
            </div>
          </div>

          <HeroArt />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section__title">Cara menggunakan</h2>

          <ol className="steps">
            {STEPS.map((step, i) => (
              <li key={step.title} className="step-card">
                <span className="step-card__num">{i + 1}</span>
                <h3 className="step-card__title">{step.title}</h3>
                <p className="step-card__text">{step.text}</p>
              </li>
            ))}
          </ol>

          <ul className="legend" aria-label="Arti kategori hasil">
            {CATEGORY_ORDER.map((key) => (
              <li key={key} className="legend__item">
                <CategoryBadge category={key} />
                <span>{CATEGORIES[key].hint}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" id="top-recommendation">
        <div className="container">
          <h2 className="section__title">Top Recommendation</h2>
          <p className="section__lead">Minuman kaleng dengan rekomendasi terbaik saat ini.</p>

          {top.length === 0 ? (
            <p className="empty">Belum ada data minuman.</p>
          ) : (
            <ul className="top-grid">
              {top.map((drink, i) => (
                <li key={drink.id} className={`top-card top-card--${i % 3}`}>
                  <div className="top-card__media">
                    <DrinkThumb drink={drink} index={i} className="top-card__img" />
                  </div>
                  <div className="top-card__body">
                    <div className="top-card__row">
                      <span className="rank-pill">#{drink.rank}</span>
                      <CategoryBadge category={drink.category} />
                    </div>
                    <h3 className="top-card__name">{drink.nama}</h3>
                    <p className="top-card__meta">
                      Harga Rp {formatNumber(drink.harga)} · Gizi total {drink.gizi}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}
