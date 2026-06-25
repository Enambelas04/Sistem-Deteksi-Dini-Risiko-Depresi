import { useState, useRef, useEffect } from 'react'
import { api } from '../services/api.js'

const SARAN_PERTANYAAN = [
  'Berapa kasus risiko tinggi minggu ini?',
  'Bagaimana performa model XGBoost?',
  'Tunjukkan tren risiko 7 hari terakhir',
]

const SAPAAN_AWAL = {
  peran: 'bot',
  teks: 'Halo, saya asisten Aurelia. Saya bisa membantu menjawab pertanyaan seputar data dan hasil klasifikasi di dashboard ini. Tanyakan sesuatu, ya.',
}

export default function Chatbot() {
  const [pesan, setPesan] = useState([SAPAAN_AWAL])
  const [input, setInput] = useState('')
  const [mengetik, setMengetik] = useState(false)
  const [memuatRiwayat, setMemuatRiwayat] = useState(true)
  const bawahRef = useRef(null)

  // Muat riwayat chat dari database saat halaman pertama dibuka
  useEffect(() => {
    api
      .getRiwayatChat()
      .then((riwayat) => {
        if (riwayat.length > 0) {
          setPesan(riwayat.map((r) => ({ peran: r.peran, teks: r.teks })))
        }
      })
      .catch(() => {
        // Kalau gagal memuat riwayat, cukup tampilkan sapaan awal seperti biasa
      })
      .finally(() => setMemuatRiwayat(false))
  }, [])

  useEffect(() => {
    bawahRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [pesan, mengetik])

  async function kirim(teks) {
    const isi = (teks ?? input).trim()
    if (!isi) return

    setPesan((p) => [...p, { peran: 'user', teks: isi }])
    setInput('')
    setMengetik(true)

    try {
      const data = await api.chatbot(isi)
      setPesan((p) => [...p, { peran: 'bot', teks: data.balasan }])
    } catch (e) {
      setPesan((p) => [
        ...p,
        { peran: 'bot', teks: 'Maaf, asisten tidak dapat dihubungi. Pastikan backend sedang berjalan.' },
      ])
    } finally {
      setMengetik(false)
    }
  }

  async function mulaiObrolanBaru() {
    if (!confirm('Hapus seluruh riwayat obrolan? Tindakan ini tidak bisa dibatalkan.')) return
    try {
      await api.hapusRiwayatChat()
    } catch (e) {
      // tetap reset tampilan walau penghapusan di server gagal
    }
    setPesan([SAPAAN_AWAL])
  }

  function handleSubmit(e) {
    e.preventDefault()
    kirim()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] max-w-3xl">
      <header className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.68rem] uppercase tracking-wide text-teal font-semibold mb-1">Asisten &middot; Chatbot</p>
          <h1 className="font-display text-[2.1rem] text-ink leading-tight">Tanya seputar data ke Aurelia</h1>
         
        </div>
        <button
          onClick={mulaiObrolanBaru}
          className="text-xs text-slate hover:text-rust border border-line hover:border-rust/30 rounded-full px-3 py-1.5 transition-colors shrink-0"
        >
          Mulai obrolan baru
        </button>
      </header>

      <div className="flex-1 bg-white rounded-lg border border-line flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {memuatRiwayat ? (
            <div className="space-y-3">
              <div className="h-10 w-2/3 bg-paperDim rounded-2xl animate-pulse" />
              <div className="h-10 w-1/2 bg-paperDim rounded-2xl animate-pulse ml-auto" />
            </div>
          ) : (
            pesan.map((m, i) => <Bubble key={i} peran={m.peran} teks={m.teks} />)
          )}
          {mengetik && <Bubble peran="bot" mengetik />}
          <div ref={bawahRef} />
        </div>

        {pesan.length <= 1 && !memuatRiwayat && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {SARAN_PERTANYAAN.map((s) => (
              <button
                key={s}
                onClick={() => kirim(s)}
                className="text-xs bg-paperDim hover:bg-line text-ink px-3 py-1.5 rounded-full transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="border-t border-line p-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis pertanyaan..."
            className="flex-1 text-sm border border-line rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal/30"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-ink text-paper rounded-full px-4 py-2.5 text-sm font-medium disabled:opacity-40 hover:bg-inkSoft transition-colors"
          >
            Kirim
          </button>
        </form>
      </div>
    </div>
  )
}

function Bubble({ peran, teks, mengetik }) {
  const isBot = peran === 'bot'
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isBot ? 'bg-paperDim text-ink rounded-tl-sm' : 'bg-teal text-white rounded-tr-sm'
        }`}
      >
        {mengetik ? (
          <span className="flex gap-1 py-1">
            <Dot delay="0ms" />
            <Dot delay="120ms" />
            <Dot delay="240ms" />
          </span>
        ) : (
          teks
        )}
      </div>
    </div>
  )
}

function Dot({ delay }) {
  return <span className="h-1.5 w-1.5 rounded-full bg-slate/60 animate-bounce" style={{ animationDelay: delay }} />
}
