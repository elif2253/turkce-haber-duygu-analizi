import { useState, useEffect, useMemo } from 'react'
import './App.css'

const API_URL = 'http://127.0.0.1:5000/api/news'

function App() {
  const [haberler, setHaberler] = useState([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [yenileniyor, setYenileniyor] = useState(false)
  const [hata, setHata] = useState(null)

  const [arama, setArama] = useState('')
  const [kaynakFiltre, setKaynakFiltre] = useState('hepsi')
  const [duyguFiltre, setDuyguFiltre] = useState('hepsi')

  const haberleriGetir = () => {
    setHata(null)
    return fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Sunucudan veri alinamadi')
        return res.json()
      })
      .then((data) => setHaberler(data))
      .catch((err) => setHata(err.message))
  }

  useEffect(() => {
    haberleriGetir().finally(() => setYukleniyor(false))
  }, [])

  const yenile = () => {
    setYenileniyor(true)
    fetch(`${API_URL}/refresh`, { method: 'POST' })
      .then(() => haberleriGetir())
      .catch((err) => setHata(err.message))
      .finally(() => setYenileniyor(false))
  }

  // Mevcut kaynakları haber listesinden otomatik çıkar
  const kaynaklar = useMemo(() => {
    return [...new Set(haberler.map((h) => h.kaynak))].sort()
  }, [haberler])

  const istatistik = useMemo(() => {
    const olumlu = haberler.filter((h) => h.duygu === 'positive').length
    const olumsuz = haberler.filter((h) => h.duygu === 'negative').length
    return { toplam: haberler.length, olumlu, olumsuz }
  }, [haberler])

  const filtrelenmis = useMemo(() => {
    return haberler.filter((h) => {
      const kaynakUygun = kaynakFiltre === 'hepsi' || h.kaynak === kaynakFiltre
      const duyguUygun = duyguFiltre === 'hepsi' || h.duygu === duyguFiltre
      const metin = `${h.baslik} ${h.ozet}`.toLocaleLowerCase('tr')
      const aramaUygun = arama === '' || metin.includes(arama.toLocaleLowerCase('tr'))
      return kaynakUygun && duyguUygun && aramaUygun
    })
  }, [haberler, kaynakFiltre, duyguFiltre, arama])

  const tarihFormatla = (tarih) => {
    if (!tarih) return ''
    const d = new Date(tarih)
    if (isNaN(d)) return ''
    return d.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (yukleniyor) {
    return (
      <div className="durum">
        <div className="spinner" />
        <p>Haberler çekiliyor ve analiz ediliyor…</p>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-ic">
          <div>
            <h1>Türkçe Haber Duygu Analizi</h1>
            <p className="alt-baslik">
              Haber başlıkları yapay zekâ ile olumlu / olumsuz olarak sınıflandırılır
            </p>
          </div>
          <button className="yenile-btn" onClick={yenile} disabled={yenileniyor}>
            {yenileniyor ? 'Yenileniyor…' : 'Yenile'}
          </button>
        </div>

        <div className="istatistikler">
          <div className="stat">
            <span className="stat-sayi">{istatistik.toplam}</span>
            <span className="stat-etiket">Toplam haber</span>
          </div>
          <div className="stat stat-olumlu">
            <span className="stat-sayi">{istatistik.olumlu}</span>
            <span className="stat-etiket">Olumlu</span>
          </div>
          <div className="stat stat-olumsuz">
            <span className="stat-sayi">{istatistik.olumsuz}</span>
            <span className="stat-etiket">Olumsuz</span>
          </div>
        </div>
      </header>

      {hata && <div className="hata-kutusu">Hata: {hata} — backend çalışıyor mu?</div>}

      <div className="arac-cubugu">
        <input
          type="text"
          className="arama"
          placeholder="Haberlerde ara…"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
        />

        <div className="filtre-grup">
          <button
            className={`cip ${duyguFiltre === 'hepsi' ? 'aktif' : ''}`}
            onClick={() => setDuyguFiltre('hepsi')}
          >
            Tümü
          </button>
          <button
            className={`cip cip-olumlu ${duyguFiltre === 'positive' ? 'aktif' : ''}`}
            onClick={() => setDuyguFiltre('positive')}
          >
            Olumlu
          </button>
          <button
            className={`cip cip-olumsuz ${duyguFiltre === 'negative' ? 'aktif' : ''}`}
            onClick={() => setDuyguFiltre('negative')}
          >
            Olumsuz
          </button>
        </div>

        <select
          className="secim"
          value={kaynakFiltre}
          onChange={(e) => setKaynakFiltre(e.target.value)}
        >
          <option value="hepsi">Tüm kaynaklar</option>
          {kaynaklar.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      <p className="sonuc-sayisi">{filtrelenmis.length} haber gösteriliyor</p>

      {filtrelenmis.length === 0 ? (
        <div className="bos-durum">
          <p>Bu filtrelere uyan haber bulunamadı.</p>
          <button
            className="temizle-btn"
            onClick={() => {
              setArama('')
              setKaynakFiltre('hepsi')
              setDuyguFiltre('hepsi')
            }}
          >
            Filtreleri temizle
          </button>
        </div>
      ) : (
        <div className="kart-listesi">
          {filtrelenmis.map((haber, i) => {
            const olumlu = haber.duygu === 'positive'
            return (
              <article key={i} className={`kart ${olumlu ? 'kart-olumlu' : 'kart-olumsuz'}`}>
                <div className="kart-ust">
                  <span className="kaynak">{haber.kaynak}</span>
                  <span className={`rozet ${olumlu ? 'rozet-olumlu' : 'rozet-olumsuz'}`}>
                    {olumlu ? 'Olumlu' : 'Olumsuz'}
                  </span>
                </div>

                <h2 className="baslik">{haber.baslik}</h2>
                <p className="ozet">{haber.ozet}</p>

                <div className="guven">
                  <div className="guven-cubuk">
                    <div
                      className={`guven-dolgu ${olumlu ? 'dolgu-olumlu' : 'dolgu-olumsuz'}`}
                      style={{ width: `${Math.round(haber.duygu_skoru * 100)}%` }}
                    />
                  </div>
                  <span className="guven-yazi">
                    %{Math.round(haber.duygu_skoru * 100)} güven
                  </span>
                </div>

                <div className="kart-alt">
                  <span className="tarih">{tarihFormatla(haber.tarih)}</span>
                  <a href={haber.link} target="_blank" rel="noopener noreferrer" className="link">
                    Haberi oku
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <footer className="footer">
        Elif Babadoğan · DistilBERT tabanlı Türkçe duygu analizi modeli ile
      </footer>
    </div>
  )
}

export default App