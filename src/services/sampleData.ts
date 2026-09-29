import { Artwork, StudioProfile } from '../types/artwork';

export const DEFAULT_STUDIO_PROFILE: StudioProfile = {
  studioName: '',
  artistName: '',
  city: '',
  address: '',
  email: '',
  phone: '',
  website: '',
  currency: 'EUR',
  catalogPrefix: 'OPV-'
};

// Catalogo iniziale pulito al 100% per la versione definitiva di produzione
export const SAMPLE_ARTWORKS: Artwork[] = [];
export const INITIAL_ARTWORKS: Artwork[] = [];
