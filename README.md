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
| Makas | Bant ve kablo kesmek (üzerinden geçir) |
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
| 5 · Çok katmanlı | İçindekini kurtar | Bant → güç → vidalar → pim → cam |

## Uygulama

Bileşen tabanlı: her etkileşimli parça hangi aletlerin işlediğini, neye bağlı olduğunu (`requires`), nerede durduğunu (`az` açısı + `y`) ve riskini (`powerFrom`, `dangerFrom`) veriyle bildirir. `LEVELS` yalnızca parçaları yerleştirir; bölüm başına özel fonksiyon yok.

`proj()` bir parçayı açıdan ekran konumuna çevirir ve derinliğine göre ölçek/saydamlık verir — 2D canvas üzerinde tabla hissi. `TYPE` tablosu parça tiplerini (vida, anahtar, kablo, vana, panel, şerit, mıknatıslı pim, devre, kapı, kurtarma nesnesi) tutar.

Çizim döngüsü `requestAnimationFrame` susarsa (gömülü önizleme panelleri, arka plan sekmeleri) 30 Hz'lik bir yedek sürücüye düşer; ilk kare senkron çizilir.

Önceki sürümün Voronoi kırık motoru bu yapıda kullanılmıyor — yeni bölümlerin hiçbiri kontrollü kırmaya dayanmıyor. Eski sürümler geçici klasörde yedekli.

## Görsel ve oynanabilirlik iyileştirmeleri

Mevcut beş bölümün bağımlılıkları ve çevir–incele–alet seç–kurtar döngüsü korunur. İlk bölümlerde yalnızca gereken aletler sunulur; son bölümde bütün aletler görünür. Ayrı **İncele** düğmesi aleti bırakmayı kolaylaştırır.

- Ahşap damarları, metal kenarlar, cam yansımaları, fiziksel döner tabla ve dikişli minder.
- Seçili alet açıklaması, vida/vanada ilerleme halkası, elektrik/basınç/devre işaretleri, mıknatıs çekim çizgileri ve vantuz esnemesi.
- Yararlı ilerleme olmadan 10 saniye geçince yalnızca bir sonraki parçaya kısa ipucu. İpuçları objeyi otomatik döndürmez ve bütün çözümü anlatmaz.
- Tamamlanan adımlar ve kısa onaylar; kusursuz çözüm için üç, cezasız ama yumuşak hatalı çözüm için iki, cezalı kurtarma için bir yıldız. Hız baskısı yoktur.
- Hızlı kesme hareketleri, tek hareket başına tek ceza, ek parmakların yok sayılması, güvenli dokunma iptali ve yeniden denemede bekleyen sonuçların temizlenmesi.

## Görsel yön

Sıcak atölye teması, referans görselden esinlenen oyuncak hissi: pegboard duvar, raf, yapışkan notlar, kupa, kesme matı ve tezgâha saçılmış vidalar — hepsi merkezdeki objeyi bastırmayacak kadar sessiz.

Obje ekranın kahramanı: metal köşe pahları, taşıma sapı, perçinler, tabanda tehlike şeridi, döndükçe kayan uyarı etiketleri (DİKKAT CANLI VAR) ve cam pencere. Yaratıklar tek bir  yardımcısını paylaşır — büyük gözler, ışık noktası, allık ve ruh hâlini taşıyan kaşlar: mahsurken endişeli, kurtulunca gülümser.

Alet çubuğu referanstaki gibi dolu renkli, basılabilir tuşlar (mavi çekiç, turuncu tornavida, kırmızı makas, mor mıknatıs, yeşil vantuz). Seçili alet yükselir, beyaz halka ve ok işareti alır. Üst barda yalnızca seviye rozeti, turuncu görev tabelası, can kalpleri ve adım çubuğu kalır.

## Malzeme ve hata tepkileri

Gövde artık düz vektör değil, ışığı sol üstten alan gerçek yüzeyler: damarlı ve budaklı ahşap tahtalar, fırçalanmış metal (dönüşle kayan parlama bandı), perçinler, kalın çerçeveli ve yansımalı cam, yıpranmış tehlike şeridi, kıvrık köşeli kâğıt etiketler. Obje döndükçe yan yüzü açılır — hacmi buradan okunur.

Hatalar artık aynı tepkiyi vermez:

| Hata | Tepki |
| --- | --- |
| Elektrik | Sarı ark çizgileri, kıvılcım yağmuru, sert sarsıntı, uzun titreşim |
| Basınç | Buhar bulutu, en sert sarsıntı, tok gümbürtü + tıslama, kesik kesik titreşim |
| Devre | Mavi kısa arklar, hafif sarsıntı, çipte kırmızı yanıp sönme, kısa titreşim |
| Kırılgan | Cam kıymıkları, orta sarsıntı, tok darbe |

## Doğrulama

`node test-game.cjs` — **30 kontrol.** Gerçek oyun betiğini sahte canvas/DOM üzerinde çalıştırır: beş bölümün tam çözümü, döndürme ve bağımlılıklar, üç hata türü, mıknatıs menzili, basınç, minder, belirlenimcilik; ayrıca ipucu zamanlaması, kısmi ilerleme, hızlı kesme, uzun hareketlerde tek ceza, çoklu dokunma, dokunma iptali, gecikmiş sonuçların sıfırlanması ve yıldızlar.

Tarayıcıda döndürme, alet değişimi, kesme hareketi ve düzen elle denendi. Gerçek telefon donanımı, titreşim ve ses kalitesi hâlâ elde doğrulanmayı bekliyor.

