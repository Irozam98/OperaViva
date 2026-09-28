import React, { useState } from 'react';
import { X, Printer, Edit3, Trash2, MapPin, Calendar, Maximize2, Layers, Award, Tag, CheckCircle2, Crop, Sliders } from 'lucide-react';
import { Artwork, ArtworkStatus } from '../types/artwork';
import { ImageEditorModal } from './ImageEditorModal';

interface ArtworkDetailModalProps {
  artwork: Artwork;
  onClose: () => void;
  onEdit: (artwork: Artwork) => void;
  onDelete: (id: string) => void;
  onPrintCertificate: (artwork: Artwork) => void;
  onQuickUpdateStatus: (artwork: Artwork, newStatus: ArtworkStatus) => void;
  onQuickUpdateLocation: (artwork: Artwork, newLocation: string) => void;
  onUpdateImage: (artwork: Artwork, newImage: string, imageIndex: number) => void;
}

const statusLabels: Record<ArtworkStatus, { label: string; className: string }> = {
  bottega: { label: 'In Bottega / Studio', className: 'badge-bottega' },
  mostra: { label: 'In Mostra / Galleria', className: 'badge-mostra' },
  venduto: { label: 'Venduto', className: 'badge-venduto' },
  prestito: { label: 'In Prestito', className: 'badge-prestito' },
  in_corso: { label: 'In Lavorazione', className: 'badge-in_corso' }
};

export const ArtworkDetailModal: React.FC<ArtworkDetailModalProps> = ({
  artwork,
  onClose,
  onEdit,
  onDelete,
  onPrintCertificate,
  onQuickUpdateStatus,
  onQuickUpdateLocation,
  onUpdateImage
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [newLocationText, setNewLocationText] = useState(artwork.location || '');
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);

  const statusInfo = statusLabels[artwork.status] || { label: artwork.status, className: 'badge-bottega' };

  const formattedPrice = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(artwork.price || 0);

  const formattedMinPrice = artwork.minPrice 
    ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(artwork.minPrice)
    : null;

  const images = artwork.images && artwork.images.length > 0 ? artwork.images : [];
  const currentImage = images[activeImageIndex] || '';

  const handleSaveLocation = () => {
    if (newLocationText.trim()) {
      onQuickUpdateLocation(artwork, newLocationText.trim());
      setIsEditingLocation(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-card modal-card-lg" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '1050px', maxHeight: '92vh' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              color: 'var(--gold-400)', 
              background: 'rgba(212,175,55,0.1)', 
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              border: '1px solid var(--border-gold)'
            }}>
              {artwork.code}
            </span>
            <h2 className="modal-title">{artwork.title}</h2>
          </div>
          
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="detail-modal-grid">
            
            {/* Sezione Immagine & Galleria */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: '#07080c',
                border: '1px solid var(--border-medium)',
                aspectRatio: '4 / 3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-md)'
              }}>
                {currentImage ? (
                  <img 
                    src={currentImage} 
                    alt={artwork.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{ color: 'var(--text-muted)' }}>Nessuna foto disponibile</div>
                )}

                <div className={`art-card-status-badge ${statusInfo.className}`} style={{ top: '0.75rem', right: '0.75rem' }}>
                  <span className="status-dot"></span>
                  <span>{statusInfo.label}</span>
                </div>
              </div>

              {images.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
                  {images.map((img, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setActiveImageIndex(idx)}
                      style={{
                        width: '65px',
                        height: '65px',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: idx === activeImageIndex ? '2px solid var(--gold-400)' : '1px solid var(--border-subtle)',
                        opacity: idx === activeImageIndex ? 1 : 0.6,
                        flexShrink: 0
                      }}
                    >
                      <img src={img} alt={`Miniatura ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Tasto Editor per ritagliare e raddrizzare la foto */}
              {currentImage && (
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setIsImageEditorOpen(true)}
                  style={{ alignSelf: 'flex-start', marginTop: '0.2rem' }}
                  title="Apri l'editor per ritagliare i bordi, raddrizzare la foto o regolare i colori del dipinto"
                  id="btn-open-image-editor"
                >
                  <Crop size={15} color="#d4af37" />
                  <span>Ritocca / Ritaglia Foto</span>
                </button>
              )}

              {/* Box Collocazione e Stato Rapido */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-gold)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginTop: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold-400)', fontWeight: 600, fontSize: '0.9rem' }}>
                    <MapPin size={17} />
                    <span>Dov'è presente l'opera</span>
                  </div>
                  {!isEditingLocation ? (
                    <button 
                      className="btn-ghost btn-sm"
                      onClick={() => {
                        setNewLocationText(artwork.location || '');
                        setIsEditingLocation(true);
                      }}
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.78rem' }}
                    >
                      Sposta opera
                    </button>
                  ) : null}
                </div>

                {isEditingLocation ? (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newLocationText}
                      onChange={e => setNewLocationText(e.target.value)}
                      placeholder="Nuova collocazione..."
                      autoFocus
                    />
                    <button className="btn btn-primary btn-sm" onClick={handleSaveLocation}>
                      Salva
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setIsEditingLocation(false)}>
                      Annulla
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                      {artwork.location || 'Posizione non definita'}
                    </div>
                    {artwork.locationNotes && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {artwork.locationNotes}
                      </div>
                    )}
                  </div>
                )}

                {/* Cambio rapido di stato */}
                <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Aggiorna stato:</span>
                  <select 
                    className="filter-dropdown-select"
                    value={artwork.status}
                    onChange={e => onQuickUpdateStatus(artwork, e.target.value as ArtworkStatus)}
                    style={{ padding: '0.35rem 0.7rem' }}
                  >
                    <option value="bottega">In Bottega / Studio</option>
                    <option value="mostra">In Mostra / Galleria</option>
                    <option value="venduto">Venduto</option>
                    <option value="prestito">In Prestito</option>
                    <option value="in_corso">In Lavorazione</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Scheda Tecnica e Dettagli */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Prezzo e Valore */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(20,24,35,0.4))',
                border: '1px solid var(--border-gold)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {artwork.status === 'venduto' ? 'Prezzo di vendita' : 'Prezzo di listino'}
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 800, color: 'var(--gold-300)' }}>
                    {formattedPrice}
                  </div>
                  {formattedMinPrice && artwork.status !== 'venduto' && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Riservato min: <span style={{ color: '#fff', fontWeight: 600 }}>{formattedMinPrice}</span>
                    </div>
                  )}
                </div>

                {artwork.status === 'venduto' && (
                  <div style={{ textAlign: 'right' }}>
                    <div className="art-card-sold-tag" style={{ fontSize: '1.1rem' }}>VENDUTO</div>
                    {artwork.buyerName && (
                      <div style={{ fontSize: '0.85rem', color: '#fff', marginTop: '4px' }}>
                        Acquirente: {artwork.buyerName}
                      </div>
                    )}
                    {artwork.soldDate && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Data: {artwork.soldDate}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dati Tecnici */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', color: 'var(--gold-400)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Dati Tecnici & Supporto
                </h4>

                <div className="technical-grid">
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Autore / Artista</span>
                    <strong style={{ color: '#fff' }}>{artwork.artist || '-'}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Anno di Creazione</span>
                    <strong style={{ color: '#fff' }}>{artwork.year || '-'}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Tecnica</span>
                    <strong style={{ color: '#fff' }}>{artwork.technique || '-'}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Supporto</span>
                    <strong style={{ color: '#fff' }}>{artwork.support || '-'}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Dimensioni (H × L × P)</span>
                    <strong style={{ color: '#fff' }}>
                      {artwork.dimensions?.height} × {artwork.dimensions?.width}
                      {artwork.dimensions?.depth ? ` × ${artwork.dimensions.depth}` : ''} cm
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Cornice</span>
                    <strong style={{ color: '#fff' }}>
                      {artwork.framed ? `Sì (${artwork.frameDetails || 'Inclusa'})` : 'Senza cornice'}
                    </strong>
                  </div>

                  {artwork.certificateNumber && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>N. Certificato Autenticità / Archivio</span>
                      <strong style={{ color: 'var(--gold-300)' }}>{artwork.certificateNumber}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Note e descrizione dell'artista */}
              {artwork.notes && (
                <div style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem'
                }}>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9rem', color: 'var(--gold-400)', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
                    Note Artistiche & Descrizione
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {artwork.notes}
                  </p>
                </div>
              )}

            </div>

          </div>

        </div>

        <div className="modal-footer detail-modal-footer">
          <button 
            type="button" 
            className="btn btn-danger btn-sm"
            onClick={() => {
              if (confirm(`Sei sicuro di voler eliminare definitivamente l'opera "${artwork.title}" dall'inventario?`)) {
                onDelete(artwork.id);
              }
            }}
          >
            <Trash2 size={16} />
            <span>Elimina Opera</span>
          </button>

          <div className="detail-modal-footer-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => onPrintCertificate(artwork)}
              id="btn-print-certificate"
              title="Stampa o salva in PDF la Scheda Tecnica e Certificato di Autenticità per gallerie o collezionisti"
            >
              <Printer size={17} color="#d4af37" />
              <span>Stampa Scheda / Certificato</span>
            </button>

            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => onEdit(artwork)}
              id="btn-edit-artwork"
            >
              <Edit3 size={17} />
              <span>Modifica Scheda</span>
            </button>
          </div>
        </div>

      </div>

      {isImageEditorOpen && currentImage && (
        <ImageEditorModal
          imageUrl={currentImage}
          onSave={(newImg) => {
            onUpdateImage(artwork, newImg, activeImageIndex);
            setIsImageEditorOpen(false);
          }}
          onClose={() => setIsImageEditorOpen(false)}
        />
      )}
    </div>
  );
};
