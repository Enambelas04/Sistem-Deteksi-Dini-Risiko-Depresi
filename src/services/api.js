// Lapisan koneksi ke backend Flask.
// Semua halaman memanggil fungsi-fungsi di sini, bukan fetch() langsung,
// supaya kalau ada perubahan endpoint nanti (misal disambungkan ke n8n),
// cukup diubah di satu tempat ini saja.

const BASE_URL = '/api'

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
}
