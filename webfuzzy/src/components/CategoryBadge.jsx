import { CATEGORIES } from '../lib/categories'

// variant "solid": label berwarna penuh (halaman publik)
// variant "soft" : label lembut dengan titik (tabel admin)
export default function CategoryBadge({ category, variant = 'solid', size }) {
  const label = CATEGORIES[category].label
  const classes = ['badge', `badge--${variant}`, `badge--${category}`, size && `badge--${size}`]
  return (
    <span className={classes.filter(Boolean).join(' ')}>
      {variant === 'soft' && <span className="badge__dot" aria-hidden="true" />}
      {label}
    </span>
  )
}
