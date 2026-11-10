import { SITE_NAME } from '../config'
import Icon from './Icon'

// tone="light" dipakai di sidebar hijau. badge/sub menambah chip dan teks kecil di bawah nama.
export default function Brand({ href = '#/', tone, badge, sub }) {
  return (
    <a href={href} className={`brand ${tone ? `brand--${tone}` : ''}`}>
      <span className="brand__logo" aria-hidden="true">
        <Icon name="cup" size={22} />
      </span>
      <span className="brand__text">
        <span className="brand__line">
          <span className="brand__name">{SITE_NAME}</span>
          {badge && <span className="chip">{badge}</span>}
        </span>
        {sub && <span className="brand__sub">{sub}</span>}
      </span>
    </a>
  )
}
