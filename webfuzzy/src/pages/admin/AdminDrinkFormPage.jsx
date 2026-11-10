import { useEffect, useMemo, useState } from 'react'
import CategoryBadge from '../../components/CategoryBadge'
import Icon from '../../components/Icon'
import { GIZI_DOMAIN_MAX } from '../../config'
import { evaluate } from '../../lib/fuzzy'
import { formatDegree, parseNumber } from '../../lib/format'
import { checkPhotoFile, fileToSquareDataUrl } from '../../lib/image'
import { redirect } from '../../lib/useHashRoute'

const NAMA_MAX = 80

// Halaman yang sama dipakai untuk menambah (drink = null) dan mengubah minuman.
export default function AdminDrinkFormPage({ drink, notFound, settings, onSave, onCancel }) {
  const isEdit = Boolean(drink)

  const [nama, setNama] = useState(drink?.nama ?? '')
  const [foto, setFoto] = useState(drink?.foto ?? '')
  const [harga, setHarga] = useState(drink ? String(drink.harga) : '')
  const [gizi, setGizi] = useState(drink ? String(drink.gizi) : '')
  const [errors, setErrors] = useState([])
  const [busy, setBusy] = useState(false)

  // Alamat edit menunjuk minuman yang sudah tidak ada: kembali ke daftar.
  useEffect(() => {
    if (notFound) redirect('#/admin')
  }, [notFound])

  const estimate = useMemo(() => {
    const h = parseNumber(harga)
    const g = parseNumber(gizi)
    if (!(h > 0) || !(g >= 0 && g <= GIZI_DOMAIN_MAX)) return null
    return evaluate(h, g, settings)
  }, [harga, gizi, settings])

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // izinkan memilih berkas yang sama lagi
    if (!file) return

    const problem = checkPhotoFile(file)
    if (problem) {
      setErrors([problem])
      return
    }

    setBusy(true)
    try {
      setFoto(await fileToSquareDataUrl(file))
      setErrors([])
    } catch {
      setErrors(['Foto tidak bisa dibaca. Coba berkas lain.'])
    } finally {
      setBusy(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const list = []
    const h = parseNumber(harga)
    const g = parseNumber(gizi)

    if (nama.trim() === '') list.push('Nama minuman wajib diisi.')
    else if (nama.trim().length > NAMA_MAX) list.push(`Nama minuman maksimal ${NAMA_MAX} karakter.`)

    if (Number.isNaN(h)) list.push('Harga wajib diisi dengan angka.')
    else if (h <= 0) list.push('Harga harus lebih besar dari 0.')

    if (Number.isNaN(g)) list.push('Nilai gizi total wajib diisi dengan angka.')
    else if (g < 0 || g > GIZI_DOMAIN_MAX) {
      list.push(`Nilai gizi total harus antara 0 dan ${GIZI_DOMAIN_MAX}.`)
    }

    setErrors(list)
    if (list.length === 0) onSave({ nama: nama.trim(), harga: h, gizi: g, foto })
  }

  if (notFound) return null

  return (
    <>
      <header className="page-head page-head--form">
        <div>
          <nav className="crumbs" aria-label="Breadcrumb">
            <a href="#/admin">
              <Icon name="arrowLeft" size={16} />
              Kelola minuman
            </a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{isEdit ? 'Edit minuman' : 'Tambah minuman'}</span>
          </nav>
          <h1 className="page-head__title">{isEdit ? 'Edit minuman' : 'Tambah minuman'}</h1>
          <p className="page-head__lead">
            {isEdit
              ? 'Ubah data minuman, lalu simpan. Hasil rekomendasi dan peringkat dihitung ulang otomatis.'
              : 'Isi data minuman baru, lalu simpan. Hasil rekomendasi dan peringkat dihitung otomatis.'}
          </p>
        </div>
      </header>

      <form className="form-panel" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="nama">
            Nama minuman <span className="req">*</span>
          </label>
          <input
            id="nama"
            className="input input--field"
            type="text"
            placeholder="Contoh: Teh Hijau Melati Rendah Gula 300ml"
            maxLength={NAMA_MAX + 20}
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
          <p className="field__hint">Tuliskan nama lengkap termasuk varian rasa dan ukuran volume kaleng.</p>
        </div>

        <div className="field">
          <span className="field__label" id="foto-label">
            Foto minuman <span className="field__optional">(Opsional)</span>
          </span>
          <div className="photo-field" aria-labelledby="foto-label">
            <div className="photo-field__preview">
              {foto ? (
                <img src={foto} alt="Pratinjau foto minuman" />
              ) : (
                <>
                  <Icon name="image" size={28} />
                  <span>Pratinjau foto</span>
                </>
              )}
            </div>
            <div className="photo-field__side">
              <div className="photo-field__buttons">
                <label className="btn btn--soft photo-field__pick">
                  <Icon name="camera" size={18} />
                  {busy ? 'Memproses…' : foto ? 'Ganti Foto' : 'Pilih Foto'}
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handlePhoto}
                    disabled={busy}
                  />
                </label>
                {foto && (
                  <button type="button" className="btn btn--ghost" onClick={() => setFoto('')}>
                    Hapus Foto
                  </button>
                )}
              </div>
              <p className="field__hint">
                Tampil di Top Recommendation. Format JPG atau PNG, maksimal 2MB. Disarankan rasio 1:1.
              </p>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label className="field__label" htmlFor="harga">
              Harga (Rp) <span className="req">*</span>
            </label>
            <div className="affix">
              <span className="affix__pre" aria-hidden="true">
                Rp
              </span>
              <input
                id="harga"
                className="input input--field affix__input"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="Contoh: 4505"
                value={harga}
                onChange={(e) => setHarga(e.target.value)}
              />
            </div>
            <p className="field__hint">Harga eceran resmi dalam Rupiah (hanya angka).</p>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="gizi">
              Nilai gizi total <span className="req">*</span>
            </label>
            <div className="affix">
              <input
                id="gizi"
                className="input input--field affix__input affix__input--post"
                type="number"
                inputMode="decimal"
                min="0"
                max={GIZI_DOMAIN_MAX}
                step="any"
                placeholder="Contoh: 335"
                value={gizi}
                onChange={(e) => setGizi(e.target.value)}
              />
              <span className="affix__post" aria-hidden="true">
                pts
              </span>
            </div>
            <p className="field__hint">Skor gizi total minuman, skala 0 sampai {GIZI_DOMAIN_MAX}.</p>
          </div>
        </div>

        <div className="estimate" aria-live="polite">
          <div>
            <p className="estimate__title">
              <Icon name="trend" size={18} />
              Perkiraan hasil
              {estimate ? (
                <CategoryBadge category={estimate.category} />
              ) : (
                <span className="chip chip--neutral">Belum dihitung</span>
              )}
              {estimate && <span className="estimate__degree">({formatDegree(estimate.degree)})</span>}
            </p>
            <p className="estimate__text">Dihitung otomatis dari harga, gizi, dan Pengaturan Penilaian.</p>
          </div>
          <span className="chip chip--teal">
            <Icon name="sparkles" size={14} />
            Logika fuzzy Mamdani
          </span>
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

        <div className="form-actions">
          <button type="button" className="btn btn--soft btn--large" onClick={onCancel}>
            Batal
          </button>
          <button type="submit" className="btn btn--primary btn--large" disabled={busy}>
            <Icon name="checkCircle" size={18} />
            Simpan
          </button>
        </div>
      </form>

      <ul className="info-cards">
        <li className="info-card">
          <span className="info-card__icon info-card__icon--green">
            <Icon name="checkCircle" size={22} />
          </span>
          <div>
            <h2>Kategori Dibeli</h2>
            <p>
              Derajat hasil mulai {settings.dibeliMulai}. Umumnya gizi tinggi dengan harga murah atau
              normal.
            </p>
          </div>
        </li>
        <li className="info-card">
          <span className="info-card__icon info-card__icon--orange">
            <Icon name="warning" size={22} />
          </span>
          <div>
            <h2>Kategori Dipertimbangkan</h2>
            <p>
              Derajat hasil antara {settings.tidakDibeliDi} dan {settings.dibeliMulai}, misalnya gizi sedang
              atau harga mahal.
            </p>
          </div>
        </li>
        <li className="info-card">
          <span className="info-card__icon info-card__icon--red">
            <Icon name="xCircle" size={22} />
          </span>
          <div>
            <h2>Kategori Tidak Dibeli</h2>
            <p>
              Derajat hasil di bawah {settings.tidakDibeliDi}, misalnya gizi rendah atau harga di luar
              batas wajar.
            </p>
          </div>
        </li>
      </ul>
    </>
  )
}
