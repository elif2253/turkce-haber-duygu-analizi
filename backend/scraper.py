import feedparser

# Türkiye'deki büyük haber sitelerinin RSS adresleri
RSS_FEEDS = {
    "Hürriyet": "https://www.hurriyet.com.tr/rss/anasayfa",
    "Cumhuriyet": "https://www.cumhuriyet.com.tr/rss/son_dakika.xml",
    "NTV": "https://www.ntv.com.tr/gundem.rss",
}


def haberleri_cek():
    """
    Tanımlı RSS kaynaklarından haber başlığı, özeti ve linkini çeker.
    Her haberi bir sözlük (dict) olarak, hepsini bir liste içinde döner.
    """
    tum_haberler = []

    for kaynak_adi, url in RSS_FEEDS.items():
        feed = feedparser.parse(url)

        for entry in feed.entries:
            haber = {
                "kaynak": kaynak_adi,
                "baslik": entry.get("title", ""),
                "ozet": entry.get("summary", ""),
                "link": entry.get("link", ""),
                "tarih": entry.get("published", ""),
            }
            tum_haberler.append(haber)

    return tum_haberler


# Bu dosyayı doğrudan çalıştırırsak (test amaçlı) haberleri ekrana yazdırır
if __name__ == "__main__":
    haberler = haberleri_cek()
    print(f"Toplam {len(haberler)} haber çekildi.\n")

    for haber in haberler[:5]:  # ilk 5 haberi göster
        print(f"[{haber['kaynak']}] {haber['baslik']}")