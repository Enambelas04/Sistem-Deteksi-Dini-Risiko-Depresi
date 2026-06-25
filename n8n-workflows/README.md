# Workflow n8n — Asisten Aurelia

File `asisten-aurelia.json` bisa langsung diimpor ke n8n:
**n8n → Workflows → Import from File** (atau drag & drop file ke kanvas).

## Alur node

```
Webhook Masuk
   │
   ├──► Ambil Ringkasan        (GET /ringkasan) ───────────────────┐
   ├──► Ambil Performa Model   (GET /performa-model) ──────────────┤
   └──► Ambil Daftar Cuitan    (GET /cuitan)                       │
           │                                                       │
           ▼                                                       │
     Pecah Per Cuitan  (array → satu item n8n per cuitan)          │
           │                                                       │
           ▼                                                       │
     Terjemahkan ke Indonesia  (LibreTranslate self-hosted: teks → translatedText)
           │                                                       │
           ▼                                                       │
     Gabungkan Terjemahan  (simpan teks asli + teksIndonesia + skor + risiko)
           │                                                       │
           ▼                                                       │
     Gabungkan Kembali Jadi Daftar  (kumpulkan jadi array lagi) ────┘
           │
           ▼
     Gabungkan Data  (merge ketiga sumber data)
           │
           ▼
     Susun Konteks   (rangkai jadi satu JSON konteks)
           │
           ▼
   Tanya LLM (OpenAI)  (system prompt + konteks data + pertanyaan pengguna)
           │
           ▼
     Kirim Balasan   (respons JSON: { "balasan": "..." })
```

## Soal terjemahan Inggris → Indonesia (penting)

Dataset & model (`Mental_Health.csv` + `tfidf_vectorizer.pkl`) berbahasa **Inggris**.
Model XGBoost dilatih dengan vocabulary Inggris, jadi:

- **Skor & klasifikasi risiko** WAJIB dihitung dari teks Inggris asli (field `teks`)
  — ini sudah dilakukan backend Flask SEBELUM data sampai ke workflow n8n.
- **Terjemahan ke Indonesia** (field `teksIndonesia`, lewat node LibreTranslate self-hosted)
  HANYA untuk ditampilkan/dibacakan ke pengguna lewat chatbot — bukan untuk dianalisis ulang.

Kalau teks Indonesia hasil terjemahan dimasukkan lagi ke model/vectorizer,
hasilnya akan salah karena kata-kata Indonesia tidak ada di vocabulary yang dipelajari model.

Untuk analisis berbasis teks Indonesia yang akurat, model & vectorizer
perlu dilatih ulang dengan dataset Indonesia (bukan sekadar menerjemahkan
dataset Inggris yang sudah ada).

## Yang perlu disesuaikan setelah import

1. **Alamat backend** — semua HTTP Request node memakai `http://backend:5000/...`.
   Ini berlaku kalau n8n berjalan di Docker network yang sama dengan
   `docker-compose.yml` project ini. Kalau n8n kamu berjalan terpisah,
   ganti jadi alamat publik backend kamu (misal `https://api.domainmu.com`).

2. **LibreTranslate sudah berjalan otomatis** lewat `docker-compose.yml`
   (service `libretranslate`, di port 5050) — open source, gratis, tidak
   butuh API key. Node "Terjemahkan ke Indonesia" memanggilnya lewat
   `http://libretranslate:5000/translate`. Pastikan n8n berjalan di
   Docker network yang sama supaya alamat ini bisa diakses.

   Kalau n8n berjalan terpisah dari project ini, ganti URL di node tersebut
   jadi alamat publik LibreTranslate kamu (atau pakai instance publik gratis
   seperti `https://libretranslate.com/translate`, ada batas penggunaan).

3. **Kredensial OpenAI** — node "Tanya LLM (OpenAI)" perlu kredensial API key
   OpenAI kamu sendiri (n8n → Credentials → tambahkan OpenAI API).
   Bisa juga diganti node LLM lain (Anthropic, dll) kalau kamu pakai provider berbeda.

4. **Aktifkan webhook** — setelah workflow di-*save* dan diaktifkan (toggle Active),
   n8n akan memberi URL webhook publik. Copy URL itu untuk dipakai di langkah berikutnya.

## Menyambungkan ke backend Flask

Di `backend/app.py`, ganti isi fungsi `chatbot()` (cari komentar "PENGGANTI SEMENTARA")
jadi memanggil URL webhook n8n tersebut:

```python
import requests

@app.post("/chatbot")
def chatbot():
    body = request.get_json(silent=True) or {}
    pesan = body.get("pesan", "").strip()
    if not pesan:
        return jsonify({"error": "Field 'pesan' wajib diisi"}), 400

    res = requests.post(
        "https://n8n-kamu.com/webhook/asisten-aurelia",  # ganti dengan URL webhook asli
        json={"pesan": pesan},
        timeout=15,
    )
    return jsonify(res.json())
```

Frontend (`src/pages/Chatbot.jsx`) **tidak perlu diubah** — selama n8n
mengembalikan JSON dengan field `balasan`, semuanya akan tetap berfungsi.

## Versi tanpa LLM (lebih murah/cepat)

Kalau belum mau pakai biaya API LLM, node "Tanya LLM (OpenAI)" bisa diganti
dengan node **Switch** yang mencocokkan kata kunci di pesan (mirip logika
`_logika_chatbot_simulasi()` yang sudah ada di Flask sekarang), lalu langsung
ambil angka dari data yang sudah di-fetch tanpa perlu model bahasa sama sekali.
