export const formatNumber = (n) => Number(n).toLocaleString('id-ID')

export const formatRupiah = (n) => `Rp ${formatNumber(n)}`

// Derajat keanggotaan ditampilkan 2 angka di belakang koma, mis. 0.84
export const formatDegree = (d) => Number(d).toFixed(2)

// Indeks kelayakan 0 sampai 100
export const toIndex = (d) => Math.round(d * 100)

// Mengubah isi kolom menjadi angka. Kolom kosong atau bukan angka menghasilkan NaN.
export const parseNumber = (value) => {
  const text = String(value ?? '').trim()
  return text === '' ? NaN : Number(text)
}
