import { DEFAULT_SETTINGS } from './settings'

// ---------------------------------------------------------------------------
// Mesin logika fuzzy Mamdani: harga + nilai gizi total -> derajat 0 sampai 1.
// ---------------------------------------------------------------------------

export const HARGA_LABELS = [
  { key: 'murah', label: 'Murah' },
  { key: 'normal', label: 'Normal' },
  { key: 'mahal', label: 'Mahal' },
]

export const GIZI_LABELS = [
  { key: 'rendah', label: 'Rendah' },
  { key: 'sedang', label: 'Sedang' },
  { key: 'tinggi', label: 'Tinggi' },
]

// Himpunan keluaran (tetap). Bentuk trapesium [a, b, c, d].
export const OUTPUT_SETS = [
  { key: 'tidak', label: 'Tidak Dibeli', points: [0, 0, 0, 0.4] },
  { key: 'pertimbangkan', label: 'Dipertimbangkan', points: [0.1, 0.5, 0.5, 0.9] },
  { key: 'dibeli', label: 'Dibeli', points: [0.6, 1, 1, 1] },
]

// 9 aturan IF-THEN: harga (murah, normal, mahal) x gizi (rendah, sedang, tinggi)
export const RULES = [
  { id: 'R1', harga: 'murah', gizi: 'rendah', output: 'tidak' },
  { id: 'R2', harga: 'murah', gizi: 'sedang', output: 'pertimbangkan' },
  { id: 'R3', harga: 'murah', gizi: 'tinggi', output: 'dibeli' },
  { id: 'R4', harga: 'normal', gizi: 'rendah', output: 'tidak' },
  { id: 'R5', harga: 'normal', gizi: 'sedang', output: 'pertimbangkan' },
  { id: 'R6', harga: 'normal', gizi: 'tinggi', output: 'dibeli' },
  { id: 'R7', harga: 'mahal', gizi: 'rendah', output: 'tidak' },
  { id: 'R8', harga: 'mahal', gizi: 'sedang', output: 'tidak' },
  { id: 'R9', harga: 'mahal', gizi: 'tinggi', output: 'pertimbangkan' },
]

const STEPS = 100 // resolusi titik saat defuzzifikasi (centroid)

// Fungsi keanggotaan trapesium [a, b, c, d].
// a = b : bahu kiri (bernilai 1 sejak awal)   c = d : bahu kanan (bernilai 1 sampai akhir)
export function membership(x, [a, b, c, d]) {
  const up = b === a ? (x >= a ? 1 : 0) : (x - a) / (b - a)
  const down = d === c ? (x <= d ? 1 : 0) : (d - x) / (d - c)
  return Math.max(0, Math.min(1, up, down))
}

// Membentuk tiga himpunan dari dua batas.
//   low  = batas "murah/rendah sampai": titik silang himpunan pertama dan kedua (nilai 0.5)
//   high = batas "mahal/tinggi mulai" : titik silang himpunan kedua dan ketiga (nilai 0.5)
// Himpunan tengah berbentuk segitiga dengan puncak di tengah kedua batas.
function threeSets(low, high, labels) {
  const mid = (low + high) / 2
  const half = (high - low) / 2
  const lowerEdge = low - half
  const upperEdge = high + half
  return [
    { ...labels[0], points: [0, 0, Math.max(lowerEdge, 0), mid] },
    { ...labels[1], points: [lowerEdge, mid, mid, upperEdge] },
    { ...labels[2], points: [mid, upperEdge, Infinity, Infinity] },
  ]
}

export function buildSets(settings = DEFAULT_SETTINGS) {
  return {
    harga: threeSets(settings.murahSampai, settings.mahalMulai, HARGA_LABELS),
    gizi: threeSets(settings.rendahSampai, settings.tinggiMulai, GIZI_LABELS),
  }
}

export function categoryKey(degree, settings = DEFAULT_SETTINGS) {
  if (degree >= settings.dibeliMulai) return 'dibeli'
  if (degree < settings.tidakDibeliDi) return 'tidak'
  return 'pertimbangkan'
}

const dominant = (mu) => Object.entries(mu).sort((a, b) => b[1] - a[1])[0][0]

// Seluruh proses: fuzzifikasi, aturan, komposisi (max), defuzzifikasi (centroid).
export function evaluate(harga, gizi, settings = DEFAULT_SETTINGS) {
  const sets = buildSets(settings)

  const muHarga = Object.fromEntries(sets.harga.map((s) => [s.key, membership(harga, s.points)]))
  const muGizi = Object.fromEntries(sets.gizi.map((s) => [s.key, membership(gizi, s.points)]))

  const rules = RULES.map((rule) => ({
    ...rule,
    alpha: Math.min(muHarga[rule.harga], muGizi[rule.gizi]),
  }))

  const alphaByOutput = { tidak: 0, pertimbangkan: 0, dibeli: 0 }
  rules.forEach((rule) => {
    alphaByOutput[rule.output] = Math.max(alphaByOutput[rule.output], rule.alpha)
  })

  let num = 0
  let den = 0
  for (let i = 0; i <= STEPS; i++) {
    const x = i / STEPS
    let y = 0
    for (const set of OUTPUT_SETS) {
      y = Math.max(y, Math.min(alphaByOutput[set.key], membership(x, set.points)))
    }
    num += x * y
    den += y
  }
  const degree = den === 0 ? 0 : num / den

  return {
    harga,
    gizi,
    muHarga,
    muGizi,
    hargaDominan: dominant(muHarga),
    giziDominan: dominant(muGizi),
    rules,
    activeRules: rules.filter((rule) => rule.alpha > 0),
    alphaByOutput,
    degree,
    category: categoryKey(degree, settings),
  }
}

// Menghitung dan mengurutkan semua minuman. Peringkat 1 = derajat tertinggi.
// Bila derajat sama: gizi lebih tinggi dulu, lalu harga lebih murah.
export function rankDrinks(drinks, settings = DEFAULT_SETTINGS) {
  return drinks
    .map((drink) => {
      const { degree, category } = evaluate(drink.harga, drink.gizi, settings)
      return { ...drink, degree, category }
    })
    .sort((a, b) => b.degree - a.degree || b.gizi - a.gizi || a.harga - b.harga || a.id - b.id)
    .map((drink, i) => ({ ...drink, rank: i + 1 }))
}
