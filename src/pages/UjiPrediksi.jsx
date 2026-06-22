import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import { api } from '../services/api.js'
import { RiskBadge, SectionLabel } from '../components/Bits.jsx'

const CONTOH = [
  "I feel so empty and tired all the time, nothing makes sense anymore",
  "Had a great day at the park with my family, feeling grateful",
  "I'm tired of pretending I'm okay in front of everyone, every single day",
]

export default function UjiPrediksi() {
  const [teks, setTeks] = useState('')
  const [hasil, setHasil] = useState(null)
  const [status, setStatus] = useState('idle') // idle | memuat | siap | error
  const [pesanError, setPesanError] = useState('')

  async function jalankan(teksInput) {
    const isi = (teksInput ?? teks).trim()
    if (!isi) return
    setStatus('memuat')
    try {
      const data = await api.predict(isi)
      setHasil(data)
      setStatus('siap')
    } catch (e) {
      setPesanError(e.message)
      setStatus('error')
    }
  }

  return (
    <div className="max-w-3xl">
      <header className="mb-7">
        <p className="text-[0.68rem] uppercase tracking-wide text-teal font-semibold mb-1">Uji Coba &middot; Model Asli</p>
        <h1 className="font-display text-[2.1rem] text-ink leading-tight">Coba model XGBoost secara langsung</h1>
        <p className="text-sm text-slate mt-2">
          Tulis teks (bahasa Inggris — sesuai dataset training saat ini), model akan memprediksi
          skor risiko secara real-time beserta penjelasan SHAP.
        </p>
        <div className="mt-3 bg-amber-soft text-amber-900/80 text-xs rounded-md px-3 py-2 inline-block">
          ⚠️ Model ini dilatih dengan dataset label biner berkualitas terbatas (lihat catatan sebelumnya) —
          hasil di sini untuk uji teknis integrasi, bukan acuan klinis.
        </div>
      </header>

      <div className="bg-white rounded-lg border border-line p-5 mb-6">
        <textarea
          value={teks}
          onChange={(e) => setTeks(e.target.value)}
          placeholder="Tulis atau tempel teks di sini..."
          rows={4}
          className="w-full text-sm border border-line rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal/30 resize-none"
        />
        <div className="flex items-center justify-between mt-3">
          <div className="flex flex-wrap gap-1.5">
            {CONTOH.map((c, i) => (
              <button
                key={i}
                onClick={() => {
                  setTeks(c)
                  jalankan(c)
                }}
                className="text-xs bg-paperDim hover:bg-line text-ink px-3 py-1.5 rounded-full transition-colors"
              >
                Contoh {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => jalankan()}
            disabled={!teks.trim() || status === 'memuat'}
            className="bg-ink text-paper rounded-full px-5 py-2 text-sm font-medium disabled:opacity-40 hover:bg-inkSoft transition-colors"
          >
            {status === 'memuat' ? 'Memprediksi...' : 'Prediksi'}
          </button>
        </div>
      </div>

      {status === 'error' && (
        <div className="bg-rust-soft border border-rust/20 rounded-lg p-5 mb-6">
          <p className="text-rust font-medium mb-1">Gagal memprediksi</p>
          <p className="text-sm text-ink/80">{pesanError}</p>
        </div>
      )}

      {status === 'siap' && hasil && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-line p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate mb-1">Skor probabilitas risiko</p>
              <p className="font-mono text-3xl text-ink">{hasil.skor.toFixed(3)}</p>
            </div>
            <RiskBadge risiko={hasil.risiko} />
          </div>

          {hasil.xai?.shap?.length > 0 && (
            <div className="bg-white rounded-lg border border-line p-6">
              <SectionLabel eyebrow="SHAP" title="Kontribusi kata terhadap skor" desc="Dihitung langsung dari model XGBoost (TreeExplainer), bukan data simulasi." />
              <ResponsiveContainer width="100%" height={Math.max(160, hasil.xai.shap.length * 36)}>
                <BarChart data={hasil.xai.shap} layout="vertical" margin={{ left: 0 }}>
                  <CartesianGrid stroke="#EDE9E1" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#5B6770' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="fitur" type="category" tick={{ fontSize: 11, fill: '#1B2430' }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #DAD4C8' }} />
                  <Bar dataKey="kontribusi" radius={[0, 4, 4, 0]} barSize={16}>
                    {hasil.xai.shap.map((entry, i) => (
                      <Cell key={i} fill={entry.kontribusi >= 0 ? '#B6493B' : '#2F6F62'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-slate mt-2">Merah = mendorong ke risiko lebih tinggi, hijau = mendorong ke risiko lebih rendah.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
