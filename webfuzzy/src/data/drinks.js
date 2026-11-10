// Data awal minuman. Nama dan foto bisa diubah lewat panel admin.
// Harga dan nilai gizi total diambil dari 20 sampel pada desain sebelumnya.
export const SEED_DRINKS = [
  { id: 1, nama: 'Sampel 1', harga: 7475, gizi: 286, foto: '' },
  { id: 2, nama: 'Sampel 2', harga: 6200, gizi: 190, foto: '' },
  { id: 3, nama: 'Sampel 3', harga: 7435, gizi: 255, foto: '' },
  { id: 4, nama: 'Sampel 4', harga: 7435, gizi: 259, foto: '' },
  { id: 5, nama: 'Sampel 5', harga: 5820, gizi: 177, foto: '' },
  { id: 6, nama: 'Sampel 6', harga: 5820, gizi: 153, foto: '' },
  { id: 7, nama: 'Sampel 7', harga: 8890, gizi: 195, foto: '' },
  { id: 8, nama: 'Sampel 8', harga: 5820, gizi: 306, foto: '' },
  { id: 9, nama: 'Sampel 9', harga: 5490, gizi: 30, foto: '' },
  { id: 10, nama: 'Sampel 10', harga: 6350, gizi: 245, foto: '' },
  { id: 11, nama: 'Sampel 11', harga: 5600, gizi: 177, foto: '' },
  { id: 12, nama: 'Sampel 12', harga: 5935, gizi: 325, foto: '' },
  { id: 13, nama: 'Sampel 13', harga: 5100, gizi: 220, foto: '' },
  { id: 14, nama: 'Sampel 14', harga: 6800, gizi: 238, foto: '' },
  { id: 15, nama: 'Sampel 15', harga: 9200, gizi: 147, foto: '' },
  { id: 16, nama: 'Sampel 16', harga: 6450, gizi: 212, foto: '' },
  { id: 17, nama: 'Sampel 17', harga: 8900, gizi: 125, foto: '' },
  { id: 18, nama: 'Sampel 18', harga: 7900, gizi: 282, foto: '' },
  { id: 19, nama: 'Sampel 19', harga: 4505, gizi: 335, foto: '' },
  { id: 20, nama: 'Sampel 20', harga: 3769, gizi: 253, foto: '' },
]

export const nextDrinkId = (drinks) => drinks.reduce((max, d) => Math.max(max, d.id), 0) + 1

// Memeriksa data lama dari penyimpanan browser.
export function sanitizeDrinks(raw, fallback) {
  if (!Array.isArray(raw)) return fallback
  const valid = raw.every(
    (d) =>
      d &&
      Number.isFinite(d.id) &&
      typeof d.nama === 'string' &&
      Number.isFinite(d.harga) &&
      Number.isFinite(d.gizi),
  )
  return valid ? raw.map((d) => ({ ...d, foto: typeof d.foto === 'string' ? d.foto : '' })) : fallback
}
