import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, Sun, BookOpen, Calculator, Calendar as CalendarIcon, 
  Settings, MapPin, Volume2, VolumeX, ChevronRight, Home, 
  Menu, X, Clock, Hand, Heart, Bell, Music, Trash2, Plus,
  Search, ArrowUpDown, Bookmark, ArrowLeft, CheckCircle, Navigation,
  WifiOff, Send, Compass, Map as MapIcon, RotateCcw, Minus
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

interface KazaData {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  witr: number;
}

interface UserSettings {
  notificationsEnabled: boolean;
  city: string;
  district: string;
  soundEnabled: boolean;
  selectedPrayerSound: string;
  vibrationEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  
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
  // Ramadan 2026: Feb 16 - March 16
  if (m === 1 && d >= 15) return true; 
  if (m === 2 && d <= 17) return true; 
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

const HomeScreen = ({ times, loading, error, settings, onRefresh, onDetectLocation }: any) => {
  const next = getNextPrayer(times);
  const today = new Date();
  const dateStr = today.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
  const [dailyVerse, setDailyVerse] = useState<DailyContent | null>(null);
  const [dailyHadith, setDailyHadith] = useState<DailyContent | null>(null);
  const [verseLoading, setVerseLoading] = useState(true);
  const [iftarCountdown, setIftarCountdown] = useState<string>('');

  useEffect(() => {
    if (!times || !isRamadan()) return;

    const updateCountdown = () => {
      const now = new Date();
      const [h, m] = times.Maghrib.split(':').map(Number);
      const iftarTime = new Date();
      iftarTime.setHours(h, m, 0);

      const diff = iftarTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        if (diff > -7200000) { 
          setIftarCountdown('Afiyet Olsun / Hayırlı İftarlar');
        } else {
          setIftarCountdown('Yarınki İftara Hazırlık');
        }
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setIftarCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [times]);

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

  const prayerItems = times ? [
    { name: 'İmsak', time: times.Fajr, icon: <Moon size={18} /> },
    { name: 'Güneş', time: times.Sunrise, icon: <Sun size={18} /> },
    { name: 'Öğle', time: times.Dhuhr, icon: <Sun size={18} /> },
    { name: 'İkindi', time: times.Asr, icon: <Sun size={18} /> },
    { name: 'Akşam', time: times.Maghrib, icon: <Moon size={18} /> },
    { name: 'Yatsı', time: times.Isha, icon: <Moon size={18} /> },
  ] : [];

  return (
    <div className="pb-36">
      {/* Hero Section */}
      <div className="relative h-80 overflow-hidden rounded-b-[3rem] shadow-2xl">
        <img 
          src="https://picsum.photos/seed/mosque/800/600?blur=2" 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/60 via-teal-800/40 to-teal-900/90"></div>
        
        <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
          <div className="flex justify-between items-start">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-1"
            >
              <div className="flex items-center space-x-1">
                <MapPin size={14} className="text-teal-300" />
                <span className="text-sm font-bold tracking-wide uppercase">{settings.city}</span>
                {settings.district && settings.district !== 'Merkez' && (
                  <span className="text-xs text-teal-200">/ {settings.district}</span>
                )}
              </div>
              <p className="text-xs opacity-80">{dateStr}</p>
            </motion.div>
            <button onClick={onDetectLocation} className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all active:scale-95">
              <Navigation size={18} />
            </button>
          </div>

          <div className="text-center mb-4">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-teal-200 text-sm font-medium mb-1 uppercase tracking-widest"
            >
              {next.name} Vaktine Kalan
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-6xl font-black tracking-tighter drop-shadow-lg"
            >
              {next.remaining}
            </motion.h2>
            <div className="mt-4 inline-flex items-center space-x-2 bg-white/10 backdrop-blur-lg px-4 py-1.5 rounded-full border border-white/20">
              <Clock size={14} className="text-teal-300" />
              <span className="text-sm font-bold">{next.name} Ezanı: {next.time}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-8 relative z-10 space-y-6">
        {/* Ramadan Special */}
        {isRamadan() && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-500 to-orange-600 p-5 rounded-3xl shadow-xl text-white overflow-hidden relative group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Moon size={80} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-2">
                <Heart size={16} className="text-amber-200" />
                <h3 className="font-black text-lg uppercase tracking-tighter">Hayırlı Ramazanlar</h3>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-amber-100 text-xs font-medium opacity-90">İftara Kalan Süre</p>
                  <p className="text-3xl font-mono font-black tracking-tighter mt-1 animate-pulse">{iftarCountdown}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold border border-white/30">
                  {times?.Maghrib} İftar
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Prayer Times Grid */}
        <div className="grid grid-cols-3 gap-3">
          {prayerItems.map((p, i) => (
            <motion.div 
              key={p.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 rounded-3xl border transition-all ${p.name === next.name ? 'bg-teal-700 text-white border-teal-600 shadow-lg scale-105 z-10' : 'bg-white text-gray-800 border-gray-100 shadow-sm'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${p.name === next.name ? 'bg-white/20' : 'bg-teal-50 text-teal-600'}`}>
                {p.icon}
              </div>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${p.name === next.name ? 'text-teal-200' : 'text-gray-400'}`}>{p.name}</p>
              <p className="text-lg font-black tracking-tighter mt-1">{p.time}</p>
            </motion.div>
          ))}
        </div>

        {/* Religious Days Glance */}
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon size={18} className="text-teal-600" />
              <h3 className="font-black text-gray-800 uppercase tracking-tighter">Önemli Günler</h3>
            </div>
            <button onClick={() => (window as any).setActiveTab('tools')} className="text-[10px] font-bold text-teal-600 uppercase tracking-widest hover:underline">Tümünü Gör</button>
          </div>
          <div className="space-y-3">
            {RELIGIOUS_DAYS.filter(d => {
              const [day, month, year] = d.date.split(' ');
              const monthMap: any = { 'Ocak': 0, 'Şubat': 1, 'Mart': 2, 'Nisan': 3, 'Mayıs': 4, 'Haziran': 5, 'Temmuz': 6, 'Ağustos': 7, 'Eylül': 8, 'Ekim': 9, 'Kasım': 10, 'Aralık': 11 };
              const date = new Date(parseInt(year), monthMap[month], parseInt(day));
              return date >= new Date();
            }).slice(0, 2).map((day, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-teal-50/50 rounded-2xl border border-teal-100/50">
                <span className="text-sm font-bold text-gray-700">{day.name}</span>
                <span className="text-[10px] font-bold text-teal-600 bg-white px-2 py-1 rounded-lg border border-teal-100">{day.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Inspiration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-gray-800 uppercase tracking-tighter">Günün İlhamı</h3>
            <div className="h-px flex-1 bg-gray-100 mx-4"></div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 text-teal-50 group-hover:text-teal-100 transition-colors">
                <BookOpen size={60} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                  <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Günün Ayeti</p>
                </div>
                {verseLoading ? (
                  <div className="h-20 flex items-center justify-center"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                  <>
                    <p className="text-gray-800 font-serif italic leading-relaxed mb-4">"{dailyVerse?.text}"</p>
                    <p className="text-[10px] font-bold text-gray-400 text-right uppercase tracking-wider">— {dailyVerse?.source}</p>
                  </>
                )}
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 text-amber-50 group-hover:text-amber-100 transition-colors">
                <Heart size={60} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Günün Hadisi</p>
                </div>
                <p className="text-gray-800 font-serif italic leading-relaxed mb-4">"{dailyHadith?.text}"</p>
                <p className="text-[10px] font-bold text-gray-400 text-right uppercase tracking-wider">— {dailyHadith?.source}</p>
              </div>
            </motion.div>
          </div>
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
           <motion.div 
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             onClick={() => { const surah = surahs.find(s => s.number === lastRead.surahId); if (surah) openSurah(surah, lastRead.ayahNumber); }} 
             className="bg-gradient-to-br from-teal-800 to-teal-600 p-5 rounded-[2rem] shadow-xl flex justify-between items-center text-white cursor-pointer relative overflow-hidden group"
           >
             <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
               <BookOpen size={120} />
             </div>
             <div className="relative z-10">
               <p className="text-teal-200 text-[10px] font-bold uppercase tracking-widest mb-1">Kaldığınız Yerden Devam Edin</p>
               <h3 className="font-black text-xl tracking-tighter">{lastRead.surahName} Suresi</h3>
               <p className="text-sm opacity-90 font-medium">{lastRead.ayahNumber}. Ayet</p>
             </div>
             <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30 group-hover:bg-white/30 transition-colors">
               <ChevronRight size={24} />
             </div>
           </motion.div>
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

const KazaTracker = () => {
  const [kaza, setKaza] = useState<KazaData>(() => {
    const saved = localStorage.getItem('kazaData');
    return saved ? JSON.parse(saved) : { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 };
  });

  useEffect(() => {
    localStorage.setItem('kazaData', JSON.stringify(kaza));
  }, [kaza]);

  const updateKaza = (key: keyof KazaData, delta: number) => {
    setKaza(prev => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }));
  };

  const prayers = [
    { key: 'fajr', name: 'Sabah' },
    { key: 'dhuhr', name: 'Öğle' },
    { key: 'asr', name: 'İkindi' },
    { key: 'maghrib', name: 'Akşam' },
    { key: 'isha', name: 'Yatsı' },
    { key: 'witr', name: 'Vitir' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 mb-4">
        <p className="text-xs text-teal-800 leading-relaxed">
          Kılmadığınız farz namazlarınızı buradan takip edebilirsiniz. Her kıldığınız namaz için "-" butonuna basarak sayıyı azaltın.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {prayers.map(p => (
          <div key={p.key} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <span className="font-bold text-gray-700">{p.name}</span>
            <div className="flex items-center space-x-4">
              <button onClick={() => updateKaza(p.key as keyof KazaData, -1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:bg-gray-200"><Minus size={16} /></button>
              <span className="w-12 text-center font-mono font-bold text-lg text-teal-700">{kaza[p.key as keyof KazaData]}</span>
              <button onClick={() => updateKaza(p.key as keyof KazaData, 1)} className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 active:bg-teal-200"><Plus size={16} /></button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => { if(confirm('Tüm veriler sıfırlanacak. Emin misiniz?')) setKaza({ fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 }); }} className="w-full py-3 text-gray-400 text-sm flex items-center justify-center hover:text-red-500 transition-colors">
        <RotateCcw size={14} className="mr-1" /> Tümünü Sıfırla
      </button>
    </div>
  );
};

const QiblaFinder = () => {
  const [heading, setHeading] = useState<number | null>(null);
  const [qiblaAngle, setQiblaAngle] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculateQibla = (lat: number, lng: number) => {
      const meccaLat = 21.4225;
      const meccaLng = 39.8262;
      
      const φ1 = lat * Math.PI / 180;
      const φ2 = meccaLat * Math.PI / 180;
      const Δλ = (meccaLng - lng) * Math.PI / 180;
      
      const y = Math.sin(Δλ) * Math.cos(φ2);
      const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
      let q = Math.atan2(y, x) * 180 / Math.PI;
      return (q + 360) % 360;
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setQiblaAngle(calculateQibla(pos.coords.latitude, pos.coords.longitude));
      },
      () => setError("Konum izni gerekli.")
    );

    const handleOrientation = (e: any) => {
      if (e.webkitCompassHeading) {
        setHeading(e.webkitCompassHeading);
      } else if (e.alpha !== null) {
        setHeading(360 - e.alpha);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    } else {
      setError("Cihazınız pusulayı desteklemiyor.");
    }

    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const diff = heading !== null ? (qiblaAngle - heading + 360) % 360 : 0;
  const isAligned = Math.abs(diff) < 5 || Math.abs(diff - 360) < 5;

  return (
    <div className="flex flex-col items-center py-8">
      <div className="relative w-64 h-64 mb-8">
        <motion.div 
          animate={{ rotate: heading !== null ? -heading : 0 }}
          className="absolute inset-0 rounded-full border-4 border-gray-200 flex items-center justify-center"
        >
          <div className="absolute top-2 text-gray-400 font-bold">K</div>
          <div className="absolute bottom-2 text-gray-400 font-bold">G</div>
          <div className="absolute left-2 text-gray-400 font-bold">B</div>
          <div className="absolute right-2 text-gray-400 font-bold">D</div>
        </motion.div>
        
        <motion.div 
          animate={{ rotate: diff }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative flex flex-col items-center">
            <div className={`w-1 h-32 ${isAligned ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-teal-600'} rounded-full transition-colors duration-300`}></div>
            <div className="absolute -top-8 text-3xl">🕋</div>
          </div>
        </motion.div>
      </div>
      
      <div className="text-center">
        <h3 className={`text-xl font-bold mb-2 ${isAligned ? 'text-green-600' : 'text-gray-700'}`}>
          {isAligned ? 'Kıbleye Yöneldiniz' : 'Cihazı Döndürün'}
        </h3>
        <p className="text-sm text-gray-500">
          Kıble Açısı: {Math.round(qiblaAngle)}°
        </p>
        {error && <p className="text-xs text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

const MosqueFinder = () => {
  const [mosques, setMosques] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const findMosques = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      // In a real app, we'd fetch from an API. Here we'll redirect to Google Maps
      window.open(`https://www.google.com/maps/search/camii/@${latitude},${longitude},15z`, '_blank');
      setLoading(false);
    }, () => {
      alert("Konum izni gerekli.");
      setLoading(false);
    });
  };

  return (
    <div className="text-center py-10">
      <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <MapIcon className="text-teal-600" size={40} />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">Yakınımdaki Camiler</h3>
      <p className="text-sm text-gray-500 mb-8 px-6">
        Bulunduğunuz konuma en yakın camileri harita üzerinde görüntüleyin.
      </p>
      <button 
        onClick={findMosques}
        className="bg-teal-700 text-white px-8 py-3 rounded-full font-bold shadow-lg active:scale-95 transition-transform flex items-center mx-auto"
      >
        {loading ? 'Aranıyor...' : 'HARİTADA GÖSTER'}
      </button>
    </div>
  );
};

const ToolsScreen = () => {
  const [activeTab, setActiveTab] = useState<'zikir' | 'zakat' | 'calendar' | 'kaza' | 'qibla' | 'mosque'>('zikir');
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

  const tabs = [
    { id: 'zikir', name: 'Zikirmatik', icon: <Hand size={18} /> },
    { id: 'qibla', name: 'Kıble', icon: <Compass size={18} /> },
    { id: 'kaza', name: 'Kaza', icon: <RotateCcw size={18} /> },
    { id: 'zakat', name: 'Zekat', icon: <Calculator size={18} /> },
    { id: 'calendar', name: 'Takvim', icon: <CalendarIcon size={18} /> },
    { id: 'mosque', name: 'Camiler', icon: <MapIcon size={18} /> },
  ];

  return (
    <div className="pb-36 relative">
      <div className="bg-white shadow-sm sticky top-0 z-40 overflow-x-auto no-scrollbar">
        <div className="flex min-w-max px-2">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`p-4 font-medium flex items-center space-x-2 transition-colors ${activeTab === tab.id ? 'text-teal-700 border-b-2 border-teal-700 bg-teal-50' : 'text-gray-500'}`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="p-4">
        {activeTab === 'zikir' && (
          <div className="flex flex-col items-center py-8">
            <div className="w-64 h-64 rounded-full bg-teal-600 shadow-xl flex items-center justify-center mb-8 cursor-pointer active:scale-95 transition-transform select-none relative overflow-hidden group" onClick={handleZikirClick}>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity"></div>
              <div className="text-center text-white z-10"><span className="block text-6xl font-bold">{zikirCount}</span><span className="text-sm opacity-80 mt-2">DOKUN</span></div>
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
        {activeTab === 'qibla' && <QiblaFinder />}
        {activeTab === 'kaza' && <KazaTracker />}
        {activeTab === 'mosque' && <MosqueFinder />}
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

const SettingsScreen = ({ settings, setSettings, sendNotification }: any) => {
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
          <div>
            <h3 className="font-bold text-gray-700">Ezan Bildirim Ayarları</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">
              İzin: {!("Notification" in window) ? 'Desteklenmiyor' : 
                      Notification.permission === 'granted' ? 'Verildi' : 
                      Notification.permission === 'denied' ? 'Engellendi' : 'Bekleniyor'} 
              | SW: {'serviceWorker' in navigator ? 'Aktif' : 'Pasif'}
            </p>
          </div>
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-700">Konum Ayarları</h3>
          <button 
            onClick={() => {
              // We need to pass detectLocation to SettingsScreen or use a custom event
              // For simplicity, I'll trigger it via a custom event or just use the prop if I add it
              window.dispatchEvent(new CustomEvent('detect-location'));
            }}
            className="flex items-center space-x-1 text-xs bg-teal-100 text-teal-700 px-3 py-1.5 rounded-full font-bold hover:bg-teal-200 transition-colors"
          >
            <Navigation size={12} />
            <span>KONUMU ALGILA</span>
          </button>
        </div>
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
            <h4 className="font-bold text-amber-800 text-sm">Bildirim Sorun Giderici</h4>
            <div className="text-xs text-amber-700 mt-1 space-y-2 leading-relaxed">
              <p>• <strong>Pil Tasarrufu:</strong> Ayarlardan uygulamanın pil kullanımını "Kısıtlama Yok" olarak belirleyin.</p>
              <p>• <strong>Bildirim İzni:</strong> Yukarıdaki "Durum" kısmında "İzin Verildi" yazdığından emin olun.</p>
              <p>• <strong>Play Store/WebView:</strong> Eğer bildirim gelmiyorsa, telefonunuzun Ayarlar {'>'} Uygulamalar {'>'} Ezan Vakti {'>'} Bildirimler kısmından tüm izinlerin açık olduğunu kontrol edin.</p>
              <p>• <strong>Arka Plan:</strong> Bazı telefonlarda uygulamanın arka planda çalışması için "Otomatik Başlatma" izni gerekebilir.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-400 text-xs py-4">
        <p>Ezan Vakti, Zikir Zekat ve Kur'an v1.2.0</p>
        <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-teal-600 hover:underline">Gizlilik Politikası</a>
      </div>

    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  useEffect(() => { (window as any).setActiveTab = setActiveTab; }, []);
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const sendNotification = (title: string, options: NotificationOptions) => {
    if (!("Notification" in window)) return;
    
    if (Notification.permission === "granted") {
      // Method 1: Service Worker Registration (Best for mobile)
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          options
        });
      }
      
      // Method 2: Direct SW showNotification
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, options);
        }).catch(() => {
          // Method 3: Standard Notification API
          try { new Notification(title, options); } catch(e) { console.error(e); }
        });
      } else {
        try { new Notification(title, options); } catch(e) { console.error(e); }
      }
    }
  };
  
  const defaultSettings: UserSettings = {
    notificationsEnabled: true, city: 'İstanbul', district: 'Merkez', soundEnabled: true, selectedPrayerSound: 'beep', vibrationEnabled: true, theme: 'light',
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
            sendNotification(`${match.name} Vakti`, {
              body: `${settings.city} için ${match.name} vakti girdi.`,
              icon: '/icon.png',
              badge: '/icon.png',
              vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40],
              tag: 'prayer-time'
            } as any);
            
            if (settings.soundEnabled) playSound(settings.selectedPrayerSound);
            localStorage.setItem(lastNotifKey, timeStr);
          }
        }
      }
    }, 30000); // Check every 30 seconds for better accuracy
    return () => clearInterval(interval);
  }, [times, settings]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Tarayıcınız konum özelliğini desteklemiyor.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocoding to find city/district using Nominatim (OpenStreetMap)
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=tr`);
          const data = await res.json();
          
          const address = data.address;
          // Nominatim address fields vary, try common ones for Turkey
          // Province is usually the main city (e.g. Istanbul)
          const city = address.province || address.city || address.state;
          // District can be in several fields
          const district = address.town || address.city_district || address.district || address.suburb || address.village;

          if (city) {
            // Try to match with CITIES_DATA
            const matchedCity = Object.keys(CITIES_DATA).find(c => 
              c.toLocaleLowerCase('tr').includes(city.toLocaleLowerCase('tr')) || 
              city.toLocaleLowerCase('tr').includes(c.toLocaleLowerCase('tr'))
            );

            if (matchedCity) {
              const newSettings = { ...settings, city: matchedCity, district: 'Merkez' };
              
              // Try to find district if possible
              if (district) {
                const matchedDistrict = CITIES_DATA[matchedCity].find(d => 
                  d.toLocaleLowerCase('tr').includes(district.toLocaleLowerCase('tr')) ||
                  district.toLocaleLowerCase('tr').includes(d.toLocaleLowerCase('tr'))
                );
                if (matchedDistrict) {
                  newSettings.district = matchedDistrict;
                }
              }
              
              setSettings(newSettings);
              localStorage.setItem('userSettings', JSON.stringify(newSettings));
              // fetchTimes will be triggered by useEffect due to settings change
            } else {
              alert(`Konum belirlendi: ${city}. Ancak şehir listemizde tam eşleşme bulunamadı.`);
              setLoading(false);
            }
          } else if (district) {
            // Sometimes only district is returned clearly, try to find which city it belongs to
            let foundCity = '';
            let foundDistrict = '';
            
            for (const [cityName, districts] of Object.entries(CITIES_DATA)) {
              const match = districts.find(d => 
                d.toLocaleLowerCase('tr').includes(district.toLocaleLowerCase('tr')) ||
                district.toLocaleLowerCase('tr').includes(d.toLocaleLowerCase('tr'))
              );
              if (match) {
                foundCity = cityName;
                foundDistrict = match;
                break;
              }
            }

            if (foundCity) {
              const newSettings = { ...settings, city: foundCity, district: foundDistrict };
              setSettings(newSettings);
              localStorage.setItem('userSettings', JSON.stringify(newSettings));
            } else {
              alert("Konum belirlendi ancak uygun şehir/ilçe eşleşmesi bulunamadı.");
              setLoading(false);
            }
          } else {
            alert("Konum bilgisi (şehir/ilçe) alınamadı.");
            setLoading(false);
          }
        } catch (err) {
          console.error("Location error:", err);
          alert("Konum bilgisi alınırken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.");
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let msg = "Konum alınamadı.";
        if (error.code === 1) msg = "Konum izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.";
        else if (error.code === 2) msg = "Konum bilgisi mevcut değil.";
        else if (error.code === 3) msg = "Konum alma zaman aşımına uğradı.";
        alert(msg);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    const handleDetect = () => detectLocation();
    window.addEventListener('detect-location', handleDetect);
    return () => window.removeEventListener('detect-location', handleDetect);
  }, [settings]); // Re-bind when settings change to ensure correct closure

  const renderContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {(() => {
            switch (activeTab) {
              case 'home': return <HomeScreen times={times} loading={loading} error={error} settings={settings} onRefresh={fetchTimes} onDetectLocation={detectLocation} />;
              case 'quran': return <QuranScreen />;
              case 'tools': return <ToolsScreen />;
              case 'settings': return <SettingsScreen settings={settings} setSettings={setSettings} sendNotification={sendNotification} />;
              default: return <HomeScreen />;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="h-[100dvh] bg-slate-50 relative max-w-md mx-auto shadow-2xl overflow-hidden flex flex-col">
      {activeTab !== 'home' && (
        <Header title={activeTab === 'quran' ? "Kur'an-ı Kerim" : activeTab === 'tools' ? 'Araçlar' : 'Ayarlar'} />
      )}
      <main className="flex-1 overflow-y-auto no-scrollbar">{renderContent()}</main>
      
      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
        <AdBanner />
        <div className="bg-white/80 backdrop-blur-xl border-t border-gray-100 px-6 py-3 flex justify-between items-center pb-safe">
          {[
            { id: 'home', icon: <Home size={22} />, label: 'Ana Sayfa' },
            { id: 'quran', icon: <BookOpen size={22} />, label: 'Kur\'an' },
            { id: 'tools', icon: <Menu size={22} />, label: 'Araçlar' },
            { id: 'settings', icon: <Settings size={22} />, label: 'Ayarlar' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`flex flex-col items-center transition-all duration-300 relative ${activeTab === tab.id ? 'text-teal-700 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -top-2 w-8 h-1 bg-teal-700 rounded-full"
                />
              )}
              {tab.icon}
              <span className={`text-[10px] font-bold mt-1 uppercase tracking-tighter ${activeTab === tab.id ? 'opacity-100' : 'opacity-60'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);