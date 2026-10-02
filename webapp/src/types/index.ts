export type ArtworkStatus = 'bottega' | 'mostra' | 'venduto' | 'prestito' | 'in_corso';

export interface ArtworkDimensions {
  height: number; // cm
  width: number;  // cm
  depth?: number; // cm
}

export interface Artwork {
  id: string;
  code: string;                 // es. "OPV-101"
  title: string;
  artist?: string;
  year: number;
  technique: string;
  support: string;
  dimensions: ArtworkDimensions;
  framed: boolean;
  frameDetails?: string;
  price: number;
  minPrice?: number;
  currency: string;
  status: ArtworkStatus;
  location: string;
  locationNotes?: string;
  notes?: string;
  certificateNumber?: string;
  buyerName?: string;
  buyerContact?: string;
  soldDate?: string;
  images: string[];             // Cloudflare R2 URLs or optimized WebP data URLs
  createdAt: string;
  updatedAt: string;
}

export interface ArtistProfile {
  id: string;
  email: string;
  studioName: string;
  artistName: string;
  phone?: string;
  website?: string;
  city?: string;
  currency: string;
  catalogPrefix: string;
  createdAt?: string;
}

export interface AuthState {
  token: string | null;
  artist: ArtistProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
