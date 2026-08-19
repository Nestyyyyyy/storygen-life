/* Hayat Simülatörü — elle yazılmış anlatı olayları
   Bunlar hikâyenin omurgası: dönüm noktaları ve zincirleme olaylar.
   Aradaki yılları `uretec.ts` içindeki prosedürel sahneler dolduruyor.

   evreler : olayın çıkabileceği yaş bantları — joker yok, her olay yaşına uygun
   gerek   : { bayrak, yokBayrak, iliski, yokIliski } koşulları
   tekSefer: zincir olayları için (motor zaten bir hayatta olayı tekrar etmez)
   Metinlerde {sevgili} {es} {arkadas} {rakip} {cocuk} {kopek} {ilkAsk}
   {isim} {birlikteYil} yer tutucuları kullanılabilir. */

import type { Olay } from "./tipler";

export const OLAYLAR: Olay[] = [
  /* ================= BEBEKLİK ================= */
  {
    id: "b1",
    evreler: ["bebek"],
    alan: "hayat",
    emoji: "🍼",
    baslik: "İlk Kelime",
    metin: "Herkes seni izliyor. Ağzından çıkacak ilk kelimeyi bekliyorlar.",
    secenekler: [
      {
        t: "Anneni çağır",
        etiketler: ["sosyal", "romantik"],
        fx: { mutluluk: 10, arkadaslik: 6 },
        sonuc:
          "İki heceyi birden söyledin ve odadaki herkes bir anda susup sana döndü. Annen elindeki bardağı bırakıp yanına çöktü, gözleri doldu. O gün evde kimse başka bir şey konuşmadı.",
        onemli: true,
      },
      {
        t: "Anlamsız bir ses çıkar",
        etiketler: ["kesif"],
        fx: { mutluluk: 6, kariyer: 3 },
        sonuc:
          "Kimsenin anlamadığı, uzun ve kararlı bir ses çıkardın. Herkes güldü ama sen ciddiydin — sanki söylemek istediğin çok daha karmaşık bir şey vardı. Bu inatçı ifade tarzı seninle kalacak.",
      },
      {
        t: "Sus, izlemeye devam et",
        etiketler: ["yalniz", "kacinma"],
        fx: { mutluluk: 2, kariyer: 4 },
        sonuc:
          "Konuşmadın. Bunun yerine herkesin yüzünü tek tek inceledin. Sessizliğin ailede bir espri konusu oldu ama gözlemci tarafın işte o gün başladı.",
      },
    ],
  },
  {
    id: "b2",
    evreler: ["bebek"],
    alan: "saglik",
    emoji: "🌡️",
    baslik: "Gece Ateşi",
    metin: "Gecenin bir yarısı ateşin çıktı. Evde telaş var.",
    secenekler: [
      {
        t: "Hastaneye götürülürsün",
        etiketler: ["guvenli", "tip"],
        fx: { saglik: 8, mutluluk: -3 },
        para: -1500,
        sonuc:
          "Acil servisin beyaz ışığı altında saatlerce beklendi. Sabaha karşı ateşin düştü ve doktorun 'geçti' demesiyle odadaki herkes aynı anda nefes verdi. O geceyi hatırlamayacaksın ama sana yıllarca anlatacaklar.",
      },
      {
        t: "Evde ıslak bezle geçirilir",
        etiketler: ["risk", "kacinma"],
        fx: { saglik: -8, mutluluk: 3 },
        sonuc:
          "Sabaha kadar alnında ıslak bir bez, yanında uyumayan biri. Ateş sabah düştü ama vücudunda küçük bir yorgunluk kaldı — yıllar sonra bile kışları çabuk hastalanacaksın.",
      },
    ],
  },
  {
    id: "b3",
    evreler: ["bebek"],
    alan: "arkadaslik",
    emoji: "🧸",
    baslik: "Oyuncak Kavgası",
    metin: "Parkta bir çocuk elindeki ayıyı çekiştiriyor. İkiniz de bırakmıyorsunuz.",
    secenekler: [
      {
        t: "Bırakma, çek",
        etiketler: ["cesaret", "bencil"],
        fx: { arkadaslik: -4, mutluluk: 5, saglik: -2 },
        sonuc:
          "Ayıyı kaptığın gibi göğsüne bastırdın. Diğer çocuk ağladı, anneler birbirine mahcup gülümsedi. Kazandın ama parkta bir süre kimse yanına gelmedi.",
      },
      {
        t: "Ver gitsin",
        etiketler: ["yardim"],
        fx: { arkadaslik: 8, mutluluk: 3 },
        sonuc:
          "Elini açtın ve ayı öbür tarafa geçti. Çocuk şaşkınlıkla sana baktı, sonra yanına oturup kumdan bir şey yapmaya başladınız. O öğleden sonra ilk kez birlikte oynamayı öğrendin.",
      },
    ],
  },
  {
    id: "b4",
    evreler: ["bebek"],
    alan: "hayat",
    emoji: "👣",
    baslik: "İlk Adım",
    metin: "Sehpaya tutunmuş, karşıda seni bekleyen kollara bakıyorsun. Arada üç adım var.",
    secenekler: [
      {
        t: "Bırak ve yürü",
        etiketler: ["cesaret", "spor"],
        fx: { saglik: 6, mutluluk: 10, kariyer: 3 },
        sonuc:
          "Elini bıraktın. İki adım attın, üçüncüde düştün ama yere değmeden yakalandın. Evde o gün alkış vardı; ilk kez bir şeye kendi başına doğru gittin.",
        onemli: true,
      },
      {
        t: "Emekleyerek git",
        etiketler: ["guvenli"],
        fx: { saglik: 3, mutluluk: 4 },
        sonuc:
          "Yürümek yerine bildiğin yolu seçtin ve saniyeler içinde karşıya vardın. Kimse üzülmedi, herkes güldü. Acele etmeyen bir çocuk oldun.",
      },
    ],
  },

  /* ================= ÇOCUKLUK ================= */
  {
    id: "c1",
    evreler: ["cocuk"],
    alan: "arkadaslik",
    emoji: "🎒",
    baslik: "İlk Gün",
    metin: "Okulda tek başına oturuyorsun. Yan masadaki çocuk sana gülümsüyor.",
    secenekler: [
      {
        t: "Selam ver, arkadaş ol",
        etiketler: ["sosyal", "cesaret"],
        fx: { arkadaslik: 12, mutluluk: 8 },
        sonuc:
          "Adını söyledin, o da söyledi ve daha teneffüs bitmeden sıraları birleştirmiştiniz. {arkadas} o günden sonra çantasında hep senin için de bir şeyler taşıdı. Yıllar sonra bile o ilk 'selam'ı hatırlayacaksın.",
        iliski: { tur: "arkadas" },
        onemli: true,
      },
      {
        t: "Utanıp başını çevir",
        etiketler: ["kacinma", "yalniz"],
        fx: { arkadaslik: -5, mutluluk: -4 },
        sonuc:
          "Defterine bakıyormuş gibi yaptın ve o gülümseme kayboldu. Öğle arasında herkesin bir masası vardı, senin yoktu. O yıl teneffüsler çok uzun geçti.",
      },
    ],
  },
  {
    id: "c2",
    evreler: ["cocuk"],
    alan: "hayat",
    emoji: "🐶",
    baslik: "Sokak Köpeği",
    metin: "Yağmurda titreyen bir yavru köpek buldun. Gözleri sana bakıyor.",
    secenekler: [
      {
        t: "Eve götür, sahiplen",
        etiketler: ["yardim", "cesaret"],
        fx: { mutluluk: 15, saglik: -3, arkadaslik: 4 },
        para: -500,
        sonuc:
          "Montunun içine sakladın, çamurlu ayak izleriyle eve girdin. Annen önce kızdı, sonra bir havlu getirdi. {kopek} o geceden itibaren senin yatağının ayak ucunda uyudu ve çocukluğunun en sadık tanığı oldu.",
        iliski: { tur: "kopek" },
        bayrak: ["kopekVar"],
        onemli: true,
      },
      {
        t: "Mamanı ver, bırak",
        etiketler: ["yardim", "guvenli"],
        fx: { mutluluk: 4, arkadaslik: 3 },
        sonuc:
          "Çantandaki sandviçi parçalayıp önüne koydun ve yağmur altında yemesini izledin. Sonra kalkıp yürüdün, arkana bakmamak için kendini zorladın. İçin rahat ama kalbin biraz buruk kaldı.",
      },
    ],
  },
  {
    id: "c3",
    evreler: ["cocuk"],
    alan: "kariyer",
    emoji: "🎨",
    baslik: "Gizli Yetenek",
    metin: "Öğretmen çizdiğin resmi tüm sınıfa gösterdi: 'Bu çocukta iş var!'",
    secenekler: [
      {
        t: "Sanata sarıl",
        etiketler: ["sanat", "kesif"],
        fx: { mutluluk: 10, kariyer: 8 },
        sonuc:
          "O günden sonra defterlerinin arkası boş kalmadı. Kimse istemeden çizdin, kimse görmeden yırttın, sonra yeniden çizdin. İçindeki o kıvılcım yıllarca peşini bırakmayacak.",
        bayrak: ["sanatKivilcimi"],
        onemli: true,
      },
      {
        t: "Utan, saklan",
        etiketler: ["kacinma", "yalniz"],
        fx: { mutluluk: -2, kariyer: 2 },
        sonuc:
          "Kulaklarına kadar kızardın ve resmi öğretmenin elinden alıp çantana tıktın. Ama o akşam eve gidince aynı resmi bir kez daha çizdin. Övgüden kaçtın, işten kaçamadın.",
      },
    ],
  },
  {
    id: "c4",
    evreler: ["cocuk"],
    alan: "saglik",
    emoji: "😠",
    baslik: "Zorba",
    metin: "Sınıfın kabadayısı harçlığını istiyor. Koridorda herkes izliyor.",
    secenekler: [
      {
        t: "Karşı dur",
        etiketler: ["cesaret", "spor"],
        fx: { saglik: -8, mutluluk: 6, arkadaslik: 8 },
        sonuc:
          "Dimdik durdun ve 'hayır' dedin. Bir yumruk yedin, dudağın patladı ama o gün bir daha kimse harçlık istemedi.",
        sonucKisilik: {
          cesur:
            "Sen daha o 'hayır' derken herkes sonunu tahmin etmişti. Bir tokat yedin ama gözünü bile kırpmadın; koridordaki çocuklar o günü yıllarca anlattı. Bir daha kimse sana bulaşmaya cesaret edemedi.",
          utangac:
            "Sesin çıkana kadar avuçların terledi, kelimeler boğazında düğümlendi. Sonunda 'hayır' dediğinde sesin çatladı ama söylemiştin işte. Yediğin darbe canını yaktı, yine de o gün kendinle ilgili yeni bir şey öğrendin.",
          kurnaz:
            "'Hayır' derken bir yandan da gözünle koridorun ucundaki nöbetçi öğretmeni arıyordun. Zamanlaman kusursuzdu; olay büyümeden bitti ve kahraman sen oldun.",
        },
        iliski: { tur: "rakip" },
        bayrak: ["rakipVar"],
        onemli: true,
      },
      {
        t: "Harçlığı ver",
        etiketler: ["kacinma", "guvenli"],
        fx: { mutluluk: -8, arkadaslik: -3 },
        para: -20,
        sonuc:
          "Cebindeki buruşuk parayı çıkarıp uzattın, gözlerini yerden kaldırmadın. O gün öğle yemeği yemedin ve kimseye anlatmadın. İçindeki o küçük çatlak uzun süre kapanmadı.",
      },
      {
        t: "Öğretmene söyle",
        etiketler: ["durustluk"],
        fx: { arkadaslik: -4, mutluluk: 4 },
        sonuc:
          "Ders bitiminde öğretmenin masasına gidip her şeyi anlattın. Mesele iki günde çözüldü, harçlığın da geri geldi. Ama bazı çocuklar arkandan 'ispiyoncu' dedi ve bu etiket bir yıl üstünde kaldı.",
      },
    ],
  },
  {
    id: "c5",
    evreler: ["cocuk"],
    alan: "para",
    emoji: "🪙",
    baslik: "Kumbara",
    metin: "Aylardır biriktirdiğin kumbara doldu. Camekânda bir bisiklet var.",
    secenekler: [
      {
        t: "Bisikleti al",
        etiketler: ["kesif", "spor"],
        fx: { mutluluk: 12, saglik: 6, arkadaslik: 4 },
        para: -900,
        sonuc:
          "Kumbarayı bozup bozuk paraları tezgâha döktün; kasiyer sayarken sabırla bekledin. O yaz mahalledeki her sokağı, her kestirmeyi öğrendin. Özgürlüğün iki tekerlek olduğunu ilk kez anladın.",
      },
      {
        t: "Biriktirmeye devam et",
        etiketler: ["guvenli", "calisma"],
        fx: { kariyer: 6, mutluluk: -3 },
        para: 600,
        sonuc:
          "Kumbarayı rafa geri koydun ve içine bir madeni para daha attın. Arkadaşların bisikletle geçerken sen pencereden izledin. Sabretmeyi öğrendin ama o yazı hep eksik hatırlayacaksın.",
      },
    ],
  },
  {
    id: "c6",
    evreler: ["cocuk"],
    alan: "hayat",
    emoji: "🪟",
    baslik: "Kırılan Cam",
    metin: "Attığın top komşunun camını indirdi. Kimse görmedi.",
    secenekler: [
      {
        t: "Kapıyı çal, itiraf et",
        etiketler: ["durustluk", "cesaret"],
        fx: { mutluluk: 6, arkadaslik: 6, kariyer: 2 },
        para: -300,
        sonuc:
          "Kapıyı çaldın ve titrek bir sesle 'ben yaptım' dedin. Komşu önce kaşlarını çattı, sonra omzuna vurup içeri çay içmeye çağırdı. Camın parası harçlığından kesildi ama o gün mahallede adın temiz kaldı.",
      },
      {
        t: "Kaç ve sus",
        etiketler: ["hile", "kacinma"],
        fx: { mutluluk: -5, arkadaslik: -2 },
        sonuc:
          "Topu kaptığın gibi eve koştun ve akşama kadar pencereden dışarı bakmadın. Kimse seni bulmadı, kimse bir şey sormadı. Ama o camın önünden her geçişinde adımların hızlandı.",
      },
    ],
  },

  /* ================= GENÇLİK ================= */
  {
    id: "g1",
    evreler: ["genc"],
    alan: "ask",
    emoji: "💌",
    baslik: "İlk Aşk",
    metin: "Kalbin sınıftaki birine kayıyor. Bugün koridorda yalnız yakaladın.",
    secenekler: [
      {
        t: "İtiraf et",
        etiketler: ["cesaret", "romantik"],
        fx: { ask: 18, mutluluk: 10, saglik: -2 },
        sonuc:
          "Kelimeler ağzından döküldüğünde kulaklarında kendi kalbini duyuyordun. {sevgili} birkaç saniye sustu — o saniyeler bir ömür gibiydi — sonra gülümsedi. O gün okuldan çıkarken yerden yürümüyordun.",
        sonucKisilik: {
          utangac:
            "Cümlenin yarısında sesin kaçtı, kalanını neredeyse fısıldadın. {sevgili} eğilip 'ne dedin?' diye sorunca her şeyi baştan söylemek zorunda kaldın — ve işte o ikinci sefer gerçekten cesaretti. Karşılık aldığında bacakların titriyordu.",
          cesur:
            "Hiç dolandırmadan söyledin, gözünü de kaçırmadın. {sevgili} bu kadar net bir şeye hazırlıklı değildi ve gülmeye başladı — iyi anlamda. O günden sonra herkes sizi birlikte görmeye alıştı.",
        },
        iliski: { tur: "sevgili", ilkAsk: true },
        bayrak: ["ilkAskYasandi"],
        onemli: true,
      },
      {
        t: "Not yaz, gizli bırak",
        etiketler: ["romantik", "kacinma", "sanat"],
        fx: { ask: 8, mutluluk: 4 },
        sonuc:
          "Defterinden kopardığın kâğıda üç cümle yazdın, sonra ikisini karaladın. Not haftalarca sınıfta konuşuldu, herkes birbirinden şüphelendi. Kimse senden şüphelenmedi ve bu hem rahatlattı hem de acıttı.",
        bayrak: ["gizliNot"],
      },
      {
        t: "Cesaret edemedin",
        etiketler: ["kacinma", "yalniz"],
        fx: { ask: -3, mutluluk: -6 },
        sonuc:
          "Ağzını açtın ve 'zil çalmak üzere' dedin. Sonra dönüp yürüdün, koridorun sonuna kadar arkana bakmadın. O cümleyi yıllarca kafanda tekrar tekrar düzelttin.",
        bayrak: ["kacirilanAsk"],
      },
    ],
  },
  {
    id: "g2",
    evreler: ["genc"],
    alan: "kariyer",
    emoji: "📚",
    baslik: "Sınav Baskısı",
    metin: "Üniversite sınavına aylar var. Ailen sürekli 'çalış' diyor, sen sürekli yoruluyorsun.",
    secenekler: [
      {
        t: "Gece gündüz çalış",
        etiketler: ["calisma", "teknik"],
        fx: { kariyer: 15, saglik: -10, mutluluk: -6 },
        sonuc:
          "Masanın üstündeki lamba her gece üçe kadar yandı. Gözlerin sulandı, omzun tutuldu, sabahları zor kalktın. Sonuç geldiğinde ailen ağladı — sen ise sadece uyumak istedin.",
        onemli: true,
      },
      {
        t: "Dengeli git",
        etiketler: ["guvenli"],
        fx: { kariyer: 8, mutluluk: 5, saglik: 2 },
        sonuc:
          "Bir program yaptın ve büyük ölçüde uydun. Hafta sonları kendine birkaç saat ayırdın, bu da seni ayakta tuttu. Ne muhteşem ne kötü bir sonuç aldın ama kimseye borçlu kalmadın.",
      },
      {
        t: "Boş ver, takıl",
        etiketler: ["tembellik", "sosyal"],
        fx: { kariyer: -8, mutluluk: 9, arkadaslik: 7 },
        sonuc:
          "Kitapları kapattın ve o yazı sokakta geçirdin. Sahilde geç saatlere kadar konuşulan geceler, ucuz dondurmalar, sonu gelmeyen kahkahalar. Sınav kâğıdın yarım kaldı ama o anılar hiç eskimedi.",
      },
    ],
  },
  {
    id: "g3",
    evreler: ["genc"],
    alan: "arkadaslik",
    emoji: "🎉",
    baslik: "Gece Partisi",
    metin: "Arkadaşların gizlice partiye çağırdı. Ailen duysa asla izin vermez.",
    secenekler: [
      {
        t: "Gizlice git",
        etiketler: ["risk", "sosyal", "hile"],
        fx: { arkadaslik: 12, mutluluk: 10, saglik: -4 },
        sonuc:
          "Pencereden çıktın, saat dörtte aynı pencereden girdin. O gece çalan şarkıyı yıllar sonra duyduğunda hâlâ aynı yere gideceksin. Yakalanmadın — bu sefer.",
      },
      {
        t: "Evde kal",
        etiketler: ["guvenli", "yalniz"],
        fx: { arkadaslik: -5, kariyer: 5, mutluluk: -2 },
        sonuc:
          "Telefonu sessize aldın ve odanda kaldın. Sabah gruba düşen fotoğraflarda herkes vardı, sen yoktun. Doğru olanı yaptığını biliyorsun ama bu bilgi o sabah pek işe yaramadı.",
      },
    ],
  },
  {
    id: "g4",
    evreler: ["genc"],
    alan: "para",
    emoji: "📱",
    baslik: "Viral Oldun",
    metin: "Paylaştığın bir video bir gecede patladı. Sabah uyandığında binlerce bildirim var.",
    secenekler: [
      {
        t: "İçerik üretmeye başla",
        etiketler: ["ticaret", "sanat", "risk"],
        fx: { kariyer: 10, mutluluk: 8, saglik: -3 },
        para: 4000,
        sonuc:
          "Telefonu elinden bırakmadığın üç ay geçti. İlk reklam teklifi geldiğinde ne yapacağını bilemedin, sonra kabul ettin. Odanın köşesi bir stüdyoya dönüştü ve hayatının merkezi kaymaya başladı.",
        bayrak: ["icerikUretici"],
        onemli: true,
      },
      {
        t: "Hesabı kapat",
        etiketler: ["kacinma", "yalniz"],
        fx: { mutluluk: 5, saglik: 4, kariyer: -3 },
        sonuc:
          "Yorumları okumak bir noktadan sonra dayanılmaz oldu ve hesabı sildin. İlk hafta elin boşluğa gitti, ikinci hafta rahatladın. Sadeliği seçtin, ama 'ya devam etseydim' sorusu ara ara ziyarete geliyor.",
      },
    ],
  },
  {
    id: "g5",
    evreler: ["genc"],
    alan: "arkadaslik",
    emoji: "🗡️",
    baslik: "İhanet",
    metin: "En yakın arkadaşın, sadece ona anlattığın şeyi herkese anlatmış.",
    secenekler: [
      {
        t: "Yüzleş",
        etiketler: ["cesaret", "durustluk"],
        fx: { arkadaslik: -6, mutluluk: 5 },
        sonuc:
          "Okulun arka bahçesinde konuştunuz, sonra bağırdınız. Söylenmemesi gereken birkaç şey de söylendi. Arkadaşlığınız o gün çatladı ama en azından ikiniz de neyin ne olduğunu biliyordunuz.",
      },
      {
        t: "Affet",
        etiketler: ["yardim", "sadakat"],
        fx: { arkadaslik: 7, mutluluk: -4 },
        sonuc:
          "'Boş ver' dedin ve konuyu kapattın. {arkadas} rahatladı, sen rahatlamadın. Aranızdaki şey devam etti ama sen artık ona her şeyi anlatmıyorsun.",
      },
      {
        t: "Sessizce uzaklaş",
        etiketler: ["yalniz", "kacinma"],
        fx: { arkadaslik: -8, mutluluk: 2, kariyer: 4 },
        sonuc:
          "Hiçbir şey demedin. Mesajlara geç dönmeye, çıkışta beklememeye başladın. Birkaç ay içinde ortadan sessizce silindin ve kimse tam olarak ne olduğunu anlamadı.",
      },
    ],
  },
  {
    id: "g6",
    evreler: ["genc"],
    alan: "kariyer",
    emoji: "🥇",
    baslik: "Yarışma",
    metin: "Okullar arası yarışmada finaldesin. Karşındaki, sana yıllardır rakip biri.",
    secenekler: [
      {
        t: "Sonuna kadar yarış",
        etiketler: ["cesaret", "calisma", "spor"],
        fx: { kariyer: 12, saglik: -4, mutluluk: 6 },
        sonuc:
          "Son ana kadar bırakmadın; nefesin bitti ama sen bitmedin. Kürsüde {rakip} ile yan yana durdunuz ve el sıkışırken ikiniz de gülümsemediniz. O günden sonra birbirinizi hep izlediniz.",
        iliski: { tur: "rakip" },
        bayrak: ["rakipVar"],
        onemli: true,
      },
      {
        t: "Kurallarla oyna",
        etiketler: ["hile", "bencil"],
        fx: { kariyer: 9, arkadaslik: -8, mutluluk: 2 },
        para: 1500,
        sonuc:
          "Kimsenin okumadığı bir maddeyi sen okudun ve itiraz ettin. Kupa senin oldu, alkış biraz cılızdı. Kazanmanın tadı beklediğin gibi çıkmadı ama kazandın işte.",
        iliski: { tur: "rakip" },
        bayrak: ["rakipVar"],
      },
      {
        t: "Çekil, sahne onun olsun",
        etiketler: ["kacinma", "yardim"],
        fx: { kariyer: -6, arkadaslik: 8, mutluluk: 3 },
        sonuc:
          "Sıra sana gelmeden adını geri çektin. Kimse nedenini anlamadı, sen de açıklamadın. Kürsüdeki alkışı izlerken içinde hem huzur hem küçük bir sızı vardı.",
      },
    ],
  },
  {
    id: "g7",
    evreler: ["genc"],
    alan: "saglik",
    emoji: "🚬",
    baslik: "Merak",
    metin:
      "Bahçenin arkasında kalabalık bir grup var. Biri sana bir şey uzatıyor: 'Sadece bir kere.'",
    secenekler: [
      {
        t: "Dene",
        etiketler: ["risk", "sosyal"],
        fx: { saglik: -10, arkadaslik: 6, mutluluk: 3 },
        sonuc:
          "Öksürdün, gözlerin sulandı, herkes güldü ve sen de güldün. O gün gruba dahil oldun. Bir kerelik olan şey birkaç yıl sürdü ve ciğerlerin bunu unutmadı.",
        bayrak: ["kotuAliskanlik"],
      },
      {
        t: "Reddet",
        etiketler: ["durustluk", "guvenli", "spor"],
        fx: { saglik: 6, arkadaslik: -4, mutluluk: 2 },
        sonuc:
          "'İstemem' deyip geri çekildin. Birkaç kişi kaşını kaldırdı, biri arkandan bir şey söyledi. Duvarın öbür tarafında yalnız kaldın ama nefesin temiz kaldı.",
      },
    ],
  },
  {
    id: "g8",
    evreler: ["genc"],
    alan: "hayat",
    emoji: "🎒",
    baslik: "Şehirden Ayrılmak",
    metin: "Okul için başka bir şehre gitme ihtimali var. Herkesin bir fikri var, seninki hariç.",
    secenekler: [
      {
        t: "Git, yeni bir şehir kur",
        etiketler: ["kesif", "cesaret", "risk"],
        fx: { kariyer: 10, arkadaslik: -6, mutluluk: 6 },
        para: -3000,
        sonuc:
          "Otobüs kalkarken pencereden el salladın ve gözyaşını kimseye göstermedin. İlk aylar zor geçti — yemek yabancı, oda soğuk, telefon sürekli sessizdi. Ama o şehirde kendi kararlarını verebilen biri oldun.",
        bayrak: ["sehirDegistirdi"],
        onemli: true,
      },
      {
        t: "Kal, tanıdık olanı seç",
        etiketler: ["guvenli", "sadakat"],
        fx: { arkadaslik: 8, mutluluk: 4, kariyer: -5 },
        sonuc:
          "Formu doldurmadın ve kimseye söylemeden konuyu kapattın. Aynı sokaklar, aynı yüzler, aynı çay bahçesi. Huzurluydun ama bazen otobüs terminalinin önünden geçerken içinde bir şey kımıldadı.",
      },
    ],
  },

  /* ================= GENÇ YETİŞKİNLİK ================= */
  {
    id: "y1",
    evreler: ["gencYetiskin"],
    alan: "kariyer",
    emoji: "💼",
    baslik: "İş Teklifi",
    metin: "Elinde iki zarf var: güvenli bir maaş, ya da riskli ama tutkulu bir iş.",
    secenekler: [
      {
        t: "Güvenli yolu seç",
        etiketler: ["guvenli", "calisma"],
        fx: { kariyer: 10, mutluluk: -3, saglik: 2 },
        para: 25000,
        sonuc:
          "Sözleşmeyi imzaladın, maaş her ayın beşinde yattı. Hayatın öngörülebilir, faturaların ödenmiş, hafta sonların boş. Bazı akşamlar bunun tam olarak istediğin şey olup olmadığını düşünüyorsun.",
      },
      {
        t: "Tutkunun peşinden git",
        etiketler: ["risk", "kesif", "sanat"],
        fx: { kariyer: 6, mutluluk: 13, saglik: -4 },
        para: 5000,
        sonuc:
          "Az para, uzun saatler, belirsiz bir gelecek. Ama sabahları alarmdan önce uyanıyorsun ve bu yıllardır olmuyordu. Ailen endişeli, sen değilsin — henüz.",
        onemli: true,
      },
    ],
  },
  {
    id: "y2",
    evreler: ["gencYetiskin"],
    alan: "ask",
    emoji: "💫",
    baslik: "Bir Tanışma",
    metin: "Kafede biriyle göz göze geldin. Gülümsüyor ve bakışını kaçırmıyor.",
    gerek: { yokIliski: "sevgili" },
    secenekler: [
      {
        t: "Yanına git, konuş",
        etiketler: ["cesaret", "sosyal", "romantik"],
        fx: { ask: 16, mutluluk: 8 },
        sonuc:
          "İki saat konuştunuz; kahveler soğudu, garson iki kez uğradı. {sevgili} kalkarken telefonunu uzattı ve 'yaz bakalım' dedi. O akşam eve giderken yürüyüşünün değiştiğini fark ettin.",
        iliski: { tur: "sevgili" },
        onemli: true,
      },
      {
        t: "Kahveni al, çık",
        etiketler: ["kacinma", "yalniz"],
        fx: { ask: -3, mutluluk: -2 },
        sonuc:
          "Bardağı kaptığın gibi kapıya yürüdün. Kaldırımda durup bir saniye düşündün, sonra geri döndün — ama masa boştu. O 'acaba' yıllarca aklında kaldı.",
      },
    ],
  },
  {
    id: "y3",
    evreler: ["gencYetiskin", "yetiskin"],
    alan: "para",
    emoji: "📈",
    baslik: "Kripto Fırsatı",
    metin:
      "Bir arkadaşın 'kesin katlanacak' dediği bir coin'e para koymanı istiyor. Grafiği gösterirken elleri titriyor.",
    secenekler: [
      {
        t: "Tüm birikimini bas",
        etiketler: ["risk", "ticaret"],
        fx: { mutluluk: -6, saglik: -5 },
        para: 45000,
        riskli: 0.45,
        kotu: {
          fx: { mutluluk: -14, saglik: -8, arkadaslik: -5 },
          para: -35000,
          sonuc:
            "Üç gün içinde grafik dipe vurdu ve bir daha kalkmadı. Ekrana bakarken midende bir boşluk açıldı; parayı değil, kendine olan güvenini kaybetmiştin. Aylarca kimseye anlatamadın.",
        },
        sonuc:
          "Şansın yaver gitti; iki ayda katladı ve tam zamanında çıktın. Ama o iki ay boyunca uyandığın her gece ilk iş telefona baktın. Kazandın, ama sinir sistemin de bir bedel ödedi.",
        bayrak: ["kumarTadi"],
      },
      {
        t: "Azıcık dene",
        etiketler: ["guvenli", "ticaret"],
        fx: { mutluluk: 3 },
        para: 3000,
        sonuc:
          "Kaybetmeyi göze alabileceğin kadarını koydun ve orada bıraktın. Küçük bir kâr çıktı, kimseye hava atacak kadar değil. Uykuların bölünmedi, bu da bir kazanç.",
      },
      {
        t: "Uzak dur",
        etiketler: ["guvenli", "durustluk"],
        fx: { mutluluk: 4, kariyer: 2 },
        sonuc:
          "'Anlamadığım şeye para koymam' dedin ve konu kapandı. Aylar sonra o coin sıfırlandığında arkadaşın seni aradı, sesi çok yorgundu. Sen sadece dinledin, 'demiştim' demedin.",
      },
    ],
  },
  {
    id: "y4",
    evreler: ["gencYetiskin", "yetiskin"],
    alan: "ask",
    emoji: "💍",
    baslik: "Büyük Soru",
    metin:
      "{sevgili} ile {birlikteYil} yıldır berabersiniz. Artık masada başka bir konu var: evlilik.",
    gerek: { iliski: "sevgili", yokBayrak: ["evli"] },
    tekSefer: true,
    agirlik: 3,
    secenekler: [
      {
        t: "Evet de",
        etiketler: ["sadakat", "romantik", "cesaret"],
        fx: { ask: 15, mutluluk: 12, arkadaslik: 5 },
        para: -30000,
        sonuc:
          "Kalabalık bir salon, yanlış çalan bir şarkı ve annenin bir türlü kurumayan gözleri. {sevgili} ile ilk dansta ikiniz de adımları şaşırdınız ve güldünüz. O gece bambaşka bir hayatın ilk sayfasıydı.",
        iliskiYukselt: { eski: "sevgili", yeni: "es" },
        bayrak: ["evli"],
        onemli: true,
      },
      {
        t: "Biraz daha bekleyelim",
        etiketler: ["kacinma", "guvenli"],
        fx: { ask: -6, mutluluk: -3 },
        sonuc:
          "'Acelemiz ne?' dedin ve konuyu ustalıkla değiştirdin. {sevgili} anlayışla başını salladı ama o akşam yemekte pek konuşmadı. Aranıza ince, görünmez bir soğukluk yerleşti.",
        bayrak: ["ertelenmisEvlilik"],
      },
      {
        t: "Ayrılalım",
        etiketler: ["durustluk", "yalniz"],
        fx: { ask: -18, mutluluk: -10, arkadaslik: -3 },
        sonuc:
          "Söylemesi zordu ama söyledin: aynı şeyi istemiyordunuz. {sevgili} ağlamadı, sadece uzun uzun sana baktı ve çantasını aldı. Boş kalan evde ilk hafta duvarlara konuştun.",
        iliskiBitir: "sevgili",
        bayrak: ["ayrilikYasadi"],
        onemli: true,
      },
    ],
  },
  {
    id: "y5",
    evreler: ["gencYetiskin", "yetiskin"],
    alan: "saglik",
    emoji: "😰",
    baslik: "Tükenmişlik",
    metin: "Haftalardır az uyuyup çok çalışıyorsun. Bugün ayağa kalkarken oda döndü.",
    secenekler: [
      {
        t: "Tatile çık",
        etiketler: ["kesif", "guvenli"],
        fx: { saglik: 13, mutluluk: 11, kariyer: -4 },
        para: -8000,
        sonuc:
          "Telefonu uçak moduna aldın ve dört gün açmadın. Denize karşı hiçbir şey yapmadan oturmak ilk gün huzursuz etti, ikinci gün iyileştirdi. Döndüğünde iş yerinde dünya yıkılmamıştı.",
      },
      {
        t: "Kafeinle devam",
        etiketler: ["calisma", "risk"],
        fx: { saglik: -13, kariyer: 7, mutluluk: -4 },
        sonuc:
          "Üçüncü kahveden sonra ellerin titriyordu ama iş bitti. Patronun 'harikasın' dedi ve yeni bir dosya uzattı. Vücudun faturayı hemen kesmedi — taksitlendirdi.",
        bayrak: ["yipranma"],
      },
    ],
  },
  {
    id: "y6",
    evreler: ["gencYetiskin", "yetiskin"],
    alan: "para",
    emoji: "🧾",
    baslik: "Sıkışan Ay",
    metin: "Kira, fatura, borç... Bu ay hiçbiri denk gelmiyor. Bir tanıdık 'ben ayarlarım' diyor.",
    secenekler: [
      {
        t: "Tefeciden borç al",
        etiketler: ["risk", "hile"],
        fx: { mutluluk: 4, saglik: -4 },
        para: 30000,
        sonuc:
          "Sayılan paraları cebe koyarken adamın gözlerine bakmamaya çalıştın. O ay her şey ödendi, nefes aldın. Ama defterin bir yerinde artık senin adın yazıyor ve bu düşünce geceleri uyanmana sebep oluyor.",
        bayrak: ["borc"],
        onemli: true,
      },
      {
        t: "İkinci işe gir",
        etiketler: ["calisma", "durustluk"],
        fx: { kariyer: 6, saglik: -8, mutluluk: -4, arkadaslik: -3 },
        para: 12000,
        sonuc:
          "Akşamları da çalışmaya başladın; günün on altı saati ayaktasın. Borcunu kendi elinle kapattın ve bunu kimseye anlatmadın. Sırtın ağrıyor ama başın dik.",
      },
      {
        t: "Sevdiklerinden iste",
        etiketler: ["sosyal", "kacinma"],
        fx: { arkadaslik: -6, mutluluk: -3, ask: -2 },
        para: 15000,
        sonuc:
          "Telefonda sesin çıkmadı, sonunda mesaj attın. Para geldi, hem de hiç soru sorulmadan. Ama bir sonraki buluşmada masada oturuş şeklin bile değişmişti.",
      },
    ],
  },
  {
    id: "y7",
    evreler: ["gencYetiskin"],
    alan: "arkadaslik",
    emoji: "🏠",
    baslik: "Ev Arkadaşı",
    metin: "Kirayı bölüşmek için birinin taşınması gerekiyor. İlan verdin, kapıda biri duruyor.",
    gerek: { yokIliski: "es" },
    secenekler: [
      {
        t: "Kabul et",
        etiketler: ["sosyal", "kesif"],
        fx: { arkadaslik: 11, mutluluk: 6, saglik: -2 },
        para: 6000,
        sonuc:
          "Mutfak paylaşımı ilk ay felaketti, sonra bir ritim oturdu. {arkadas} ile gece yarısı yapılan sohbetler, dolapta biten süt kavgaları, ortak alışveriş listeleri. Yalnızlığın ne kadar pahalı olduğunu ancak biterken anladın.",
        iliski: { tur: "arkadas" },
      },
      {
        t: "Yalnız yaşamayı seç",
        etiketler: ["yalniz", "guvenli"],
        fx: { mutluluk: 4, arkadaslik: -6, kariyer: 3 },
        para: -6000,
        sonuc:
          "Kapıyı kapattın ve evin sessizliği bir anda çok belirgin oldu. Her şey senin bıraktığın yerde duruyor, kimse sana soru sormuyor. Bazı akşamlar bu mükemmel, bazı akşamlar dayanılmaz.",
      },
    ],
  },
  {
    id: "y8",
    evreler: ["gencYetiskin", "yetiskin"],
    alan: "kariyer",
    emoji: "🧪",
    baslik: "Kendi İşin",
    metin: "Aklındaki fikri artık uykunda bile görüyorsun. Ama kurmak için işi bırakmak gerek.",
    secenekler: [
      {
        t: "İstifa et, kur",
        etiketler: ["risk", "ticaret", "cesaret"],
        fx: { kariyer: 10, mutluluk: 8, saglik: -6 },
        para: -20000,
        riskli: 0.4,
        kotu: {
          fx: { kariyer: -10, mutluluk: -12, saglik: -6 },
          para: -30000,
          sonuc:
            "On bir ay sonra kepenk indi. Elinde ödenmemiş faturalar, geri dönülmeyen mesajlar ve bir sürü 'keşke' kaldı. En zoru, herkese tek tek anlatmak oldu.",
        },
        sonuc:
          "İlk altı ay ofis dediğin şey mutfak masasıydı. Sonra ilk gerçek müşteri geldi, sonra bir tane daha. Kendi kurduğun şeyin ayakta durduğunu görmek, hayatında hissettiğin en tuhaf gururdu.",
        bayrak: ["kendiIsi"],
        onemli: true,
      },
      {
        t: "Hafta sonları geliştir",
        etiketler: ["calisma", "guvenli", "teknik"],
        fx: { kariyer: 6, saglik: -4, mutluluk: 2 },
        para: 4000,
        sonuc:
          "Cumartesileri fikre, pazarları uykuya ayırdın. İki yılda yavaş ama sağlam bir şey çıktı ortaya. Kimse patlama demedi ama kimse de battın demedi.",
      },
      {
        t: "Fikri rafa kaldır",
        etiketler: ["kacinma", "guvenli"],
        fx: { kariyer: -3, mutluluk: -6 },
        sonuc:
          "Defteri çekmeceye koydun ve anahtarı çevirdin. Yıllar sonra aynı fikri bir başkasının reklamında gördüğünde kanalı değiştirdin. 'Ben de düşünmüştüm' cümlesi kimseyi ısıtmıyor.",
      },
    ],
  },

  /* ================= YETİŞKİNLİK ================= */
  {
    id: "a1",
    evreler: ["yetiskin"],
    alan: "kariyer",
    emoji: "🏆",
    baslik: "Terfi mi, Aile mi?",
    metin: "Hayalindeki terfi geldi ama başka şehirde. Sevdiklerin burada.",
    secenekler: [
      {
        t: "Terfiyi al, taşın",
        etiketler: ["bencil", "calisma", "kesif"],
        fx: { kariyer: 16, ask: -9, arkadaslik: -7 },
        para: 30000,
        sonuc:
          "Yeni şehirde ofisin camdan, evin boş. Unvanın büyüdü, telefon defterin küçüldü. Akşamları menüye bakarken kendine 'buna değdi mi' diye sormayı alışkanlık haline getirdin.",
        onemli: true,
      },
      {
        t: "Kal, sevdiklerini seç",
        etiketler: ["sadakat", "yardim"],
        fx: { kariyer: -5, ask: 9, mutluluk: 9, arkadaslik: 7 },
        sonuc:
          "'Teşekkür ederim ama hayır' demek beklediğinden kolay oldu. Aynı masa, aynı yüzler, aynı akşam yemekleri devam etti. Kariyerin bir basamak eksik kaldı, sofran bir kişi fazla.",
        onemli: true,
      },
    ],
  },
  {
    id: "a2",
    evreler: ["yetiskin"],
    alan: "hayat",
    emoji: "🎸",
    baslik: "Orta Yaş",
    metin: "Bir sabah aynada kendine baktın ve içinden geçti: 'Bu hayatı ben mi seçtim?'",
    secenekler: [
      {
        t: "Her şeyi değiştir",
        etiketler: ["risk", "kesif", "cesaret"],
        fx: { mutluluk: 12, kariyer: -7, saglik: 4 },
        para: -15000,
        sonuc:
          "Bir motosiklet, bir gitar kursu ve kimsenin anlamadığı yeni bir saç kesimi. Çevrendekiler önce endişelendi, sonra alıştı. Çılgın görünüyorsun ama uzun zamandır bu kadar canlı hissetmemiştin.",
      },
      {
        t: "Terapiye başla",
        etiketler: ["durustluk", "yardim"],
        fx: { mutluluk: 9, saglik: 7 },
        para: -6000,
        sonuc:
          "İlk seans boyunca çoğunlukla sustun. Üçüncü seansta hiç beklemediğin bir cümle ağzından döküldü ve odada uzun bir sessizlik oldu. Değişim gürültüsüz başladı ama başladı.",
        bayrak: ["terapi"],
      },
      {
        t: "Görmezden gel",
        etiketler: ["kacinma", "tembellik"],
        fx: { mutluluk: -7 },
        sonuc:
          "Aynadan uzaklaştın ve her zamanki gibi işe gittin. Gün normal geçti, hafta normal geçti. Ama o soru geceleri, herkes uyuduktan sonra hep geri geldi.",
      },
    ],
  },
  {
    id: "a3",
    evreler: ["yetiskin", "orta"],
    alan: "para",
    emoji: "🏠",
    baslik: "Yatırım",
    metin: "Bir emlak fırsatı çıktı. Tüm birikimini ve biraz da cesaret istiyor.",
    secenekler: [
      {
        t: "Al gözünü kapa",
        etiketler: ["risk", "ticaret"],
        fx: { mutluluk: 4, saglik: -4 },
        para: 70000,
        riskli: 0.35,
        kotu: {
          fx: { mutluluk: -12, saglik: -6, kariyer: -4 },
          para: -45000,
          sonuc:
            "Proje yarım kaldı, müteahhit ortadan kayboldu ve elinde bir kâğıt yığını kaldı. Avukat masrafları da cabası. O binanın önünden geçmemek için yolunu değiştirdin.",
        },
        sonuc:
          "İmzayı atarken ellerin terliyordu. Üç yıl sonra bölgeye metro geldi ve değer ikiye katlandı. Kazandın ama o üç yılın her taksitinde saçların biraz daha ağardı.",
      },
      {
        t: "Kirada kal, biriktir",
        etiketler: ["guvenli", "calisma"],
        fx: { mutluluk: 2, saglik: 2 },
        para: 9000,
        sonuc:
          "Riske girmedin, mevduatta beklemeyi seçtin. Fiyatlar uçarken biraz canın sıkıldı ama gece uykun hiç bölünmedi. Yavaş, güvenli ve biraz da sıkıcı bir ilerleme.",
      },
    ],
  },
  {
    id: "a4",
    evreler: ["yetiskin", "orta"],
    alan: "arkadaslik",
    emoji: "📞",
    baslik: "Eski Dost",
    metin: "Yıllar sonra çocukluk arkadaşın arıyor: 'Zor durumdayım, borç lazım.'",
    secenekler: [
      {
        t: "Yardım et",
        etiketler: ["yardim", "sadakat"],
        fx: { arkadaslik: 12, mutluluk: 7 },
        para: -20000,
        sonuc:
          "Hiç soru sormadan gönderdin ve 'ne zaman olursa' dedin. Telefonun öbür ucunda uzun bir sessizlik ve titreyen bir teşekkür vardı. Para belki geri gelmez ama o ses aklında kaldı.",
      },
      {
        t: "Nazikçe reddet",
        etiketler: ["bencil", "guvenli"],
        fx: { arkadaslik: -9, mutluluk: -4 },
        sonuc:
          "Bütçeni anlattın, gerçekten anlattın. Karşı taraf 'tabii, anlıyorum' dedi ve telefonu kapattı. Bir daha aramadı ve sen de arayamadın.",
      },
      {
        t: "İş bul, para verme",
        etiketler: ["hile", "yardim"],
        fx: { arkadaslik: 5, kariyer: 3, mutluluk: 3 },
        sonuc:
          "Para yerine iki telefon açtın ve bir görüşme ayarladın. İşe girdi, birkaç ay sonra ilk maaşıyla sana yemek ısmarladı. Bazı yardımlar cepten değil, defterden çıkıyor.",
      },
    ],
  },
  {
    id: "a5",
    evreler: ["yetiskin"],
    alan: "ask",
    emoji: "🌧️",
    baslik: "Soğuyan Ev",
    metin: "{es} ile aynı evde yaşıyorsunuz ama son aylarda konuşmalar iki cümleyi geçmiyor.",
    gerek: { iliski: "es" },
    agirlik: 3,
    secenekler: [
      {
        t: "Konuş, üstüne git",
        etiketler: ["durustluk", "romantik", "cesaret"],
        fx: { ask: 12, mutluluk: 8, arkadaslik: 2 },
        sonuc:
          "Televizyonu kapattın ve 'böyle devam edemeyiz' dedin. O gece mutfakta sabaha kadar konuştunuz; ikiniz de birkaç kez ağladınız. Ertesi sabah kahve iki fincanla yapıldı ve bu küçük şey her şeyi anlatıyordu.",
      },
      {
        t: "Görmezden gel",
        etiketler: ["kacinma", "tembellik"],
        fx: { ask: -12, mutluluk: -8 },
        sonuc:
          "Konuyu açmadın, o da açmadı. Aynı evde iki ayrı hayat kurmayı öğrendiniz; buzdolabında bile iki ayrı raf var artık. Sessizlik en gürültülü şey haline geldi.",
        bayrak: ["evdeCatlak"],
      },
      {
        t: "Başka bir kapıyı arala",
        etiketler: ["hile", "bencil", "romantik"],
        fx: { ask: -6, mutluluk: 4, arkadaslik: -5 },
        sonuc:
          "İş yerinden biriyle mesajlaşmalar uzadı, sonra bir kahve oldu. Kendini haklı çıkarmak için içinden uzun cümleler kurdun. {es} bir şey sormadı ama bakışları değişti.",
        bayrak: ["ihanet"],
        onemli: true,
      },
    ],
  },
  {
    id: "a6",
    evreler: ["yetiskin", "orta"],
    alan: "saglik",
    emoji: "🫀",
    baslik: "Uyarı",
    metin: "Göğsünde birkaç saniye süren bir sıkışma oldu. Geçti ama seni korkuttu.",
    secenekler: [
      {
        t: "Hemen doktora git",
        etiketler: ["tip", "guvenli", "durustluk"],
        fx: { saglik: 12, mutluluk: -3 },
        para: -5000,
        sonuc:
          "Tahliller, bir sürü kablo ve beklenen bir cümle: 'Ciddi bir şey yok ama bu bir uyarı.' Sigara, tuz ve uykusuzluk listeden çıktı. Korkun sana iyi geldi.",
      },
      {
        t: "Yorgunluktur de",
        etiketler: ["kacinma", "risk"],
        fx: { saglik: -14, mutluluk: 2 },
        sonuc:
          "Bir bardak su içtin ve işine döndün. Birkaç hafta boyunca aynı sıkışma iki kez daha oldu, her seferinde biraz daha uzun sürdü. Bedenin sana konuşuyor ama sen kulaklıkla geziyorsun.",
        bayrak: ["kalpUyarisi"],
      },
    ],
  },

  /* ================= ORTA YAŞ ================= */
  {
    id: "o1",
    evreler: ["orta"],
    alan: "saglik",
    emoji: "🩺",
    baslik: "Kontrol",
    metin: "Doktor tahlil kâğıdını uzatıyor: 'Yaşam tarzını değiştirmen lazım.'",
    secenekler: [
      {
        t: "Spora ve diyete başla",
        etiketler: ["spor", "calisma", "tip"],
        fx: { saglik: 16, mutluluk: 5, kariyer: -2 },
        para: -3000,
        sonuc:
          "İlk hafta her yerin ağrıdı ve iki kez vazgeçmeyi düşündün. Üçüncü ayda merdivenleri nefesin kesilmeden çıktığını fark ettin ve durup gülümsedin. Bedenini geri kazanmak yıllarını geri kazanmak gibiydi.",
      },
      {
        t: "Yarın başlarım de",
        etiketler: ["tembellik", "kacinma"],
        fx: { saglik: -13, mutluluk: -2 },
        sonuc:
          "Kâğıdı buzdolabının üstüne astın, sonra bir dosyanın altında kayboldu. O 'yarın' hiç gelmedi. Vücudun artık eskisi kadar affetmiyor ve bunu her sabah hatırlatıyor.",
      },
    ],
  },
  {
    id: "o2",
    evreler: ["orta", "yasli"],
    alan: "hayat",
    emoji: "✈️",
    baslik: "Yapılacaklar Listesi",
    metin: "Hep 'bir gün' dediğin o uzun yolculuk hâlâ listenin başında duruyor.",
    secenekler: [
      {
        t: "Bavulu topla, git",
        etiketler: ["kesif", "cesaret"],
        fx: { mutluluk: 17, saglik: 5, ask: 4 },
        para: -20000,
        sonuc:
          "Adını doğru telaffuz edemediğin şehirlerde kayboldun, yanlış trene bindin, yabancılarla masa paylaştın. Döndüğünde valizin ağırlığı aynıydı ama sen değildin. 'Pişmanlıksız yaşamak' dedikleri şey buymuş.",
        onemli: true,
      },
      {
        t: "Sonraya bırak",
        etiketler: ["kacinma", "guvenli"],
        fx: { mutluluk: -7 },
        sonuc:
          "'Şartlar uygun değil' dedin ve listeyi çekmeceye koydun. Şartlar hiçbir zaman tam olarak uygun olmadı. Takvim yaprakları sen fark etmeden hızlandı.",
      },
    ],
  },
  {
    id: "o3",
    evreler: ["orta"],
    alan: "arkadaslik",
    emoji: "🕰️",
    baslik: "Vedanın Zamanı",
    metin: "Çocukluğundan beri tanıdığın birinin cenazesindesin. Kalabalık dağılıyor.",
    secenekler: [
      {
        t: "Herkese ulaş, bir araya getir",
        etiketler: ["sosyal", "yardim"],
        fx: { arkadaslik: 12, mutluluk: -3, saglik: -2 },
        sonuc:
          "Cenazeden sonra herkesi bir çay bahçesine topladın. Yıllardır konuşmayan insanlar aynı masada eski hikâyeleri anlattı, bir noktada gülündü. Kaybın acısı azalmadı ama yalnız kalmadın.",
      },
      {
        t: "Sessizce eve dön",
        etiketler: ["yalniz", "kacinma"],
        fx: { mutluluk: -8, saglik: -3, arkadaslik: -4 },
        sonuc:
          "Kimseyle konuşmadan arabaya bindin ve eve kadar radyoyu açmadın. Kapıyı kapattığında ev hiç bu kadar büyük görünmemişti. O gece uzun bir liste yaptın: hâlâ arayabileceğin kişiler.",
      },
    ],
  },
  {
    id: "o4",
    evreler: ["orta"],
    alan: "kariyer",
    emoji: "🧭",
    baslik: "Genç Meslektaş",
    metin:
      "İşe yeni giren biri tam da senin yıllar önceki halin gibi: hevesli, acemi ve çok hızlı.",
    secenekler: [
      {
        t: "Kanadının altına al",
        etiketler: ["yardim", "calisma"],
        fx: { kariyer: 8, mutluluk: 9, arkadaslik: 7 },
        sonuc:
          "Bildiğin her şeyi anlattın, hatalarını da sakladığın yerden çıkarıp gösterdin. Bir yıl sonra o kişi senin bile göremediğin bir çözümü buldu ve ilk sana koştu. Öğretmenin gururu bambaşkaymış.",
      },
      {
        t: "Mesafeni koru",
        etiketler: ["bencil", "yalniz"],
        fx: { kariyer: 3, arkadaslik: -6, mutluluk: -4 },
        sonuc:
          "Sorularına kısa cevaplar verdin, projelerini paylaşmadın. Koltuğun sağlam kaldı ama ofiste etrafına ince bir duvar örüldü. Öğle yemeklerini artık çoğunlukla masanda yiyorsun.",
      },
    ],
  },
  {
    id: "o5",
    evreler: ["orta", "yasli"],
    alan: "para",
    emoji: "🧿",
    baslik: "Miras Kavgası",
    metin:
      "Aileden kalan eski bir ev var. Herkesin farklı bir planı, herkesin farklı bir hikâyesi.",
    secenekler: [
      {
        t: "Payını al, çekil",
        etiketler: ["guvenli", "bencil"],
        fx: { arkadaslik: -6, mutluluk: -2 },
        para: 45000,
        sonuc:
          "Noterde imzayı attın ve payını aldın. Cebin doldu, bayram sofrasında iki sandalye boş kaldı. Bazı akrabalarınla bir daha ancak cenazelerde karşılaştın.",
      },
      {
        t: "Evi ortak tut",
        etiketler: ["sadakat", "yardim"],
        fx: { arkadaslik: 10, mutluluk: 8 },
        para: -5000,
        sonuc:
          "'Satmayalım' diyen tek sendin ve ısrar ettin. Çatı aktardığında masrafı sen üstlendin ama her yaz o bahçede kalabalık bir sofra kuruldu. Bazı şeylerin fiyatı var, değeri başka.",
      },
    ],
  },

  /* ================= YAŞLILIK ================= */
  {
    id: "z1",
    evreler: ["yasli"],
    alan: "kariyer",
    emoji: "🌇",
    baslik: "Emeklilik",
    metin: "Uzun bir çalışma hayatının son gününde masanı topluyorsun. Şimdi ne olacak?",
    secenekler: [
      {
        t: "Torunlara, bahçeye vakit ayır",
        etiketler: ["yardim", "sosyal"],
        fx: { mutluluk: 15, saglik: 7, arkadaslik: 7 },
        sonuc:
          "Sabahları kuş sesiyle uyanıyor, akşamüstü domates fidelerini suluyorsun. Telaş diye bir şey kalmadı, yerine tuhaf bir doluluk geldi. Hayatında ilk kez saate bakmadan yaşıyorsun.",
      },
      {
        t: "Danışmanlık yapmaya devam",
        etiketler: ["calisma", "teknik"],
        fx: { kariyer: 7, mutluluk: 3, saglik: -6 },
        para: 12000,
        sonuc:
          "Durmayı hiç beceremedin; iki hafta sonra ilk toplantıya oturmuştun bile. Aklın hâlâ keskin, tavsiyelerin hâlâ değerli. Ama akşamları koltuktan kalkman biraz daha uzun sürüyor.",
      },
    ],
  },
  {
    id: "z2",
    evreler: ["yasli"],
    alan: "hayat",
    emoji: "📖",
    baslik: "Miras",
    metin: "Geriye bir şey bırakmak istiyorsun. Ama ne?",
    secenekler: [
      {
        t: "Anılarını yaz",
        etiketler: ["sanat", "yalniz"],
        fx: { mutluluk: 13, kariyer: 5 },
        sonuc:
          "Her sabah iki saat, eski bir defter ve yavaşlayan bir el yazısı. Bazı sayfalarda uzun süre duraksadın, bazılarını yırtıp yeniden yazdın. Torunların o defteri yıllar sonra bulup ağlayarak okuyacak.",
        onemli: true,
      },
      {
        t: "Birikimini bağışla",
        etiketler: ["yardim", "durustluk"],
        fx: { mutluluk: 15, arkadaslik: 5 },
        para: -30000,
        sonuc:
          "Bir okulun kütüphanesine bağışladın ve adının yazılmasını istemedin. Yine de yazdılar. Oradan geçen çocuklar o ismi okumadan içeri girecek ama kitaplar duracak.",
        onemli: true,
      },
      {
        t: "Her şeyi olduğu gibi bırak",
        etiketler: ["tembellik", "guvenli"],
        fx: { mutluluk: -4, saglik: 2 },
        sonuc:
          "'Onlar halleder' dedin ve konuyu kapattın. Eşyalar, kâğıtlar, yarım kalmış bir sürü şey olduğu yerde kaldı. Sadelik mi, kayıtsızlık mı, buna sen bile karar veremedin.",
      },
    ],
  },
  {
    id: "z3",
    evreler: ["yasli"],
    alan: "saglik",
    emoji: "🦯",
    baslik: "Yavaşlayan Adımlar",
    metin: "Merdivenler eskisi gibi değil. Bir çocuğun kolunu uzatıyor.",
    secenekler: [
      {
        t: "Kolu tut, kabullen",
        etiketler: ["durustluk", "sosyal"],
        fx: { saglik: 6, mutluluk: 7, arkadaslik: 5 },
        sonuc:
          "Uzanan kola tutundun ve teşekkür ettin. Gurur denen şeyin ne kadar ağır bir bavul olduğunu o an anladın. Yardım kabul etmek de bir olgunluk çeşidiymiş.",
      },
      {
        t: "Kendi başına çık",
        etiketler: ["cesaret", "yalniz"],
        fx: { saglik: -8, mutluluk: 5 },
        sonuc:
          "'Sağ ol evladım' deyip tırabzana tutundun ve yavaş yavaş çıktın. En üstte durup nefeslendin, kimse görmedi. Bağımsızlığın canını acıttı ama sen buna razısın.",
      },
    ],
  },
  {
    id: "z4",
    evreler: ["yasli"],
    alan: "ask",
    emoji: "🪑",
    baslik: "İki Koltuk",
    metin: "Balkonda iki koltuk var. Biri seninki, diğeri yıllardır aynı kişinin.",
    gerek: { iliski: "es" },
    secenekler: [
      {
        t: "Elini tut, hiçbir şey söyleme",
        etiketler: ["romantik", "sadakat"],
        fx: { ask: 14, mutluluk: 12, saglik: 3 },
        sonuc:
          "{es} ile {birlikteYil} yıl sonra konuşmaya gerek kalmıyor artık. Elini tuttun, o da sıktı ve ikiniz de akşamüstü ışığına baktınız. Bir ömür bu sessizliği hak etmek için geçmiş.",
      },
      {
        t: "Eski kavgayı kapat",
        etiketler: ["durustluk", "yardim"],
        fx: { ask: 10, mutluluk: 10, arkadaslik: 3 },
        sonuc:
          "Yıllardır kimsenin adını koymadığı o eski meseleyi sen açtın ve özür diledin. {es} önce şaşırdı, sonra güldü ve 'ben unutmuştum' dedi — ama unutmamıştı. O akşam ikiniz de daha hafif uyudunuz.",
      },
    ],
  },

  /* ================= ZİNCİRLEME OLAYLAR =================
     Bunlar ancak geçmişte belirli bir seçim yapıldıysa açılır. */
  {
    id: "zn1",
    evreler: ["yetiskin", "orta"],
    alan: "ask",
    emoji: "🌹",
    baslik: "Geçmişten Biri",
    metin:
      "Bir kalabalığın içinde {ilkAsk} ile göz göze geldin. Aradan onlarca yıl geçmiş, ikiniz de değişmişsiniz.",
    gerek: { bayrak: ["ilkAskYasandi"] },
    tekSefer: true,
    agirlik: 4,
    secenekler: [
      {
        t: "Bir kahve iç, konuş",
        etiketler: ["romantik", "sosyal"],
        fx: { ask: 9, mutluluk: 10 },
        sonuc:
          "İki saat boyunca o yılları, o koridoru, o kaçamak bakışları konuştunuz. {ilkAsk} 'ben de senden hoşlanıyordum, biliyor muydun?' dediğinde ikiniz de güldünüz. Kapanmamış bir sayfa nihayet huzurla kapandı.",
        onemli: true,
      },
      {
        t: "Bir daha dene",
        etiketler: ["risk", "romantik", "cesaret"],
        fx: { ask: 14, mutluluk: 8, arkadaslik: -5 },
        riskli: 0.5,
        kotu: {
          fx: { ask: -12, mutluluk: -12 },
          sonuc:
            "İki ay sonra ikiniz de aynı şeyi fark ettiniz: aşık olduğunuz kişiler artık yoktu, sadece anıları vardı. Ayrılık bu sefer daha sessiz oldu ama daha çok acıttı.",
        },
        sonuc:
          "Nereden kaldıysanız oradan devam ettiniz ve şaşırtıcı biçimde tuttu. {ilkAsk} ile geçen ikinci bahar, ilkinden çok daha sakin ama çok daha derindi. Bazen zamanlama gerçekten her şeymiş.",
        iliski: { tur: "sevgili" },
        onemli: true,
      },
      {
        t: "Geçmişte bırak",
        etiketler: ["guvenli", "sadakat"],
        fx: { mutluluk: 5, saglik: 3 },
        sonuc:
          "Uzaktan başınla selam verdin ve yürümeye devam ettin. Arkana bakmadın, çünkü bakarsan duracağını biliyordun. Bazı şeyler anı olarak daha güzel.",
      },
    ],
  },
  {
    id: "zn2",
    evreler: ["gencYetiskin"],
    alan: "ask",
    emoji: "📬",
    baslik: "Söylenmemiş Cümle",
    metin: "Yıllar önce cesaret edemediğin o kişiden bir mesaj geldi: 'Bir şey soracaktım.'",
    gerek: { bayrak: ["kacirilanAsk"] },
    tekSefer: true,
    agirlik: 4,
    secenekler: [
      {
        t: "Bu sefer söyle",
        etiketler: ["cesaret", "romantik", "durustluk"],
        fx: { ask: 15, mutluluk: 12 },
        sonuc:
          "Telefonda o eski cümleyi kurdun, hem de tek seferde. Karşı taraf uzun bir sessizlikten sonra 'ben o gün bekledim' dedi. On yıl geç kaldın ama sonunda söyledin ve {sevgili} bu sefer yanında kaldı.",
        iliski: { tur: "sevgili" },
        onemli: true,
      },
      {
        t: "Şakaya vur",
        etiketler: ["kacinma", "hile"],
        fx: { ask: -6, mutluluk: -7 },
        sonuc:
          "Konuyu bir espriyle geçiştirdin, ikiniz de güldünüz ve telefon kapandı. Bir daha aramadı. Aynı hatayı ikinci kez yapmak, ilkinden çok daha ağır bir şeymiş.",
      },
    ],
  },
  {
    id: "zn3",
    evreler: ["gencYetiskin", "yetiskin", "orta"],
    alan: "para",
    emoji: "🚪",
    baslik: "Kapıdaki Adam",
    metin: "Yıllar önce aldığın borcun faizi katlanmış. Bu sabah kapıda iki kişi bekliyor.",
    gerek: { bayrak: ["borc"], yokBayrak: ["borcOdendi"] },
    tekSefer: true,
    agirlik: 5,
    secenekler: [
      {
        t: "Ne pahasına olursa olsun kapat",
        etiketler: ["durustluk", "cesaret"],
        fx: { mutluluk: 10, saglik: -4 },
        para: -60000,
        sonuc:
          "Arabayı sattın, birikimini boşalttın, birkaç kapıyı da çalmak zorunda kaldın. Son taksiti verdiğin gün elin titriyordu ama içinde yıllardır olmayan bir hafiflik vardı. Bir daha o defterlere adını yazdırmayacaksın.",
        bayrak: ["borcOdendi"],
        onemli: true,
      },
      {
        t: "Kaç, şehir değiştir",
        etiketler: ["kacinma", "hile", "risk"],
        fx: { mutluluk: -10, arkadaslik: -12, saglik: -6, kariyer: -6 },
        sonuc:
          "Bir gecede toplandın ve kimseye haber vermeden çıktın. Yeni şehirde kapı her çaldığında kalbin duruyor, telefonunu bilinmeyen numaralara kapatıyorsun. Borçtan kaçtın ama korkuyu yanında götürdün.",
        bayrak: ["kacak"],
        onemli: true,
      },
      {
        t: "Pazarlık et",
        etiketler: ["hile", "ticaret"],
        fx: { mutluluk: -3, kariyer: 3, saglik: -3 },
        para: -25000,
        sonuc:
          "İki saat konuştun, rakamı üçte birine indirdin ve taksite bağladın. Adamlar çıkarken biri omzuna vurup 'sen iyi konuşuyorsun' dedi. Ucuz atlattın ama o sabahı hiç unutmayacaksın.",
        bayrak: ["borcOdendi"],
      },
    ],
  },
  {
    id: "zn4",
    evreler: ["yetiskin", "orta"],
    alan: "kariyer",
    emoji: "♟️",
    baslik: "Aynı Masa",
    metin:
      "Büyük bir iş görüşmesinde masanın karşı tarafında {rakip} oturuyor. Yıllar geçmiş ama bakışı hiç değişmemiş.",
    gerek: { bayrak: ["rakipVar"] },
    tekSefer: true,
    agirlik: 4,
    secenekler: [
      {
        t: "Ortak ol",
        etiketler: ["ticaret", "sosyal", "cesaret"],
        fx: { kariyer: 14, arkadaslik: 9, mutluluk: 8 },
        para: 40000,
        sonuc:
          "'Birbirimizi yenmeye çalışarak yirmi yıl kaybettik' dedin ve elini uzattın. {rakip} bir süre baktı, sonra sıktı. Kurduğunuz şey ikinizin de tek başına yapabileceğinden büyük oldu.",
        onemli: true,
      },
      {
        t: "Ez geç",
        etiketler: ["hile", "bencil"],
        fx: { kariyer: 12, arkadaslik: -10, mutluluk: -4 },
        para: 25000,
        sonuc:
          "Zayıf noktasını biliyordun ve tam oradan vurdun. İhale senin oldu, {rakip} salondan tek kelime etmeden çıktı. Kazanmanın tadı, kutlama biter bitmez kayboldu.",
      },
      {
        t: "Çekil, ona bırak",
        etiketler: ["yardim", "kacinma"],
        fx: { kariyer: -6, mutluluk: 6, arkadaslik: 7 },
        sonuc:
          "Teklifini geri çektin ve nedenini kimseye açıklamadın. Bir hafta sonra {rakip} aradı; sesi tuhaftı, 'neden' diye sordu. 'Artık yorucu geliyor' dedin ve ilk kez gerçekten konuştunuz.",
      },
    ],
  },
  {
    id: "zn5",
    evreler: ["gencYetiskin", "yetiskin"],
    alan: "hayat",
    emoji: "👶",
    baslik: "Bir Kişi Daha",
    metin: "{es} ile mutfakta uzun bir konuşma: çocuk sahibi olmak.",
    gerek: { bayrak: ["evli"], yokBayrak: ["cocukVar"] },
    tekSefer: true,
    agirlik: 4,
    secenekler: [
      {
        t: "Evet, hazırız",
        etiketler: ["romantik", "sadakat", "cesaret"],
        fx: { mutluluk: 14, ask: 8, saglik: -5, kariyer: -5 },
        para: -25000,
        sonuc:
          "Hastane koridorunda geçen o uzun gecenin sonunda kollarına küçücük bir insan verdiler. {cocuk} ilk kez ağladığında bacakların tutmadı ve duvara yaslandın. Hayatının merkezi o saniyede kalıcı olarak değişti.",
        iliski: { tur: "cocuk" },
        bayrak: ["cocukVar"],
        onemli: true,
      },
      {
        t: "Biz ikimize bakalım",
        etiketler: ["guvenli", "durustluk"],
        fx: { ask: 6, mutluluk: 5, kariyer: 6 },
        para: 10000,
        sonuc:
          "İkiniz de aynı şeyi düşünüyormuşsunuz ama söylemekten çekiniyormuşsunuz. Konuştukça rahatladınız; hayatınızı başkasının beklentisine göre kurmayacaktınız. Hafta sonları uzun, evler sessiz, kararınız sizin.",
        bayrak: ["cocuksuzKarar"],
      },
    ],
  },
  {
    id: "zn6",
    evreler: ["orta", "yasli"],
    alan: "hayat",
    emoji: "🎓",
    baslik: "Kanatlanan",
    metin: "{cocuk} büyüdü ve kendi yolunu çizmek istiyor. Senin planladığın yol değil.",
    gerek: { bayrak: ["cocukVar"] },
    tekSefer: true,
    agirlik: 4,
    secenekler: [
      {
        t: "Destekle, arkasında dur",
        etiketler: ["yardim", "sadakat"],
        fx: { mutluluk: 14, arkadaslik: 6, ask: 4 },
        para: -15000,
        sonuc:
          "İçinden geçen bütün itirazları yuttun ve 'git' dedin. Havaalanında sarıldığınızda {cocuk} ağladı, sen arabaya binene kadar dayandın. Bir yıl sonra gönderdiği ilk fotoğrafta gözlerindeki ışığı gördün ve haklı olduğunu anladın.",
        onemli: true,
      },
      {
        t: "Karşı çık",
        etiketler: ["bencil", "guvenli"],
        fx: { mutluluk: -10, arkadaslik: -6, kariyer: 2 },
        sonuc:
          "Sesini yükselttin, 'ben senin iyiliğini istiyorum' dedin. {cocuk} kapıyı çarpıp gitti ve üç ay aramadı. Haklı olduğuna hâlâ inanıyorsun ama o üç ayı hiçbir haklılık geri getirmiyor.",
        bayrak: ["cocuklaKuslar"],
      },
    ],
  },
  {
    id: "zn7",
    evreler: ["gencYetiskin", "yetiskin"],
    alan: "kariyer",
    emoji: "🔔",
    baslik: "Kalabalığın Sesi",
    metin:
      "İçerik ürettiğin hesap büyüdü. Artık her cümlen tartışılıyor, her sessizliğin sorgulanıyor.",
    gerek: { bayrak: ["icerikUretici"] },
    tekSefer: true,
    agirlik: 3,
    secenekler: [
      {
        t: "Büyüt, ekip kur",
        etiketler: ["ticaret", "risk", "calisma"],
        fx: { kariyer: 13, mutluluk: -4, saglik: -7 },
        para: 60000,
        sonuc:
          "Bir ofis tuttun, üç kişi işe aldın ve takvimi altı ay öncesinden doldurdun. Rakamlar hayat değiştirecek boyuta geldi. Ama eskiden zevk için yaptığın şey artık her sabah çalan bir alarm.",
      },
      {
        t: "Küçült, kendine dön",
        etiketler: ["yalniz", "durustluk", "sanat"],
        fx: { mutluluk: 12, saglik: 6, kariyer: -6 },
        para: -5000,
        sonuc:
          "Bir video çekip 'bir süre yokum' dedin ve gerçekten kayboldun. Takipçilerin yarısı gitti, kalanlar bekledi. Geri döndüğünde daha az izlenen ama gerçekten senin olan şeyler yaptın.",
      },
    ],
  },
  {
    id: "zn8",
    evreler: ["genc", "gencYetiskin"],
    alan: "hayat",
    emoji: "🐾",
    baslik: "Vefa",
    metin: "{kopek} artık çok yaşlı. Bu sabah merdivenleri çıkamadı ve sana baktı.",
    gerek: { bayrak: ["kopekVar"], yokBayrak: ["kopekGitti"] },
    tekSefer: true,
    agirlik: 4,
    secenekler: [
      {
        t: "Son güne kadar yanında ol",
        etiketler: ["sadakat", "yardim"],
        fx: { mutluluk: -6, ask: 4, arkadaslik: 5, saglik: -2 },
        para: -6000,
        sonuc:
          "Onu kucağına aldın ve son haftalarını sevdiği battaniyenin üstünde, güneş gören pencerenin önünde geçirdi. Gittiği gün ağladığın kadar yıllardır ağlamamıştın. Bahçeye bir ağaç diktin ve adını verdin.",
        bayrak: ["kopekGitti"],
        onemli: true,
      },
      {
        t: "Bakamayacağını kabul et",
        etiketler: ["kacinma", "durustluk"],
        fx: { mutluluk: -12, arkadaslik: -3 },
        sonuc:
          "Ona daha iyi bakacak birini buldun ve teslim ederken arkana bakmadın. Doğru olanı yaptığını söyleyip durdun kendine. Ama uzun süre kapıyı açtığında ayak sesi aradın.",
        bayrak: ["kopekGitti"],
      },
    ],
  },
  {
    id: "zn9",
    evreler: ["yetiskin", "orta"],
    alan: "para",
    emoji: "📉",
    baslik: "Grafiklerin Esiri",
    metin:
      "O ilk büyük kazançtan sonra hiçbir şey aynı tadı vermedi. Bu gece yine ekranın karşısındasın.",
    gerek: { bayrak: ["kumarTadi"] },
    tekSefer: true,
    agirlik: 4,
    secenekler: [
      {
        t: "Dur, hepsini kapat",
        etiketler: ["durustluk", "cesaret", "guvenli"],
        fx: { mutluluk: 9, saglik: 8, kariyer: 3 },
        para: -8000,
        sonuc:
          "Bütün uygulamaları sildin ve birine anlattın — bu ikincisi daha zordu. İlk ay elin sürekli boş telefona gitti. Altıncı ayda bir akşam fark ettin: fiyatın ne olduğunu bilmiyorsun ve umurunda da değil.",
        onemli: true,
      },
      {
        t: "Bir kere daha büyük oyna",
        etiketler: ["risk", "bencil"],
        fx: { saglik: -8, mutluluk: -6 },
        para: 20000,
        riskli: 0.65,
        kotu: {
          fx: { saglik: -12, mutluluk: -18, arkadaslik: -8, ask: -6 },
          para: -80000,
          sonuc:
            "Bu sefer dip gerçekten dipti. Ev sattın, borç aldın, yalan söyledin. Sabaha karşı ekranın ışığında kendi yüzünü gördün ve tanıyamadın.",
        },
        sonuc:
          "İnanılmaz ama tuttu; hesabına bakarken kendi kendine güldün. Kimseye söylemedin, çünkü kimse bir daha bunu yapmana izin vermezdi. Ve sen bir daha yapacağını biliyorsun.",
      },
    ],
  },
  {
    id: "zn10",
    evreler: ["gencYetiskin", "yetiskin", "orta"],
    alan: "kariyer",
    emoji: "🖼️",
    baslik: "İlk Sergi",
    metin:
      "Çocukken başlayan o çizim merakı bir teklife dönüştü: küçük bir galeride tek kişilik sergi.",
    gerek: { bayrak: ["sanatKivilcimi"] },
    tekSefer: true,
    agirlik: 3,
    secenekler: [
      {
        t: "Kabul et, hepsini as",
        etiketler: ["sanat", "cesaret", "kesif"],
        fx: { kariyer: 11, mutluluk: 14, saglik: -3 },
        para: 9000,
        sonuc:
          "Açılış gecesi ellerin buz gibiydi ve kimse gelmeyecek sandın. Salon doldu; birisi bir işin önünde uzun süre durup ağladı. O an, çocukken öğretmenin resmini havaya kaldırdığı ana bağlandı.",
        onemli: true,
      },
      {
        t: "Hazır değilim de",
        etiketler: ["kacinma", "yalniz"],
        fx: { mutluluk: -8, kariyer: -4 },
        sonuc:
          "'Biraz daha çalışayım' dedin ve tarihi erteledin, sonra galeri başkasını buldu. Klasörlerin dolmaya devam etti ama kimse görmedi. Hazır olmak diye bir şey yokmuş, bunu çok sonra anladın.",
      },
    ],
  },
  {
    id: "zn11",
    evreler: ["yetiskin", "orta"],
    alan: "saglik",
    emoji: "🫁",
    baslik: "Fatura",
    metin: "Gençlikte 'bir kerelik' dediğin şey yıllara yayıldı. Bugün doktor filmi ışığa tuttu.",
    gerek: { bayrak: ["kotuAliskanlik"] },
    tekSefer: true,
    agirlik: 4,
    secenekler: [
      {
        t: "Bugün bırak",
        etiketler: ["cesaret", "tip", "durustluk"],
        fx: { saglik: 14, mutluluk: -4 },
        para: -2000,
        sonuc:
          "Paketi çöpe attığın gün dünyanın en uzun günüydü. İkinci hafta sinirlerin herkesi yordu, birinci ayda merdivenleri fark ettin. Bir yıl sonra o filmi tekrar çektirdiğinde doktorun kaşları kalktı.",
        bayrak: ["birakti"],
        onemli: true,
      },
      {
        t: "Azaltırım de",
        etiketler: ["kacinma", "tembellik"],
        fx: { saglik: -11, mutluluk: 2 },
        sonuc:
          "'Yarıya indireceğim' dedin ve iki hafta gerçekten indirdin. Sonra yoğun bir dönem geldi ve her şey eskisi gibi oldu. Öksürüğün artık sabahları seni uyandırıyor.",
      },
    ],
  },
  {
    id: "zn12",
    evreler: ["yetiskin", "orta"],
    alan: "ask",
    emoji: "💔",
    baslik: "Açığa Çıkan",
    metin: "{es} elinde telefonunla salonda oturuyor. Hiçbir şey söylemiyor, sadece bakıyor.",
    gerek: { bayrak: ["ihanet"], yokBayrak: ["bosandi"] },
    tekSefer: true,
    agirlik: 5,
    secenekler: [
      {
        t: "Her şeyi itiraf et",
        etiketler: ["durustluk", "cesaret"],
        fx: { ask: -8, mutluluk: 4, arkadaslik: -3 },
        sonuc:
          "Yalan söylemeyi denemedin bile; hepsini anlattın, hiçbir şeyi yumuşatmadın. {es} ağladı, bağırdı, sonra çok uzun bir süre sustu. Aylar süren zor bir onarım başladı ve ilk defa gerçekten aynı odadaydınız.",
        bayrak: ["itirafEtti"],
        onemli: true,
      },
      {
        t: "İnkâr et",
        etiketler: ["hile", "kacinma"],
        fx: { ask: -14, mutluluk: -10, arkadaslik: -4 },
        sonuc:
          "'Yanlış anladın' dedin ve inandırıcı bile oldun. {es} konuyu bir daha açmadı ama gözlerindeki o şey geri gelmedi. Aynı evde iki yabancı gibi yaşamayı öğrendiniz.",
      },
      {
        t: "Ayrılığı sen söyle",
        etiketler: ["bencil", "durustluk"],
        fx: { ask: -20, mutluluk: -8, arkadaslik: -6 },
        para: -40000,
        sonuc:
          "'Bitti' kelimesini sen kurdun ve odadaki hava değişti. Avukatlar, kutulanan eşyalar, ikiye bölünen bir fotoğraf albümü. Özgürlüğün ilk haftası bayram, ikinci ayı çok sessizdi.",
        iliskiBitir: "es",
        bayrak: ["bosandi"],
        onemli: true,
      },
    ],
  },
  {
    id: "zn13",
    evreler: ["yetiskin", "orta"],
    alan: "hayat",
    emoji: "🚏",
    baslik: "Eski Sokak",
    metin: "Yıllar önce arkanda bıraktığın şehre bir işin düştü. Otobüs terminali hiç değişmemiş.",
    gerek: { bayrak: ["sehirDegistirdi"] },
    tekSefer: true,
    agirlik: 3,
    secenekler: [
      {
        t: "Eski sokağa git",
        etiketler: ["kesif", "sosyal"],
        fx: { mutluluk: 10, arkadaslik: 8, ask: 3 },
        sonuc:
          "Aynı bakkal, aynı çınar, çok daha küçük görünen bir apartman. Bakkalın oğlu seni ismiyle hatırladı ve çay ısmarladı. Gitmekle kaybettiğin şeyleri o öğleden sonra bir bir saydın, sonra bıraktın.",
      },
      {
        t: "İşini bitir, dön",
        etiketler: ["kacinma", "calisma"],
        fx: { kariyer: 5, mutluluk: -6 },
        para: 5000,
        sonuc:
          "Toplantıyı bitirdin ve akşam otobüsüne bindin. Pencereden geçerken o sokağın tabelasını gördün ve bir saniye baktın. Sonra gözlerini kapatıp uyumaya çalıştın.",
      },
    ],
  },

  /* ================= HER YAŞ / ŞANS ================= */
  {
    id: "h1",
    evreler: ["genc", "gencYetiskin"],
    alan: "para",
    emoji: "🍀",
    baslik: "Beklenmedik Şans",
    metin: "Yolda katlanmış bir zarf buldun. İçinde hatırı sayılır bir para var.",
    secenekler: [
      {
        t: "Sahibini ara",
        etiketler: ["durustluk", "yardim"],
        fx: { mutluluk: 9, arkadaslik: 7 },
        sonuc:
          "Zarfın içindeki bir kartvizitten sahibini buldun ve elden teslim ettin. Adam bir süre konuşamadı, sonra 'bu param değil, torunumun ameliyatıydı' dedi. Eve dönerken adımların yerden kesiliyordu.",
      },
      {
        t: "Cebe at",
        etiketler: ["bencil", "hile"],
        fx: { mutluluk: 3 },
        para: 3500,
        sonuc:
          "Etrafına bakındın, kimse yoktu ve zarf cebine girdi. O ay biraz rahat ettin. Ama o sokaktan her geçişinde gözlerin yerde bir şey arıyor gibi oldu.",
      },
    ],
  },
  {
    id: "h2",
    evreler: ["cocuk", "genc"],
    alan: "hayat",
    emoji: "🤝",
    baslik: "Küçük İyilik",
    metin: "Yağmurda ıslanan yaşlı biri çantasını taşıyamıyor, kimse durmuyor.",
    secenekler: [
      {
        t: "Yardım et",
        etiketler: ["yardim", "sosyal"],
        fx: { mutluluk: 8, arkadaslik: 5, saglik: 2 },
        sonuc:
          "Çantayı aldın ve şemsiyeni onun üstüne tuttun, kendi omzun ıslandı. Kapıya vardığınızda ısrarla içeri çağırdı, sen kibarca reddettin. Bazen mutluluk bu kadar basit ve bu kadar ucuz.",
      },
      {
        t: "Acelen var, geç",
        etiketler: ["bencil", "kacinma"],
        fx: { mutluluk: -4 },
        sonuc:
          "Adımlarını hızlandırdın ve on saniye sonra unuttun. Akşam yatağa girdiğinde o bakış geri geldi. Küçük şeyler bazen en uzun kalanlar oluyor.",
      },
    ],
  },
  {
    id: "h3",
    evreler: ["gencYetiskin", "yetiskin"],
    alan: "saglik",
    emoji: "🌙",
    baslik: "Uykusuz Gece",
    metin: "Saat üç. Tavana bakıyorsun ve zihnin durmuyor.",
    secenekler: [
      {
        t: "Kalk, bir şeyler yaz",
        etiketler: ["sanat", "yalniz"],
        fx: { mutluluk: 7, kariyer: 4, saglik: -4 },
        sonuc:
          "Mutfak masasında bir defter açtın ve sabaha kadar durmadan yazdın. Sabah okuduğunda yarısı saçmaydı, ama bir paragraf gerçekten iyiydi. O paragraf sonradan işine yarayacak.",
      },
      {
        t: "Birini ara",
        etiketler: ["sosyal", "durustluk"],
        fx: { arkadaslik: 9, mutluluk: 8 },
        sonuc:
          "Gece üçte aranabilecek birinin olması, sahip olduğun en pahalı şey. Konuşmadan çok sustunuz ama telefonu kapattığında omuzların inmişti. Uykuya gülümseyerek daldın.",
      },
      {
        t: "Zorla uyumaya çalış",
        etiketler: ["kacinma", "guvenli"],
        fx: { saglik: -5, mutluluk: -3 },
        sonuc:
          "Gözlerini kapattın ve saatlerce döndün durdun. Sabah alarm çaldığında sanki hiç yatmamış gibiydin. O gün her şey biraz daha zor oldu.",
      },
    ],
  },
  {
    id: "h4",
    evreler: ["gencYetiskin", "orta"],
    alan: "arkadaslik",
    emoji: "🚌",
    baslik: "Yabancı",
    metin: "Uzun bir yolculukta yanındaki kişi konuşmak istiyor gibi.",
    secenekler: [
      {
        t: "Sohbete gir",
        etiketler: ["sosyal", "kesif"],
        fx: { arkadaslik: 8, mutluluk: 7 },
        sonuc:
          "Üç saat boyunca hiç tanımadığın birine hayatının en dürüst özetini anlattın. O da anlattı. İniş yerinde vedalaştınız, isim bile almadınız ama o konuşma uzun süre içinde kaldı.",
      },
      {
        t: "Kulaklığı tak",
        etiketler: ["yalniz", "kacinma"],
        fx: { mutluluk: 3, saglik: 2, arkadaslik: -3 },
        sonuc:
          "Kulaklığı takıp camdan dışarı baktın ve manzara boyunca kendi düşüncelerinle kaldın. Dinlenmiş indin. Bazen yalnızlık dinlenmenin başka bir adı.",
      },
    ],
  },

  /* ================= KAOS ================= */
  {
    id: "k1",
    evreler: ["gencYetiskin", "yetiskin"],
    kaosOnly: true,
    alan: "para",
    emoji: "🎰",
    baslik: "Piyango!",
    metin: "Aldığın bilet TUTTU. Büyük ikramiye senin!",
    secenekler: [
      {
        t: "Herkese ısmarla",
        etiketler: ["sosyal", "yardim"],
        fx: { arkadaslik: 20, mutluluk: 17, saglik: -3 },
        para: 200000,
        sonuc:
          "Bütün mahalleyi topladın, hesap kimin umurundaydı. Haftalarca aranmadığın gün olmadı; herkes seni buldu. Para bitince kimlerin kaldığını da öğrendin ve bu bilgi paradan daha değerliydi.",
        onemli: true,
      },
      {
        t: "Sessizce yatır",
        etiketler: ["guvenli", "yalniz", "ticaret"],
        fx: { mutluluk: 9, kariyer: 5 },
        para: 400000,
        sonuc:
          "Kimseye tek kelime etmedin, ne eşine ne dostuna. Hayatın kâğıt üstünde tamamen değişti ama sabah aynı otobüse bindin. Zenginlik en çok, kimsenin bunu bilmemesinde rahattı.",
        onemli: true,
      },
    ],
  },
  {
    id: "k2",
    evreler: ["genc", "gencYetiskin"],
    kaosOnly: true,
    alan: "saglik",
    emoji: "🛸",
    baslik: "Garip Işık",
    metin: "Gece gökyüzünde tuhaf bir ışık gördün. Ve sana doğru geliyor...",
    secenekler: [
      {
        t: "Yaklaş, bak",
        etiketler: ["cesaret", "kesif", "risk"],
        fx: { mutluluk: 15, saglik: -7, kariyer: 9 },
        sonuc:
          "Tarlanın ortasında kaç dakika kaldığını bilmiyorsun; saatin dört saat ileri gitmişti. Kimseye anlatamadın çünkü anlatacak kelime yoktu. O geceden sonra hiçbir şeyi eskisi kadar ciddiye alamadın.",
        onemli: true,
      },
      {
        t: "Kaç, saklan",
        etiketler: ["kacinma", "guvenli"],
        fx: { saglik: 4, mutluluk: -5 },
        sonuc:
          "Eve koştun, perdeleri çektin ve sabaha kadar ışığı açmadın. Sabah gökyüzü her zamanki gibiydi ve sen de kendine 'olmadı' dedin. Ama tarladaki o yanık daire haftalarca durdu.",
      },
    ],
  },
  {
    id: "k3",
    evreler: ["genc", "gencYetiskin", "yetiskin", "orta"],
    kaosOnly: true,
    alan: "hayat",
    emoji: "🌊",
    baslik: "Ters Giden Gün",
    metin: "Bugün her şey aynı anda ters gidiyor. Kader seninle açıkça dalga geçiyor.",
    secenekler: [
      {
        t: "Gül geç, kabullen",
        etiketler: ["tembellik", "kesif"],
        fx: { mutluluk: 11, saglik: 5 },
        sonuc:
          "Üçüncü felaketten sonra sokağın ortasında kahkahayı bastın ve insanlar sana baktı. Umursamadın. Kaosla dans etmeyi öğrenmek de bir yetenekmiş ve sen o gün öğrendin.",
      },
      {
        t: "Sinirlen, savaş",
        etiketler: ["cesaret", "calisma"],
        fx: { mutluluk: -9, saglik: -7, kariyer: 5 },
        sonuc:
          "Kime denk geldiyse bağırdın, üç kapı çaldın, iki dilekçe yazdın. Akşam olduğunda sorunların çoğu çözülmüştü ve senin hiç enerjin kalmamıştı. Kazandın ama savaş alanı sendin.",
      },
    ],
  },
  {
    id: "k4",
    evreler: ["gencYetiskin", "yetiskin"],
    kaosOnly: true,
    alan: "kariyer",
    emoji: "🎪",
    baslik: "Absürt Teklif",
    metin: "Tanımadığın biri sana çok tuhaf ama çok kârlı bir iş teklif ediyor. Detay vermiyor.",
    secenekler: [
      {
        t: "Kabul et, sorma",
        etiketler: ["risk", "kesif", "hile"],
        fx: { kariyer: 8, mutluluk: 8, saglik: -6 },
        para: 55000,
        riskli: 0.5,
        kotu: {
          fx: { kariyer: -12, mutluluk: -10, arkadaslik: -8 },
          para: -20000,
          sonuc:
            "İşin ne olduğunu ancak polis kapıyı çaldığında öğrendin. Suçsuzdun ama ifade vermek, avukat tutmak ve herkese açıklamak aylarını aldı. Bazı sorular sorulmalıymış.",
        },
        sonuc:
          "Ne yaptığını tam olarak anlamadan üç ay çalıştın ve hayatının en yüksek ödemesini aldın. Sonra o kişi kayboldu, numarası kapandı. Hâlâ ne olduğunu bilmiyorsun ve artık öğrenmek de istemiyorsun.",
      },
      {
        t: "Sorular sor",
        etiketler: ["durustluk", "guvenli", "teknik"],
        fx: { kariyer: 4, mutluluk: 3 },
        para: 8000,
        sonuc:
          "Üst üste sorduğun sorulardan sonra teklif küçüldü, sonra makullüğe indi. Küçük ama temiz bir iş çıktı ortaya. Heyecanı azdı, uykusuz gecesi de yoktu.",
      },
    ],
  },
];
