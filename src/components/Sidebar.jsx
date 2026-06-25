import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Ringkasan', sub: 'Overview' },
  { to: '/detail', label: 'Detail Analisis', sub: 'XAI' },
  { to: '/riwayat', label: 'Riwayat', sub: 'Histori' },
  { to: '/uji-prediksi', label: 'Uji Prediksi', sub: 'Model' },
  { to: '/chatbot', label: 'Asisten', sub: 'Chatbot' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 bg-ink text-paper flex flex-col h-screen sticky top-0">
      <div className="px-6 py-7 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <PulseMark />
          <span className="font-display text-[1.35rem] tracking-tight">Aurelia</span>
        </div>
        <p className="text-[0.7rem] text-white/45 mt-1.5 leading-snug">
          Sistem Deteksi Dini Risiko Depresi
        </p>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-baseline justify-between rounded-md px-3.5 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-white/10 text-paper'
                  : 'text-white/55 hover:text-white/85 hover:bg-white/5'
              }`
            }
          >
            <span className="font-medium">{item.label}</span>
            <span className="text-[0.65rem] font-mono text-white/30">{item.sub}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-5 border-t border-white/10">
       
      </div>
    </aside>
  )
}

function PulseMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="13" r="12" stroke="#E3EEE9" strokeOpacity="0.25" strokeWidth="1" />
      <path
        d="M2 13H7L9.5 6L13.5 20L16 13H24"
        stroke="#2F6F62"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
