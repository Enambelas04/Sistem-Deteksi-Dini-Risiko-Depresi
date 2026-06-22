import { getRiskColor } from '../data/dummyData.js'

export function RiskBadge({ risiko }) {
  const c = getRiskColor(risiko)
  const label = risiko === 'tinggi' ? 'Risiko Tinggi' : risiko === 'sedang' ? 'Risiko Sedang' : 'Risiko Rendah'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {label}
    </span>
  )
}

export function StatCard({ eyebrow, value, suffix, note, accent = 'text-ink' }) {
  return (
    <div className="bg-white rounded-lg border border-line px-5 py-4">
      <p className="text-[0.68rem] uppercase tracking-wide text-slate font-medium">{eyebrow}</p>
      <p className={`font-display text-3xl mt-1.5 ${accent}`}>
        {value}
        {suffix && <span className="text-base font-body text-slate ml-1">{suffix}</span>}
      </p>
      {note && <p className="text-xs text-slate mt-1.5">{note}</p>}
    </div>
  )
}

export function SectionLabel({ eyebrow, title, desc }) {
  return (
    <div className="mb-5">
      {eyebrow && (
        <p className="text-[0.68rem] uppercase tracking-wide text-teal font-semibold mb-1">{eyebrow}</p>
      )}
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      {desc && <p className="text-sm text-slate mt-1 max-w-2xl">{desc}</p>}
    </div>
  )
}
