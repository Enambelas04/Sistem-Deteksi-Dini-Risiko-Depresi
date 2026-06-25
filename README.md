# Aurelia — Dashboard Deteksi Dini Risiko Depresi

## Menjalankan dengan Docker (production-like)

Build frontend (nginx, hasil `npm run build`) + backend Flask jadi satu:

```bash
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend Flask langsung: http://localhost:5060
- n8n (untuk mengatur workflow chatbot): http://localhost:5678
- LibreTranslate (terjemahan, dipakai workflow n8n chatbot): http://localhost:5050
- Dari frontend, panggilan ke `/api/...` otomatis diteruskan nginx ke Flask
  (contoh: `fetch('/api/cuitan')` → diteruskan ke `http://backend:5000/cuitan`)

## Menjalankan mode development (hot reload)

```bash
docker compose -f docker-compose.dev.yml up --build
```

- Frontend (Vite dev server, hot reload): http://localhost:5173
- Backend Flask (debug mode, auto-reload): http://localhost:5000
- Di mode ini Vite dev server yang meneruskan `/api` ke Flask (lihat `vite.config.js`)

## Status model saat ini (integrasi awal dari Google Colab)

Backend sekarang memakai **model XGBoost terlatih sungguhan** (bukan dummy lagi),
hasil training dari `backend/models/model_xgboost.pkl` + `tfidf_vectorizer.pkl`
(vectorizer dari Colab, model dilatih dari dataset `Mental_Health.csv`).

**Catatan penting (perlu ditindaklanjuti sebelum jadi laporan akhir):**
- Dataset training berlabel **biner** (0/1), bukan 3 level seperti tampilan dashboard.
  Skor probabilitas dipetakan ke rendah/sedang/tinggi hanya untuk keperluan tampilan.
- Teks training **berbahasa Inggris**. Untuk produksi dengan teks Indonesia,
  vectorizer & model perlu dilatih ulang dengan dataset Indonesia.
- Akurasi model saat ini ~68% (lihat halaman Ringkasan), karena label dataset
  bersifat distant-supervision (bukan anotasi klinis), belum capai target >90%
  di rumusan masalah. Perlu dataset berlabel lebih baik untuk hasil akhir.

**Endpoint baru:**
- `POST /predict` — prediksi real-time dari teks baru, body: `{ "teks": "..." }`,
  mengembalikan skor, level risiko, dan penjelasan SHAP (kontribusi kata sungguhan,
  dihitung dari `shap.TreeExplainer`, bukan simulasi).

Coba langsung dari dashboard di halaman **Uji Prediksi**.

## Menyambungkan ke model ML asli

Endpoint di `backend/app.py`:

- `GET /health` — cek status
- `GET /ringkasan` — statistik ringkasan (kartu di halaman Overview)
- `GET /tren-harian` — data grafik tren 14 hari
- `GET /performa-model` — perbandingan SVM / Random Forest / XGBoost
- `GET /cuitan` — daftar seluruh cuitan terklasifikasi
- `GET /cuitan/<id>` — detail satu cuitan
- `GET /cuitan/<id>/xai` — penjelasan SHAP & LIME untuk satu cuitan

Langkah menyambungkan ke data/model asli:
1. Ganti isi fungsi-fungsi di `backend/app.py` agar mengambil data dari database/pipeline n8n
   dan hasil inferensi model, bukan dari list Python statis.
2. Frontend tidak perlu diubah lagi — selama bentuk JSON responsnya sama, halaman akan
   otomatis menampilkan data baru.
3. Jika SHAP/LIME dihitung on-demand (bukan precomputed), endpoint `/cuitan/<id>/xai`
   bisa diubah jadi memanggil proses inferensi secara langsung saat dipanggil.

## Tanpa Docker (lokal biasa)

```bash
# Frontend
npm install
npm run dev

# Backend (di folder backend/, terpisah)
pip install -r requirements.txt
python app.py
```

Saat menjalankan tanpa Docker, ubah target proxy di `vite.config.js` dari
`http://backend:5000` menjadi `http://localhost:5000`.

## Chatbot — sekarang langsung pakai Groq (tanpa n8n)

Endpoint `/chatbot` di `backend/app.py` memanggil Groq (LLM gratis, API kompatibel
format OpenAI) **langsung dari Flask**, tanpa lewat n8n. Lebih simpel dan tidak
rentan masalah koneksi antar-container.

**Yang saya lakukan:**
1. Daftar gratis di console.groq.com/keys, buat API key
2. Edit `backend/app.py`, ganti baris:
   ```python
   GROQ_API_KEY = "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"
   ```
3. Rebuild: `docker compose up --build`

Kalau Groq gagal dihubungi (key belum diisi, rate limit, dll), chatbot otomatis
jatuh ke jawaban rule-based (`_logika_chatbot_simulasi`) supaya UI tetap berfungsi.

**Catatan:** service `n8n` di `docker-compose.yml` dan folder `n8n-workflows/`
masih ada untuk referensi/eksperimen lain, tapi **tidak lagi dipakai** oleh
fitur chatbot ini.
