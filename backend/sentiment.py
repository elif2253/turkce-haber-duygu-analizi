from transformers import pipeline

# Türkçe duygu analizi modelini yükle
# İlk çalıştırmada model internetten indirilecek (~500MB), biraz sürebilir
print("Duygu analizi modeli yükleniyor, lütfen bekleyin...")
duygu_analizci = pipeline(
    "sentiment-analysis",
    model="savasy/bert-base-turkish-sentiment-cased"
)
print("Model hazır!\n")


def duygu_analiz_et(metin):
    """
    Verilen Türkçe metnin duygusunu analiz eder.
    Dönüş: {"etiket": "positive"/"negative", "skor": 0.0-1.0}
    """
    if not metin or not metin.strip():
        return {"etiket": "notr", "skor": 0.0}

    # Model çok uzun metinlerde hata verebilir, ilk 512 karakterle sınırlayalım
    kisaltilmis_metin = metin[:512]

    sonuc = duygu_analizci(kisaltilmis_metin)[0]

    return {
        "etiket": sonuc["label"],  # genelde "positive" veya "negative" döner
        "skor": round(sonuc["score"], 3)
    }


# Test amaçlı
if __name__ == "__main__":
    test_cumleler = [
        "Bugün harika bir gün geçirdim, çok mutluyum!",
        "Bu haber gerçekten üzücü ve kaygı verici.",
        "Toplantı saat 3'te başlayacak.",
    ]

    for cumle in test_cumleler:
        sonuc = duygu_analiz_et(cumle)
        print(f"'{cumle}' -> {sonuc['etiket']} (skor: {sonuc['skor']})")