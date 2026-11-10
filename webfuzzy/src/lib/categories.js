// Teks dan label untuk tiga kategori hasil rekomendasi.
export const CATEGORY_ORDER = ['dibeli', 'pertimbangkan', 'tidak']

export const CATEGORIES = {
  dibeli: {
    key: 'dibeli',
    label: 'Dibeli',
    hint: 'Harga sepadan dengan gizinya',
    taraf: 'Taraf Sangat Layak',
    description:
      'Harga dan nilai gizi minuman ini seimbang. Sangat layak dipilih untuk konsumsi harian Anda.',
    ratio: 'Rasio Unggul',
    cardLabel: 'Layak Beli',
  },
  pertimbangkan: {
    key: 'pertimbangkan',
    label: 'Dipertimbangkan',
    hint: 'Cukup baik, bandingkan dulu',
    taraf: 'Taraf Cukup Layak',
    description:
      'Harga dan nilai gizi cukup baik, tetapi bandingkan dulu dengan pilihan lain sebelum memutuskan.',
    ratio: 'Rasio Cukup',
    cardLabel: 'Pertimbangkan',
  },
  tidak: {
    key: 'tidak',
    label: 'Tidak Dibeli',
    hint: 'Kurang sepadan',
    taraf: 'Taraf Kurang Layak',
    description:
      'Harga kurang sepadan dengan nilai gizinya. Sebaiknya pilih minuman lain.',
    ratio: 'Rasio Rendah',
    cardLabel: 'Kurang Layak',
  },
}

// Label singkat berdasarkan himpunan fuzzy yang paling dominan.
export const HARGA_TAGS = { murah: 'Ekonomis', normal: 'Wajar', mahal: 'Mahal' }
export const GIZI_TAGS = {
  rendah: 'Nutrisi Rendah',
  sedang: 'Nutrisi Cukup',
  tinggi: 'Nutrisi Optimal',
}
