// Lapisan koneksi ke backend Flask.


// Saat development: proxy Vite kirim /api ke backend Flask (lihat vite.config.js).
// Saat production (Vercel): pakai VITE_API_URL dari env Vercel, fallback ke /api.
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

async function ambil(path) {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) {
    throw new Error(`Gagal mengambil ${path} (status ${res.status})`)
  }
  return res.json()
}

export const api = {
  getRingkasan: () => ambil('/ringkasan'),
  getTrenHarian: () => ambil('/tren-harian'),
  getPerformaModel: () => ambil('/performa-model'),
  getDaftarCuitan: () => ambil('/cuitan'),
  getCuitanDetail: (id) => ambil(`/cuitan/${id}`),
  getCuitanXAI: (id) => ambil(`/cuitan/${id}/xai`),
  predict: async (teks) => {
    const res = await fetch(`${BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teks }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `Gagal memprediksi (status ${res.status})`)
    }
    return res.json()
  },
  chatbot: async (pesan) => {
    const res = await fetch(`${BASE_URL}/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pesan }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `Gagal menghubungi asisten (status ${res.status})`)
    }
    return res.json()
  },
  getRiwayatChat: () => ambil('/chatbot/riwayat'),
  hapusRiwayatChat: async () => {
    const res = await fetch(`${BASE_URL}/chatbot/riwayat`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`Gagal menghapus riwayat (status ${res.status})`)
    return res.json()
  },
}
