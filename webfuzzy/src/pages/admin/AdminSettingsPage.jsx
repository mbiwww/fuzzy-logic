import { useMemo, useState } from 'react'
import CategoryBadge from '../../components/CategoryBadge'
import Icon from '../../components/Icon'
import FuzzyCurves from '../../components/admin/FuzzyCurves'
import { GIZI_DOMAIN_MAX, HARGA_DOMAIN_MAX } from '../../config'
import { DEFAULT_SETTINGS, SETTING_KEYS, validateSettings } from '../../lib/settings'
import { buildSets, evaluate } from '../../lib/fuzzy'
import { formatDegree, parseNumber } from '../../lib/format'

const toForm = (settings) => Object.fromEntries(SETTING_KEYS.map((key) => [key, String(settings[key])]))
const toValues = (form) => Object.fromEntries(SETTING_KEYS.map((key) => [key, parseNumber(form[key])]))

const HARGA_COLORS = ['#1e7a4b', '#6b7280', '#b4540c']
const GIZI_COLORS = ['#c42a1f', '#6b7280', '#1e7a4b']

// Uji cepat: hitung satu minuman dengan pengaturan yang sedang diisi (belum disimpan).
function runQuick(harga, gizi, values) {
  if (validateSettings(values).length > 0) {
    return { error: 'Perbaiki pengaturan yang belum valid dulu.' }
  }
  const h = parseNumber(harga)
  const g = parseNumber(gizi)
  if (!(h > 0) || !(g >= 0 && g <= GIZI_DOMAIN_MAX)) {
    return { error: `Isi harga (lebih dari 0) dan gizi (0 sampai ${GIZI_DOMAIN_MAX}).` }
  }
  const { category, degree } = evaluate(h, g, values)
  return { category, degree }
}

export default function AdminSettingsPage({ settings, onSave }) {
  const [form, setForm] = useState(() => toForm(settings))
  const [quick, setQuick] = useState({ harga: '4505', gizi: '335' })
  const [quickResult, setQuickResult] = useState(() => runQuick('4505', '335', settings))
  const [status, setStatus] = useState('')

  const values = useMemo(() => toValues(form), [form])
  const errors = useMemo(() => validateSettings(values), [values])
  const valid = errors.length === 0

  // Kurva memakai isian yang valid; bila belum valid, tampilkan pengaturan tersimpan.
  const sets = useMemo(() => buildSets(valid ? values : settings), [valid, values, settings])
  const shown = valid ? values : settings

  const change = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setQuickResult(null)
    setStatus('')
  }

  const changeQuick = (key, value) => {
    setQuick((prev) => ({ ...prev, [key]: value }))
    setQuickResult(null)
  }

  const handleReset = () => {
    setForm(toForm(DEFAULT_SETTINGS))
    setQuickResult(null)
    setStatus('Nilai awal dimuat. Tekan "Simpan Pengaturan" untuk menerapkannya.')
  }

  const handleSave = () => {
    if (!valid) return
    onSave(values)
    setStatus('Pengaturan disimpan. Peringkat dan hasil rekomendasi sudah memakai batas baru.')
  }

  const category = quickResult && !quickResult.error ? quickResult.category : null

  return (
    <>
      <header className="page-head page-head--form">
        <div>
          <nav className="crumbs" aria-label="Breadcrumb">
            <a href="#/admin">Admin</a>
            <Icon name="chevronRight" size={14} />
            <span aria-current="page" className="crumbs__current">
              Pengaturan Penilaian
            </span>
          </nav>
          <h1 className="page-head__title">Pengaturan penilaian</h1>
          <p className="page-head__lead">
            Tentukan batas yang dianggap murah, mahal, rendah, atau tinggi. Perubahan berlaku untuk
            semua penilaian, termasuk hasil pengunjung dan Top Recommendation.
          </p>
        </div>
      </header>

      <div className="settings-grid">
        <section className="panel settings-card" aria-labelledby="harga-title">
          <div className="settings-card__head">
            <span className="settings-card__icon">
              <Icon name="banknote" size={22} />
            </span>
            <h2 id="harga-title">Batas harga</h2>
            <span className="chip chip--blue">Moneter (IDR)</span>
          </div>

          <div className="settings-card__fields">
            <div className="field">
              <label className="field__label" htmlFor="murahSampai">
                Murah sampai (Rp)
              </label>
              <input
                id="murahSampai"
                className="input input--field"
                type="number"
                inputMode="decimal"
                min="0"
                max={HARGA_DOMAIN_MAX}
                step="any"
                value={form.murahSampai}
                onChange={(e) => change('murahSampai', e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="mahalMulai">
                Mahal mulai (Rp)
              </label>
              <input
                id="mahalMulai"
                className="input input--field"
                type="number"
                inputMode="decimal"
                min="0"
                max={HARGA_DOMAIN_MAX}
                step="any"
                value={form.mahalMulai}
                onChange={(e) => change('mahalMulai', e.target.value)}
              />
            </div>
          </div>
          <p className="settings-card__hint">
            <Icon name="info" size={15} />
            Di antara dua batas dianggap harga normal.
          </p>

          <div className="preview">
            <p className="preview__title">PRATINJAU DISTRIBUSI KURVA FUZZY</p>
            <FuzzyCurves
              sets={sets.harga}
              domainMax={HARGA_DOMAIN_MAX}
              colors={HARGA_COLORS}
              low={shown.murahSampai}
              high={shown.mahalMulai}
              kind="harga"
              ariaLabel="Kurva keanggotaan harga: murah, normal, mahal"
            />
          </div>
        </section>

        <section className="panel settings-card" aria-labelledby="gizi-title">
          <div className="settings-card__head">
            <span className="settings-card__icon">
              <Icon name="heart" size={22} />
            </span>
            <h2 id="gizi-title">Batas nilai gizi total</h2>
            <span className="chip chip--blue">Skala 0 sampai {GIZI_DOMAIN_MAX}</span>
          </div>

          <div className="settings-card__fields">
            <div className="field">
              <label className="field__label" htmlFor="rendahSampai">
                Rendah sampai
              </label>
              <input
                id="rendahSampai"
                className="input input--field"
                type="number"
                inputMode="decimal"
                min="0"
                max={GIZI_DOMAIN_MAX}
                step="any"
                value={form.rendahSampai}
                onChange={(e) => change('rendahSampai', e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="tinggiMulai">
                Tinggi mulai
              </label>
              <input
                id="tinggiMulai"
                className="input input--field"
                type="number"
                inputMode="decimal"
                min="0"
                max={GIZI_DOMAIN_MAX}
                step="any"
                value={form.tinggiMulai}
                onChange={(e) => change('tinggiMulai', e.target.value)}
              />
            </div>
          </div>
          <p className="settings-card__hint">
            <Icon name="info" size={15} />
            Di antara dua batas dianggap gizi sedang.
          </p>

          <div className="preview">
            <p className="preview__title">PRATINJAU DISTRIBUSI KURVA FUZZY</p>
            <FuzzyCurves
              sets={sets.gizi}
              domainMax={GIZI_DOMAIN_MAX}
              colors={GIZI_COLORS}
              low={shown.rendahSampai}
              high={shown.tinggiMulai}
              kind="gizi"
              ariaLabel="Kurva keanggotaan nilai gizi: rendah, sedang, tinggi"
            />
          </div>
        </section>
      </div>

      <section className="panel settings-card settings-card--wide" aria-labelledby="hasil-title">
        <div className="settings-card__head">
          <span className="settings-card__icon">
            <Icon name="checkCircle" size={22} />
          </span>
          <h2 id="hasil-title">Batas hasil rekomendasi</h2>
          <span className="chip chip--blue">Skala Defuzzifikasi 0.00 - 1.00</span>
        </div>

        <div className="settings-card__fields">
          <div className="field">
            <label className="field__label" htmlFor="dibeliMulai">
              Dibeli jika nilai mulai
            </label>
            <input
              id="dibeliMulai"
              className="input input--field"
              type="number"
              inputMode="decimal"
              min="0"
              max="1"
              step="0.01"
              value={form.dibeliMulai}
              onChange={(e) => change('dibeliMulai', e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="tidakDibeliDi">
              Tidak Dibeli jika nilai di bawah
            </label>
            <input
              id="tidakDibeliDi"
              className="input input--field"
              type="number"
              inputMode="decimal"
              min="0"
              max="1"
              step="0.01"
              value={form.tidakDibeliDi}
              onChange={(e) => change('tidakDibeliDi', e.target.value)}
            />
          </div>
        </div>

        <div className="result-legend">
          <CategoryBadge category="tidak" />
          <CategoryBadge category="pertimbangkan" />
          <CategoryBadge category="dibeli" />
          <span>Di antara dua batas hasilnya Dipertimbangkan.</span>
        </div>
      </section>

      <section className="panel settings-card settings-card--wide" aria-labelledby="uji-title">
        <div className="settings-card__head">
          <span className="settings-card__icon">
            <Icon name="flask" size={22} />
          </span>
          <h2 id="uji-title">Uji cepat</h2>
        </div>
        <p className="settings-card__sub">
          Coba satu minuman untuk melihat hasil dengan pengaturan di atas, sebelum disimpan.
        </p>

        <div className="quick">
          <div className="field">
            <label className="field__label" htmlFor="ujiHarga">
              Harga (Rp)
            </label>
            <input
              id="ujiHarga"
              className="input input--field"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={quick.harga}
              onChange={(e) => changeQuick('harga', e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="ujiGizi">
              Nilai gizi total
            </label>
            <input
              id="ujiGizi"
              className="input input--field"
              type="number"
              inputMode="decimal"
              min="0"
              max={GIZI_DOMAIN_MAX}
              step="any"
              value={quick.gizi}
              onChange={(e) => changeQuick('gizi', e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn--soft quick__btn"
            onClick={() => setQuickResult(runQuick(quick.harga, quick.gizi, values))}
          >
            <Icon name="play" size={14} />
            Uji
          </button>
          <div className="quick__result" aria-live="polite">
            <span>Hasil:</span>
            {category ? (
              <span className={`result-pill result-pill--${category}`}>
                <Icon name="checkCircle" size={15} />
                {category === 'dibeli' ? 'Dibeli' : category === 'tidak' ? 'Tidak Dibeli' : 'Dipertimbangkan'} (
                {formatDegree(quickResult.degree)})
              </span>
            ) : (
              <span className="quick__empty">{quickResult?.error ?? 'Tekan Uji'}</span>
            )}
          </div>
        </div>
      </section>

      <div className={`integrity ${valid ? '' : 'integrity--error'}`} role="status">
        <span className="integrity__icon">
          <Icon name={valid ? 'help' : 'warning'} size={20} />
        </span>
        <div>
          <p className="integrity__title">Status Integritas Validasi: {valid ? 'Valid' : 'Tidak valid'}</p>
          {valid ? (
            <p>Semua batas berurutan dan siap disimpan.</p>
          ) : (
            <ul>
              {errors.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="settings-actions">
        {status && (
          <p className="settings-actions__status" role="status">
            {status}
          </p>
        )}
        <button type="button" className="btn btn--soft btn--large" onClick={handleReset}>
          <Icon name="undo" size={18} />
          Kembalikan ke Awal
        </button>
        <button type="button" className="btn btn--primary btn--large" onClick={handleSave} disabled={!valid}>
          <Icon name="check" size={18} />
          Simpan Pengaturan
        </button>
      </div>
    </>
  )
}
