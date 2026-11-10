import { useState } from 'react'
import Icon from '../components/Icon'
import { GIZI_DOMAIN_MAX } from '../config'
import { parseNumber } from '../lib/format'
import { navigate } from '../lib/useHashRoute'

export default function RecommendPage() {
  const [harga, setHarga] = useState('')
  const [gizi, setGizi] = useState('')
  const [errors, setErrors] = useState([])

  const handleSubmit = (e) => {
    e.preventDefault()
    const h = parseNumber(harga)
    const g = parseNumber(gizi)
    const list = []

    if (Number.isNaN(h)) list.push('Harga wajib diisi dengan angka.')
    else if (h <= 0) list.push('Harga harus lebih besar dari 0.')

    if (Number.isNaN(g)) list.push('Nilai gizi total wajib diisi dengan angka.')
    else if (g < 0 || g > GIZI_DOMAIN_MAX) {
      list.push(`Nilai gizi total harus antara 0 dan ${GIZI_DOMAIN_MAX}.`)
    }

    setErrors(list)
    if (list.length === 0) navigate(`#/hasil?harga=${h}&gizi=${g}`)
  }

  const handleReset = () => {
    setHarga('')
    setGizi('')
    setErrors([])
  }

  return (
    <section className="page page--form">
      <div className="container">
        <form className="form-card" onSubmit={handleSubmit} noValidate>
          <h1 className="form-card__title">Cek rekomendasi minuman kaleng</h1>
          <p className="form-card__lead">Tidak perlu login. Isi dua data di bawah, lalu lihat hasilnya.</p>

          <div className="field">
            <label className="field__label" htmlFor="harga">
              Harga (Rp)
            </label>
            <input
              id="harga"
              className="input"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="Contoh: 4505"
              value={harga}
              onChange={(e) => setHarga(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="gizi">
              Nilai gizi total
            </label>
            <input
              id="gizi"
              className="input"
              type="number"
              inputMode="decimal"
              min="0"
              max={GIZI_DOMAIN_MAX}
              step="any"
              placeholder="Contoh: 335"
              value={gizi}
              onChange={(e) => setGizi(e.target.value)}
            />
          </div>

          {errors.length > 0 && (
            <div className="notice notice--error" role="alert">
              <Icon name="info" size={18} />
              <ul>
                {errors.map((msg) => (
                  <li key={msg}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="form-card__actions">
            <button type="submit" className="btn btn--primary btn--large">
              Lihat Rekomendasi
            </button>
            <button type="button" className="btn btn--large" onClick={handleReset}>
              Reset
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
