from flask import Flask, jsonify
from flask_cors import CORS

from scraper import haberleri_cek
from sentiment import duygu_analiz_et

app = Flask(__name__)
CORS(app)  # Frontend (farklı porttan) bu API'ye erişebilsin diye

# Haberleri her seferinde yeniden çekip analiz etmemek için basit bir önbellek
onbellek = {"veri": None}

@app.route("/api/news", methods=["GET"])
def get_news():
    """
    Haberleri çeker, her birinin duygusunu analiz eder, JSON olarak döner.
    """
    if onbellek["veri"] is not None:
        return jsonify(onbellek["veri"])

    haberler = haberleri_cek()

    sonuclar = []
    for haber in haberler:
        duygu = duygu_analiz_et(haber["baslik"])
        sonuclar.append({
            **haber,
            "duygu": duygu["etiket"],
            "duygu_skoru": duygu["skor"],
        })

    onbellek["veri"] = sonuclar
    return jsonify(sonuclar)


@app.route("/api/news/refresh", methods=["POST"])
def refresh_news():
    """Önbelleği temizler, bir sonraki istekte haberler yeniden çekilir."""
    onbellek["veri"] = None
    return jsonify({"mesaj": "Onbellek temizlendi"})


@app.route("/", methods=["GET"])
def home():
    return jsonify({"mesaj": "Turkce Haber Duygu Analizi API calisiyor"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)