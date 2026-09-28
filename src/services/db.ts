import Dexie, { Table } from 'dexie';
import { Artwork, StudioProfile } from '../types/artwork';
import { DEFAULT_STUDIO_PROFILE, INITIAL_ARTWORKS } from './sampleData';

export class ArtVaultDatabase extends Dexie {
  artworks!: Table<Artwork, string>;
  settings!: Table<{ key: string; value: any }, string>;

  constructor() {
    super('ArtVaultDB');
    this.version(1).stores({
      artworks: 'id, code, title, artist, year, technique, status, location, price, createdAt',
      settings: 'key'
    });
  }
}

export const db = new ArtVaultDatabase();

// Inizializza le impostazioni base se non ancora presenti
export async function initializeDatabase(): Promise<void> {
  try {
    const profile = await db.settings.get('studioProfile');
    if (!profile) {
      await db.settings.put({ key: 'studioProfile', value: DEFAULT_STUDIO_PROFILE });
    }
  } catch (error) {
    console.error('Errore durante inizializzazione database:', error);
  }
}

// Helper per ottenere tutte le opere
export async function getAllArtworks(): Promise<Artwork[]> {
  try {
    return await db.artworks.toArray();
  } catch (e) {
    console.error('Errore lettura opere:', e);
    return [];
  }
}

// Salva o aggiorna un'opera
export async function saveArtwork(artwork: Artwork): Promise<void> {
  artwork.updatedAt = new Date().toISOString();
  await db.artworks.put(artwork);
}

// Elimina un'opera
export async function deleteArtwork(id: string): Promise<void> {
  await db.artworks.delete(id);
}

// Ottieni profilo bottega
export async function getStudioProfile(): Promise<StudioProfile> {
  const item = await db.settings.get('studioProfile');
  return item ? (item.value as StudioProfile) : DEFAULT_STUDIO_PROFILE;
}

// Aggiorna profilo bottega
export async function saveStudioProfile(profile: StudioProfile): Promise<void> {
  await db.settings.put({ key: 'studioProfile', value: profile });
}

// Reimposta o svuota i dati
export async function resetDatabaseWithSamples(): Promise<void> {
  await db.artworks.clear();
  await db.artworks.bulkAdd(INITIAL_ARTWORKS);
  await db.settings.put({ key: 'studioProfile', value: DEFAULT_STUDIO_PROFILE });
}

export async function clearAllArtworks(): Promise<void> {
  await db.artworks.clear();
}
