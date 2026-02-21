import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Moon, Sun, BookOpen, Calculator, Calendar as CalendarIcon, 
  Settings, MapPin, Volume2, VolumeX, ChevronRight, Home, 
  Menu, X, Clock, Hand, Heart, Bell, Music, Trash2, Plus,
  Search, ArrowUpDown, Bookmark, ArrowLeft, CheckCircle, Navigation,
  WifiOff, Send
} from 'lucide-react';

// --- TYPES & INTERFACES ---

interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

interface ZikirItem {
  id: number;
  name: string;
  count: number;
  date: string;
}

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
}

interface LastRead {
  surahId: number;
  surahName: string;
  ayahNumber: number;
  timestamp: number;
}

interface DailyContent {
  text: string;
  source: string;
}

interface UserSettings {
  notificationsEnabled: boolean;
  city: string;
  district: string;
  soundEnabled: boolean;
  selectedPrayerSound: string;
  vibrationEnabled: boolean;
  
  hadithNotificationEnabled: boolean;
  hadithSoundEnabled: boolean;
  selectedHadithSound: string;

  verseNotificationEnabled: boolean;
  verseSoundEnabled: boolean;
  selectedVerseSound: string;
}

// --- CONSTANTS & MOCK DATA ---

const ADMOB_CONFIG = {
  appId: "ca-app-pub-6308314903351712~7551586606", 
  bannerUnitId: "ca-app-pub-6308314903351712/XXXXXXXXXX" 
};

const CITIES_DATA: { [key: string]: string[] } = {
  "Adana": ["Merkez", "Aladağ", "Ceyhan", "Çukurova", "Feke", "İmamoğlu", "Karaisalı", "Karataş", "Kozan", "Pozantı", "Saimbeyli", "Sarıçam", "Seyhan", "Tufanbeyli", "Yumurtalık", "Yüreğir"],
  "Adıyaman": ["Merkez", "Besni", "Çelikhan", "Gerger", "Gölbaşı", "Kahta", "Samsat", "Sincik", "Tut"],
  "Afyonkarahisar": ["Merkez", "Başmakçı", "Bayat", "Bolvadin", "Çay", "Çobanlar", "Dazkırı", "Dinar", "Emirdağ", "Evciler", "Hocalar", "İhsaniye", "İscehisar", "Kızılören", "Sandıklı", "Sinanpaşa", "Sultandağı", "Şuhut"],
  "Ağrı": ["Merkez", "Diyadin", "Doğubayazıt", "Eleşkirt", "Hamur", "Patnos", "Taşlıçay", "Tutak"],
  "Aksaray": ["Merkez", "Ağaçören", "Eskil", "Gülağaç", "Güzelyurt", "Ortaköy", "Sarıyahşi", "Sultanhanı"],
  "Amasya": ["Merkez", "Göynücek", "Gümüşhacıköy", "Hamamözü", "Merzifon", "Suluova", "Taşova"],
  "Ankara": ["Merkez", "Akyurt", "Altındağ", "Ayaş", "Bala", "Beypazarı", "Çamlıdere", "Çankaya", "Çubuk", "Elmadağ", "Etimesgut", "Evren", "Gölbaşı", "Güdül", "Haymana", "Kahramankazan", "Kalecik", "Keçiören", "Kızılcahamam", "Mamak", "Nallıhan", "Polatlı", "Pursaklar", "Sincan", "Şereflikoçhisar", "Yenimahalle"],
  "Antalya": ["Merkez", "Akseki", "Aksu", "Alanya", "Demre", "Döşemealtı", "Elmalı", "Finike", "Gazipaşa", "Gündoğmuş", "İbradı", "Kaş", "Kemer", "Kepez", "Konyaaltı", "Korkuteli", "Kumluca", "Manavgat", "Muratpaşa", "Serik"],
  "Ardahan": ["Merkez", "Çıldır", "Damal", "Göle", "Hanak", "Posof"],
  "Artvin": ["Merkez", "Ardanuç", "Arhavi", "Borçka", "Hopa", "Kemalpaşa", "Murgul", "Şavşat", "Yusufeli"],
  "Aydın": ["Merkez", "Bozdoğan", "Buharkent", "Çine", "Didim", "Efeler", "Germencik", "İncirliova", "Karacasu", "Karpuzlu", "Koçarlı", "Köşk", "Kuşadası", "Kuyucak", "Nazilli", "Söke", "Sultanhisar", "Yenipazar"],
  "Balıkesir": ["Merkez", "Altıeylül", "Ayvalık", "Balya", "Bandırma", "Bigadiç", "Burhaniye", "Dursunbey", "Edremit", "Erdek", "Gömeç", "Gönen", "Havran", "İvrindi", "Karesi", "Kepsut", "Manyas", "Marmara", "Savaştepe", "Sındırgı", "Susurluk"],
  "Bartın": ["Merkez", "Amasra", "Kurucaşile", "Ulus"],
  "Batman": ["Merkez", "Beşiri", "Gercüş", "Hasankeyf", "Kozluk", "Sason"],
  "Bayburt": ["Merkez", "Aydıntepe", "Demirözü"],
  "Bilecik": ["Merkez", "Bozüyük", "Gölpazarı", "İnhisar", "Osmaneli", "Pazaryeri", "Söğüt", "Yenipazar"],
  "Bingöl": ["Merkez", "Adaklı", "Genç", "Karlıova", "Kiğı", "Solhan", "Yayladere", "Yedisu"],
  "Bitlis": ["Merkez", "Adilcevaz", "Ahlat", "Güroymak", "Hizan", "Mutki", "Tatvan"],
  "Bolu": ["Merkez", "Dörtdivan", "Gerede", "Göynük", "Kıbrıscık", "Mengen", "Mudurnu", "Seben", "Yeniçağa"],
  "Burdur": ["Merkez", "Ağlasun", "Altınyayla", "Bucak", "Çavdır", "Çeltikçi", "Gölhisar", "Karamanlı", "Kemer", "Tefenni", "Yeşilova"],
  "Bursa": ["Merkez", "Büyükorhan", "Gemlik", "Gürsu", "Harmancık", "İnegöl", "İznik", "Karacabey", "Keles", "Kestel", "Mudanya", "Mustafakemalpaşa", "Nilüfer", "Orhaneli", "Orhangazi", "Osmangazi", "Yenişehir", "Yıldırım"],
  "Çanakkale": ["Merkez", "Ayvacık", "Bayramiç", "Biga", "Bozcaada", "Çan", "Eceabat", "Ezine", "Gelibolu", "Gökçeada", "Lapseki", "Yenice"],
  "Çankırı": ["Merkez", "Atkaracalar", "Bayramören", "Çerkeş", "Eldivan", "Ilgaz", "Kızılırmak", "Korgun", "Kurşunlu", "Orta", "Şabanözü", "Yapraklı"],
  "Çorum": ["Merkez", "Alaca", "Bayat", "Boğazkale", "Dodurga", "İskilip", "Kargı", "Laçin", "Mecitözü", "Oğuzlar", "Ortaköy", "Osmancık", "Sungurlu", "Uğurludağ"],
  "Denizli": ["Merkez", "Acıpayam", "Babadağ", "Baklan", "Bekilli", "Beyağaç", "Bozkurt", "Buldan", "Çal", "Çameli", "Çardak", "Çivril", "Güney", "Honaz", "Kale", "Merkezefendi", "Pamukkale", "Sarayköy", "Serinhisar", "Tavas"],
  "Diyarbakır": ["Merkez", "Bağlar", "Bismil", "Çermik", "Çınar", "Çüngüş", "Dicle", "Eğil", "Ergani", "Hani", "Hazro", "Kayapınar", "Kocaköy", "Kulp", "Lice", "Silvan", "Sur", "Yenişehir"],
  "Düzce": ["Merkez", "Akçakoca", "Cumayeri", "Çilimli", "Gölyaka", "Gümüşova", "Kaynaşlı", "Yığılca"],
  "Edirne": ["Merkez", "Enez", "Havsa", "İpsala", "Keşan", "Lalapaşa", "Meriç", "Süloğlu", "Uzunköprü"],
  "Elazığ": ["Merkez", "Ağın", "Alacakaya", "Arıcak", "Baskil", "Karakoçan", "Keban", "Kovancılar", "Maden", "Palu", "Sivrice"],
  "Erzincan": ["Merkez", "Çayırlı", "İliç", "Kemah", "Kemaliye", "Otlukbeli", "Refahiye", "Tercan", "Üzümlü"],
  "Erzurum": ["Merkez", "Aşkale", "Aziziye", "Çat", "Hınıs", "Horasan", "İspir", "Karaçoban", "Karayazı", "Köprüköy", "Narman", "Oltu", "Olur", "Palandöken", "Pasinler", "Pazaryolu", "Şenkaya", "Tekman", "Tortum", "Uzundere", "Yakutiye"],
  "Eskişehir": ["Merkez", "Alpu", "Beylikova", "Çifteler", "Günyüzü", "Han", "İnönü", "Mahmudiye", "Mihalgazi", "Mihalıççık", "Odunpazarı", "Sarıcakaya", "Seyitgazi", "Sivrihisar", "Tepebaşı"],
  "Gaziantep": ["Merkez", "Araban", "İslahiye", "Karkamış", "Nizip", "Nurdağı", "Oğuzeli", "Şahinbey", "Şehitkamil", "Yavuzeli"],
  "Giresun": ["Merkez", "Alucra", "Bulancak", "Çamoluk", "Çanakçı", "Dereli", "Doğankent", "Espiye", "Eynesil", "Görele", "Güce", "Keşap", "Piraziz", "Şebinkaharhisar", "Tirebolu", "Yağlıdere"],
  "Gümüşhane": ["Merkez", "Kelkit", "Köse", "Kürtün", "Şiran", "Torul"],
  "Hakkâri": ["Merkez", "Çukurca", "Derecik", "Şemdinli", "Yüksekova"],
  "Hatay": ["Merkez", "Altınözü", "Antakya", "Arsuz", "Belen", "Defne", "Dörtyol", "Erzin", "Hassa", "İskenderun", "Kırıkhan", "Kumlu", "Payas", "Reyhanlı", "Samandağ", "Yayladağı"],
  "Iğdır": ["Merkez", "Aralık", "Karakoyunlu", "Tuzluca"],
  "Isparta": ["Merkez", "Aksu", "Atabey", "Eğirdir", "Gelendost", "Gönen", "Keçiborlu", "Senirkent", "Sütçüler", "Şarkikaraağaç", "Uluborlu", "Yalvaç", "Yenişarbademli"],
  "İstanbul": ["Merkez", "Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler", "Bakırköy", "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü", "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Esenyurt", "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy", "Kağıthane", "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe", "Sarıyer", "Silivri", "Sultanbeyli", "Sultangazi", "Şile", "Şişli", "Tuzla", "Ümraniye", "Üsküdar", "Zeytinburnu"],
  "İzmir": ["Merkez", "Aliağa", "Balçova", "Bayındır", "Bayraklı", "Bergama", "Beydağ", "Bornova", "Buca", "Çeşme", "Çiğli", "Dikili", "Foça", "Gaziemir", "Güzelbahçe", "Karabağlar", "Karaburun", "Karşıyaka", "Kemalpaşa", "Kınık", "Kiraz", "Konak", "Menderes", "Menemen", "Narlıdere", "Ödemiş", "Seferihisar", "Selçuk", "Tire", "Torbalı", "Urla"],
  "Kahramanmaraş": ["Merkez", "Afşin", "Andırın", "Çağlayancerit", "Dulkadiroğlu", "Ekinözü", "Elbistan", "Göksun", "Nurhak", "Onikişubat", "Pazarcık", "Türkoğlu"],
  "Karabük": ["Merkez", "Eflani", "Eskipazar", "Ovacık", "Safranbolu", "Yenice"],
  "Karaman": ["Merkez", "Ayrancı", "Başyayla", "Ermenek", "Kazımkarabekir", "Sarıveliler"],
  "Kars": ["Merkez", "Akyaka", "Arpaçay", "Digor", "Kağızman", "Sarıkamış", "Selim", "Susuz"],
  "Kastamonu": ["Merkez", "Abana", "Ağlı", "Araç", "Azdavay", "Bozkurt", "Cide", "Çatalzeytin", "Daday", "Devrekani", "Doğanyurt", "Hanönü", "İhsangazi", "İnebolu", "Küre", "Pınarbaşı", "Seydiler", "Şenpazar", "Taşköprü", "Tosya"],
  "Kayseri": ["Merkez", "Akkışla", "Bünyan", "Develi", "Felahiye", "Hacılar", "İncesu", "Kocasinan", "Melikgazi", "Özvatan", "Pınarbaşı", "Sarıoğlan", "Sarız", "Talas", "Tomarza", "Yahyalı", "Yeşilhisar"],
  "Kilis": ["Merkez", "Elbeyli", "Musabeyli", "Polateli"],
  "Kırıkkale": ["Merkez", "Bahşılı", "Balışeyh", "Çelebi", "Delice", "Karakeçili", "Keskin", "Sulakyurt", "Yahşihan"],
  "Kırklareli": ["Merkez", "Babaeski", "Demirköy", "Kofçaz", "Lüleburgaz", "Pehlivanköy", "Pınarhisar", "Vize"],
  "Kırşehir": ["Merkez", "Akçakent", "Akpınar", "Boztepe", "Çiçekdağı", "Kaman", "Mucur"],
  "Kocaeli": ["Merkez", "Başiskele", "Çayırova", "Darıca", "Derince", "Dilovası", "Gebze", "Gölcük", "İzmit", "Kandıra", "Karamürsel", "Kartepe", "Körfez"],
  "Konya": ["Merkez", "Ahırlı", "Akören", "Akşehir", "Altınekin", "Beyşehir", "Bozkır", "Cihanbeyli", "Çeltik", "Çumra", "Derbent", "Derebucak", "Doğanhisar", "Emirgazi", "Ereğli", "Güneysınır", "Hadim", "Halkapınar", "Hüyük", "Ilgın", "Kadınhanı", "Karapınar", "Karatay", "Kulu", "Meram", "Sarayönü", "Selçuklu", "Seydişehir", "Taşkent", "Tuzlukçu", "Yalıhüyük", "Yunak"],
  "Kütahya": ["Merkez", "Altıntaş", "Aslanapa", "Çavdarhisar", "Domaniç", "Dumlupınar", "Emet", "Gediz", "Hisarcık", "Pazarlar", "Simav", "Şaphane", "Tavşanlı"],
  "Malatya": ["Merkez", "Akçadağ", "Arapgir", "Arguvan", "Battalgazi", "Darende", "Doğanşehir", "Doğanyol", "Hekimhan", "Kale", "Kuluncak", "Pütürge", "Yazıhan", "Yeşilyurt"],
  "Manisa": ["Merkez", "Ahmetli", "Akhisar", "Alaşehir", "Demirci", "Gölmarmara", "Gördes", "Kırkağaç", "Köprübaşı", "Kula", "Salihli", "Sarıgöl", "Saruhanlı", "Selendi", "Soma", "Şehzadeler", "Turgutlu", "Yunusemre"],
  "Mardin": ["Merkez", "Artuklu", "Dargeçit", "Derik", "Kızıltepe", "Mazıdağı", "Midyat", "Nusaybin", "Ömerli", "Savur", "Yeşilli"],
  "Mersin": ["Merkez", "Akdeniz", "Anamur", "Aydıncık", "Bozyazı", "Çamlıyayla", "Erdemli", "Gülnar", "Mezitli", "Mut", "Silifke", "Tarsus", "Toroslar", "Yenişehir"],
  "Muğla": ["Merkez", "Bodrum", "Dalaman", "Datça", "Fethiye", "Kavaklıdere", "Köyceğiz", "Marmaris", "Menteşe", "Milas", "Ortaca", "Seydikemer", "Ula", "Yatağan"],
  "Muş": ["Merkez", "Bulanık", "Hasköy", "Korkut", "Malazgirt", "Varto"],
  "Nevşehir": ["Merkez", "Acıgöl", "Avanos", "Derinkuyu", "Gülşehir", "Hacıbektaş", "Kozaklı", "Ürgüp"],
  "Niğde": ["Merkez", "Altunhisar", "Bor", "Çamardı", "Çiftlik", "Ulukışla"],
  "Ordu": ["Merkez", "Akkuş", "Altınordu", "Aybastı", "Çamaş", "Çatalpınar", "Çaybaşı", "Fatsa", "Gölköy", "Gülyalı", "Gürgentepe", "İkizce", "Kabadüz", "Kabataş", "Korgan", "Kumru", "Mesudiye", "Perşembe", "Ulubey", "Ünye"],
  "Osmaniye": ["Merkez", "Bahçe", "Düziçi", "Hasanbeyli", "Kadirli", "Sumbas", "Toprakkale"],
  "Rize": ["Merkez", "Ardeşen", "Çamlıhemşin", "Çayeli", "Derepazarı", "Fındıklı", "Güneysu", "Hemşin", "İkizdere", "İyidere", "Kalkandere", "Pazar"],
  "Sakarya": ["Merkez", "Adapazarı", "Akyazı", "Arifiye", "Erenler", "Ferizli", "Geyve", "Hendek", "Karapürçek", "Karasu", "Kaynarca", "Kocaali", "Pamukova", "Sapanca", "Serdivan", "Söğütlü", "Taraklı"],
  "Samsun": ["Merkez", "19 Mayıs", "Alaçam", "Asarcık", "Atakum", "Ayvacık", "Bafra", "Canik", "Çarşamba", "Havza", "İlkadım", "Kavak", "Ladik", "Salıpazarı", "Tekkeköy", "Terme", "Vezirköprü", "Yakakent"],
  "Şanlıurfa": ["Merkez", "Akçakale", "Birecik", "Bozova", "Ceylanpınar", "Eyyübiye", "Halfeti", "Haliliye", "Harran", "Hilvan", "Karaköprü", "Siverek", "Suruç", "Viranşehir"],
  "Siirt": ["Merkez", "Baykan", "Eruh", "Kurtalan", "Pervari", "Şirvan", "Tillo"],
  "Sinop": ["Merkez", "Ayancık", "Boyabat", "Dikmen", "Durağan", "Erfelek", "Gerze", "Saraydüzü", "Türkeli"],
  "Sivas": ["Merkez", "Akıncılar", "Altınyayla", "Divriği", "Doğanşar", "Gemerek", "Gölova", "Gürün", "Hafik", "İmranlı", "Kangal", "Koyulhisar", "Suşehri", "Şarkışla", "Ulaş", "Yıldızeli", "Zara"],
  "Şırnak": ["Merkez", "Beytüşşebap", "Cizre", "Güçlükonak", "İdil", "Silopi", "Uludere"],
  "Tekirdağ": ["Merkez", "Çerkezköy", "Çorlu", "Ergene", "Hayrabolu", "Kapaklı", "Malkara", "Marmaraereğlisi", "Muratlı", "Saray", "Süleymanpaşa", "Şarköy"],
  "Tokat": ["Merkez", "Almus", "Artova", "Başçiftlik", "Erbaa", "Niksar", "Pazar", "Reşadiye", "Sulusaray", "Turhal", "Yeşilyurt", "Zile"],
  "Trabzon": ["Merkez", "Akçaabat", "Araklı", "Arsin", "Beşikdüzü", "Çarşıbaşı", "Çaykara", "Dernekpazarı", "Düzköy", "Hayrat", "Köprübaşı", "Maçka", "Of", "Ortahisar", "Sürmene", "Şalpazarı", "Tonya", "Vakfıkebir", "Yomra"],
  "Tunceli": ["Merkez", "Çemişgezek", "Hozat", "Mazgirt", "Nazımiye", "Ovacık", "Pertek", "Pülümür"],
  "Uşak": ["Merkez", "Banaz", "Eşme", "Karahallı", "Sivaslı", "Ulubey"],
  "Van": ["Merkez", "Bahçesaray", "Başkale", "Çaldıran", "Çatak", "Edremit", "Erciş", "Gevaş", "Gürpınar", "İpekyolu", "Muradiye", "Özalp", "Saray", "Tuşba"],
  "Yalova": ["Merkez", "Altınova", "Armutlu", "Çınarcık", "Çiftlikköy", "Termal"],
  "Yozgat": ["Merkez", "Akdağmadeni", "Aydıncık", "Boğazlıyan", "Çandır", "Çayıralan", "Çekerek", "Kadışehri", "Saraykent", "Sarıkaya", "Sorgun", "Şefaatli", "Yenifakılı", "Yerköy"],
  "Zonguldak": ["Merkez", "Alaplı", "Çaycuma", "Devrek", "Ereğli", "Gökçebey", "Kilimli", "Kozlu"]
};

const REVELATION_ORDER = [
  96, 68, 73, 74, 1, 111, 81, 87, 92, 89, 93, 94, 103, 100, 108, 102, 107, 109, 105, 113, 114, 112, 53, 80, 97, 
  91, 85, 95, 106, 101, 75, 104, 77, 50, 90, 86, 54, 38, 7, 72, 36, 25, 35, 19, 20, 56, 26, 27, 28, 17, 10, 11, 
  12, 15, 6, 37, 31, 34, 39, 40, 41, 42, 43, 44, 45, 46, 51, 88, 18, 16, 71, 14, 21, 23, 32, 52, 67, 69, 70, 78, 
  79, 82, 84, 30, 29, 83, 2, 8, 3, 33, 60, 4, 99, 57, 47, 13, 55, 76, 65, 98, 59, 24, 22, 63, 58, 49, 66, 64, 61, 
  62, 48, 5, 9, 110
];

const SOUND_OPTIONS = [
  { id: 'beep', name: 'Standart (Bip)', url: 'https://www.soundjay.com/buttons/beep-01a.mp3' },
  { id: 'water', name: 'Yumuşak (Su)', url: 'https://www.soundjay.com/nature/sounds/water-droplet-1.mp3' },
  { id: 'bell', name: 'Uyarı (Zil)', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3' },
  { id: 'bird', name: 'Doğa (Kuş)', url: 'https://www.soundjay.com/nature/sounds/bird-chirp-01.mp3' }
];

const HADITHS = [
  { text: "Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz.", source: "Buhârî, İlim, 11" },
  { text: "Ameller niyetlere göredir.", source: "Buhârî, Bed'ü'l-Vahy, 1" },
  { text: "Sizin en hayırlınız, Kur'an'ı öğrenen ve öğretendir.", source: "Tirmizî, Fedâilü'l-Kur'ân, 15" },
  { text: "Temizlik imanın yarısıdır.", source: "Müslim, Tahâret, 1" },
  { text: "Müslüman, elinden ve dilinden diğer Müslümanların emin olduğu kimsedir.", source: "Buhârî, İman, 4" },
  { text: "Kişi sevdiği ile beraberdir.", source: "Buhârî, Edeb, 96" },
  { text: "Hiçbir baba, çocuğuna güzel terbiyeden daha kıymetli bir miras bırakmamıştır.", source: "Tirmizî, Birr, 33" },
  { text: "Cennet annelerin ayakları altındadır.", source: "Nesâî, Cihad, 6" },
  { text: "Bizi aldatan bizden değildir.", source: "Müslim, İman, 164" },
  { text: "Veren el, alan elden üstündür.", source: "Buhârî, Zekât, 18" },
  { text: "İki günü eşit olan ziyandadır.", source: "Hadis-i Şerif" },
  { text: "Bir müslümanın, din kardeşine üç günden fazla küs durması helal değildir.", source: "Buhârî, Edeb, 57" },
  { text: "Güzel söz sadakadır.", source: "Buhârî, Edeb, 34" },
  { text: "Komşusu açken tok yatan bizden değildir.", source: "İbn Ebi Şeybe, Musannef, İman, 6" },
  { text: "İlim öğrenmek, kadın-erkek her Müslümana farzdır.", source: "İbn Mâce, Mukaddime, 17" },
  { text: "Merhamet etmeyene merhamet olunmaz.", source: "Buhârî, Edeb, 18" },
  { text: "Danışan dağları aşmış, danışmayan düz yolda şaşmış.", source: "Atasözü (Hadis Temelli)" },
  { text: "Söz taşıyan (koğuculuk yapan) cennete giremez.", source: "Buhârî, Edeb, 50" },
  { text: "En faziletli amel, vaktinde kılınan namazdır.", source: "Buhârî, Mevâkît, 5" },
  { text: "Allah, sizin dış görünüşünüze ve mallarınıza bakmaz; fakat kalplerinize ve amellerinize bakar.", source: "Müslim, Birr, 34" },
  { text: "Mümin, bir delikten iki defa ısırılmaz.", source: "Buhârî, Edeb, 83" },
  { text: "Hasetten sakınınız. Çünkü ateşin odunu yiyip bitirdiği gibi haset de iyilikleri yer bitirir.", source: "Ebû Dâvûd, Edeb, 44" },
  { text: "Bir milletin efendisi, onlara hizmet edendir.", source: "Deylemî" },
  { text: "Utanmıyorsan dilediğini yap!", source: "Buhârî, Enbiyâ, 54" },
  { text: "Allah güzeldir, güzelliği sever.", source: "Müslim, İman, 147" },
  { text: "Sadaka malı eksiltmez.", source: "Müslim, Birr, 69" },
  { text: "Mazlumun bedduasından sakınınız. Çünkü onunla Allah arasında perde yoktur.", source: "Buhârî, Zekât, 63" },
  { text: "Kim susarsa kurtulur.", source: "Tirmizî, Kıyâmet, 50" },
  { text: "İşçiye ücretini teri kurumadan veriniz.", source: "İbn Mâce, Ruhûn, 4" },
  { text: "Dua, müminin silahıdır.", source: "Ebû Ya’lâ, Müsned, 1/344" },
  { text: "Birbirinize hediye veriniz, sevginiz artar.", source: "Buhârî, Edebü’l-Müfred, 594" },
  { text: "Hayra vesile olan, hayrı yapan gibidir.", source: "Tirmizî, İlim, 14" },
  { text: "Müslüman kardeşinle tartışma, onunla alay etme.", source: "Tirmizî, Birr, 58" },
  { text: "Kıyamet gününde müminin mizanında en ağır basacak şey güzel ahlaktır.", source: "Tirmizî, Birr, 62" },
  { text: "Küçüklerimize merhamet etmeyen, büyüklerimize saygı göstermeyen bizden değildir.", source: "Tirmizî, Birr, 15" },
  { text: "Zenginlik mal çokluğu değil, gönül tokluğudur.", source: "Buhârî, Rıkak, 15" },
  { text: "İnsanların en hayırlısı, insanlara faydalı olandır.", source: "Buhârî, Mağâzî, 35" },
  { text: "Sabır, ilk sarsıntı anında olandır.", source: "Buhârî, Cenâiz, 32" },
  { text: "Cennet kılıçların gölgesi altındadır.", source: "Buhârî, Cihâd, 22" },
  { text: "Mümin, yeşil ekine benzer. Rüzgârla eğilir ama yıkılmaz.", source: "Buhârî, Merdâ, 1" },
  { text: "Allah Teâlâ temizdir, temizliği sever.", source: "Tirmizî, Edeb, 41" },
  { text: "Her dinin bir ahlâkı vardır; İslâm’ın ahlâkı da hayâdır.", source: "İbn Mâce, Zühd, 17" },
  { text: "Kim bir hayrı başlatırsa, kendisine hem o hayrın sevabı hem de onu yapanların sevabı verilir.", source: "Müslim, Zekât, 69" },
  { text: "Doğruluktan ayrılmayınız. Doğruluk sizi iyiliğe, iyilik de cennete götürür.", source: "Buhârî, Edeb, 69" },
  { text: "Bizi aldatan bizden değildir.", source: "Müslim, Îmân, 164" },
  { text: "İki nimet vardır ki insanların çoğu onların kıymetini bilmez: Sağlık ve boş vakit.", source: "Buhârî, Rıkak, 1" }
];

const OFFLINE_VERSES = [
  { text: "Şüphesiz biz onu (Kur'an'ı) Kadir gecesinde indirdik.", source: "Kadir Suresi, 1. Ayet" },
  { text: "Rabbin, kendisinden başkasına asla ibadet etmemenizi hükmetti.", source: "İsra Suresi, 23. Ayet" },
  { text: "Allah, sabredenlerle beraberdir.", source: "Bakara Suresi, 153. Ayet" },
  { text: "Şüphesiz zorlukla beraber bir kolaylık vardır.", source: "İnşirah Suresi, 5. Ayet" },
  { text: "Biz her şeyi bir ölçüye göre yarattık.", source: "Kamer Suresi, 49. Ayet" },
  { text: "Müminler ancak kardeştirler.", source: "Hucurat Suresi, 10. Ayet" },
  { text: "Ey iman edenler! Sabır ve namaz ile Allah'tan yardım isteyin.", source: "Bakara Suresi, 153. Ayet" },
  { text: "Allah size emanetleri ehline vermenizi emreder.", source: "Nisa Suresi, 58. Ayet" },
  { text: "Bilsin ki insan için kendi çalışmasından başka bir şey yoktur.", source: "Necm Suresi, 39. Ayet" },
  { text: "O, hanginizin daha güzel amel yapacağını sınamak için ölümü ve hayatı yaratandır.", source: "Mülk Suresi, 2. Ayet" },
  { text: "Kim zerre kadar hayır işlerse onu görür.", source: "Zilzal Suresi, 7. Ayet" },
  { text: "Kim zerre kadar şer işlerse onu görür.", source: "Zilzal Suresi, 8. Ayet" },
  { text: "Rabbininin nimetini durmadan anlat.", source: "Duha Suresi, 11. Ayet" },
  { text: "De ki: O Allah birdir.", source: "İhlas Suresi, 1. Ayet" },
  { text: "Ancak sana kulluk eder ve ancak senden yardım dileriz.", source: "Fatiha Suresi, 5. Ayet" },
  { text: "Gevşemeyin, hüzünlenmeyin. Eğer inanıyorsanız, üstün gelecek olan sizsiniz.", source: "Al-i İmran Suresi, 139. Ayet" },
  { text: "O (Allah), göklerin ve yerin eşsiz yaratıcısıdır.", source: "En'am Suresi, 101. Ayet" },
  { text: "Şüphesiz Allah, adaleti, iyilik yapmayı, yakınlara yardım etmeyi emreder.", source: "Nahl Suresi, 90. Ayet" },
  { text: "Ey iman edenler! Allah'tan korkun ve doğrularla beraber olun.", source: "Tevbe Suresi, 119. Ayet" },
  { text: "Hiç bilenlerle bilmeyenler bir olur mu?", source: "Zümer Suresi, 9. Ayet" },
  { text: "Yiyiniz, içiniz, fakat israf etmeyiniz.", source: "A'raf Suresi, 31. Ayet" },
  { text: "Şüphesiz namaz, hayâsızlıktan ve kötülükten alıkoyar.", source: "Ankebut Suresi, 45. Ayet" },
  { text: "Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver.", source: "Bakara Suresi, 201. Ayet" },
  { text: "Allah kimseye gücünün yettiğinden fazlasını yüklemez.", source: "Bakara Suresi, 286. Ayet" },
  { text: "Sizin ilahınız tek bir ilahtır.", source: "Bakara Suresi, 163. Ayet" },
  { text: "Eğer şükrederseniz elbette size nimetimi artırırım.", source: "İbrahim Suresi, 7. Ayet" },
  { text: "Oku! Yaratan Rabbinin adıyla.", source: "Alak Suresi, 1. Ayet" },
  { text: "O gün, ne mal fayda verir ne de evlat.", source: "Şuara Suresi, 88. Ayet" },
  { text: "Allah, tövbe edenleri sever, temizlenenleri sever.", source: "Bakara Suresi, 222. Ayet" },
  { text: "Beni anın, ben de sizi anayım.", source: "Bakara Suresi, 152. Ayet" }
];

const RELIGIOUS_DAYS = [
  { date: "16 Ocak 2026", name: "Miraç Kandili" },
  { date: "3 Şubat 2026", name: "Berat Kandili" },
  { date: "18 Şubat 2026", name: "Ramazan Başlangıcı" },
  { date: "15 Mart 2026", name: "Kadir Gecesi" },
  { date: "19 Mart 2026", name: "Ramazan Bayramı" },
  { date: "27 Mayıs 2026", name: "Kurban Bayramı" },
  { date: "16 Haziran 2026", name: "Hicri Yılbaşı" },
  { date: "25 Haziran 2026", name: "Aşure Günü" },
  { date: "24 Ağustos 2026", name: "Mevlid Kandili" }
];

// --- HELPER FUNCTIONS ---

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
};

const getNextPrayer = (times: PrayerTimes | null) => {
  if (!times) return { name: '', time: '', remaining: '' };

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const prayerMap = [
    { name: 'İmsak', time: times.Fajr },
    { name: 'Güneş', time: times.Sunrise },
    { name: 'Öğle', time: times.Dhuhr },
    { name: 'İkindi', time: times.Asr },
    { name: 'Akşam', time: times.Maghrib },
    { name: 'Yatsı', time: times.Isha },
  ];

  let nextPrayer = prayerMap[0];
  let found = false;

  for (let p of prayerMap) {
    const [h, m] = p.time.split(':').map(Number);
    const pMinutes = h * 60 + m;
    if (pMinutes > currentMinutes) {
      nextPrayer = p;
      found = true;
      break;
    }
  }

  const [nh, nm] = nextPrayer.time.split(':').map(Number);
  let nextTimeMinutes = nh * 60 + nm;
  if (!found) nextTimeMinutes += 24 * 60; 
  
  const diff = nextTimeMinutes - currentMinutes;
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  return {
    name: nextPrayer.name,
    time: nextPrayer.time,
    remaining: `${hours} sa ${minutes} dk`
  };
};

const isRamadan = () => {
  const today = new Date();
  const m = today.getMonth(); 
  const d = today.getDate();
  if (m === 1 && d >= 18) return true; 
  if (m === 2 && d <= 19) return true; 
  return false;
};

const playSound = (soundId: string) => {
  const sound = SOUND_OPTIONS.find(s => s.id === soundId);
  if (sound) {
    const audio = new Audio(sound.url);
    audio.play().catch(e => console.log('Audio autoplay blocked:', e));
  }
};

// --- COMPONENTS ---

const AdBanner = () => (
  <div className="w-full bg-gray-50 border-t border-gray-200 flex flex-col items-center justify-center pt-1 pb-1 shadow-inner">
    <div className="text-[9px] text-gray-400 mb-1 tracking-wider uppercase">Reklam</div>
    <div className="w-[320px] h-[50px] bg-white border border-gray-300 rounded-sm flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0f766e_1px,transparent_1px)] [background-size:8px_8px]"></div>
        <div className="flex flex-col items-center z-10">
          <span className="font-bold text-gray-500 text-xs flex items-center">
             <span className="w-3 h-3 bg-[#4285F4] rounded-full mr-1"></span>
             Google AdMob
          </span>
          <span className="text-[9px] text-gray-400 font-mono mt-0.5" title={ADMOB_CONFIG.appId}>
            {ADMOB_CONFIG.appId.substring(0, 20)}...
          </span>
        </div>
    </div>
  </div>
);

const Header = ({ title }: { title: string }) => (
  <div className="bg-teal-700 text-white p-4 shadow-md sticky top-0 z-50">
    <div className="flex justify-between items-center">
      <h1 className="text-xl font-bold tracking-wide">{title}</h1>
      <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
        <Moon size={18} />
      </div>
    </div>
  </div>
);

const HomeScreen = ({ times, loading, error, settings, onRefresh }: any) => {
  const next = getNextPrayer(times);
  const today = new Date();
  const dateStr = today.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
  const [dailyVerse, setDailyVerse] = useState<DailyContent | null>(null);
  const [dailyHadith, setDailyHadith] = useState<DailyContent | null>(null);
  const [verseLoading, setVerseLoading] = useState(true);

  useEffect(() => {
    const fetchDailyContent = async () => {
      const todayKey = new Date().toLocaleDateString('tr-TR');
      const cachedDate = localStorage.getItem('daily_content_date');
      
      if (cachedDate === todayKey && localStorage.getItem('daily_hadith_data')) {
        setDailyHadith(JSON.parse(localStorage.getItem('daily_hadith_data')!));
      } else {
        const randomIndex = Math.floor(Math.random() * HADITHS.length);
        const selectedHadith = HADITHS[randomIndex];
        setDailyHadith({ text: selectedHadith.text, source: selectedHadith.source });
        localStorage.setItem('daily_hadith_data', JSON.stringify({ text: selectedHadith.text, source: selectedHadith.source }));
      }

      if (cachedDate === todayKey && localStorage.getItem('daily_verse_data')) {
        setDailyVerse(JSON.parse(localStorage.getItem('daily_verse_data')!));
        setVerseLoading(false);
      } else {
        try {
          const randomAyahId = Math.floor(Math.random() * 6236) + 1;
          const res = await fetch(`https://api.alquran.cloud/v1/ayah/${randomAyahId}/tr.diyanet`);
          const data = await res.json();
          if (data.code === 200) {
             const v = data.data;
             const verseData = {
               text: v.text,
               source: `${v.surah.englishName} Suresi, ${v.numberInSurah}. Ayet`
             };
             setDailyVerse(verseData);
             localStorage.setItem('daily_verse_data', JSON.stringify(verseData));
          } else {
            throw new Error('API Error');
          }
        } catch (e) {
          const randomIndex = Math.floor(Math.random() * OFFLINE_VERSES.length);
          const fallbackVerse = OFFLINE_VERSES[randomIndex];
          const verseData = { text: fallbackVerse.text, source: fallbackVerse.source };
          setDailyVerse(verseData);
          localStorage.setItem('daily_verse_data', JSON.stringify(verseData));
        } finally {
          setVerseLoading(false);
          localStorage.setItem('daily_content_date', todayKey);
        }
      }
    };
    fetchDailyContent();
  }, []);

  return (
    <div className="pb-36 space-y-4">
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center space-x-1">
               <p className="text-teal-100 text-sm font-medium">{settings.city}</p>
               {settings.district && settings.district !== 'Merkez' && (
                 <>
                   <ChevronRight size={12} className="text-teal-300" />
                   <p className="text-teal-200 text-sm">{settings.district}</p>
                 </>
               )}
            </div>
            <p className="text-teal-50 opacity-80 text-xs">{dateStr}</p>
          </div>
          <button onClick={onRefresh} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
            <MapPin size={18} />
          </button>
        </div>
        <div className="text-center py-4">
          <p className="text-teal-200 text-lg font-medium mb-1">Vakte Kalan</p>
          <h2 className="text-5xl font-bold tracking-tight">{next.remaining}</h2>
          <div className="mt-2 inline-block bg-teal-900/30 px-4 py-1 rounded-full border border-teal-500/30">
            <span className="text-lg">{next.name} Ezanı: {next.time}</span>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6">
        <div className="bg-white rounded-xl shadow-md p-4 grid grid-cols-3 gap-4 border border-gray-100">
          {times && ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((key) => {
            const labelMap: any = { Fajr: 'İmsak', Sunrise: 'Güneş', Dhuhr: 'Öğle', Asr: 'İkindi', Maghrib: 'Akşam', Isha: 'Yatsı' };
            const isActive = labelMap[key] === next.name;
            return (
              <div key={key} className={`flex flex-col items-center p-2 rounded-lg ${isActive ? 'bg-teal-50 border border-teal-200' : ''}`}>
                <span className="text-xs text-gray-500 font-medium">{labelMap[key]}</span>
                <span className={`text-lg font-bold ${isActive ? 'text-teal-700' : 'text-gray-800'}`}>
                  {times[key as keyof PrayerTimes]}
                </span>
              </div>
            );
          })}
          {loading && <div className="col-span-3 text-center py-4 text-gray-500">Vakitler yükleniyor...</div>}
          {error && <div className="col-span-3 text-center py-4 text-red-500">Veri alınamadı.</div>}
        </div>
      </div>

      {isRamadan() && (
        <div className="px-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center shadow-sm">
            <Moon className="text-amber-600 mr-3" />
            <div>
              <h3 className="font-bold text-amber-800 text-lg">Hayırlı Ramazanlar</h3>
              <p className="text-amber-700 text-sm">İftara kalan süre sayaç burada olacak.</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 space-y-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 min-h-[140px] flex flex-col justify-center">
          <div className="flex items-center mb-2 text-teal-700">
            <BookOpen size={20} className="mr-2" />
            <h3 className="font-bold">Günün Ayeti</h3>
          </div>
          {verseLoading ? (
            <div className="animate-pulse space-y-2">
               <div className="h-4 bg-gray-200 rounded w-3/4"></div>
               <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : dailyVerse ? (
            <>
               <p className="text-gray-700 italic text-lg leading-relaxed">"{dailyVerse.text}"</p>
               <p className="text-right text-sm text-gray-500 mt-2">- {dailyVerse.source}</p>
            </>
          ) : (
            <p className="text-gray-400 text-sm">İçerik yüklenemedi.</p>
          )}
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center mb-2 text-teal-700">
            <Heart size={20} className="mr-2" />
            <h3 className="font-bold">Günün Hadisi</h3>
          </div>
          {dailyHadith ? (
             <>
               <p className="text-gray-700 text-lg leading-relaxed">{dailyHadith.text}</p>
               <p className="text-right text-sm text-gray-500 mt-2">- {dailyHadith.source}</p>
             </>
          ) : (
             <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const QuranScreen = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loadingAyahs, setLoadingAyahs] = useState(false);
  const [sortOrder, setSortOrder] = useState<'mushaf' | 'nuzul'>('mushaf');
  const [lastRead, setLastRead] = useState<LastRead | null>(null);
  
  useEffect(() => {
    fetchSurahs();
    const saved = localStorage.getItem('lastRead');
    if (saved) setLastRead(JSON.parse(saved));
  }, []);

  const fetchSurahs = async () => {
    try {
      const res = await fetch('https://api.alquran.cloud/v1/surah');
      const data = await res.json();
      if (data.code === 200) setSurahs(data.data);
    } catch (e) {
      console.error("Failed to fetch surahs", e);
    } finally {
      setLoading(false);
    }
  };

  const openSurah = async (surah: Surah, targetAyahNumber: number = 0) => {
    setSelectedSurah(surah);
    setViewMode('detail');
    setLoadingAyahs(true);
    setAyahs([]);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/tr.diyanet`);
      const data = await res.json();
      if (data.code === 200) {
        setAyahs(data.data.ayahs);
        if (targetAyahNumber > 0) {
          setTimeout(() => {
            const el = document.getElementById(`ayah-${targetAyahNumber}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.classList.add('bg-teal-50');
              setTimeout(() => el.classList.remove('bg-teal-50'), 2000);
            }
          }, 500); 
        }
      }
    } catch (e) {
      console.error("Failed to fetch ayahs", e);
    } finally {
      setLoadingAyahs(false);
    }
  };

  const handleSetLastRead = (ayahNumberInSurah: number) => {
    if (!selectedSurah) return;
    const newLastRead: LastRead = {
      surahId: selectedSurah.number,
      surahName: selectedSurah.name, 
      ayahNumber: ayahNumberInSurah,
      timestamp: Date.now()
    };
    setLastRead(newLastRead);
    localStorage.setItem('lastRead', JSON.stringify(newLastRead));
  };

  const goBack = () => {
    setViewMode('list');
    setSelectedSurah(null);
  };

  const toggleSort = () => setSortOrder(prev => prev === 'mushaf' ? 'nuzul' : 'mushaf');

  const filteredSurahs = surahs.filter(s => 
    s.englishName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.englishNameTranslation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(s.number).includes(searchTerm)
  );

  const displayedSurahs = [...filteredSurahs].sort((a, b) => {
    if (sortOrder === 'mushaf') return a.number - b.number;
    const indexA = REVELATION_ORDER.indexOf(a.number);
    const indexB = REVELATION_ORDER.indexOf(b.number);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  if (viewMode === 'detail' && selectedSurah) {
    return (
      <div className="pb-36 bg-white min-h-full">
        <div className="sticky top-0 bg-white border-b border-gray-200 z-40 shadow-sm flex items-center p-3">
           <button onClick={goBack} className="p-2 mr-2 rounded-full hover:bg-gray-100 text-gray-600">
             <ArrowLeft size={24} />
           </button>
           <div className="flex-1">
             <h2 className="font-bold text-lg text-gray-800">{selectedSurah.englishName}</h2>
             <p className="text-xs text-gray-500">{selectedSurah.englishNameTranslation} • {selectedSurah.numberOfAyahs} Ayet</p>
           </div>
           <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-700 font-bold border border-teal-100">
             {selectedSurah.number}
           </div>
        </div>
        <div className="p-4 space-y-6">
          {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
            <div className="text-center py-4 mb-4">
              <p className="text-2xl font-serif text-gray-800">Bismillahirrahmânirrahîm</p>
            </div>
          )}
          {loadingAyahs ? (
            <div className="space-y-4 animate-pulse">
               {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>)}
            </div>
          ) : (
            ayahs.map((ayah) => (
              <div key={ayah.number} id={`ayah-${ayah.numberInSurah}`} className="flex flex-col border-b border-gray-100 pb-6 transition-colors duration-500">
                <div className="flex justify-between items-center mb-3">
                  <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 text-sm flex items-center justify-center font-bold">
                    {ayah.numberInSurah}
                  </span>
                  <button onClick={() => handleSetLastRead(ayah.numberInSurah)} className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${lastRead?.surahId === selectedSurah.number && lastRead?.ayahNumber === ayah.numberInSurah ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-400 border-gray-200 hover:border-teal-500 hover:text-teal-600'}`}>
                    {lastRead?.surahId === selectedSurah.number && lastRead?.ayahNumber === ayah.numberInSurah ? <><CheckCircle size={12} /><span>Kaldığım Yer</span></> : <><Bookmark size={12} /><span>Kaldığım Yer Yap</span></>}
                  </button>
                </div>
                <p className="text-gray-800 text-lg leading-relaxed font-medium">{ayah.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-36">
      <div className="p-4 bg-teal-50 sticky top-0 z-40 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-teal-600" size={20} />
          <input type="text" placeholder="Sure ara..." className="w-full pl-10 p-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-700" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex justify-between items-center">
          <button onClick={toggleSort} className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-600 shadow-sm hover:bg-gray-50">
            <ArrowUpDown size={16} />
            <span>Sıralama: <strong>{sortOrder === 'mushaf' ? 'Mushaf' : 'İniş Sırası'}</strong></span>
          </button>
          <span className="text-xs text-gray-400">{filteredSurahs.length} Sure</span>
        </div>
      </div>
      {lastRead && (
        <div className="px-4 mt-4">
           <div onClick={() => { const surah = surahs.find(s => s.number === lastRead.surahId); if (surah) openSurah(surah, lastRead.ayahNumber); }} className="bg-gradient-to-r from-teal-700 to-teal-600 p-4 rounded-xl shadow-md flex justify-between items-center text-white cursor-pointer hover:shadow-lg transition-shadow">
             <div><p className="text-teal-100 text-xs font-bold uppercase mb-1">Son Okunan</p><h3 className="font-bold text-lg">{lastRead.surahName} Suresi</h3><p className="text-sm opacity-90">{lastRead.ayahNumber}. Ayet</p></div>
             <div className="bg-white/20 p-2 rounded-full"><ChevronRight size={24} /></div>
           </div>
        </div>
      )}
      <div className="px-4 space-y-3 mt-4">
        {loading ? <div className="text-center py-10 text-gray-400">Yükleniyor...</div> : displayedSurahs.map(surah => (
          <div key={surah.number} onClick={() => openSurah(surah)} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between active:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center font-bold mr-4 text-sm">{surah.number}</div>
              <div><h3 className="font-bold text-lg text-gray-800">{surah.englishName}</h3><p className="text-gray-500 text-xs">{surah.englishNameTranslation} • {surah.numberOfAyahs} Ayet</p></div>
            </div>
            <ChevronRight className="text-gray-300" size={20} />
          </div>
        ))}
      </div>
    </div>
  );
};

const ToolsScreen = () => {
  const [activeTab, setActiveTab] = useState<'zikir' | 'zakat' | 'calendar'>('zikir');
  const [zikirCount, setZikirCount] = useState(0);
  const [savedZikirs, setSavedZikirs] = useState<ZikirItem[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [newZikirName, setNewZikirName] = useState('');
  const [assets, setAssets] = useState({ gold: 0, cash: 0, debts: 0 });
  const [zakatResult, setZakatResult] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('savedZikirs');
    if (saved) setSavedZikirs(JSON.parse(saved));
  }, []);

  const handleZikirClick = () => {
    setZikirCount(p => p + 1);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleSaveZikir = () => { if (zikirCount > 0) { setIsSaveModalOpen(true); setNewZikirName(`Zikir ${savedZikirs.length + 1}`); } };

  const confirmSaveZikir = () => {
    if (!newZikirName.trim()) return;
    const newItem: ZikirItem = { id: Date.now(), name: newZikirName, count: zikirCount, date: new Date().toLocaleDateString('tr-TR') };
    const newList = [newItem, ...savedZikirs];
    setSavedZikirs(newList);
    localStorage.setItem('savedZikirs', JSON.stringify(newList));
    setZikirCount(0);
    setIsSaveModalOpen(false);
  };

  const handleDeleteZikir = (id: number) => {
    const newList = savedZikirs.filter(item => item.id !== id);
    setSavedZikirs(newList);
    localStorage.setItem('savedZikirs', JSON.stringify(newList));
  };

  const calculateZakat = () => {
    const total = (Number(assets.gold) * 2000) + Number(assets.cash) - Number(assets.debts); 
    setZakatResult(total > 80000 ? total * 0.025 : 0);
  };

  return (
    <div className="pb-36 relative">
      <div className="flex bg-white shadow-sm sticky top-0 z-40">
        <button onClick={() => setActiveTab('zikir')} className={`flex-1 p-3 font-medium ${activeTab === 'zikir' ? 'text-teal-700 border-b-2 border-teal-700 bg-teal-50' : 'text-gray-500'}`}>Zikirmatik</button>
        <button onClick={() => setActiveTab('zakat')} className={`flex-1 p-3 font-medium ${activeTab === 'zakat' ? 'text-teal-700 border-b-2 border-teal-700 bg-teal-50' : 'text-gray-500'}`}>Zekat</button>
        <button onClick={() => setActiveTab('calendar')} className={`flex-1 p-3 font-medium ${activeTab === 'calendar' ? 'text-teal-700 border-b-2 border-teal-700 bg-teal-50' : 'text-gray-500'}`}>Takvim</button>
      </div>
      <div className="p-4">
        {activeTab === 'zikir' && (
          <div className="flex flex-col items-center py-8">
            <div className="w-64 h-64 rounded-full bg-teal-600 shadow-xl flex items-center justify-center mb-8 cursor-pointer active:scale-95 transition-transform select-none" onClick={handleZikirClick}>
              <div className="text-center text-white"><span className="block text-6xl font-bold">{zikirCount}</span><span className="text-sm opacity-80 mt-2">DOKUN</span></div>
            </div>
            <div className="flex gap-4 mb-8">
              <button onClick={() => setZikirCount(0)} className="bg-gray-200 px-6 py-2 rounded-full text-gray-700 font-medium">Sıfırla</button>
              <button onClick={handleSaveZikir} className="bg-teal-700 px-6 py-2 rounded-full text-white font-medium flex items-center"><Plus size={18} className="mr-1" /> Kaydet</button>
            </div>
            {savedZikirs.length > 0 && (
              <div className="w-full max-w-sm">
                <h3 className="text-gray-500 text-sm font-bold mb-3 uppercase tracking-wider">Kayıtlı Zikirler</h3>
                <div className="space-y-3">
                  {savedZikirs.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                      <div><h4 className="font-bold text-gray-800">{item.name}</h4><p className="text-xs text-gray-400">{item.date}</p></div>
                      <div className="flex items-center"><span className="bg-teal-50 text-teal-700 font-bold px-3 py-1 rounded-full mr-3 text-sm">{item.count}</span><button onClick={() => handleDeleteZikir(item.id)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={18} /></button></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {isSaveModalOpen && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xs animate-[scaleIn_0.2s_ease-out]">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Zikri Kaydet</h3>
                  <input type="text" value={newZikirName} onChange={(e) => setNewZikirName(e.target.value)} placeholder="Örn: Günlük Tesbihat" className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-teal-500 outline-none" autoFocus />
                  <div className="flex gap-3"><button onClick={() => setIsSaveModalOpen(false)} className="flex-1 py-2 text-gray-600 font-medium">İptal</button><button onClick={confirmSaveZikir} className="flex-1 py-2 bg-teal-600 text-white rounded-lg font-medium">Kaydet</button></div>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'zakat' && (
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="font-bold text-lg mb-2">Zekat Hesapla</h3>
            <div><label className="block text-sm text-gray-600 mb-1">Altın (Gram)</label><input type="number" className="w-full p-3 border rounded-lg" value={assets.gold} onChange={e => setAssets({...assets, gold: Number(e.target.value)})} /></div>
            <div><label className="block text-sm text-gray-600 mb-1">Nakit Para (TL)</label><input type="number" className="w-full p-3 border rounded-lg" value={assets.cash} onChange={e => setAssets({...assets, cash: Number(e.target.value)})} /></div>
            <div><label className="block text-sm text-gray-600 mb-1">Borçlar (TL)</label><input type="number" className="w-full p-3 border rounded-lg" value={assets.debts} onChange={e => setAssets({...assets, debts: Number(e.target.value)})} /></div>
            <button onClick={calculateZakat} className="w-full bg-teal-700 text-white p-3 rounded-lg font-bold">HESAPLA</button>
            {zakatResult !== null && <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-lg text-center font-bold text-teal-800 text-xl">{zakatResult > 0 ? `Verilecek Zekat: ${zakatResult.toFixed(2)} TL` : "Zekat Gerekmiyor"}</div>}
          </div>
        )}
        {activeTab === 'calendar' && (
          <div className="space-y-3">
            {RELIGIOUS_DAYS.map((day, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-teal-500 flex justify-between items-center">
                <div><h4 className="font-bold text-gray-800">{day.name}</h4><p className="text-gray-500">{day.date}</p></div>
                <CalendarIcon className="text-teal-600 opacity-50" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SettingsScreen = ({ settings, setSettings }: any) => {
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem('userSettings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const toggleSetting = (key: string) => updateSetting(key, !settings[key]);

  const sendNotification = (title: string, options: NotificationOptions) => {
    if (!("Notification" in window)) return;
    
    if (Notification.permission === "granted") {
      // Try Service Worker first (more reliable on mobile)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, options);
        }).catch(() => {
          new Notification(title, options);
        });
      } else {
        new Notification(title, options);
      }
    }
  };

  const handleTestNotification = () => {
    if (!("Notification" in window)) {
      alert("Bu tarayıcı bildirimleri desteklemiyor.");
      return;
    }

    if (Notification.permission === "granted") {
      sendNotification("Ezan Vakti, Zikir Zekat ve Kur'an", {
        body: `${settings.city} (${settings.district}) için bildirim testi başarılı!`,
        icon: '/icon.png',
        badge: '/icon.png',
        vibrate: [200, 100, 200]
      } as any);
      if (settings.soundEnabled) playSound(settings.selectedPrayerSound);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") handleTestNotification();
      });
    } else {
      alert("Bildirim izni reddedilmiş. Lütfen ayarlardan izin verin.");
    }
  };

  return (
    <div className="pb-36 p-4 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-700">Ezan Bildirim Ayarları</h3>
          <button 
            onClick={handleTestNotification}
            className="flex items-center space-x-1 text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-bold hover:bg-teal-200 transition-colors"
          >
            <Send size={12} />
            <span>TEST ET</span>
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="p-4 flex flex-col">
            <div className="flex justify-between items-center">
              <div className="flex items-center text-gray-700"><Volume2 className="mr-3" size={20} /><span className="text-lg">Sesli Bildirim</span></div>
              <button onClick={() => toggleSetting('soundEnabled')} className={`w-12 h-6 rounded-full relative transition-colors ${settings.soundEnabled ? 'bg-teal-600' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all`} style={{ left: settings.soundEnabled ? '26px' : '2px' }} />
              </button>
            </div>
            {settings.soundEnabled && (
              <div className="mt-3 ml-8">
                 <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1"><Music size={14} /><span>Ses Tonu</span></div>
                 <select value={settings.selectedPrayerSound} onChange={(e) => { updateSetting('selectedPrayerSound', e.target.value); playSound(e.target.value); }} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm">
                   {SOUND_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                 </select>
              </div>
            )}
          </div>
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center text-gray-700"><Sun className="mr-3" size={20} /><span className="text-lg">Titreşim</span></div>
            <button onClick={() => toggleSetting('vibrationEnabled')} className={`w-12 h-6 rounded-full relative transition-colors ${settings.vibrationEnabled ? 'bg-teal-600' : 'bg-gray-300'}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all`} style={{ left: settings.vibrationEnabled ? '26px' : '2px' }} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100"><h3 className="font-bold text-gray-700">İçerik Bildirimleri</h3></div>
        <div className="divide-y divide-gray-100">
          <div className="p-4 flex flex-col">
            <div className="flex justify-between items-center">
              <div className="flex items-center text-gray-700"><Heart className="mr-3" size={20} /><div><span className="text-lg block">Günün Hadisi</span><span className="text-xs text-gray-400">10:00'da</span></div></div>
              <button onClick={() => toggleSetting('hadithNotificationEnabled')} className={`w-12 h-6 rounded-full relative transition-colors ${settings.hadithNotificationEnabled ? 'bg-teal-600' : 'bg-gray-300'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all`} style={{ left: settings.hadithNotificationEnabled ? '26px' : '2px' }} /></button>
            </div>
          </div>
          <div className="p-4 flex flex-col">
            <div className="flex justify-between items-center">
              <div className="flex items-center text-gray-700"><BookOpen className="mr-3" size={20} /><div><span className="text-lg block">Günün Ayeti</span><span className="text-xs text-gray-400">12:00'da</span></div></div>
              <button onClick={() => toggleSetting('verseNotificationEnabled')} className={`w-12 h-6 rounded-full relative transition-colors ${settings.verseNotificationEnabled ? 'bg-teal-600' : 'bg-gray-300'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all`} style={{ left: settings.verseNotificationEnabled ? '26px' : '2px' }} /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-bold text-gray-700 mb-4">Konum Ayarları</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div><p className="text-sm text-gray-500">Şehir</p><p className="font-bold text-lg">{settings.city}</p></div>
            <button onClick={() => setIsCityModalOpen(true)} className="text-teal-700 font-bold px-4 py-2 bg-teal-100 rounded-lg">DEĞİŞTİR</button>
          </div>
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div><p className="text-sm text-gray-500">İlçe</p><p className="font-bold text-lg">{settings.district}</p></div>
            <button onClick={() => setIsDistrictModalOpen(true)} className="text-teal-700 font-bold px-4 py-2 bg-teal-100 rounded-lg">SEÇ</button>
          </div>
        </div>
      </div>

      {isCityModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-teal-700 text-white rounded-t-xl"><h3 className="font-bold">Şehir Seçimi</h3><button onClick={() => setIsCityModalOpen(false)}><X size={24} /></button></div>
            <div className="p-4 bg-gray-50"><input type="text" placeholder="Şehir ara..." className="w-full p-2 border rounded-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <div className="overflow-y-auto p-2 flex-1">
              {Object.keys(CITIES_DATA).filter(c => c.toLocaleLowerCase('tr').includes(searchTerm.toLocaleLowerCase('tr'))).map(city => (
                <button key={city} onClick={() => { setSettings((p:any) => ({...p, city: city, district: 'Merkez'})); setIsCityModalOpen(false); }} className={`w-full text-left p-3 mb-1 rounded-lg ${settings.city === city ? 'bg-teal-50 text-teal-700 font-bold' : ''}`}>{city}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isDistrictModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-teal-700 text-white rounded-t-xl"><h3 className="font-bold">{settings.city} İlçeleri</h3><button onClick={() => setIsDistrictModalOpen(false)}><X size={24} /></button></div>
            <div className="overflow-y-auto p-2 flex-1">
              {CITIES_DATA[settings.city]?.map(district => (
                <button key={district} onClick={() => { updateSetting('district', district); setIsDistrictModalOpen(false); }} className={`w-full text-left p-3 mb-1 rounded-lg ${settings.district === district ? 'bg-teal-50 text-teal-700 font-bold' : ''}`}>{district}</button>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
        <div className="flex items-start">
          <Bell className="text-amber-600 mr-3 mt-1" size={20} />
          <div>
            <h4 className="font-bold text-amber-800 text-sm">Android Kullanıcıları İçin Not</h4>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              Uygulama kapalıyken bildirim alabilmek için uygulamanın "Pil Tasarrufu" modunda "Kısıtlama Yok" olarak ayarlandığından emin olun. 
            </p>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-400 text-xs py-4"><p>Ezan Vakti, Zikir Zekat ve Kur'an v1.2.0</p></div>

    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const defaultSettings: UserSettings = {
    notificationsEnabled: true, city: 'İstanbul', district: 'Merkez', soundEnabled: true, selectedPrayerSound: 'beep', vibrationEnabled: true,
    hadithNotificationEnabled: true, hadithSoundEnabled: true, selectedHadithSound: 'water', verseNotificationEnabled: true, verseSoundEnabled: true, selectedVerseSound: 'water'
  };

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('userSettings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const fetchTimes = async () => {
    setLoading(true); setError(false);
    try {
      const today = new Date();
      const dateStr = `${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}`;
      const queryLocation = (settings.district && settings.district !== 'Merkez') ? settings.district : settings.city;
      const cacheKey = `prayers_${queryLocation}_${dateStr}`;
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) { setTimes(JSON.parse(cachedData)); setLoading(false); return; }
      const response = await fetch(`https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${queryLocation}&country=Turkey&method=13`);
      const data = await response.json();
      if (data.code === 200) { setTimes(data.data.timings); localStorage.setItem(cacheKey, JSON.stringify(data.data.timings)); }
      else throw new Error('API Error');
    } catch (err) { setError(true); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchTimes();
    if ("Notification" in window && Notification.permission !== 'granted') Notification.requestPermission();
  }, [settings.city, settings.district]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (times && settings.notificationsEnabled) {
        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');
        const timeStr = `${h}:${m}`;
        
        const prayers = [ 
          { name: 'İmsak', time: times.Fajr }, 
          { name: 'Güneş', time: times.Sunrise }, 
          { name: 'Öğle', time: times.Dhuhr }, 
          { name: 'İkindi', time: times.Asr }, 
          { name: 'Akşam', time: times.Maghrib }, 
          { name: 'Yatsı', time: times.Isha } 
        ];
        
        const match = prayers.find(p => p.time === timeStr);
        if (match && Notification.permission === 'granted') {
          // Prevent multiple notifications in the same minute
          const lastNotifKey = `last_notif_${match.name}_${new Date().toDateString()}`;
          if (localStorage.getItem(lastNotifKey) !== timeStr) {
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(`${match.name} Vakti`, {
                  body: `${settings.city} için ${match.name} vakti girdi.`,
                  icon: '/icon.png',
                  badge: '/icon.png',
                  vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40],
                  tag: 'prayer-time'
                } as any);
              });
            } else {
              new Notification(`${match.name} Vakti`, { 
                body: `${settings.city} için ${match.name} vakti girdi.`, 
                icon: '/icon.png' 
              });
            }
            
            if (settings.soundEnabled) playSound(settings.selectedPrayerSound);
            localStorage.setItem(lastNotifKey, timeStr);
          }
        }
      }
    }, 30000); // Check every 30 seconds for better accuracy
    return () => clearInterval(interval);
  }, [times, settings]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeScreen times={times} loading={loading} error={error} settings={settings} onRefresh={fetchTimes} />;
      case 'quran': return <QuranScreen />;
      case 'tools': return <ToolsScreen />;
      case 'settings': return <SettingsScreen settings={settings} setSettings={setSettings} />;
      default: return <HomeScreen />;
    }
  };

  return (
    <div className="h-[100dvh] bg-slate-50 relative max-w-md mx-auto shadow-2xl overflow-hidden flex flex-col">
      <Header title={activeTab === 'home' ? 'Ezan Vakti' : activeTab === 'quran' ? "Kur'an-ı Kerim" : activeTab === 'tools' ? 'Araçlar' : 'Ayarlar'} />
      <main className="flex-1 overflow-y-auto no-scrollbar">{renderContent()}</main>
      <div className="bg-white border-t z-50 w-full max-w-md fixed bottom-0 left-0 right-0 mx-auto"><AdBanner />
        <div className="flex justify-around items-center p-2 pb-safe">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center p-2 ${activeTab === 'home' ? 'text-teal-700' : 'text-gray-400'}`}><Home size={24} /><span className="text-xs font-medium mt-1">Ana Sayfa</span></button>
          <button onClick={() => setActiveTab('quran')} className={`flex flex-col items-center p-2 ${activeTab === 'quran' ? 'text-teal-700' : 'text-gray-400'}`}><BookOpen size={24} /><span className="text-xs font-medium mt-1">Kur'an</span></button>
          <button onClick={() => setActiveTab('tools')} className={`flex flex-col items-center p-2 ${activeTab === 'tools' ? 'text-teal-700' : 'text-gray-400'}`}><Menu size={24} /><span className="text-xs font-medium mt-1">Araçlar</span></button>
          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center p-2 ${activeTab === 'settings' ? 'text-teal-700' : 'text-gray-400'}`}><Settings size={24} /><span className="text-xs font-medium mt-1">Ayarlar</span></button>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);