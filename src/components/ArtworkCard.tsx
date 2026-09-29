import React from 'react';
import { MapPin, Check } from 'lucide-react';
import { Artwork, ArtworkStatus } from '../types/artwork';
import { useI18n } from '../i18n';

interface ArtworkCardProps {
  artwork: Artwork;
  onSelect: (artwork: Artwork) => void;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onToggleSelect?: (artworkId: string) => void;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({ 
  artwork, 
  onSelect,
  isSelected = false,
  isSelectionMode = false,
  onToggleSelect
}) => {
  const { t, language } = useI18n();

  const getStatusInfo = (status: ArtworkStatus) => {
    switch (status) {
      case 'bottega':
        return { label: t('statusBottega'), className: 'badge-bottega' };
      case 'mostra':
        return { label: t('statusMostra'), className: 'badge-mostra' };
      case 'venduto':
        return { label: t('statusVenduto'), className: 'badge-venduto' };
      case 'prestito':
        return { label: t('statusPrestito'), className: 'badge-prestito' };
      case 'in_corso':
        return { label: t('statusInCorso'), className: 'badge-in_corso' };
      default:
        return { label: status, className: 'badge-bottega' };
    }
  };

  const statusInfo = getStatusInfo(artwork.status);
  
  const artCurrency = /^[A-Z]{3}$/.test(artwork.currency ?? '') ? artwork.currency : 'EUR';
  const formattedPrice = new Intl.NumberFormat(language === 'it' ? 'it-IT' : 'en-US', {
    style: 'currency',
    currency: artCurrency,
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
      className={`art-card ${isSelected ? 'art-card-selected' : ''}`} 
      onClick={() => {
        if (isSelectionMode && onToggleSelect) {
          onToggleSelect(artwork.id);
        } else {
          onSelect(artwork);
        }
      }}
      id={`card-${artwork.id}`}
    >
      <div className="art-card-image-wrap">
        {/* Checkbox di Selezione Multipla */}
        <div 
          className={`art-card-select-checkbox ${isSelected ? 'selected' : ''} ${isSelectionMode ? 'active-mode' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect?.(artwork.id);
          }}
          title={isSelected ? "Deseleziona quest'opera" : "Seleziona per eliminazione multipla"}
        >
          {isSelected && <Check size={14} strokeWidth={3} />}
        </div>

        <img 
          src={mainImage} 
          alt={artwork.title} 
          className="art-card-img" 
          loading="lazy" 
        />
        
        <div className="art-card-code-tag" style={{ left: '2.65rem' }}>
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
              {artwork.status === 'venduto' ? (language === 'it' ? 'Prezzo finale' : 'Final price') : (language === 'it' ? 'Quotazione' : 'Value')}
            </span>
            <span className="art-card-price">
              {formattedPrice}
            </span>
          </div>

          <div className="art-card-action-hint">
            {artwork.status === 'venduto' ? (
              <span className="sold-indicator">{language === 'it' ? 'Collezione Privata' : 'Private Collection'}</span>
            ) : (
              <span className="detail-link">{language === 'it' ? 'Scheda opera →' : 'View record →'}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
