import React from 'react';
import { MapPin, Award, Image as ImageIcon } from 'lucide-react';
import { Artwork, ArtworkStatus } from '../types';

interface ArtworkCardProps {
  artwork: Artwork;
  onClick: () => void;
}

const STATUS_LABELS: Record<ArtworkStatus, { label: string; className: string }> = {
  bottega: { label: 'In Bottega', className: 'status-bottega' },
  mostra: { label: 'In Mostra', className: 'status-mostra' },
  venduto: { label: 'Venduto', className: 'status-venduto' },
  prestito: { label: 'In Prestito', className: 'status-prestito' },
  in_corso: { label: 'In Lavorazione', className: 'status-corso' }
};

export const ArtworkCard: React.FC<ArtworkCardProps> = ({ artwork, onClick }) => {
  const statusInfo = STATUS_LABELS[artwork.status] || { label: artwork.status, className: 'status-bottega' };
  const coverImage = artwork.images && artwork.images.length > 0 ? artwork.images[0] : null;

  return (
    <div className="artwork-card" onClick={onClick}>
      {/* Immagine con badge sovrapposti */}
      <div className="card-image-wrapper">
        {coverImage ? (
          <img src={coverImage} alt={artwork.title} className="card-image" loading="lazy" />
        ) : (
          <div className="card-image-placeholder">
            <ImageIcon size={32} />
            <span>Nessuna foto</span>
          </div>
        )}

        <div className={`card-status-badge ${statusInfo.className}`}>
          {statusInfo.label}
        </div>

        {artwork.certificateNumber && (
          <div className="card-cert-badge" title={`Certificato d'Autenticità N. ${artwork.certificateNumber}`}>
            <Award size={14} />
          </div>
        )}
      </div>

      {/* Contenuto Card */}
      <div className="card-content">
        <div className="card-meta-top">
          <span className="card-code">{artwork.code}</span>
          <span className="card-year">{artwork.year}</span>
        </div>

        <h3 className="card-title" title={artwork.title}>{artwork.title}</h3>

        <p className="card-technique">
          {artwork.technique} {artwork.support ? `• ${artwork.support}` : ''}
        </p>

        <div className="card-dimensions">
          {artwork.dimensions.height} × {artwork.dimensions.width} cm
          {artwork.dimensions.depth ? ` × ${artwork.dimensions.depth} cm` : ''}
          {artwork.framed && ' (Incorniciato)'}
        </div>

        <div className="card-footer">
          <div className="card-price">
            {artwork.status === 'venduto' ? (
              <span className="sold-indicator">Venduto</span>
            ) : artwork.price > 0 ? (
              <span>{artwork.price.toLocaleString('it-IT')} €</span>
            ) : (
              <span className="price-reserved">Trattativa</span>
            )}
          </div>

          {artwork.location && (
            <div className="card-location" title={artwork.location}>
              <MapPin size={13} />
              <span>{artwork.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
