// ============================================================
//  YEREL ANLATI MOTORU v3 — kombinasyonel, AI gerektirmez
//  Sahneler sabit şablonlardan değil; alan (domain) + olay tipi (beat)
//  + cümle yuvalarından üretilir. Her yuvanın 6-12 varyantı olduğu için
//  aynı sahnenin iki kez çıkma ihtimali pratikte sıfıra yakındır.
// ============================================================

import { tune, type Difficulty } from "./difficulty";
import { pickBest } from "./story-quality.server";
import type { QualityAudit } from "./quality-types";

export type Domain =
  | "aşk"
  | "arkadaşlık"
  | "aile"
  | "iş"
  | "para"
  | "sağlık"
  | "hobi"
  | "komşuluk"
  | "geçmiş"
  | "yolculuk"
  | "hayvan"
  | "risk";

export type Beat = "fırsat" | "tehdit" | "itiraf" | "kayıp" | "tesadüf" | "ikilem";

const rnd = (n: number) => Math.floor(Math.random() * n);
export const one = <T,>(a: T[]): T => a[rnd(a.length)];
export const between = (lo: number, hi: number) => lo + rnd(hi - lo + 1);
const maybe = (p: number) => Math.random() < p;

const NAMES_F = ["Elif", "Zeynep", "Selin", "Aslı", "Nur", "Ece", "Melis", "Derya", "Yasemin", "Ceren", "Pınar", "İrem", "Sude", "Berrin", "Hande", "Feride", "Nazlı", "Gülce", "Şeyma", "Bahar", "Esra", "Tuğçe"];
const NAMES_M = ["Emre", "Can", "Mert", "Kaan", "Barış", "Onur", "Serkan", "Tolga", "Umut", "Kerem", "Burak", "Efe", "Cenk", "Levent", "Tarık", "Halil", "Yusuf", "Sinan", "Doruk", "Volkan", "Arda", "Koray"];
const PETS = ["Şila", "Tarçın", "Boncuk", "Duman", "Zeytin", "Karamel", "Paşa", "Fındık", "Mırnav", "Leblebi", "Kömür", "Badem"];

const PLACES = [
  "eski apartmanın gıcırdayan merdiveninde",
  "yağmurun camları dövdüğü bir sokakta",
  "köşedeki kafenin loş arka masasında",
  "kalabalık ve gürültülü otobüs durağında",
  "rüzgârın saçlarını dağıttığı sahil yolunda",
  "tezgâhların yeni kurulduğu pazar yerinde",
  "dezenfektan kokan bir hastane koridorunda",
  "şehir dışına giden gece treninde",
  "mahalle bakkalının önündeki tahta bankta",
  "çınarın gölgesindeki çay bahçesinde",
  "asansörü yine bozuk olan iş hanında",
  "eski defterlerin durduğu tozlu balkonda",
  "ışıkları yarı sönük bir alışveriş merkezinde",
  "camı buğulanmış bir esnaf lokantasında",
  "kimsenin uğramadığı bir park kenarında",
  "bitmemiş bir inşaatın yanındaki boş arsada",
  "kapanmak üzere olan bir kitapçının raflarının arasında",
  "sabah servisini bekleyen boş bir fabrika kantininde",
  "cami avlusunda, güvercinlerin arasında",
  "iki otobüs arası bekleyen bir terminal salonunda",
  "kirası ödenmemiş küçük bir dükkânın kepenginin önünde",
  "sahaftan aldığın kitabın kokusunun sindiği odanda",
  "denize inen dik bir merdivenin son basamağında",
  "yeni taşınılan evin hâlâ kolilerle dolu salonunda",
  "hastane bahçesindeki sigara içilen köşede",
  "nikâh salonunun kalabalık koridorunda",
  "gece nöbetinde ışığı yanan tek pencerenin ardında",
  "mezarlığın kapısındaki çiçekçi tezgâhının önünde",
];

const TIMES = [
  "sabahın köründe",
  "öğle sıcağında",
  "gün batarken",
  "gece yarısına doğru",
  "cumartesi sabahı",
  "bayram arifesinde",
  "yağmurlu bir salı akşamı",
  "elektrikler kesildiği o akşam",
  "ilk kar düşerken",
  "ay sonuna üç gün kala",
  "ramazan gecesi sahura doğru",
  "yılbaşına iki gün kala",
  "sabah ezanı okunurken",
  "kar yağışı trafiği kilitlerken",
  "okulların kapandığı ilk gün",
  "elektrik faturasının geldiği akşam",
  "ilkbaharın ilk sıcak gününde",
  "bir cenaze dönüşü",
];

const MONEY = ["4.750 lira", "11 bin lira", "iki maaşlık bir borç", "yüz dolar bozdurmalık", "kirasının yarısı kadar", "3.500 lira", "8.200 lira", "15 bin lira", "27 bin lira", "birkaç bin lira", "aylık maaşın kadar bir para", "60 bin lira", "iki kiralık bir meblağ"];

const SENSES = [
  "Odada demli çay kokusu var; nedense bu, her şeyi daha gerçek yapıyor.",
  "Dışarıda bir çocuk bağırıyor, bir köpek havlıyor; hayat kendi işine bakıyor.",
  "Ellerinin buz gibi olduğunu ancak şimdi fark ediyorsun.",
  "Telefonun ekranı kararıyor, sonra yeniden yanıyor; sanki o da bekliyor.",
  "Kalorifer tıkırdıyor, saat işliyor, dünya dönmeye devam ediyor.",
  "Boğazında düğümlenen şeyin adını koyamıyorsun.",
  "Bir an, on yıl önceki hâlinin bunu nasıl karşılayacağını düşünüyorsun.",
  "Camdaki yansımanda kendini yaşından biraz daha yorgun görüyorsun.",
  "Uzaktan bir düğün konvoyunun kornaları geliyor; hayat başkalarına devam ediyor.",
  "Parmaklarının arasında çevirdiğin anahtarlık, söylemediklerinin ağırlığını taşıyor.",
  "Ekmek fırınının kokusu sokağı doldururken karnının aç olmadığını fark ediyorsun.",
  "Radyoda çalan şarkı tam da bu ana denk geliyor; hayat bazen fazla ironik.",
  "Ayakkabının tabanındaki delikten içeri su sızıyor; bunu bugün düşünmemen gerek.",
  "Bir kedi ayaklarının dibine sokuluyor; kimsenin sormadığını o soruyor gibi.",
];

const HOOKS = [
  "Ne yapacağını bilmiyorsun; ama bir şey yapman gerektiğini biliyorsun.",
  "Bu kararın faturası bugün değil, aylar sonra gelecek — ikiniz de bunu biliyorsunuz.",
  "İçindeki iki ses aynı anda konuşuyor ve ikisi de haklı.",
  "Bir cümle söyleyeceksin ve o cümle uzun süre burada asılı kalacak.",
  "Zamanın var gibi hissediyorsun; oysa yok.",
  "Kaçmak da bir seçim; kalmak da bedelli.",
  "Geri dönüşü olmayan kapıların önünde insan hep aynı şeyi hisseder: hafif bir baş dönmesi.",
  "Doğru cevabın olmadığı sorulardan biri bu; sadece daha az yanlış olanı var.",
  "Yıllar sonra bu anı anlatırken hangi kelimeyi seçeceğini şimdiden merak ediyorsun.",
  "Kimse sana ne yapman gerektiğini söylemeyecek; bu sefer sadece sen varsın.",
  "Bir tarafın kalkıp gitmek, diğer tarafın sonuna kadar kalmak istiyor.",
  "İçinden bir ses \"bu kadarı da fazla\" diyor; başka bir ses \"tam sırası\" diyor.",
];

// Her alana eklenen evrensel komplikasyon/bahis yuvaları: havuzu büyütür,
// aynı alanın iki kez aynı şekilde kurulmasını zorlaştırır.
const UNIVERSAL_COMPLICATIONS = [
  "Kimseye söylemediğin bir hesap var ve bu mesele o hesaba dokunuyor.",
  "Zamanlaman berbat: tam da her şeyi toparlamaya başlamıştın.",
  "Doğru olanı biliyorsun; sorun, doğru olanın pahalı olması.",
  "Aynı hatayı bir kez daha yapma ihtimali seni en çok korkutan şey.",
  "Karşı taraf senden emin görünüyor; oysa sen kendinden emin değilsin.",
];

const UNIVERSAL_STAKES = [
  "Kazanırsan kimse fark etmeyecek; kaybedersen herkes duyacak.",
  "Bugün vereceğin cevap, önümüzdeki aylara ton ton yük bindirebilir.",
  "Bir yol huzur, öbür yol hikâye; ikisini birden alamıyorsun.",
  "Kendine karşı dürüst olacaksan tam sırası.",
];

// Süreklilik: geçmişte kurulmuş bir "gerçeğe" doğrudan geri dönen cümleler.
const CALLBACKS = [
  "{fact} — bu mesele oraya da dokunuyor.",
  "Aklına yine şu geliyor: {fact}",
  "Geçmişte kalan bir ayrıntı bugün masaya geliyor: {fact}",
];

// --- Alan bazlı yuvalar -------------------------------------------------

type DomainPack = {
  titles: string[];
  openers: string[];
  complications: string[];
  stakes: string[];
  bold: string[];
  careful: string[];
  avoid: string[];
  bias: "happiness" | "wealth" | "career";
  facts?: string[];
  mature?: boolean;
};

const D: Record<Domain, DomainPack> = {
  aşk: {
    titles: ["Yarım kalan cümle", "Kapıdaki tereddüt", "İki kelime meselesi", "Geç kalmış bir itiraf", "Kalbin sessiz alarmı", "Aynı masada iki yabancı"],
    openers: [
      "{time} {place} {name} ile göz göze geliyorsun ve konuşmadan önce sessizlik uzuyor.",
      "{name}'in mesajı {time} düşüyor: \"Bir dakikan var mı? Yazamıyorum, konuşmam lazım.\"",
      "{place} {name} yanına oturuyor; omzunun sıcaklığı sana kaç zamandır unuttuğun bir şeyi hatırlatıyor.",
      "{name} ile aylardır süren şu ‘arkadaşız’ oyunu {time} çatlıyor; ikiniz de artık numara yapamıyorsunuz.",
    ],
    complications: [
      "Söyleyeceklerinin yarısını zaten biliyorsun, diğer yarısından ödün kopuyor.",
      "Aranızda kapanmamış eski bir hesap var ve bu akşam o hesap masaya geliyor.",
      "Onun hayatında senden başka biri daha var; adı söylenmese de odada duruyor.",
      "Hislerin gerçek ama zamanlama berbat: hayatının en dağınık dönemindesin.",
    ],
    stakes: [
      "Bir adım atarsan geri dönüşü yok; atmazsan bu his yıllarca içinde kalır.",
      "Kazanırsan bir insan kazanırsın; kaybedersen sadece onu değil, kendine olan güvenini de.",
      "Bu konuşma ya bir başlangıç olacak ya da yıllardır sürdürdüğün dostluğun sonu.",
    ],
    bold: ["Ne hissettiğini olduğu gibi, kelimeleri süslemeden söyle", "Elini uzat ve sonunu düşünmeyi bırak", "Bu akşam kalmasını iste, gerisini konuşursunuz"],
    careful: ["Önce onu dinle, sonra kendi payına düşeni söyle", "Ağır git; yarın kahve içmeyi teklif et", "Sınırlarını çiz ama kapıyı da açık bırak"],
    avoid: ["Konuyu değiştir ve gülüp geç", "Bahane uydurup erken kalk", "Mesajı okumamış gibi yap"],
    bias: "happiness",
    facts: ["{name} ile aranızda konuşulmamış bir yakınlık var."],
  },
  arkadaşlık: {
    titles: ["Eski bir numara", "Yarım kalan dostluk", "Bir iyilik borcu", "Masadaki sessizlik", "Kimin sırası?"],
    openers: [
      "{time} {name} arıyor; yıllardır aramamıştı ve sesi ilk saniyede her şeyi ele veriyor.",
      "{place} {name} ile burun buruna geliyorsunuz; en son kavga ederek ayrılmıştınız.",
      "Ortak arkadaşınız haber veriyor: {name} zor durumda ve senden başka arayacak kimsesi yok.",
      "{name} bir iyilik istiyor; küçük bir iyilik, ama ‘küçük’ derken gözünü kaçırıyor.",
    ],
    complications: [
      "Bu iyiliğin altından kalkmak senin de canını yakacak, o da bunu biliyor.",
      "Aranızdaki kırgınlığın üstünden yıllar geçti ama tozu hâlâ havada.",
      "Ona her ‘evet’ dediğinde kendine bir ‘hayır’ demiş oluyorsun.",
      "Kalabalık bir dostluk grubunun ortasındasın ve taraf tutman bekleniyor.",
    ],
    stakes: [
      "Yardım edersen kendinden bir parça verirsin; etmezsen bir dostu kaybedersin.",
      "Bu, dostluğun tamir edilebilir olup olmadığını gösteren an.",
      "Bir kez daha kullanılmayı göze alıyor musun, bunu bilmiyorsun.",
    ],
    bold: ["Ne olursa olsun yanında ol, elini taşın altına koy", "Yüzüne karşı her şeyi konuş, kırılan kırılsın", "Ona kalacak yer aç, birkaç gün senin evinde kalsın"],
    careful: ["Yardım et ama sınırını baştan söyle", "Önce ne olup bittiğini öğren, sonra karar ver", "Maddi değil, zaman ve destek olarak yanında ol"],
    avoid: ["Meşgul olduğunu söyleyip geç", "Numarayı sessize al, sonra bakarsın", "Bu sefer kendini koru ve reddet"],
    bias: "happiness",
    facts: ["{name} ile yollarınız yeniden kesişti."],
  },
  aile: {
    titles: ["Pazar sofrası", "Miras değil, mesele", "Telefondaki ses tonu", "Aynı evde iki dünya", "Söylenmeyenler"],
    openers: [
      "Aile masasında, tam çaylar gelirken yıllardır konuşulmayan mesele yeniden açılıyor.",
      "{name} {time} arıyor ve daha ‘alo’ demeden ne diyeceğini anlıyorsun.",
      "Evin en eski eşyası taşınırken altından senin bilmediğin bir belge çıkıyor.",
      "Yıllardır aynı cümleyi kuruyorsun: “Bu sefer sakin konuşacağım.” Bu sefer de olmuyor.",
    ],
    complications: [
      "Herkes senin tarafını tutmanı bekliyor; kimse senin ne istediğini sormuyor.",
      "Sorumluluk yine sana kalıyor çünkü hep sana kalıyor.",
      "Söylersen kırılacaklar; söylemezsen sen kırılacaksın.",
      "Aradaki para meselesi, aslında yıllardır konuşulamayan sevgi meselesinin kılığı.",
    ],
    stakes: [
      "Bu masadan söyleyeceğin cümleyle kalkacaksın ve o cümle uzun süre unutulmayacak.",
      "Bir bağı ya tamir edeceksin ya da temelli kopartacaksın.",
      "Barış mümkün, ama bedeli senin sessizliğin olabilir.",
    ],
    bold: ["Doğru bildiğini açık açık söyle, kim kırılırsa kırılsın", "Sorumluluğu üstlen ve meseleyi bugün bitir", "Yıllardır içinde tuttuğun her şeyi masaya koy"],
    careful: ["İki tarafı da yatıştır, ortak bir yol öner", "Bir kenara çekip yalnız konuşmayı teklif et", "Karar için bir hafta zaman iste"],
    avoid: ["“Ben karışmam” de ve çayını iç", "Erken kalkıp evden çık", "Konuyu şakaya vurup dağıt"],
    bias: "happiness",
  },
  iş: {
    titles: ["Masadaki teklif", "Kapalı kapı toplantısı", "İmza sırası sende", "Yeni gelen", "Bir bilgi, iki yol"],
    openers: [
      "{job} olarak verdiğin emek bugün birinin gözüne takılıyor ve seni odaya çağırıyorlar.",
      "Toplantıda söylediğin bir cümle beklenmedik bir kapı açıyor — ve beklenmedik bir düşman.",
      "{time} işten çıkarken müdürün “yarın erken gel” diyor; tonu her şeyi belirsiz bırakıyor.",
      "Yeni gelen biri, senin yıllardır yapmaya çalıştığın şeyi üç haftada yapıyor.",
    ],
    complications: [
      "Teklif iyi ama şartların yarısı sözlü; kâğıda dökülmemiş her şey risktir.",
      "Kabul edersen özel hayatın diye bir şey kalmayacak.",
      "Bildiğin bir şey var ve söylersen birinin işi bitecek.",
      "Kazanan taraf belli değil; yanlış safta durursan sen de dosyaya girersin.",
    ],
    stakes: [
      "Bu adım kariyerini iki yıl öne alabilir ya da seni sıfırlayabilir.",
      "Bir yıl sonra bugünü ya gururla ya da pişmanlıkla anacaksın.",
      "Para var, itibar var, ama uykun gidiyor.",
    ],
    bold: ["Riski göze al ve teklifi hemen kabul et", "Bildiklerini üst yönetimle paylaş", "Kendi işini kurmak için ilk adımı at"],
    careful: ["Şartları yazılı iste ve pazarlık masasına otur", "Bir hafta düşün, kulisleri yokla", "Küçük bir pilot deneme öner"],
    avoid: ["Teşekkür edip reddet; güvenli liman iyi", "Duymamış gibi yap, kendi işine bak", "Kararı başkasına bırak"],
    bias: "career",
  },
  para: {
    titles: ["Ay sonu aritmetiği", "Kolay para", "Fatura kalınlığı", "Bir imza, bir borç", "Hesabın dibi"],
    openers: [
      "Ay bitmeden para bitiyor; hesap ekranına bakarken içinin sıkıştığını hissediyorsun.",
      "{name} arıyor: “{money} koyarsan üç ayda ikiye katlarsın,” diyor, her zamanki gibi kendinden emin.",
      "Posta kutusunda beklemediğin bir zarf var; içinde {money} tutarında bir talep.",
      "{place} birine kefil olman isteniyor; imza tek, sonuçları uzun.",
    ],
    complications: [
      "Rakamlar tutmuyor ve tutmayan rakamlar hep birinin cebinden çıkıyor.",
      "Reddedersen ilişkiniz bozulacak, kabul edersen belki paranı hiç göremeyeceksin.",
      "Elindeki tek birikim bu ve bu birikimin adı ‘{goal}’.",
      "Karşındaki insan yalan söylemiyor olabilir — ama gerçeği de tam söylemiyor.",
    ],
    stakes: [
      "Doğru hamle seni rahatlatır; yanlışı aylarca ödersin.",
      "Bu para bir çıkış olabilir, ya da yeni bir tuzağın kapısı.",
      "Cebindeki huzurun fiyatı bugün belli olacak.",
    ],
    bold: ["Riski al, parayı koy ve sonuna kadar git", "Borcu tek seferde kapatmak için birikimini boz", "Ek işi kap, uyku sonra"],
    careful: ["Küçük bir miktarla dene, gerisini bekle", "Yazılı sözleşme iste, avukata danış", "Bir bütçe planı yap ve harcamaları kes"],
    avoid: ["Teşekkür et ve uzak dur; kolay para diye bir şey yok", "Konuyu kapat, telefonu aç bile deme", "Şimdilik erteleyip görmezden gel"],
    bias: "wealth",
  },
  sağlık: {
    titles: ["Vücudun konuşuyor", "Bir tahlil sonucu", "Nefes darlığı", "Uyku denen lüks", "Bedenin faturası"],
    openers: [
      "Haftalardır süren yorgunluk {time} sesini yükseltiyor: nefesin daralıyor, gözlerin kararıyor.",
      "Tahlil sonucu geliyor ve doktorun yüzündeki ifade rakamlardan önce konuşuyor.",
      "Üç gecedir uyuyamıyorsun; sabahlar artık başlamıyor, sadece devam ediyor.",
      "{place} bir an duvara tutunmak zorunda kalıyorsun; kimse fark etmiyor, sen fark ediyorsun.",
    ],
    complications: [
      "Randevu almak zaman, tedavi para, dinlenmek ise iş kaybı demek.",
      "Sevdiklerine söylersen telaşlanacaklar; söylemezsen yalnız kalacaksın.",
      "İçindeki ses “bir şeyin yok” diyor; öbürü “artık ciddiye al” diye fısıldıyor.",
    ],
    stakes: [
      "Şimdi durursan belki iki hafta kaybedersin; durmazsan çok daha fazlasını.",
      "Bedenin sana yıllardır söylemeye çalıştığını bugün bağırarak söylüyor.",
    ],
    bold: ["Yarın ilk iş doktora git, sonucu ne olursa olsun öğren", "Her şeyi bırak, iki hafta gerçekten dinlen", "Sevdiklerine açıl ve yardım iste"],
    careful: ["Önce randevu al, kimseyi telaşlandırma", "Uykunu ve yemeğini düzelt, bir hafta izle", "İşyerinden esnek çalışma iste"],
    avoid: ["Bir bardak su iç, üstünü örtme", "Geçer diye bekle ve çalışmaya devam et", "Kimseye söyleme, kendi başına idare et"],
    bias: "happiness",
  },
  hobi: {
    titles: ["Tozlu kutu", "Sahnedeki boşluk", "Yarım kalan defter", "Bir alet, bir hayal", "İlk gösteri"],
    openers: [
      "Dolabı düzenlerken yıllar önce yarım bıraktığın uğraşın kalıntıları düşüyor önüne.",
      "Mahalle etkinliğinde sunucu anons ediyor: programda boşluk var, gönüllü aranıyor.",
      "{name} senin eski işlerinden birini görmüş ve “bunu neden bıraktın?” diye soruyor.",
      "Küçük bir yarışma ilanı görüyorsun; son başvuru {time} doluyor.",
    ],
    complications: [
      "Yeniden başlamak, geçmişteki hâlinle yüzleşmek demek.",
      "Zamanın yok; olan zamanı da başka şeylere söz verdin.",
      "İyi olup olmadığını bilmiyorsun ve öğrenmekten korkuyorsun.",
    ],
    stakes: [
      "Kaybedeceğin şey birkaç akşam; kazanabileceğin şey kendini yeniden sevmek.",
      "Bu kapıyı bir daha bu kadar aralık bulamayabilirsin.",
    ],
    bold: ["Başvuruyu yap, sahneye çık, sonucu sonra düşün", "Bugünden başla ve herkese duyur", "Malzemeleri al, ciddi bir plan kur"],
    careful: ["Hafta sonu küçük bir deneme yap", "Önce birine göster, sonra karar ver", "Ayda birkaç saat ayırarak yavaş başla"],
    avoid: ["Kutuyu kapat; nostalji güzel ama vakit yok", "“Sonra” de ve ilanı kapat", "Espriyle topu başkasına at"],
    bias: "happiness",
  },
  komşuluk: {
    titles: ["Kapıdaki komşu", "Üst kattaki hayat", "Apartman toplantısı", "Bir tabak börek", "Duvarın öte yanı"],
    openers: [
      "Kapı zili {time} çalıyor; yeni komşun {name} kucağında {pet} adında bir hayvanla kapında.",
      "Üç gecedir üst kattan sesler geliyor; bu sabah {name} mahcup bir gülümsemeyle kapında.",
      "Apartman toplantısında herkes birbirine giriyor ve nedense söz sırası sana geliyor.",
      "Alt kattaki yaşlı komşu iki gündür görünmüyor ve kimse kapıyı çalmaya cesaret edemiyor.",
    ],
    complications: [
      "Yardım edersen bu bir alışkanlığa dönüşebilir.",
      "Kimse karışmak istemiyor; herkes birinin karışmasını bekliyor.",
      "Duyduğun ses normal bir gürültü değildi ve sen bunu biliyorsun.",
    ],
    stakes: [
      "Bir insanın hayatına dokunabilirsin ya da kendi huzurunu bozabilirsin.",
      "Bu mahallede yıllarca yaşayacaksın; bugün ne yaparsan o kalacak.",
    ],
    bold: ["Kapıyı çal, gerekirse zorla gir, emin ol", "Sorumluluğu al ve meseleyi çöz", "İçeri davet et, derdini sonuna kadar dinle"],
    careful: ["Yönetime ve gerekiyorsa yetkililere haber ver", "Yardım et ama sınırını nazikçe çiz", "Önce diğer komşularla konuş"],
    avoid: ["Kibarca reddet; kendi düzenin pamuk ipliğinde", "Kapıyı kapat, sesi duymamış ol", "Şikâyet et ve karışma"],
    bias: "happiness",
    facts: ["Komşun {name} ile aranızda yeni bir bağ kuruldu."],
  },
  geçmiş: {
    titles: ["Tozlu bir kutu", "Eski bir sır", "Yıllar sonra gelen mektup", "Fotoğraftaki yüz", "Kapanmamış dosya"],
    openers: [
      "Yıllar önce yazılmış bir mektup {time} eline geçiyor ve zarfın üstündeki yazıyı tanıyorsun.",
      "Eski bir fotoğrafta, o güne kadar hiç fark etmediğin bir ayrıntı görüyorsun.",
      "{name} çıkageliyor ve “o gün olanları konuşmamız lazım” diyor.",
      "Bir isim duyuyorsun ve on yıl bir anda üstüne yıkılıyor.",
    ],
    complications: [
      "Öğrendiğin şey, bugüne kadar anlattığın hikâyeyi yalanlıyor.",
      "Kapağı açarsan sadece kendini değil, sevdiklerini de sarsacaksın.",
      "Gerçeği isteyen sensin ama taşımak zorunda kalacak olan da sensin.",
    ],
    stakes: [
      "Bilmek özgürleştirir derler; bazen sadece ağırlaştırır.",
      "Bu kutuyu açarsan bir daha kapatamazsın.",
    ],
    bold: ["Peşine düş, gerçeği sonuna kadar öğren", "Yüzleşmeyi bugün iste, erteleme", "Bildiklerini herkese anlat"],
    careful: ["Önce tek bir kişiye danış, sonra ilerle", "Belgeleri topla, acele etme", "Sadece kendin için öğren, kimseye söyleme"],
    avoid: ["Kutuyu geri koy; bazı kapılar kapalı kalsın", "Mektubu yak ve unut", "Konuşmayı reddet"],
    bias: "happiness",
    facts: ["Geçmişinden {name} yeniden gündeme geldi."],
  },
  yolculuk: {
    titles: ["Kaçış bileti", "Son otobüs", "İki günlük özgürlük", "Yol ayrımı", "Valizdeki karar"],
    openers: [
      "Telefonuna bir bildirim düşüyor: yarın kalkan otobüsle iki günlük bir kaçamak, yarı fiyatına.",
      "İşten izin çıkıyor ama yalnızca bu hafta; sonrası belirsiz.",
      "{name} “gel” diyor, başka şehirden; bileti bile almış.",
      "Elindeki anahtarı bırakıp gitmek {time} hiç bu kadar mümkün görünmemişti.",
    ],
    complications: [
      "Bütçe zaten kıl payı ve bu ay her kuruş hesaplı.",
      "Gitmek, geride bıraktığın işi birinin sırtına yüklemek demek.",
      "Dönüşte her şeyin aynı olmayacağını içten içe biliyorsun.",
    ],
    stakes: [
      "Bir nefes alacaksın ya da geri döndüğünde daha yorgun olacaksın.",
      "Bazen kaçmak, kalmaktan daha cesur bir iştir.",
    ],
    bold: ["Bileti al, çantanı topla, bu şehirden kaç", "Tek yön al; dönüşü sonra düşünürsün", "Git ve orada bir iş imkânı ara"],
    careful: ["Bütçeni hesapla, uyarsa git", "İzni ayarla, işi devret, öyle çık", "Bir günlüğüne git, tadına bak"],
    avoid: ["Bu sefer kal; deniz kaçmıyor ya", "Bileti iptal et, parayı biriktir", "Erteleyip sonraki aya bak"],
    bias: "happiness",
  },
  hayvan: {
    titles: ["Kapıdaki misafir", "Yağmurda bir ses", "{pet}", "Bir bakış, bir karar", "Sahipsiz"],
    openers: [
      "{place} sırılsıklam, minicik bir hayvan sana bakıyor; kaçmıyor, sadece bakıyor.",
      "{name} bir haftalığına {pet} adındaki hayvanını sana bırakmak istiyor.",
      "Barınaktan arıyorlar: senin ilgilendiğin o hayvan için son gün bugün.",
      "{pet} bu sabah yemek yemedi ve hâli hiç iyi görünmüyor.",
    ],
    complications: [
      "Ne evin buna uygun ne de bütçen; ama gözlerini de görmezden gelemiyorsun.",
      "Veteriner masrafı {money} tutuyor ve bu ay için hiç planın yoktu.",
      "Bir canlıyı üstlenmek, bir sözü ömür boyu tutmak demek.",
    ],
    stakes: [
      "Bir canlının hayatı bugün senin kararına bakıyor.",
      "Bu sorumluluğu alırsan hayatının düzeni değişir; almazsan içinde bir yer sızlar.",
    ],
    bold: ["Al, eve götür, gerisini birlikte çözersiniz", "Veterinere koş, masrafı sonra düşün", "Kalıcı olarak sahiplen"],
    careful: ["Geçici olarak bak, sahibini ara", "Barınakla iletişime geç, düzgün bir yuva bul", "Bir haftalık dene, sonra karar ver"],
    avoid: ["Yoluna devam et; kaldıramazsın", "Birine haber ver ve uzaklaş", "Kibarca reddet"],
    bias: "happiness",
    facts: ["{pet} artık hayatının bir parçası."],
  },
  risk: {
    titles: ["Gri bölge", "Bir seferlik", "Kapalı zarf", "Kimin kaybettiği belli değil", "Kısa yol"],
    openers: [
      "{name} {time} arıyor: “Ufak bir iş var, tek sefer, {money} nakit. Sorma, bilme.”",
      "Elinde olmaması gereken bir bilgi var ve bu bilginin bir alıcısı olduğunu öğreniyorsun.",
      "{place} biri sana bir zarf uzatıyor; içine bakmadan da ne olduğunu tahmin ediyorsun.",
      "Kestirme bir yol öneriliyor: kimse zarar görmeyecek, sadece kurallar biraz esneyecek.",
    ],
    complications: [
      "Para gerçek, iş kirli; bugünlerde ikisine de itiraz edecek hâlin yok.",
      "Bir kez ‘evet’ dersen ikincisini reddetmek çok daha zor olacak.",
      "Yakalanma ihtimali düşük ama sıfır değil ve sıfır olmayan her şey bir gün olur.",
    ],
    stakes: [
      "Kazanırsan nefes alırsın; kaybedersen kaybedeceğin şey sadece para olmaz.",
      "Bu kapıdan geçenlerin çoğu geri dönmedi.",
    ],
    bold: ["Bir seferlik gözünü kapat ve parayı al", "Pazarlık et; payını ikiye katlat", "Kabul et ama kendi kuralınla oyna"],
    careful: ["Ne olduğunu tam öğrenmeden söz verme", "Bir tanık ya da kayıt bırakarak kendini garantiye al", "Zaman iste, çıkış planı hazırla"],
    avoid: ["Reddet ve numarasını engelle", "Zarfı geri ver, bir daha arama de", "Konuyu duymamış say ve uzaklaş"],
    bias: "wealth",
    mature: true,
  },
};

const MATURE_EXTRAS: Partial<Record<Domain, { openers: string[]; complications: string[] }>> = {
  aşk: {
    openers: [
      "Gece {place} yalnız kalınca {name} sesini alçaltıyor: “Aylardır her gün seni düşünerek uyanıyorum.”",
      "{name} ile aranızdaki şey masumiyet sınırını çoktan geçti — ve ikinizin de başkasına sözü var.",
    ],
    complications: [
      "Bardağındaki içki yarım, kalbin dörtnala; bu kapı bir kez açılırsa eskisi gibi kapanmaz.",
      "Yalan büyüyor ve büyüyen her yalan bir gün kendi ağırlığıyla çöker.",
    ],
  },
  para: {
    openers: [
      "Borç {money} oldu ve faiz her hafta büyüyor; bu akşam kapına {name} dayanıyor.",
      "“Şansımı bir döneyim” diye girdiğin yerde üçüncü saatini dolduruyorsun; cebinde son {money} kaldı.",
    ],
    complications: [
      "Tatlı dilli konuşuyor ama gözleri gülmüyor: cuma günü, tamamı.",
      "Masadaki adam gülümsüyor: “Talih dönmek üzere.” Sen neyi hissettiğinden emin değilsin.",
    ],
  },
  risk: {
    openers: [
      "Barın arka odasında konuşuluyor mesele; içeride sigara dumanı, dışarıda bekleyen bir araba var.",
    ],
    complications: [
      "İşin ucunda sadece para yok; birinin canı da var ve bunu sana söylemiyorlar.",
    ],
  },
};

const BEAT_BY_DOMAIN: Record<Domain, Beat[]> = {
  aşk: ["itiraf", "ikilem", "tesadüf"],
  arkadaşlık: ["itiraf", "ikilem", "kayıp"],
  aile: ["ikilem", "itiraf", "kayıp"],
  iş: ["fırsat", "ikilem", "tehdit"],
  para: ["fırsat", "tehdit", "ikilem"],
  sağlık: ["tehdit", "ikilem"],
  hobi: ["fırsat", "tesadüf"],
  komşuluk: ["tesadüf", "ikilem"],
  geçmiş: ["tesadüf", "itiraf", "kayıp"],
  yolculuk: ["fırsat", "ikilem"],
  hayvan: ["tesadüf", "ikilem"],
  risk: ["tehdit", "fırsat"],
};

let lastDomains: Domain[] = [];

const ALL_DOMAINS = Object.keys(D) as Domain[];

// --- Sonuç metinleri: kombinasyonel --------------------------------------

const OUT_OPEN: Record<"success" | "partial" | "failure", string[]> = {
  success: ["Beklediğinden iyi gitti.", "Tuttu.", "Cesaretinin karşılığını aldın.", "Bu kez şans senden yanaydı.", "Hesap tam da düşündüğün gibi çıktı.", "Kapı açıldı."],
  partial: ["Yarım bir zafer bu.", "Ne tam oldu ne tam bozuldu.", "İstediğinin bir kısmını aldın.", "İşler yürüdü ama gıcırdayarak.", "Kâr da var zarar da."],
  failure: ["Olmadı.", "Ters gitti.", "Geri tepti; hem de sertçe.", "Bu eli kaybettin.", "Umduğun kapı yüzüne kapandı."],
};

const OUT_BODY: Record<"success" | "partial" | "failure", string[]> = {
  success: [
    "Karşındaki insanın bakışı değişti ve bu değişimi sen de hissettin.",
    "Günün sonunda telefonuna düşen o mesaj her şeye değdi.",
    "Uzun zamandır ilk kez bir şeyi doğru zamanda yaptığını düşünüyorsun.",
    "Küçük bir pürüz çıktıysa da sonuç yüzünü güldürdü.",
    "Etrafındakiler fark etti, en çok da sen fark ettin.",
  ],
  partial: [
    "Kazandığını cebine, kaybettiğini deneyim hanene yazdın.",
    "Herkes memnun görünüyor; sen ise 'daha iyisi olabilirdi' diye düşünüyorsun.",
    "Bedel ödedin, karşılığında bir şeyler aldın; hesap başa baş kapandı.",
    "Bir kapı aralandı ama ardına kadar değil.",
    "Zaman kazandın; asıl mesele olduğu yerde duruyor.",
  ],
  failure: [
    "Enkazı tek başına toplamak yine sana kaldı.",
    "İnsanlar yanlış anladı, zamanlama şaştı, şans başka kapıya gitti.",
    "Cebindeki kayıp kadar gururundaki çizik de acıyor.",
    "Günler sonra bile o an aklına geldikçe içinden bir 'keşke' geçecek.",
    "Bir ilişki bugün onarılmaz biçimde çatladı.",
  ],
};

const OUT_CLOSE: Record<"success" | "partial" | "failure", string[]> = {
  success: ["Bu gece yastığa başını koyduğunda içinde tatlı bir yorgunluk var.", "Bir dahaki sefere elini daha güçlü uzatacaksın.", "Bir süre kimse bunu senden alamayacak.", "Aynaya bakarken omuzların dik."],
  partial: ["İçinde ufak bir burukluk kalıyor.", "Hayat bir kez daha 'her şeyi alamazsın' dedi; sen de 'göreceğiz' dedin.", "Şimdilik idare eder.", "Devamı yarına kaldı."],
  failure: ["Bu gece uyku kolay gelmeyecek.", "Ama keşkeler kira ödemiyor; toparlanman gerek.", "Pencereyi açıp derin bir nefes alıyorsun.", "En zoru, herkesin biraz haklı olması."],
};

const outSeen: string[] = [];
function freshOutcome(kind: "success" | "partial" | "failure") {
  for (let i = 0; i < 8; i++) {
    const t = `${one(OUT_OPEN[kind])} ${one(OUT_BODY[kind])} ${one(OUT_CLOSE[kind])}`;
    if (!outSeen.includes(t)) {
      outSeen.push(t);
      if (outSeen.length > 40) outSeen.shift();
      return t;
    }
  }
  return `${one(OUT_OPEN[kind])} ${one(OUT_BODY[kind])} ${one(OUT_CLOSE[kind])}`;
}

// --- Kaderin belirlediği (seçimsiz) sahneler -----------------------------

const FORCED: { t: string; n: string[]; go: string; bias: "happiness" | "wealth" | "career"; mature?: boolean }[] = [
  { t: "Gece yarısı telefonu", n: ["Telefon {time} çalıyor; bu saatte gelen telefon hiç iyi haber vermemiştir.", "Arayan {name}; sesi titriyor ve ilk cümlede her şey anlaşılıyor.", "Kapattığında şehir aynı şehir, ama sen aynı sen değilsin."], go: "Sabahı bekle ve ilk otobüse bin", bias: "happiness" },
  { t: "Bir metrelik mesafe", n: ["{time} {place} her şey bir saniyede oluyor: bir korna, bir fren, savrulan bir gölge.", "Kenara çekilmesen o gölge sen olabilirdin.", "Bugün şanslıydın; ama şans, ders çalışmayanın öğretmenidir."], go: "Derin bir nefes al ve toparlan", bias: "happiness" },
  { t: "Beyaz zarf", n: ["Mesai bitimine on dakika kala masana bir zarf bırakılıyor.", "Okumana gerek yok; ofisteki sessizlik her şeyi anlatıyor.", "Kutuya eşyalarını koyarken yıllarını da katlayıp yanına koyuyorsun."], go: "Kutunu al ve yeni bir sayfa aç", bias: "career" },
  { t: "Duvardaki çatlak", n: ["Sabah kombiden gelen sesle uyanıyorsun, akşam ustanın yüzü her şeyi söylüyor.", "\"Bu iş {money} tutar,\" diyor, \"daha azına kimse dokunmaz.\"", "Ev senin evin, ama bu ay bütçen çoktan başkalarına söz vermişti."], go: "Hesap defterini aç ve yeniden başla", bias: "wealth" },
  { t: "Damgasız evrak", n: ["Aylardır beklediğin işlem tek bir eksik imza yüzünden iade ediliyor.", "Gişedeki görevli omuz silkiyor: \"Sistem böyle.\"", "İtiraz süresi üç hafta, senin sabrın üç dakika."], go: "Sıra numarası al ve bekle", bias: "career" },
  { t: "Ateşli günler", n: ["Önce hafif bir üşüme dedin, sonra dünya döndü.", "Üç gündür yataktasın; termometre inatla aynı sayıyı gösteriyor.", "Vücudun sana yıllardır söyleyemediğini nihayet zorla söyletiyor: dur."], go: "İyileşene kadar dinlen", bias: "happiness" },
  { t: "Kapanan kepenk", n: ["Her sabah selamlaştığın esnaf bugün kepengi yarı kapalı karşılıyor: \"Biz kapatıyoruz, evlat.\"", "O tezgâhın başında büyüdün sen; şimdi 'devren kiralık' yazısı asılıyor.", "Şehir değişiyor ve kimse sana sormuyor."], go: "Son kez içeri gir, vedalaş", bias: "happiness" },
  { t: "Ayrılık masası", n: ["\"Konuşmamız lazım\" mesajının ardından geldiğin masada karşındaki gözlerine bakamıyor.", "Cümleler ezberlenmiş, kahveler soğuk.", "Kalbin, garsonun topladığı fincanlar gibi: boş ve az kırık."], go: "Hesabı öde ve yürümeye başla", bias: "happiness", mature: true },
  { t: "Sıra sende değil", n: ["Aylardır çabaladığın şeyi bugün bir başkası aldı ve haberi sosyal medyadan öğrendin.", "Tebrik mesajı yazarken parmakların klavyede duraksıyor.", "Kimseye söylemediğin bir cümle var içinde: \"Ben ne zaman?\""], go: "Tebrik et ve kendi planına dön", bias: "career" },
  { t: "Adres değişikliği", n: ["Ev sahibi arıyor: {time} bir cümleyle her şey değişiyor, \"Evi satıyoruz.\"", "İki ay süren var; iki ayda bir hayatı taşımak gerekiyor.", "Kolileri düşünürken aklına önce kitaplar değil, anılar geliyor."], go: "İlanlara bakmaya başla", bias: "wealth" },
];

// --- Ana üretici ---------------------------------------------------------

export type LocalScene = {
  title: string;
  narrative: string;
  outcomeText: string;
  choices: { label: string; recommended: boolean }[];
  effects: { happiness: number; wealth: number; career: number; stress: number };
  ageDelta: number;
  facts: string[];
  domain: Domain;
};

function castName(usedFacts: string[]): string {
  // Süreklilik: geçmiş gerçeklerde geçen bir isim varsa bazen onu geri getir.
  const known = Array.from(
    new Set(
      usedFacts
        .flatMap((f) => f.match(/\b[A-ZÇĞİÖŞÜ][a-zçğıöşü]{2,}\b/g) ?? [])
        .filter((n) => NAMES_F.includes(n) || NAMES_M.includes(n) || PETS.includes(n)),
    ),
  );
  if (known.length && maybe(0.4)) return one(known);
  return maybe(0.5) ? one(NAMES_F) : one(NAMES_M);
}

function makeEffects(
  outcome: "success" | "partial" | "failure" | "neutral",
  bias: "happiness" | "wealth" | "career",
  difficulty?: Difficulty,
) {
  const t = tune(difficulty);
  const up = (n: number) => Math.round(n * t.gain);
  const down = (n: number) => Math.round(n * t.loss);
  const e = { happiness: 0, wealth: 0, career: 0, stress: 0 };
  if (outcome === "neutral") return e;
  if (outcome === "success") {
    e[bias] += up(between(7, 16));
    e.happiness += up(between(2, 6));
    e.stress -= up(between(3, 8));
  } else if (outcome === "partial") {
    e[bias] += up(between(3, 9));
    e.wealth -= down(between(0, 5));
    e.stress += down(between(2, 6));
  } else {
    e[bias] -= down(between(6, 14));
    e.happiness -= down(between(3, 9));
    e.stress += down(between(6, 13));
  }
  return e;
}

export type SceneArgs = {
  occupation: string;
  goal: string;
  action?: string;
  outcome: "success" | "partial" | "failure" | "neutral";
  forced: boolean;
  mature: boolean;
  usedFacts: string[];
  usedTitles: string[];
  usedDomains?: string[];
  usedNarratives?: string[];
  usedChoices?: string[];
  difficulty?: Difficulty;
  /** Kalite değerlendirmesinde üretilecek aday sayısı (best-of-N). */
  bestOf?: number;
};

/**
 * Kalite seçimli üretici: birkaç aday sahne üretir, kalite puanlayıcısından
 * (story-quality.server) en yüksek puanı alan varyantı döndürür.
 */
export function generateScene(a: SceneArgs): LocalScene & { quality: QualityAudit } {
  const ctx = {
    usedTitles: a.usedTitles,
    usedChoices: a.usedChoices,
    usedNarratives: a.usedNarratives,
    usedDomains: a.usedDomains,
    facts: a.usedFacts,
  };
  const { scene, report, audit } = pickBest(() => buildScene(a), ctx, a.bestOf ?? 5);
  if (report.score < 70)
    console.warn(`[yerel motor] düşük kaliteli sahne (${report.score}): ${report.issues.join(", ")}`);
  return { ...scene, quality: audit };
}


export function buildScene(a: SceneArgs): LocalScene {

  const vars: Record<string, string> = {
    name: castName(a.usedFacts),
    pet: (() => {
      const knownPet = PETS.find((n) => a.usedFacts.some((f) => f.includes(n)));
      return knownPet ?? one(PETS);
    })(),
    place: one(PLACES),
    time: one(TIMES),
    money: one(MONEY),
    job: a.occupation || "işini arayan biri",
    goal: a.goal || "bir hayali",
  };
  const cap = (s: string) => (s ? s[0].toLocaleUpperCase("tr") + s.slice(1) : s);
  const fill = (s: string) => cap(s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? ""));
  const opening = !a.action;
  const effOutcome = a.outcome === "neutral" ? "partial" : a.outcome;
  const outcomeText = opening ? "" : freshOutcome(effOutcome);

  if (a.forced) {
    const pool = a.mature ? FORCED : FORCED.filter((x) => !x.mature);
    const fresh = pool.filter((x) => !a.usedTitles.includes(x.t));
    const s = one(fresh.length ? fresh : pool);
    return {
      title: fill(s.t),
      narrative: `${s.n.map(fill).join(" ")}${maybe(0.5) ? " " + one(SENSES) : ""}`,
      outcomeText,
      choices: [{ label: fill(s.go), recommended: true }],
      effects: makeEffects(a.outcome === "neutral" ? "failure" : a.outcome, s.bias, a.difficulty),
      ageDelta: maybe(0.5) ? 1 : 0,
      facts: [],
      domain: "geçmiş",
    };
  }

  // Alan seçimi: son 4 turda kullanılanlardan kaçın.
  const recentDomains = [...(a.usedDomains ?? []), ...lastDomains].slice(-4);
  const domainPool = ALL_DOMAINS.filter((d) => {
    if (recentDomains.includes(d)) return false;
    if (D[d].mature && !a.mature) return false;
    return true;
  });
  const domain = one(domainPool.length ? domainPool : ALL_DOMAINS.filter((d) => !D[d].mature || a.mature));
  const pack = D[domain];
  const beat = one(BEAT_BY_DOMAIN[domain]);

  const extra = a.mature ? MATURE_EXTRAS[domain] : undefined;
  const openers = extra ? [...pack.openers, ...extra.openers] : pack.openers;
  const complications = [
    ...(extra ? [...pack.complications, ...extra.complications] : pack.complications),
    ...UNIVERSAL_COMPLICATIONS,
  ];
  const stakes = [...pack.stakes, ...UNIVERSAL_STAKES];

  const sentences = [
    fill(one(openers)),
    fill(one(complications)),
    fill(one(stakes)),
  ];
  // Süreklilik kuralı: elde kalıcı gerçek varsa ara sıra ona geri dön.
  const recallable = a.usedFacts.filter((f) => f.length > 8 && f.length < 120);
  if (recallable.length && maybe(0.35)) {
    const fact = one(recallable).replace(/[.!?]$/, "");
    sentences.push(one(CALLBACKS).replace("{fact}", fact));
  }
  if (maybe(0.6)) sentences.splice(2, 0, one(SENSES));
  if (maybe(0.5)) sentences.push(one(HOOKS));

  // Başlık: aynı oynayışta tekrar etmesin.
  const titlePool = pack.titles.filter((t) => !a.usedTitles.includes(fill(t)));
  const title = fill(one(titlePool.length ? titlePool : pack.titles));

  // Seçenekler: cesur / temkinli / kaçın — sırası her turda karışsın.
  const raw = [
    { label: fill(one(pack.bold)), type: "bold" as const },
    { label: fill(one(pack.careful)), type: "careful" as const },
    { label: fill(one(pack.avoid)), type: "avoid" as const },
  ].sort(() => Math.random() - 0.5);

  // Tavsiye: olay tipine göre değişir — tehditte temkinli, fırsatta cesur.
  const bestType =
    beat === "tehdit" || beat === "kayıp"
      ? "careful"
      : beat === "fırsat"
        ? "bold"
        : one(["bold", "careful"] as const);
  const choices = raw.map((c) => ({ label: c.label, recommended: c.type === bestType }));
  if (!choices.some((c) => c.recommended)) choices[0].recommended = true;

  const facts: string[] = [];
  if (pack.facts && maybe(0.55)) {
    const f = fill(one(pack.facts));
    if (!a.usedFacts.includes(f)) facts.push(f);
  }

  lastDomains = [...lastDomains, domain].slice(-4);

  return {
    title,
    narrative: sentences.join(" "),
    outcomeText,
    choices,
    effects: opening ? makeEffects("neutral", pack.bias) : makeEffects(a.outcome, pack.bias, a.difficulty),
    ageDelta: opening ? 0 : maybe(0.7) ? 0 : 1,
    facts,
    domain,
  };
}
