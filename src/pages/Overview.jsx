import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'
import { StatCard, SectionLabel, RiskBadge } from '../components/Bits.jsx'

export default function Overview() {
  const [ringkasan, setRingkasan] = useState(null)
  const [trenHarian, setTrenHarian] = useState([])
  const [performaModel, setPerformaModel] = useState([])
  const [cuitan, setCuitan] = useState([])
  const [status, setStatus] = useState('memuat') // memuat | siap | error

  useEffect(() => {
    let batal = false

    Promise.all([api.getRingkasan(), api.getTrenHarian(), api.getPerformaModel(), api.getDaftarCuitan()])
      .then(([r, tren, performa, daftar]) => {
        if (batal) return
        setRingkasan(r)
        setTrenHarian(tren)
        setPerformaModel(performa)
        setCuitan(daftar)
        setStatus('siap')
      })
      .catch(() => {
        if (!batal) setStatus('error')
      })

    return () => {
      batal = true
    }
  }, [])

  if (status === 'memuat') return <Memuat />
  if (status === 'error') return <GagalMuat />

  const perlu = cuitan.filter((c) => c.statusTinjau !== 'Ditinjau')

  return (
    <div>
      <header className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-[0.68rem] uppercase tracking-wide text-teal font-semibold mb-1">
            Ringkasan &middot; {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="font-display text-[2.1rem] text-ink leading-tight">
            Detak linguistik dari 1.342 akun terpantau
          </h1>
          <p className="text-sm text-slate mt-2 max-w-xl">
            Pipeline n8n menarik cuitan publik setiap 15 menit, lalu model ansambel
            mengklasifikasikan tingkat risiko sebelum diteruskan ke pakar kesehatan.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-4 gap-4 mb-8">
        <StatCard eyebrow="Cuitan dianalisis" value={ringkasan.totalCuitanDianalisis.toLocaleString('id-ID')} note="14 hari terakhir" />
        <StatCard eyebrow="Risiko tinggi" value={ringkasan.risikoTinggi} accent="text-rust" note="perlu tinjauan segera" />
        <StatCard eyebrow="Risiko sedang" value={ringkasan.risikoSedang} accent="text-amber" note="dalam pemantauan" />
        <StatCard eyebrow="Akurasi model (XGBoost)" value={(ringkasan.akurasiModel * 100).toFixed(1)} suffix="%" note={`F1-score ${(ringkasan.f1Score * 100).toFixed(1)}%`} accent="text-teal" />
      </section>

      <section className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 bg-white rounded-lg border border-line p-6">
          <SectionLabel eyebrow="Tren 14 hari" title="Volume deteksi per tingkat risiko" />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trenHarian} margin={{ left: -16 }}>
              <defs>
                <linearGradient id="gTinggi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B6493B" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#B6493B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#EDE9E1" vertical={false} />
              <XAxis dataKey="tanggal" tick={{ fontSize: 11, fill: '#5B6770' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#5B6770' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #DAD4C8' }} labelStyle={{ fontWeight: 600 }} />
              <Area type="monotone" dataKey="rendah" stackId="1" stroke="#2F6F62" fill="#2F6F62" fillOpacity={0.18} name="Rendah" />
              <Area type="monotone" dataKey="sedang" stackId="1" stroke="#C98A3B" fill="#C98A3B" fillOpacity={0.28} name="Sedang" />
              <Area type="monotone" dataKey="tinggi" stackId="1" stroke="#B6493B" fill="url(#gTinggi)" name="Tinggi" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-line p-6">
          <SectionLabel eyebrow="Perbandingan" title="Performa algoritma" />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={performaModel} layout="vertical" margin={{ left: 0 }}>
              <CartesianGrid stroke="#EDE9E1" horizontal={false} />
              <XAxis type="number" domain={[0.8, 1]} tick={{ fontSize: 10, fill: '#5B6770' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="model" type="category" tick={{ fontSize: 11, fill: '#1B2430' }} axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #DAD4C8' }} />
              <Bar dataKey="akurasi" fill="#2F6F62" radius={[0, 4, 4, 0]} barSize={18} name="Akurasi" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate mt-2">
            XGBoost memimpin dengan akurasi {(performaModel[2]?.akurasi * 100).toFixed(1)}% — melampaui target 90%.
          </p>
        </div>
      </section>

      <section className="bg-white rounded-lg border border-line p-6">
        <div className="flex items-center justify-between mb-4">
          <SectionLabel eyebrow="Antrean" title="Perlu tinjauan pakar" desc="Cuitan dengan skor risiko tinggi atau sedang yang belum ditinjau." />
          <Link to="/riwayat" className="text-sm text-teal font-medium hover:underline shrink-0">Lihat semua →</Link>
        </div>
        <div className="divide-y divide-line">
          {perlu.map((c) => (
            <Link to={`/detail/${c.id}`} key={c.id} className="flex items-center gap-4 py-3.5 group">
              <span className="font-mono text-xs text-slate w-24 shrink-0">{c.id}</span>
              <span className="text-sm text-ink flex-1 truncate group-hover:text-teal transition-colors">{c.teks}</span>
              <span className="text-xs text-slate w-32 shrink-0">{c.akun}</span>
              <RiskBadge risiko={c.risiko} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

function Memuat() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-72 bg-paperDim rounded animate-pulse" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-paperDim rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="h-72 bg-paperDim rounded-lg animate-pulse" />
    </div>
  )
}

function GagalMuat() {
  return (
    <div className="bg-rust-soft border border-rust/20 rounded-lg p-6 max-w-lg">
      <p className="text-rust font-medium mb-1">Gagal memuat data dari backend</p>
      <p className="text-sm text-ink/80">
        Pastikan backend Flask berjalan dan dapat diakses lewat <code className="font-mono text-xs">/api</code>.
        Cek apakah container <code className="font-mono text-xs">aurelia-backend</code> aktif.
      </p>
    </div>
  )
}
