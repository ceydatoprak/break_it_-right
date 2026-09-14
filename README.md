# RESCUE WORKSHOP

Türkçe, mobil öncelikli bir kurtarma bulmacası. `index.html` dosyasını doğrudan aç ya da `node serve.cjs` çalıştırıp http://127.0.0.1:4173 adresine git.

Çekirdek döngü: **incele → alet seç → etkileşime gir → çöz → kurtar.**

Kırma sistemi silinmedi; beş aletten yalnızca biri hâline geldi.

## Aletler

| Alet | İşi | Hareket |
| --- | --- | --- |
| Çekiç | Zayıf noktayı ölçülü kırmak | Noktaya bas, güç için sürükle, bırak |
| Tornavida | Vida sökmek | Vidanın üstünde sürükle |
| Kesici | Bant, kayış kesmek | Şeridin üstünden geçir |
| Mıknatıs | Metal pimi çekmek | Pimin yakınında basılı tut |
| Vantuz | Kapak, panel kaldırmak | Panele bas ve dışarı çek |

Yanlış alet hiçbir şeyi bozmaz — parça titrer ve kısa bir uyarı çıkar. Başarısızlık yalnızca aşırı güçten gelir.

## Bölümler

| Bölüm | Hedef | Öğrettiği |
| --- | --- | --- |
| 1 · Cam kavanoz | Anahtarı kurtar | Her şey kırılarak açılmıyor: mandal → kapak → anahtar |
| 2 · Ahşap kutu | Oyuncağı çıkar | Sıra önemli: bant → iki vida → kapak |
| 3 · Metal kafes | Kafesi aç | Dolaylı etkileşim: elin yetişmediği pime mıknatıs yetişir |
| 4 · Buz kütlesi | Mücevheri kurtar | Kontrollü kırma: hafif vuruş çatlatır, sert vuruş mücevheri fırlatır |
| 5 · Kapsül | Kapsülü aç | Hepsi bir arada: kayış → vidalar → pim → cam kapak |

## Uygulama

Önceki prototipin kırık motoru olduğu gibi duruyor: Voronoi hücreleri, paylaşılan kırık duvarları, bağlı parça yeniden hesabı, dokulu parça çizimi, malzeme sesleri ve çatlak yayılımı. Çekiç bu motoru tek bir bölümde kullanıyor.

Üstüne bileşen tabanlı bir bulmaca katmanı geldi. Her etkileşimli parça bir bileşen: hangi aletlerin işlediği, neye bağlı olduğu ve tamamlanma durumu veriyle tanımlı. `TYPE` tablosu parça tiplerini (vida, şerit, pim, panel, kapı, zayıf nokta, kurtarma nesnesi) tutar; `LEVELS` yalnızca bu parçaları yerleştirir. Bağımlılıklar `requires` alanıyla kurulur, bölüm başına özel fonksiyon yazılmaz.

`mk` bileşen üretir, `locked` bağımlılığı çözer, `finish` tamamlanmayı yayar — `auto` işaretli parçalar (ahşap çerçeve) bağımlılıkları düşünce kendiliğinden açılır. Sahne her ekran oranında dolacak şekilde taşırmalı çiziliyor.

## Doğrulama

`node test-game.cjs` — 17 kontrol. Gerçek oyun betiğini sahte canvas/DOM üzerinde çalıştırır: beş bölümün tamamının çözümü, tek açık başlangıç adımı, yanlış alet davranışı, bağımlılık kilitleri, mıknatıs menzili, vantuz eşiği, buz güç bandı, otomatik çerçeve, minder kuralı, sıfırlama ve belirlenimcilik.

Tarayıcıda dokunmatik sürükleme, alet değişimi ve düzen elle denendi. Gerçek telefon donanımı, titreşim ve ses kalitesi hâlâ elde doğrulanmayı bekliyor.

Çalışma zamanı paketi gerekmez. Google Fonts isteğe bağlıdır; sistem yazı tipleriyle de çalışır.
