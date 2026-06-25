import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { api } from '../services/api.js'
import { getRiskColor } from '../data/dummyData.js'
import { RiskBadge, SectionLabel } from '../components/Bits.jsx'

export default function Detail() {
  const { id } = useParams()
  const [daftar, setDaftar] = useState([])
  const [aktif, setAktif] = useState(null)
  const [xai, setXai] = useState(null)
  const [xaiStatus, setXaiStatus] = useState('memuat') // memuat | siap | kosong
  const [status, setStatus] = useState('memuat')

  // Ambil daftar cuitan sekali di awal, untuk panel pemilihan di kiri
  useEffect(() => {
    api
      .getDaftarCuitan()
      .then((data) => {
        setDaftar(data)
        setStatus('siap')
      })
      .catch(() => setStatus('error'))
  }, [])

  // Tentukan cuitan aktif: dari parameter URL, atau cuitan pertama yang punya XAI
  useEffect(() => {
    if (status !== 'siap' || daftar.length === 0) return
    const dipilih = daftar.find((c) => c.id === id) || daftar[0]
    setAktif(dipilih)
  }, [status, daftar, id])

  // Ambil penjelasan XAI untuk cuitan aktif
  useEffect(() => {
    if (!aktif) return
    setXaiStatus('memuat')
    api
      .getCuitanXAI(aktif.id)
      .then((data) => {
        setXai(data)
        setXaiStatus('siap')
      })
      .catch(() => {
        setXai(null)
        setXaiStatus('kosong')
      })
  }, [aktif])

  if (status === 'memuat' || !aktif) return <Memuat />
  if (status === 'error') return <GagalMuat />

  return (
    <div>
      <header className="mb-7">
        <p className="text-[0.68rem] uppercase tracking-wide text-teal font-semibold mb-1">Detail Analisis &middot; Explainable AI</p>
        <h1 className="font-display text-[2.1rem] text-ink leading-tight">Mengapa model memberi skor ini?</h1>
        <p className="text-sm text-slate mt-2 max-w-xl">
          SHAP mengukur kontribusi setiap fitur linguistik terhadap skor risiko, sementara LIME
          menandai frasa spesifik dalam teks yang paling memengaruhi prediksi.
        </p>
      </header>

      <div className="grid grid-cols-[280px_1fr] gap-6">
        <aside className="bg-white rounded-lg border border-line p-3 h-fit">
          <p className="text-[0.68rem] uppercase tracking-wide text-slate font-medium px-2 pt-1 pb-2">Pilih cuitan</p>
          <div className="space-y-1">
            {daftar.map((c) => (
              <Link
                key={c.id}
                to={`/detail/${c.id}`}
                className={`block rounded-md px-3 py-2.5 transition-colors ${
                  c.id === aktif.id ? 'bg-teal-soft' : 'hover:bg-paperDim'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[0.65rem] text-slate">{c.id}</span>
                  <span className={`h-1.5 w-1.5 rounded-full ${getRiskColor(c.risiko).dot}`} />
                </div>
                <p className="text-xs text-ink line-clamp-2 leading-snug">{c.teks}</p>
              </Link>
            ))}
          </div>
        </aside>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-line p-6">
            <div className="flex items-start justify-between mb-4">
              <p className="font-mono text-xs text-slate">{aktif.id} &middot; {aktif.akun} &middot; {aktif.waktu}</p>
              <RiskBadge risiko={aktif.risiko} />
            </div>

            {xaiStatus === 'siap' && xai ? (
              <p className="font-display text-xl text-ink leading-relaxed mb-2">
                {renderHighlighted(aktif.teks, xai.limeHighlight)}
              </p>
            ) : (
              <p className="font-display text-xl text-ink leading-relaxed mb-2">{aktif.teks}</p>
            )}
            <p className="text-xs text-slate mt-3">
              Skor risiko: <span className="font-mono font-medium text-ink">{aktif.skor.toFixed(2)}</span> &middot; Model: {aktif.model}
            </p>
          </div>

          {xaiStatus === 'memuat' && (
            <div className="h-48 bg-paperDim rounded-lg animate-pulse" />
          )}

          {xaiStatus === 'siap' && xai && (
            <>
              <div className="bg-white rounded-lg border border-line p-6">
                <SectionLabel eyebrow="SHAP" title="Kontribusi fitur terhadap skor risiko" desc="Semakin panjang batang, semakin besar dorongan fitur tersebut menuju klasifikasi risiko tinggi." />
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={xai.shap} layout="vertical" margin={{ left: 0 }}>
                    <CartesianGrid stroke="#EDE9E1" horizontal={false} />
                    <XAxis type="number" domain={[0, 0.3]} tick={{ fontSize: 10, fill: '#5B6770' }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="fitur" type="category" tick={{ fontSize: 10.5, fill: '#1B2430' }} axisLine={false} tickLine={false} width={230} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #DAD4C8' }} />
                    <Bar dataKey="kontribusi" fill="#B6493B" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg border border-line p-6">
                <SectionLabel eyebrow="LIME" title="Frasa kunci dalam teks" desc="Frasa dengan bobot lebih tinggi (warna lebih pekat) paling memengaruhi prediksi model." />
                <div className="space-y-2.5">
                  {xai.limeHighlight.map((h, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1 bg-paperDim rounded h-7 relative overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-rust rounded" style={{ width: `${h.bobot * 100}%`, opacity: 0.75 }} />
                        <span className="absolute inset-0 flex items-center px-3 text-xs text-ink font-medium">{h.teks}</span>
                      </div>
                      <span className="font-mono text-xs text-slate w-10 text-right">{h.bobot.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-inkSoft text-paper rounded-lg p-6">
                <p className="text-[0.68rem] uppercase tracking-wide text-white/50 font-medium mb-2">Catatan klinis untuk pakar</p>
                <p className="text-sm leading-relaxed text-white/90">{xai.catatanKlinis}</p>
              </div>
            </>
          )}

          {xaiStatus === 'kosong' && (
            <div className="bg-white rounded-lg border border-line p-6 text-sm text-slate">
              Penjelasan SHAP/LIME terperinci belum tersedia untuk cuitan ini. Biasanya hanya dihitung
              untuk cuitan dengan risiko tinggi yang telah melalui proses inferensi lengkap.
              Coba pilih <span className="font-mono text-xs">TWT-10231</span> di panel kiri.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function renderHighlighted(teks, highlights) {
  let parts = [{ text: teks, bobot: 0 }]
  highlights
    .slice()
    .sort((a, b) => b.teks.length - a.teks.length)
    .forEach((h) => {
      parts = parts.flatMap((p) => {
        if (p.bobot > 0 || !p.text.includes(h.teks)) return [p]
        const idx = p.text.indexOf(h.teks)
        const before = p.text.slice(0, idx)
        const after = p.text.slice(idx + h.teks.length)
        const out = []
        if (before) out.push({ text: before, bobot: 0 })
        out.push({ text: h.teks, bobot: h.bobot })
        if (after) out.push({ text: after, bobot: 0 })
        return out
      })
    })
  return parts.map((p, i) =>
    p.bobot > 0 ? (
      <span key={i} className="bg-rust-soft text-rust rounded px-0.5" style={{ opacity: 0.55 + p.bobot * 0.45 }}>
        {p.text}
      </span>
    ) : (
      <span key={i}>{p.text}</span>
    )
  )
}

function Memuat() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-72 bg-paperDim rounded animate-pulse" />
      <div className="grid grid-cols-[280px_1fr] gap-6">
        <div className="h-64 bg-paperDim rounded-lg animate-pulse" />
        <div className="h-96 bg-paperDim rounded-lg animate-pulse" />
      </div>
    </div>
  )
}

function GagalMuat() {
  return (
    <div className="bg-rust-soft border border-rust/20 rounded-lg p-6 max-w-lg">
      <p className="text-rust font-medium mb-1">Gagal memuat data dari backend</p>
      <p className="text-sm text-ink/80">
        Pastikan backend Flask berjalan dan dapat diakses lewat <code className="font-mono text-xs">/api</code>.
      </p>
    </div>
  )
}
