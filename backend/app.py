"""
Backend Flask untuk Dashboard Aurelia.

Model XGBoost + TF-IDF vectorizer di sini adalah hasil training nyata
(lihat backend/models/), bukan lagi data dummy. Endpoint /predict
melakukan prediksi real-time dari teks baru.

CATATAN PENTING soal dataset saat ini:
- Dataset training (Mental_Health.csv) berlabel BINER (0/1), bukan 3 level.
- Skor probabilitas dari model dipetakan ke 3 level risiko (rendah/sedang/tinggi)
  hanya untuk keperluan tampilan dashboard, BUKAN hasil training 3 kelas asli.
- Teks training berbahasa Inggris. Untuk produksi dengan teks Indonesia,
  vectorizer & model perlu dilatih ulang dengan dataset Indonesia.
"""

import json
import re
from pathlib import Path

import joblib
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MODELS_DIR = Path(__file__).parent / "models"

# --- Muat model & vectorizer hasil training sekali saat startup ---
model = joblib.load(MODELS_DIR / "model_xgboost.pkl")
vectorizer = joblib.load(MODELS_DIR / "tfidf_vectorizer.pkl")

with open(MODELS_DIR / "performa_model.json") as f:
    _performa_mentah = json.load(f)

# Ubah ke format yang dipakai chart di frontend (array of {model, akurasi, f1, ...})
PERFORMA_MODEL = [
    {"model": nama, **metrik} for nama, metrik in _performa_mentah.items()
]

# SHAP explainer untuk XGBoost (TreeExplainer, cepat & akurat untuk model pohon)
try:
    import shap

    _explainer = shap.TreeExplainer(model)
except Exception:
    _explainer = None


def bersihkan_teks(teks: str) -> str:
    """Sama dengan preprocessing saat training, supaya konsisten."""
    teks = str(teks).lower()
    teks = re.sub(r"http\S+|www\.\S+", "", teks)
    teks = re.sub(r"@\w+", "", teks)
    teks = re.sub(r"#", "", teks)
    teks = re.sub(r"[^a-zA-Z\s]", " ", teks)
    teks = re.sub(r"\s+", " ", teks).strip()
    return teks


def skor_ke_risiko(skor: float) -> str:
    if skor >= 0.67:
        return "tinggi"
    if skor >= 0.34:
        return "sedang"
    return "rendah"


# --- Data dummy yang masih dipakai untuk halaman Ringkasan & Riwayat ---
# (cuitan contoh + status tinjau; nantinya ini akan datang dari n8n/database,
# bukan lagi list statis. Skor & risikonya sudah dihitung pakai model asli
# lewat fungsi hitung_label_dummy() di bawah, supaya konsisten dengan model.)

RINGKASAN = {
    "totalCuitanDianalisis": 18420,
    "totalAkunTerpantau": 1342,
    "risikoTinggi": 86,
    "risikoSedang": 241,
    "risikoRendah": 1015,
    "akurasiModel": _performa_mentah["XGBoost"]["akurasi"],
    "f1Score": _performa_mentah["XGBoost"]["f1"],
    "latensiPipelineMs": 412,
}

TREN_HARIAN = [
    {"tanggal": "09 Jun", "tinggi": 4, "sedang": 14, "rendah": 58},
    {"tanggal": "10 Jun", "tinggi": 6, "sedang": 17, "rendah": 61},
    {"tanggal": "11 Jun", "tinggi": 5, "sedang": 15, "rendah": 55},
    {"tanggal": "12 Jun", "tinggi": 8, "sedang": 19, "rendah": 63},
    {"tanggal": "13 Jun", "tinggi": 7, "sedang": 22, "rendah": 70},
    {"tanggal": "14 Jun", "tinggi": 9, "sedang": 20, "rendah": 66},
    {"tanggal": "15 Jun", "tinggi": 6, "sedang": 18, "rendah": 59},
    {"tanggal": "16 Jun", "tinggi": 10, "sedang": 24, "rendah": 72},
    {"tanggal": "17 Jun", "tinggi": 11, "sedang": 26, "rendah": 75},
    {"tanggal": "18 Jun", "tinggi": 9, "sedang": 21, "rendah": 68},
    {"tanggal": "19 Jun", "tinggi": 8, "sedang": 19, "rendah": 64},
    {"tanggal": "20 Jun", "tinggi": 12, "sedang": 27, "rendah": 80},
    {"tanggal": "21 Jun", "tinggi": 13, "sedang": 25, "rendah": 77},
    {"tanggal": "22 Jun", "tinggi": 11, "sedang": 23, "rendah": 73},
]

CUITAN_CONTOH = [
    "I'm just over 2 years since I was diagnosed with anxiety and depression. Today I'm reflecting on how far I've come.",
    "deadline everywhere this week, only sleeping 3 hours a night. body is falling apart",
    "finally finished my thesis revision, my advisor was so supportive today",
    "sometimes I feel so alone even when I'm surrounded by friends. weird right",
    "I'm tired of pretending I'm okay in front of everyone, every single day",
    "day off finally! gonna cook something nice before getting back to assignments",
    "lost my appetite again lately, everything just tastes bland now",
    "had so much fun at the futsal watch party tonight, haven't laughed this much in ages",
]


def bangun_daftar_cuitan():
    """Hitung skor & risiko untuk cuitan contoh memakai model XGBoost asli."""
    daftar = []
    for i, teks in enumerate(CUITAN_CONTOH):
        bersih = bersihkan_teks(teks)
        fitur = vectorizer.transform([bersih])
        skor = float(model.predict_proba(fitur)[0][1])
        daftar.append(
            {
                "id": f"TWT-{10231 - i}",
                "akun": f"@akun_contoh_{i+1}",
                "waktu": "22 Jun 2026",
                "teks": teks,
                "risiko": skor_ke_risiko(skor),
                "skor": round(skor, 2),
                "model": "XGBoost",
                "statusTinjau": "Menunggu tinjauan pakar" if skor >= 0.5 else "Ditinjau",
            }
        )
    return daftar


DAFTAR_CUITAN = bangun_daftar_cuitan()


@app.get("/health")
def health():
    return jsonify({"status": "ok", "model_dimuat": True, "shap_aktif": _explainer is not None})


@app.get("/ringkasan")
def get_ringkasan():
    return jsonify(RINGKASAN)


@app.get("/tren-harian")
def get_tren_harian():
    return jsonify(TREN_HARIAN)


@app.get("/performa-model")
def get_performa_model():
    return jsonify(PERFORMA_MODEL)


@app.get("/cuitan")
def get_cuitan():
    return jsonify(DAFTAR_CUITAN)


@app.get("/cuitan/<cuitan_id>")
def get_cuitan_detail(cuitan_id):
    cuitan = next((c for c in DAFTAR_CUITAN if c["id"] == cuitan_id), None)
    if cuitan is None:
        return jsonify({"error": "Cuitan tidak ditemukan"}), 404
    return jsonify(cuitan)


@app.get("/cuitan/<cuitan_id>/xai")
def get_cuitan_xai(cuitan_id):
    cuitan = next((c for c in DAFTAR_CUITAN if c["id"] == cuitan_id), None)
    if cuitan is None:
        return jsonify({"error": "Cuitan tidak ditemukan"}), 404
    return jsonify(_hitung_xai(cuitan["teks"]))


@app.post("/predict")
def predict():
    """
    Prediksi real-time dari teks baru.
    Body JSON: { "teks": "..." }
    """
    body = request.get_json(silent=True) or {}
    teks = body.get("teks", "").strip()
    if not teks:
        return jsonify({"error": "Field 'teks' wajib diisi"}), 400

    bersih = bersihkan_teks(teks)
    fitur = vectorizer.transform([bersih])
    skor = float(model.predict_proba(fitur)[0][1])

    hasil = {
        "teks": teks,
        "skor": round(skor, 4),
        "risiko": skor_ke_risiko(skor),
        "model": "XGBoost",
    }
    hasil["xai"] = _hitung_xai(teks)
    return jsonify(hasil)


def _hitung_xai(teks: str, top_n: int = 6):
    """Hitung kontribusi SHAP per kata untuk satu teks."""
    bersih = bersihkan_teks(teks)
    fitur = vectorizer.transform([bersih])

    if _explainer is None:
        return {"shap": [], "limeHighlight": [], "catatanKlinis": "SHAP tidak tersedia di server ini."}

    nilai_shap = _explainer.shap_values(fitur)
    nilai_shap = np.array(nilai_shap).flatten()

    nama_fitur = np.array(vectorizer.get_feature_names_out())
    fitur_array = fitur.toarray().flatten()

    # Hanya kata yang benar-benar muncul di teks (TF-IDF-nya > 0)
    indeks_aktif = np.where(fitur_array > 0)[0]
    kontribusi = [(nama_fitur[i], float(nilai_shap[i])) for i in indeks_aktif]
    kontribusi.sort(key=lambda x: abs(x[1]), reverse=True)
    teratas = kontribusi[:top_n]

    shap_list = [{"fitur": kata, "kontribusi": round(nilai, 4)} for kata, nilai in teratas]

    maks_abs = max((abs(n) for _, n in teratas), default=1) or 1
    lime_list = [
        {"teks": kata, "bobot": round(abs(nilai) / maks_abs, 2)}
        for kata, nilai in teratas
        if nilai > 0
    ]

    return {
        "shap": shap_list,
        "limeHighlight": lime_list,
        "catatanKlinis": (
            "Skor dan kontribusi kata di atas dihasilkan model XGBoost terlatih secara real-time. "
            "Tetap perlu ditinjau oleh pakar kesehatan sebelum diambil tindakan."
        ),
    }


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
