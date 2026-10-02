import { Artwork, ArtistProfile } from '../types';

const TOKEN_KEY = 'operaviva_cloud_token';
const MOCK_STORAGE_KEY = 'operaviva_mock_cloud_data';

// Helper Token
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 404 || response.status === 502) {
        return handleMockFallback<T>(endpoint, options);
      }
      throw new Error(data?.error || `Errore server (${response.status})`);
    }

    return data as T;
  } catch (error: any) {
    // Se la chiamata fallisce per connessione assente (es. Vite dev senza backend Pages attivo)
    return handleMockFallback<T>(endpoint, options);
  }
}

// ==========================================
// MOCK FALLBACK PER TEST IMMEDIATO IN LOCALE
// ==========================================
function getMockData() {
  const raw = localStorage.getItem(MOCK_STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  const initial = {
    artist: {
      id: 'demo-artist-1',
      email: 'bottega.maestro@arte.it',
      studioName: 'Atelier Maestri del Colore',
      artistName: 'Marzio Sparla',
      currency: 'EUR',
      catalogPrefix: 'OPV-'
    },
    artworks: [
      {
        id: 'mock-1',
        code: 'OPV-101',
        title: 'Armonia d\'Autunno in Laguna',
        artist: 'Marzio Sparla',
        year: 2026,
        technique: 'Olio su tela',
        support: 'Telaio in lino maestoso',
        dimensions: { height: 100, width: 80, depth: 3.5 },
        framed: true,
        frameDetails: 'Oro Barocco Anticato',
        price: 2800,
        minPrice: 2400,
        currency: 'EUR',
        status: 'bottega',
        location: 'Cavalletto d\'Onore - Atelier',
        notes: 'Lavoro materico realizzato a spatola con velature dorate.',
        certificateNumber: 'CERT-2026-001',
        images: ['https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'mock-2',
        code: 'OPV-102',
        title: 'Geometrie di Luce nel Silenzio',
        artist: 'Marzio Sparla',
        year: 2025,
        technique: 'Acrilico e pigmenti puri',
        support: 'Tavola preparata a gesso',
        dimensions: { height: 60, width: 60, depth: 2 },
        framed: false,
        price: 1650,
        currency: 'EUR',
        status: 'mostra',
        location: 'Galleria San Marco (Venezia)',
        notes: 'Esposto alla Biennale degli Artisti Contemporanei.',
        certificateNumber: 'CERT-2025-042',
        images: ['https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  };
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function handleMockFallback<T>(endpoint: string, options: RequestInit): T {
  const store = getMockData();

  if (endpoint.includes('/api/auth/login')) {
    return {
      requires2FA: true,
      tempToken: 'mock-temp-token',
      artistName: store.artist.artistName
    } as T;
  }

  if (endpoint.includes('/api/auth/register')) {
    return {
      success: true,
      tempToken: 'mock-temp-token',
      totpSecret: 'JBSWY3DPEHPK3PXP',
      otpauthUri: 'otpauth://totp/OperaViva:demo?secret=JBSWY3DPEHPK3PXP&issuer=OperaViva',
      artist: store.artist
    } as T;
  }

  if (endpoint.includes('/api/auth/verify-2fa')) {
    return {
      success: true,
      token: 'mock-jwt-token-7days',
      artist: store.artist
    } as T;
  }

  if (endpoint.includes('/api/auth/me')) {
    return { artist: store.artist } as T;
  }

  if (endpoint.includes('/api/artworks') && (!options.method || options.method === 'GET')) {
    return { artworks: store.artworks } as T;
  }

  if (endpoint.includes('/api/upload')) {
    return {
      success: true,
      url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80'
    } as T;
  }

  return { success: true } as T;
}

// ==========================================
// CHIAMATE API UFFICIALI
// ==========================================
export const api = {
  // Autenticazione & 2FA
  async register(data: { email: string; password: string; studioName: string; artistName: string; city?: string }) {
    return request<{
      success: boolean;
      tempToken: string;
      totpSecret: string;
      otpauthUri: string;
      artist: ArtistProfile;
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async login(email: string, password: string) {
    return request<{
      requires2FA: boolean;
      tempToken: string;
      artistName: string;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async verify2FA(tempToken: string, code: string) {
    return request<{
      success: boolean;
      token: string;
      artist: ArtistProfile;
    }>('/api/auth/verify-2fa', {
      method: 'POST',
      body: JSON.stringify({ tempToken, code })
    });
  },

  async getMe() {
    return request<{ artist: ArtistProfile }>('/api/auth/me');
  },

  async updateProfile(profile: Partial<ArtistProfile>) {
    return request<{ success: boolean; message: string }>('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify(profile)
    });
  },

  // Opere
  async getArtworks(params?: { status?: string; q?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.q) query.set('q', params.q);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ artworks: Artwork[] }>(`/api/artworks${qs}`);
  },

  async getArtwork(id: string) {
    return request<{ artwork: Artwork }>(`/api/artworks/${id}`);
  },

  async createArtwork(artwork: Partial<Artwork>) {
    return request<{ success: boolean; id: string }>('/api/artworks', {
      method: 'POST',
      body: JSON.stringify(artwork)
    });
  },

  async updateArtwork(id: string, artwork: Partial<Artwork>) {
    return request<{ success: boolean; message: string }>(`/api/artworks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(artwork)
    });
  },

  async deleteArtwork(id: string) {
    return request<{ success: boolean; message: string }>(`/api/artworks/${id}`, {
      method: 'DELETE'
    });
  },

  // Upload Immagini su Cloudflare R2
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ success: boolean; url: string; key: string; sizeBytes: number }>('/api/upload', {
      method: 'POST',
      body: formData
    });
  }
};
