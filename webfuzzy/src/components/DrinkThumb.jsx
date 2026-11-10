import Icon from './Icon'

const TONES = ['green', 'orange', 'teal']
const ICONS = ['bolt', 'sparkles', 'cube']

// Kaleng ilustrasi dipakai bila minuman belum punya foto.
export function CanArt({ tone = 'green', icon = 'bolt', className }) {
  return (
    <span className={`can can--${tone} ${className ?? ''}`} aria-hidden="true">
      <span className="can__rim" />
      <Icon name={icon} size={20} strokeWidth={1.8} />
    </span>
  )
}

// Foto minuman. Tanpa foto, tampil kaleng ilustrasi (warna mengikuti `index`).
export default function DrinkThumb({ drink, index = 0, className }) {
  if (drink.foto) {
    return <img className={className} src={drink.foto} alt={drink.nama} loading="lazy" />
  }
  return (
    <span className={`thumb-fallback ${className ?? ''}`} role="img" aria-label={drink.nama}>
      <CanArt tone={TONES[index % 3]} icon={ICONS[index % 3]} />
    </span>
  )
}
