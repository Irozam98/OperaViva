export type ArtworkStatus = 'bottega' | 'mostra' | 'venduto' | 'prestito' | 'in_corso';

export interface ArtworkDimensions {
  height: number; // cm
  width: number;  // cm
  depth?: number; // cm (opzionale per sculture o spessore tela)
}

export interface Artwork {
  id: string;
  code: string;                 // es. "ART-001"
  title: string;                // Titolo del quadro
  artist: string;               // Artista / Autore
  year: number;                 // Anno di realizzazione
  technique: string;            // es. "Olio su tela", "Acrilico", "Acquerello", "Mista"
  support: string;              // es. "Telaio in lino", "Tavola in legno", "Carta cotone"
  dimensions: ArtworkDimensions;
  framed: boolean;              // Incorniciato sì/no
  frameDetails?: string;        // Tipo cornice
  price: number;                // Prezzo (€)
  minPrice?: number;            // Prezzo minimo riservato / trattabile
  currency: string;             // "EUR", "USD", etc.
  status: ArtworkStatus;        // Dove si trova lo stato: Bottega, Mostra, Venduto, ecc.
  location: string;             // Posizione specifica (es: "Bottega - Parete Nord", "Galleria Duomo", "Studio")
  locationNotes?: string;       // Note sulla collocazione (es. "Cavalletto n. 2", "In mostra fino al 30 Ottobre")
  notes?: string;               // Descrizione artistica, note critiche, ispirazione
  certificateNumber?: string;   // Numero certificato autenticità o archivio
  buyerName?: string;           // Se venduto o riservato: nome cliente/galleria
  buyerContact?: string;        // Recapito acquirente
  soldDate?: string;            // Data di vendita
  images: string[];             // Array di immagini (base64 o data URL). images[0] è la copertina principale
  createdAt: string;            // Data inserimento ISO
  updatedAt: string;            // Ultimo aggiornamento ISO
}

export interface StudioProfile {
  studioName: string;           // Nome della bottega o atelier
  artistName: string;           // Nome dell'artista principale
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  address?: string;
  currency: string;             // default "€"
  catalogPrefix: string;        // default "ART-"
}

export type SortOption = 
  | 'date_desc' 
  | 'date_asc' 
  | 'price_desc' 
  | 'price_asc' 
  | 'title_asc' 
  | 'year_desc' 
  | 'dimensions_desc';

export interface FilterState {
  searchQuery: string;
  status: ArtworkStatus | 'all';
  location: string;
  technique: string;
  minPrice: number;
  maxPrice: number;
  sortBy: SortOption;
  onlyFramed: boolean;
}
