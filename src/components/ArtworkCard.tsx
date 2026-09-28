import React from 'react';
import { MapPin, Maximize2, Calendar, Layers } from 'lucide-react';
import { Artwork, ArtworkStatus } from '../types/artwork';

interface ArtworkCardProps {
  artwork: Artwork;
  onSelect: (artwork: Artwork) => void;
}

const statusLabels: Record<ArtworkStatus, { label: string; className: string }> = {
  bottega: { label: 'In Bottega', className: 'badge-bottega' },
  mostra: { label: 'In Mostra', className: 'badge-mostra' },
  venduto: { label: 'Venduto', className: 'badge-venduto' },
  prestito: { label: 'In Prestito', className: 'badge-prestito' },
  in_corso: { label: 'In Lavorazione', className: 'badge-in_corso' }
};

export const ArtworkCard: React.FC<ArtworkCardProps> = ({ artwork, onSelect }) => {
  const statusInfo = statusLabels[artwork.status] || { label: artwork.status, className: 'badge-bottega' };
  
  const formattedPrice = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(artwork.price || 0);

  const mainImage = artwork.images && artwork.images.length > 0 
    ? artwork.images[0] 
    : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%231a1e29"/><text x="50%" y="50%" fill="%23d4af37" font-family="sans-serif" font-size="16" text-anchor="middle">Nessuna Immagine</text></svg>';

  const dimText = `${artwork.dimensions?.height || 0} × ${artwork.dimensions?.width || 0}${
    artwork.dimensions?.depth ? ` × ${artwork.dimensions.depth}` : ''
  } cm`;

  return (
    <div 
      className="art-card" 
      onClick={() => onSelect(artwork)}
      id={`card-${artwork.id}`}
    >
      <div className="art-card-image-wrap">
        <img 
          src={mainImage} 
          alt={artwork.title} 
          className="art-card-img" 
          loading="lazy" 
        />
        
        <div className="art-card-code-tag">
          {artwork.code || 'Senza Codice'}
        </div>

        <div className={`art-card-status-badge ${statusInfo.className}`}>
          <span className="status-dot"></span>
          <span>{statusInfo.label}</span>
        </div>
      </div>

      <div className="art-card-body">
        <div className="art-card-header-line">
          <span className="art-card-code">{artwork.code || 'CATALOGO'}</span>
          <span className="art-card-year">{artwork.year || ''}</span>
        </div>

        <h3 className="art-card-title" title={artwork.title}>
          {artwork.title}
        </h3>

        <div className="art-card-artist-sub">
          {artwork.artist || 'Artista Bottega'}
        </div>

        <div className="art-card-tech-line">
          <span>{artwork.technique || 'Tecnica su tela'}</span>
          <span className="bullet-sep">·</span>
          <span>{dimText}</span>
        </div>

        {artwork.location && (
          <div className="art-card-location-line" title={`Collocazione attuale: ${artwork.location}`}>
            <MapPin size={13} className="loc-pin-icon" />
            <span>{artwork.location}</span>
          </div>
        )}

        <div className="art-card-footer">
          <div className="art-card-price-block">
            <span className="price-label">
              {artwork.status === 'venduto' ? 'Prezzo finale' : 'Quotazione'}
            </span>
            <span className="art-card-price">
              {formattedPrice}
            </span>
          </div>

          <div className="art-card-action-hint">
            {artwork.status === 'venduto' ? (
              <span className="sold-indicator">Collezione Privata</span>
            ) : (
              <span className="detail-link">Scheda opera →</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
