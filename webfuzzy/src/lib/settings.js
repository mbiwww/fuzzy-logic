import { GIZI_DOMAIN_MAX, HARGA_DOMAIN_MAX } from '../config'
import { formatNumber } from './format'

// Nilai awal pengaturan penilaian.
//   murahSampai / mahalMulai   : batas harga (Rp)
//   rendahSampai / tinggiMulai : batas nilai gizi total
//   dibeliMulai                : hasil defuzzifikasi >= nilai ini -> Dibeli
//   tidakDibeliDi              : hasil defuzzifikasi <  nilai ini -> Tidak Dibeli
export const DEFAULT_SETTINGS = {
  murahSampai: 4000,
  mahalMulai: 8000,
  rendahSampai: 150,
  tinggiMulai: 250,
  dibeliMulai: 0.7,
  tidakDibeliDi: 0.4,
}

export const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS)

const NAMES = {
  murahSampai: 'Batas murah',
  mahalMulai: 'Batas mahal',
  rendahSampai: 'Batas rendah',
  tinggiMulai: 'Batas tinggi',
  dibeliMulai: 'Batas Dibeli',
  tidakDibeliDi: 'Batas Tidak Dibeli',
}

// Memeriksa nilai pengaturan (angka, bukan teks). Mengembalikan daftar pesan galat.
export function validateSettings(values) {
  const errors = []

  SETTING_KEYS.forEach((key) => {
    if (!Number.isFinite(values[key])) errors.push(`${NAMES[key]} harus diisi dengan angka.`)
  })
  if (errors.length > 0) return errors

  const v = values

  if (v.murahSampai <= 0) errors.push('Batas murah harus lebih besar dari 0.')
  if (v.murahSampai >= v.mahalMulai) {
    errors.push('Batas murah harus lebih kecil dari batas mahal.')
  }
  if (v.mahalMulai > HARGA_DOMAIN_MAX) {
    errors.push(`Batas mahal tidak boleh lebih dari Rp ${formatNumber(HARGA_DOMAIN_MAX)}.`)
  }

  if (v.rendahSampai <= 0) errors.push('Batas rendah harus lebih besar dari 0.')
  if (v.rendahSampai >= v.tinggiMulai) {
    errors.push('Batas gizi tidak berurutan: batas rendah harus lebih kecil dari batas tinggi.')
  }
  if (v.tinggiMulai > GIZI_DOMAIN_MAX) {
    errors.push(`Batas tinggi tidak boleh lebih dari ${GIZI_DOMAIN_MAX}.`)
  }

  if (v.tidakDibeliDi < 0 || v.dibeliMulai > 1) {
    errors.push('Batas hasil rekomendasi harus berada di antara 0 dan 1.')
  }
  if (v.tidakDibeliDi >= v.dibeliMulai) {
    errors.push('Batas Tidak Dibeli harus lebih kecil dari batas Dibeli.')
  }

  return errors
}

// Dipakai saat membaca pengaturan dari penyimpanan browser.
export function sanitizeSettings(raw) {
  if (!raw || typeof raw !== 'object') return DEFAULT_SETTINGS
  const merged = Object.fromEntries(SETTING_KEYS.map((key) => [key, Number(raw[key])]))
  return validateSettings(merged).length === 0 ? merged : DEFAULT_SETTINGS
}
