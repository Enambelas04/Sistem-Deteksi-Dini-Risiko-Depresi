import { useState, useRef, useEffect } from 'react'

// Respons dummy untuk simulasi UI. Nanti tinggal diganti dengan panggilan
// ke webhook n8n, misalnya:
//
//   const res = await fetch('https://n8n.contoh.com/webhook/asisten-aurelia', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ pesan: teksPengguna }),
//   })
//   const data = await res.json()
//   // data.balasan -> teks jawaban dari workflow n8n
//
const RESPON_DUMMY = [
  'Berdasarkan data 14 hari terakhir, ada 86 cuitan dengan klasifikasi risiko tinggi yang menunggu tinjauan.',
  'Model XGBoost saat ini mencatat akurasi 93.2% dengan F1-score 91.8% pada data validasi.',
  'Saya bisa membantu merangkum kasus, tapi keputusan klinis tetap perlu ditinjau oleh pakar kesehatan ya.',
  'Ada 3 cuitan baru dari akun yang sebelumnya pernah terklasifikasi risiko sedang dalam 24 jam terakhir.',
  'Fitur linguistik yang paling sering muncul pada klasifikasi risiko tinggi minggu ini adalah kosakata afek negatif dan indikasi isolasi sosial.',
]

const SARAN_PERTANYAAN = [
  'Berapa kasus risiko tinggi minggu ini?',
  'Bagaimana performa model XGBoost?',
  'Tunjukkan tren risiko 7 hari terakhir',
]

export default function Chatbot() {
  const [pesan, setPesan] = useState([
    {
      peran: 'bot',
      teks: 'Halo, saya asisten Aurelia. Saya bisa membantu menjawab pertanyaan seputar data dan hasil klasifikasi di dashboard ini. Tanyakan sesuatu, ya.',
    },
  ])
  const [input, setInput] = useState('')
  const [mengetik, setMengetik] = useState(false)
  const bawahRef = useRef(null)

  useEffect(() => {
    bawahRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [pesan, mengetik])

  function kirim(teks) {
    const isi = (teks ?? input).trim()
    if (!isi) return

    setPesan((p) => [...p, { peran: 'user', teks: isi }])
    setInput('')
    setMengetik(true)

    // Simulasi delay jawaban, seakan menunggu respons dari workflow n8n
    setTimeout(() => {
      const balasan = RESPON_DUMMY[Math.floor(Math.random() * RESPON_DUMMY.length)]
      setPesan((p) => [...p, { peran: 'bot', teks: balasan }])
      setMengetik(false)
    }, 900 + Math.random() * 700)
  }

  function handleSubmit(e) {
    e.preventDefault()
    kirim()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] max-w-3xl">
      <header className="mb-5">
        <p className="text-[0.68rem] uppercase tracking-wide text-teal font-semibold mb-1">Asisten &middot; Chatbot</p>
        <h1 className="font-display text-[2.1rem] text-ink leading-tight">Tanya seputar data ke Aurelia</h1>
        <p className="text-sm text-slate mt-2">
          Tampilan ini masih memakai respons simulasi. Logika dan sumber jawaban sesungguhnya
          akan diatur lewat workflow n8n di backend.
        </p>
      </header>

      <div className="flex-1 bg-white rounded-lg border border-line flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {pesan.map((m, i) => (
            <Bubble key={i} peran={m.peran} teks={m.teks} />
          ))}
          {mengetik && <Bubble peran="bot" mengetik />}
          <div ref={bawahRef} />
        </div>

        {pesan.length <= 1 && (
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
  return (
    <span
      className="h-1.5 w-1.5 rounded-full bg-slate/60 animate-bounce"
      style={{ animationDelay: delay }}
    />
  )
}
