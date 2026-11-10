export const MAX_PHOTO_BYTES = 2 * 1024 * 1024
export const PHOTO_TYPES = ['image/jpeg', 'image/png']

// Memeriksa berkas foto. Mengembalikan pesan galat atau null bila aman.
export function checkPhotoFile(file) {
  if (!PHOTO_TYPES.includes(file.type)) return 'Format foto harus JPG atau PNG.'
  if (file.size > MAX_PHOTO_BYTES) return 'Ukuran foto maksimal 2MB.'
  return null
}

// Memotong foto menjadi persegi (1:1) dan mengecilkannya agar muat di penyimpanan browser.
export async function fileToSquareDataUrl(file, maxSide = 480) {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('Foto tidak bisa dibaca.'))
      el.src = url
    })

    const side = Math.min(img.naturalWidth, img.naturalHeight)
    const sx = (img.naturalWidth - side) / 2
    const sy = (img.naturalHeight - side) / 2
    const size = Math.min(maxSide, side)

    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)
    ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)
    return canvas.toDataURL('image/jpeg', 0.82)
  } finally {
    URL.revokeObjectURL(url)
  }
}
