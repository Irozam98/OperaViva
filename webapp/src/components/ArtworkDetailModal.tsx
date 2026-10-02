import React from 'react';
import { X, Edit3, Trash2, Award, MapPin, Tag, Calendar, Image as ImageIcon } from 'lucide-react';
import { Artwork } from '../types';

interface ArtworkDetailModalProps {
  artwork: Artwork | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (artwork: Artwork) => void;
  onDelete: (id: string) => void;
  onOpenCertificate: (artwork: Artwork) => void;
}

export const ArtworkDetailModal: React.FC<ArtworkDetailModalProps> = ({
  artwork,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onOpenCertificate
}) => {
  if (!isOpen || !artwork) return null;

  const coverImage = artwork.images && artwork.images.length > 0 ? artwork.images[0] : null;

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog modal-xl">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="code-badge">{artwork.code}</span>
            <h2>{artwork.title}</h2>
          </div>
          <button type="button" className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="detail-layout">
          {/* Colonna Immagine */}
          <div className="detail-image-col">
            {coverImage ? (
              <div className="detail-image-box">
                <img src={coverImage} alt={artwork.title} className="detail-main-img" />
              </div>
            ) : (
              <div className="detail-image-placeholder">
                <ImageIcon size={64} />
                <span>Nessuna fotografia archiviata</span>
              </div>
            )}

            {artwork.images && artwork.images.length > 1 && (
              <div className="detail-thumbs-strip">
                {artwork.images.map((img, i) => (
                  <img key={i} src={img} alt={`Dettaglio ${i + 1}`} className="thumb-item" />
                ))}
              </div>
            )}
          </div>

          {/* Colonna Scheda Tecnica */}
          <div className="detail-info-col">
            <div className="info-section">
              <h4 className="info-title">Scheda Tecnica d'Autore</h4>
              
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Anno:</span>
                  <span className="info-val">{artwork.year}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">Tecnica:</span>
                  <span className="info-val">{artwork.technique}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">Supporto:</span>
                  <span className="info-val">{artwork.support}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">Dimensioni:</span>
                  <span className="info-val highlight">
                    {artwork.dimensions.height} × {artwork.dimensions.width} cm
                    {artwork.dimensions.depth ? ` (prof. ${artwork.dimensions.depth} cm)` : ''}
                  </span>
                </div>

                <div className="info-item">
                  <span className="info-label">Cornice:</span>
                  <span className="info-val">
                    {artwork.framed ? `Sì (${artwork.frameDetails || 'Inclusa'})` : 'No (Senza cornice)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h4 className="info-title">Collocazione & Stato Economico</h4>

              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Stato:</span>
                  <span className={`status-pill status-${artwork.status}`}>
                    {artwork.status.toUpperCase()}
                  </span>
                </div>

                <div className="info-item">
                  <span className="info-label">Collocazione:</span>
                  <span className="info-val"><MapPin size={14} className="gold-icon" /> {artwork.location}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">Prezzo Ufficiale:</span>
                  <span className="info-val price-val">
                    {artwork.price ? `${artwork.price.toLocaleString('it-IT')} €` : 'Riservato'}
                  </span>
                </div>

                {artwork.minPrice ? (
                  <div className="info-item">
                    <span className="info-label">Prezzo Minimo Riservato:</span>
                    <span className="info-val text-muted">{artwork.minPrice.toLocaleString('it-IT')} €</span>
                  </div>
                ) : null}
              </div>
            </div>

            {artwork.notes && (
              <div className="info-section">
                <h4 className="info-title">Note & Ispirazione Critica</h4>
                <p className="detail-notes">{artwork.notes}</p>
              </div>
            )}

            {/* Barra Azioni */}
            <div className="detail-actions-bar">
              <button
                type="button"
                className="btn-cert-action"
                onClick={() => onOpenCertificate(artwork)}
              >
                <Award size={18} />
                <span>Certificato d'Autenticità</span>
              </button>

              <button
                type="button"
                className="btn-edit-action"
                onClick={() => onEdit(artwork)}
              >
                <Edit3 size={18} />
                <span>Modifica</span>
              </button>

              <button
                type="button"
                className="btn-delete-action"
                onClick={() => {
                  if (confirm(`Sei sicuro di voler eliminare definitivamente "${artwork.title}"?`)) {
                    onDelete(artwork.id);
                  }
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
