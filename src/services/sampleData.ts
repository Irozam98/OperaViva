import { Artwork, StudioProfile } from '../types/artwork';

export const DEFAULT_STUDIO_PROFILE: StudioProfile = {
  studioName: "Atelier d'Arte Sokke",
  artistName: "Giuseppe Sparla & Sandra Niviano",
  city: "Castellammare di Stabia (NA)",
  address: "Bottega d'Arte & Restauro",
  email: "info@artesokke.com",
  phone: "+39 081 1234567",
  website: "www.artesokke.com",
  currency: "€",
  catalogPrefix: "SOKKE-"
};

export const INITIAL_ARTWORKS: Artwork[] = [
  {
    id: "sokke-1",
    code: "SOKKE-001",
    title: "L'Inizio della Carica delle Guide",
    artist: "Giuseppe Sparla",
    year: 2019,
    technique: "Olio su tela (Grande Formato)",
    support: "Telaio in lino maestoso da museo",
    dimensions: {
      height: 240,
      width: 180,
      depth: 4.5
    },
    framed: true,
    frameDetails: "Cornice museale artigianale",
    price: 8500,
    minPrice: 7500,
    currency: "EUR",
    status: "bottega",
    location: "Bottega - Parete d'Onore",
    locationNotes: "Opera monumentale presentata con prolusione critica del Dott. Ferdinando Creta",
    notes: "Opera monumentale celebrativa della Regia Cavalleria e del Reggimento Guide. Composizione dinamica ad altissima tensione cromatica, con studio rigoroso delle divise storiche e del moto dei cavalli in carica.",
    certificateNumber: "SOKKE-CERT-2019-001",
    images: [
      "./gallery/art_19.jpg"
    ],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: "sokke-2",
    code: "SOKKE-002",
    title: "Amore Sacro e Profano",
    artist: "Giuseppe Sparla",
    year: 2021,
    technique: "Olio su tela",
    support: "Telaio in lino",
    dimensions: {
      height: 160,
      width: 60,
      depth: 3.5
    },
    framed: true,
    frameDetails: "Cornice dorata su misura",
    price: 3800,
    minPrice: 3400,
    currency: "EUR",
    status: "venduto",
    location: "Collezione Privata",
    locationNotes: "Acquisito da collezionista privato con certificato ufficiale",
    buyerName: "Collezionista Privato",
    buyerContact: "Napoli",
    soldDate: "2024-05-18",
    notes: "Ispirata all'archetipo tizianesco ma reinterpretata con sensibilità contemporanea. Il contrasto eterno tra passione terrena e purezza spirituale prende corpo nella composizione verticale slanciata.",
    certificateNumber: "SOKKE-CERT-2021-018",
    images: [
      "./gallery/art_08.jpg"
    ],
    createdAt: new Date(Date.now() - 50 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: "sokke-3",
    code: "SOKKE-003",
    title: "Bacco (Omaggio a Caravaggio)",
    artist: "Giuseppe Sparla",
    year: 2022,
    technique: "Olio su tela (Metodo Antico Caravaggesco)",
    support: "Tela di lino a trama fitta",
    dimensions: {
      height: 80,
      width: 60,
      depth: 3
    },
    framed: true,
    frameDetails: "Cornice in legno scuro e filetto oro",
    price: 2900,
    minPrice: 2500,
    currency: "EUR",
    status: "bottega",
    location: "Bottega - Cavalletto Centrale",
    locationNotes: "In esposizione centrale per visite collezionisti",
    notes: "Omaggio magistrale al maestro Michelangelo Merisi da Caravaggio. Realizzato secondo le antiche tecniche delle velature e imprimitura a terra scura, con straordinaria resa del calice vitreo e della canestra di frutta.",
    certificateNumber: "SOKKE-CERT-2022-044",
    images: [
      "./gallery/art_16.jpg"
    ],
    createdAt: new Date(Date.now() - 70 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: "sokke-4",
    code: "SOKKE-004",
    title: "Caccia alla volpe",
    artist: "Giuseppe Sparla",
    year: 2020,
    technique: "Olio su tela (Velature e Chiaroscuro)",
    support: "Telaio in legno massello",
    dimensions: {
      height: 90,
      width: 70,
      depth: 3
    },
    framed: true,
    frameDetails: "Cornice stile inglese d'epoca",
    price: 3200,
    minPrice: 2800,
    currency: "EUR",
    status: "mostra",
    location: "Galleria d'Arte - Sala Maestri",
    locationNotes: "In mostra temporanea fino al mese prossimo",
    notes: "Raffigurazione dinamica e raffinata della caccia alla volpe con muta di segugi e cavalieri in giacca rossa. Paesaggio boschivo trattato con tonalità calde e atmosferiche.",
    certificateNumber: "SOKKE-CERT-2020-022",
    images: [
      "./gallery/art_15.jpg"
    ],
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 86400000).toISOString()
  },
  {
    id: "sokke-5",
    code: "SOKKE-005",
    title: "Marinai in festa (Omaggio a G. Gigante)",
    artist: "Giuseppe Sparla",
    year: 2023,
    technique: "Olio su tela",
    support: "Pannello in lino belga",
    dimensions: {
      height: 70,
      width: 100,
      depth: 3
    },
    framed: true,
    frameDetails: "Cornice dorata a cassetta",
    price: 3600,
    minPrice: 3200,
    currency: "EUR",
    status: "bottega",
    location: "Bottega - Parete Sud",
    locationNotes: "Posizione n. 3",
    notes: "Tributo alla scuola di Posillipo e a Giacinto Gigante. Atmosfera festosa della marina partenopea con contrasti solari tra il mare cobalto e le vesti popolari.",
    certificateNumber: "SOKKE-CERT-2023-012",
    images: [
      "./gallery/art_14.jpg"
    ],
    createdAt: new Date(Date.now() - 110 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    id: "sokke-6",
    code: "SOKKE-006",
    title: "Italia",
    artist: "Sandra Niviano",
    year: 2024,
    technique: "Olio su tela e pigmenti puri",
    support: "Telaio in lino",
    dimensions: {
      height: 100,
      width: 70,
      depth: 3
    },
    framed: false,
    frameDetails: "Bordi dipinti a vista da galleria",
    price: 2700,
    minPrice: 2300,
    currency: "EUR",
    status: "bottega",
    location: "Bottega - Atelier Sandra",
    locationNotes: "Cavalletto n. 1 studio femminile",
    notes: "Allegoria contemporanea dell'Italia personificata. Pennellate vibranti e sensibilità plastica unica che contraddistingue la poetica di Sandra Niviano.",
    certificateNumber: "SOKKE-CERT-2024-001",
    images: [
      "./gallery/art_18.jpg"
    ],
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: "sokke-7",
    code: "SOKKE-007",
    title: "Girasoli (Omaggio a Van Gogh)",
    artist: "Sandra Niviano",
    year: 2023,
    technique: "Olio su tela a spatola e corpo denso",
    support: "Telaio in legno naturale",
    dimensions: {
      height: 80,
      width: 60,
      depth: 3.5
    },
    framed: true,
    frameDetails: "Cornice in legno rovere sbiancato",
    price: 2400,
    minPrice: 2100,
    currency: "EUR",
    status: "bottega",
    location: "Bottega - Parete Est",
    locationNotes: "Sezione nature morte e studi floreali",
    notes: "Omaggio appassionato all'arte di Vincent Van Gogh. Materia pittorica ricca, corposa e plasmata a spatola, con impasti gialli caldi e toni ocra dorati che riflettono la luce con rilievo tridimensionale.",
    certificateNumber: "SOKKE-CERT-2023-088",
    images: [
      "./gallery/art_11.jpg"
    ],
    createdAt: new Date(Date.now() - 80 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: "sokke-8",
    code: "SOKKE-008",
    title: "Il Bacio dell'Angelo",
    artist: "Sandra Niviano",
    year: 2022,
    technique: "Olio su tela",
    support: "Telaio d'autore",
    dimensions: {
      height: 90,
      width: 70,
      depth: 3
    },
    framed: true,
    frameDetails: "Cornice classica dorata",
    price: 3100,
    minPrice: 2700,
    currency: "EUR",
    status: "in_corso",
    location: "Bottega - Cavalletto Lavorazione",
    locationNotes: "In fase di rifinitura velature finali e vernice protettiva",
    notes: "Raffigurazione simbolista ed eterea dell'unione mistica tra terra e cielo. Tonalità azzurre sfumate e chiaroscuri delicati.",
    certificateNumber: "SOKKE-CERT-2022-095",
    images: [
      "./gallery/art_12.jpg"
    ],
    createdAt: new Date(Date.now() - 100 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: "sokke-9",
    code: "SOKKE-009",
    title: "Restauro Dipinto Sec. XIX",
    artist: "Giuseppe Sparla",
    year: 2019,
    technique: "Restauro conservativo & Pittura a vernice",
    support: "Dipinto originale su tela dell'800 rintelato",
    dimensions: {
      height: 80,
      width: 60,
      depth: 2.5
    },
    framed: true,
    frameDetails: "Cornice coeva restaurata",
    price: 2500,
    minPrice: 2200,
    currency: "EUR",
    status: "bottega",
    location: "Bottega - Reparto Restauri",
    locationNotes: "Lavoro completato, documentazione fotografica disponibile",
    notes: "Intervento di pulitura, rimozione vernici ossidate, fermatura colore, rinteggiatura delle lacune a rigatino e verniciatura finale secondo le più severe norme di restauro museale.",
    certificateNumber: "SOKKE-REST-2019-003",
    images: [
      "./gallery/art_20.jpg"
    ],
    createdAt: new Date(Date.now() - 150 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: "sokke-10",
    code: "SOKKE-010",
    title: "Momenti di preghiera",
    artist: "Giuseppe Sparla",
    year: 2021,
    technique: "Olio su tela",
    support: "Telaio in abete e lino",
    dimensions: {
      height: 70,
      width: 50,
      depth: 2.5
    },
    framed: true,
    frameDetails: "Cornice a cassetta dorata",
    price: 2200,
    minPrice: 1900,
    currency: "EUR",
    status: "prestito",
    location: "Mostra 'Fede e Luce' - Salerno",
    locationNotes: "In prestito temporaneo per esposizione d'arte sacra",
    notes: "Scena intimista di devozione popolare. Studio magistrale della luce di una candela che scolpisce il volto e le mani giunte.",
    certificateNumber: "SOKKE-CERT-2021-033",
    images: [
      "./gallery/art_01.jpg"
    ],
    createdAt: new Date(Date.now() - 130 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 86400000).toISOString()
  }
];
