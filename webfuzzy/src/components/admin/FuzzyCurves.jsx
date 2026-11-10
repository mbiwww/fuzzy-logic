import { useId } from 'react'
import { membership } from '../../lib/fuzzy'
import { formatNumber } from '../../lib/format'

const W = 440
const H = 124
const TOP = 10
const SAMPLES = 90

// Pratinjau kurva keanggotaan fuzzy untuk tiga himpunan (kiri, tengah, kanan).
// `low` dan `high` adalah batas yang diatur admin: titik silang kurva (nilai 0.5).
export default function FuzzyCurves({ sets, domainMax, colors, low, high, kind, ariaLabel }) {
  const uid = useId().replace(/:/g, '')
  const x = (v) => (v / domainMax) * W
  const y = (m) => H - m * (H - TOP)

  const line = (points) => {
    let d = ''
    for (let i = 0; i <= SAMPLES; i++) {
      const v = (i / SAMPLES) * domainMax
      d += `${i === 0 ? 'M' : 'L'}${x(v).toFixed(1)} ${y(membership(v, points)).toFixed(1)} `
    }
    return d
  }

  const money = kind === 'harga'
  const fmt = (v) => (money ? `Rp ${formatNumber(v)}` : formatNumber(v))
  const labels = [
    { at: low / 2, range: `≤ ${fmt(low)}`, name: sets[0].label },
    { at: (low + high) / 2, range: `${fmt(low + 1)} - ${fmt(high - 1)}`, name: sets[1].label },
    { at: (high + domainMax) / 2, range: `≥ ${fmt(high)}`, name: sets[2].label },
  ]

  return (
    <div className="curves">
      <svg viewBox={`0 0 ${W} ${H + 4}`} role="img" aria-label={ariaLabel}>
        <defs>
          {colors.map((color, i) => (
            <linearGradient key={color + i} id={`${uid}-g${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        <line className="curves__base" x1="0" x2={W} y1={H} y2={H} />

        {sets.map((set, i) => (
          <g key={set.key}>
            <path d={`${line(set.points)}L${W} ${H}L0 ${H}Z`} fill={`url(#${uid}-g${i})`} />
            <path d={line(set.points)} fill="none" stroke={colors[i]} strokeWidth="2" strokeLinejoin="round" />
          </g>
        ))}

        {[low, high].map((v) => (
          <circle key={v} cx={x(v)} cy={y(0.5)} r="4.5" className="curves__dot" />
        ))}
      </svg>

      <div className="curves__labels">
        {labels.map((item, i) => (
          <div
            key={item.name}
            className="curves__label"
            style={{ left: `${Math.min(Math.max((item.at / domainMax) * 100, 13), 87)}%`, color: colors[i] }}
          >
            <span>{item.range}</span>
            <strong>{item.name}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
