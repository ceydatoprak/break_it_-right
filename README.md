# RESCUE WORKSHOP

Türkçe, mobil öncelikli, dokunsal bir kurtarma bulmacası. `index.html` dosyasını doğrudan aç ya da `node serve.cjs` çalıştırıp http://127.0.0.1:4173 adresine git.

Çekirdek döngü: **Çevir → İncele → Riski Fark Et → Alet Seç → Doğru Sırayla Uygula → Kurtar.**

Bölüm başına yaklaşık 20–60 saniye.

## Ayırt edici mekanik: sonuçlar

Hata rastgele tıklamayı cezalandırır ama oyunu bitirmez. Üç kademe var:

| Kademe | Örnek | Sonuç |
| --- | --- | --- |
| **Yumuşak** | Yanlış alet, yanlış hedef | Parça titrer, kısa uyarı. Can gitmez. |
| **Cezalı** | Canlı kabloyu kesmek · basınçlı kapağı çekmek · güç açıkken mıknatıs · mıknatısı devreye yaklaştırmak | Bir can gider, eylem gerçekleşmez, bölüm oynanabilir kalır. |
| **Kritik** | Çekici kırılgan parçaya vurmak · kurtardığını tezgâhtan düşürmek | Bölüm biter. |

Üç can biterse bölüm yeniden başlar. Bir sürükleme en fazla bir can götürür — kare başına değil.

## Döndürme

Obje 360° dönen bir tabla üzerinde. Parçalar gövdenin farklı yüzlerinde duruyor; yalnızca **öne bakan** parça kullanılabilir. Bölüm 1'in ikinci vidası arkada: çevirmeden bulunamaz.

- **Alet seçili değilken:** her yerde sürükle → döner.
- **Alet elindeyken:** obje üstünde sürükleme aleti kullanır, döndürmeyi objenin etrafındaki boşluktan yaparsın.

İlk dönüşe kadar gövdenin altında küçük bir dönme işareti durur.

## Aletler

| Alet | İşi |
| --- | --- |
| Çekiç | Kırılgan parçalara vurmak **risklidir** — burada anahtar değil, tuzaktır |
| Tornavida | Vida sökmek (sürükle) |
| Kesici | Kayış ve kablo kesmek (üzerinden geçir) |
| Mıknatıs | İçerideki metal pimi dışarıdan sürüklemek (basılı tut) |
| Vantuz | Cam ve panel kaldırmak (yapıştır, dışarı çek) |

`TOOLS` bir kayıt listesi: pense, ısı tabancası, fener gibi aletler tek satır ekleyerek geliyor.

## Bölümler

| Bölüm | Hedef | Yeni fikir |
| --- | --- | --- |
| 1 · Mekanik kapsül | Kapsülü aç | Döndürme + sıra: arkadaki vida |
| 2 · Canlı kablo | Robotu kurtar | Önce gücü kes — yoksa çarpar |
| 3 · Basınç odası | Kapsülü güvenle aç | Göstergeyi oku, vanayı aç |
| 4 · Mıknatıs kilidi | Kilidi aç | Dolaylı kontrol + hassas devre riski |
| 5 · Çok katmanlı | İçindekini kurtar | Kayış → güç → vidalar → pim → cam |

## Uygulama

Bileşen tabanlı: her etkileşimli parça hangi aletlerin işlediğini, neye bağlı olduğunu (`requires`), nerede durduğunu (`az` açısı + `y`) ve riskini (`powerFrom`, `dangerFrom`) veriyle bildirir. `LEVELS` yalnızca parçaları yerleştirir; bölüm başına özel fonksiyon yok.

`proj()` bir parçayı açıdan ekran konumuna çevirir ve derinliğine göre ölçek/saydamlık verir — 2D canvas üzerinde tabla hissi. `TYPE` tablosu parça tiplerini (vida, anahtar, kablo, vana, panel, şerit, mıknatıslı pim, devre, kapı, kurtarma nesnesi) tutar.

Çizim döngüsü `requestAnimationFrame` susarsa (gömülü önizleme panelleri, arka plan sekmeleri) 30 Hz'lik bir yedek sürücüye düşer; ilk kare senkron çizilir.

Önceki sürümün Voronoi kırık motoru bu yapıda kullanılmıyor — yeni bölümlerin hiçbiri kontrollü kırmaya dayanmıyor. Eski sürümler geçici klasörde yedekli.

## Doğrulama

`node test-game.cjs` — **21 kontrol.** Gerçek oyun betiğini sahte canvas/DOM üzerinde çalıştırır: beş bölümün tam çözümü, döndürmenin arkadaki parçayı hem gizlemesi hem kilitlemesi, yumuşak/cezalı/kritik hataların üçü, hareket başına tek ceza, üç canın bitmesi, bağımlılık kilitleri, mıknatıs menzili, basınç tuzağı, minder kuralı, sıfırlama ve belirlenimcilik.

Tarayıcıda döndürme, alet değişimi, kesme hareketi ve düzen elle denendi. Gerçek telefon donanımı, titreşim ve ses kalitesi hâlâ elde doğrulanmayı bekliyor.
