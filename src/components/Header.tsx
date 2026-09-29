import React from 'react';
import { Palette, Plus, Download, BarChart3, Settings } from 'lucide-react';
import { Artwork, StudioProfile } from '../types/artwork';

interface HeaderProps {
  artworks: Artwork[];
  studioProfile: StudioProfile;
  onOpenNewArtworkModal: () => void;
  onOpenStatsModal: () => void;
  onOpenBackupModal: () => void;
  onOpenProfileModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  artworks,
  studioProfile,
  onOpenNewArtworkModal,
  onOpenStatsModal,
  onOpenBackupModal,
  onOpenProfileModal,
}) => {
  // Statistiche rapide calcolate in tempo reale
  const totalArtworks = artworks.length;
  const inBottega = artworks.filter(a => a.status === 'bottega').length;
  const inMostra = artworks.filter(a => a.status === 'mostra').length;
  const vendute = artworks.filter(a => a.status === 'venduto').length;
  
  // Valore economico opere attualmente in bottega (disponibili per la vendita)
  const availableValue = artworks
    .filter(a => a.status === 'bottega' || a.status === 'mostra')
    .reduce((sum, a) => sum + (Number(a.price) || 0), 0);

  const formattedValue = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(availableValue);

  return (
    <>
      <header className="header-bar">
        <div className="header-content">
          <div className="header-brand-wrap">
            <div className="logo-section" onClick={onOpenProfileModal} title="Clicca per modificare i dati della bottega o dell'artista">
              <div className="logo-icon-wrapper">
                <Palette size={22} color="#c5a059" />
              </div>
              <div className="logo-text">
                <h1>OPERAVIVA</h1>
                <p>
                  {[studioProfile.studioName, studioProfile.artistName].filter(Boolean).join(' • ') || "ARCHIVIO PERSONALE D'ARTE"}
                </p>
              </div>
            </div>

            {/* Pulsante Impostazioni dedicato per mobile in alto a destra */}
            <button 
              className="btn-icon header-settings-btn mobile-only-btn"
              onClick={onOpenProfileModal}
              id="btn-profile-mobile"
              title="Impostazioni Bottega & Artista"
              aria-label="Impostazioni Bottega & Artista"
            >
              <Settings size={18} />
            </button>
          </div>

          <div className="header-actions">
            <button 
              className="btn btn-primary btn-add-main"
              onClick={onOpenNewArtworkModal}
              id="btn-add-artwork"
              title="Aggiungi una nuova opera all'inventario"
            >
              <Plus size={17} />
              <span>Nuova Opera</span>
            </button>

            <button 
              className="btn btn-secondary header-btn-secondary"
              onClick={onOpenStatsModal}
              id="btn-stats"
              title="Riepilogo statistiche bottega e valore economico"
            >
              <BarChart3 size={15} />
              <span>Statistiche</span>
            </button>

            <button 
              className="btn btn-secondary header-btn-secondary"
              onClick={onOpenBackupModal}
              id="btn-backup"
              title="Esporta o importa catalogo completo con foto (.artvault / CSV)"
            >
              <Download size={15} />
              <span>Archivio & Backup</span>
            </button>

            {/* Pulsante Impostazioni visibile su desktop */}
            <button 
              className="btn-icon header-settings-btn desktop-only-btn"
              onClick={onOpenProfileModal}
              id="btn-profile"
              title="Impostazioni Bottega & Artista"
              aria-label="Impostazioni Bottega & Artista"
            >
              <Settings size={17} />
            </button>
          </div>
        </div>
      </header>

      {/* Fascia Curatoriale d'Atelier (Sostituisce il look da dashboard AI) */}
      <div className="curator-summary-bar">
        <div className="curator-counts">
          <span className="curator-label">Archivio Generale:</span>
          <strong>{totalArtworks} opere</strong>
          <span className="curator-sep">/</span>
          <span>{inBottega} in bottega</span>
          <span className="curator-sep">/</span>
          <span>{inMostra} in esposizione</span>
          {vendute > 0 && (
            <>
              <span className="curator-sep">/</span>
              <span>{vendute} in collezioni private</span>
            </>
          )}
        </div>
        <div className="curator-value">
          <span>Stima opere disponibili:</span>
          <strong>{formattedValue}</strong>
        </div>
      </div>
    </>
  );
};
