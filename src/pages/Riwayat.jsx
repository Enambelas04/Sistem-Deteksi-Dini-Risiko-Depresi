import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'
import { RiskBadge } from '../components/Bits.jsx'

const filterRisiko = ['semua', 'tinggi', 'sedang', 'rendah']

export default function Riwayat() {
  const [daftar, setDaftar] = useState([])
  const [status, setStatus] = useState('memuat')
  const [filter, setFilter] = useState('semua')
  const [cari, setCari] = useState('')

  useEffect(() => {
    api
      .getDaftarCuitan()
      .then((data) => {
        setDaftar(data)
        setStatus('siap')
      })
      .catch(() => setStatus('error'))
  }, [])

  const data = useMemo(() => {
    return daftar.filter((c) => {
      const cocokRisiko = filter === 'semua' || c.risiko === filter
      const cocokCari =
        cari.trim() === '' ||
        c.teks.toLowerCase().includes(cari.toLowerCase()) ||
        c.akun.toLowerCase().includes(cari.toLowerCase())
      return cocokRisiko && cocokCari
    })
  }, [daftar, filter, cari])

  return (
    <div>
      <header className="mb-7 flex items-end justify-between">
        <div>
          <p className="text-[0.68rem] uppercase tracking-wide text-teal font-semibold mb-1">Riwayat</p>
          <h1 className="font-display text-[2.1rem] text-ink leading-tight">Histori klasifikasi cuitan</h1>
          <p className="text-sm text-slate mt-2 max-w-xl">
            Seluruh cuitan yang telah melewati pipeline n8n dan diberi skor oleh model ansambel.
          </p>
        </div>
      </header>

      {status === 'error' && (
        <div className="bg-rust-soft border border-rust/20 rounded-lg p-6 mb-6 max-w-lg">
          <p className="text-rust font-medium mb-1">Gagal memuat data dari backend</p>
          <p className="text-sm text-ink/80">
            Pastikan backend Flask berjalan dan dapat diakses lewat <code className="font-mono text-xs">/api</code>.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg border border-line">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-line">
          <input
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari teks atau akun..."
            className="text-sm border border-line rounded-md px-3 py-1.5 w-64 focus:outline-none focus:ring-2 focus:ring-teal/30"
          />
          <div className="flex gap-1.5 ml-auto">
            {filterRisiko.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full capitalize transition-colors ${
                  filter === f ? 'bg-ink text-paper' : 'bg-paperDim text-slate hover:bg-line'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[0.68rem] uppercase tracking-wide text-slate">
              <th className="px-6 py-3 font-medium">ID</th>
              <th className="px-3 py-3 font-medium">Akun</th>
              <th className="px-3 py-3 font-medium">Cuitan</th>
              <th className="px-3 py-3 font-medium">Skor</th>
              <th className="px-3 py-3 font-medium">Risiko</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {status === 'memuat' &&
              [...Array(4)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-6 py-3.5">
                    <div className="h-4 bg-paperDim rounded animate-pulse" />
                  </td>
                </tr>
              ))}

            {status === 'siap' &&
              data.map((c) => (
                <tr key={c.id} className="hover:bg-paperDim/60 transition-colors">
                  <td className="px-6 py-3.5 font-mono text-xs text-slate">{c.id}</td>
                  <td className="px-3 py-3.5 text-xs text-ink">{c.akun}</td>
                  <td className="px-3 py-3.5 text-ink max-w-md truncate">{c.teks}</td>
                  <td className="px-3 py-3.5 font-mono text-xs text-ink">{c.skor.toFixed(2)}</td>
                  <td className="px-3 py-3.5"><RiskBadge risiko={c.risiko} /></td>
                  <td className="px-3 py-3.5 text-xs text-slate">{c.statusTinjau}</td>
                  <td className="px-6 py-3.5 text-right">
                    <Link to={`/detail/${c.id}`} className="text-teal text-xs font-medium hover:underline">
                      Lihat detail →
                    </Link>
                  </td>
                </tr>
              ))}

            {status === 'siap' && data.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate">
                  Tidak ada cuitan yang cocok dengan filter ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
