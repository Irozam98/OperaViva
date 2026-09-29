import React, { useState, useRef, useEffect } from 'react';
import { X, Printer, Save, PenLine, Trash2, MapPin, Crop, ChevronDown, Check } from 'lucide-react';
import { Artwork, ArtworkStatus } from '../types/artwork';
import { ImageEditorModal } from './ImageEditorModal';
import { ConfirmModal } from './ConfirmModal';
import { useI18n } from '../i18n';

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
  const { t, language } = useI18n();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [newLocationText, setNewLocationText] = useState(artwork.location || '');
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    if (isStatusDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStatusDropdownOpen]);

  const STATUS_OPTIONS: { value: ArtworkStatus; labelIt: string; labelEn: string; color: string }[] = [
    { value: 'bottega', labelIt: 'In Bottega / Studio', labelEn: 'In Studio', color: '#4ade80' },
    { value: 'mostra', labelIt: 'In Mostra / Galleria', labelEn: 'In Exhibition', color: '#60a5fa' },
    { value: 'venduto', labelIt: 'Venduto', labelEn: 'Sold / Private', color: '#c084fc' },
    { value: 'prestito', labelIt: 'In Prestito', labelEn: 'On Loan', color: '#fbbf24' },
    { value: 'in_corso', labelIt: 'In Lavorazione', labelEn: 'Work in Progress', color: '#38bdf8' },
  ];

  const statusMap: Record<ArtworkStatus, { label: string; className: string }> = {
    bottega: {
      label: language === 'en' ? 'In Studio' : 'In Bottega / Studio',
      className: 'badge-bottega'
    },
    mostra: {
      label: language === 'en' ? 'In Exhibition' : 'In Mostra / Galleria',
      className: 'badge-mostra'
    },
    venduto: {
      label: language === 'en' ? 'Sold / Private' : 'Venduto',
      className: 'badge-venduto'
    },
    prestito: {
      label: language === 'en' ? 'On Loan' : 'In Prestito',
      className: 'badge-prestito'
    },
    in_corso: {
      label: language === 'en' ? 'Work in Progress' : 'In Lavorazione',
      className: 'badge-in_corso'
    }
  };

  const statusInfo = statusMap[artwork.status] || { label: artwork.status, className: 'badge-bottega' };

  const artCurrency = /^[A-Z]{3}$/.test(artwork.currency ?? '') ? artwork.currency : 'EUR';

  const formattedPrice = new Intl.NumberFormat(language === 'en' ? 'en-US' : 'it-IT', {
    style: 'currency',
    currency: artCurrency,
    maximumFractionDigits: 0
  }).format(artwork.price || 0);

  const formattedMinPrice = artwork.minPrice 
    ? new Intl.NumberFormat(language === 'en' ? 'en-US' : 'it-IT', { style: 'currency', currency: artCurrency, maximumFractionDigits: 0 }).format(artwork.minPrice)
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold-400)', fontWeight: 600, fontSize: '0.85rem' }}>
                    <MapPin size={16} />
                    <span>{language === 'en' ? 'Current Physical Location' : "Dov'è presente l'opera"}</span>
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
                      {language === 'en' ? 'Relocate' : 'Sposta opera'}
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
                      placeholder={language === 'en' ? 'New location...' : 'Nuova collocazione...'}
                      autoFocus
                    />
                    <button className="btn btn-primary btn-sm" onClick={handleSaveLocation}>
                      {language === 'en' ? 'Save' : 'Salva'}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setIsEditingLocation(false)}>
                      {language === 'en' ? 'Cancel' : 'Annulla'}
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                      {artwork.location || (language === 'en' ? 'Location not specified' : 'Posizione non definita')}
                    </div>
                    {artwork.locationNotes && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {artwork.locationNotes}
                      </div>
                    )}
                  </div>
                )}

                {/* Cambio rapido di stato con Dropdown Custom Atelier */}
                <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {language === 'en' ? 'Update status:' : 'Aggiorna stato:'}
                  </span>

                  <div ref={statusDropdownRef} style={{ position: 'relative' }}>
                    {(() => {
                      const currentStatusObj = STATUS_OPTIONS.find(s => s.value === artwork.status) || STATUS_OPTIONS[0];
                      const currentLabel = language === 'en' ? currentStatusObj.labelEn : currentStatusObj.labelIt;
                      return (
                        <>
                          <button
                            type="button"
                            className="custom-status-trigger"
                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                          >
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentStatusObj.color, boxShadow: `0 0 7px ${currentStatusObj.color}`, flexShrink: 0 }}></span>
                            <span>{currentLabel}</span>
                            <ChevronDown size={14} color="#d4af37" style={{ transform: isStatusDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                          </button>

                          {isStatusDropdownOpen && (
                            <div className="custom-status-menu">
                              {STATUS_OPTIONS.map(opt => {
                                const isSelected = opt.value === artwork.status;
                                const optLabel = language === 'en' ? opt.labelEn : opt.labelIt;
                                return (
                                  <div
                                    key={opt.value}
                                    className="custom-status-item"
                                    style={{
                                      background: isSelected ? 'rgba(212, 175, 55, 0.18)' : 'transparent',
                                      color: isSelected ? '#faebc8' : '#cbd5e1',
                                      fontWeight: isSelected ? 700 : 500
                                    }}
                                    onClick={() => {
                                      onQuickUpdateStatus(artwork, opt.value);
                                      setIsStatusDropdownOpen(false);
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: opt.color, boxShadow: `0 0 6px ${opt.color}`, flexShrink: 0 }}></span>
                                      <span>{optLabel}</span>
                                    </div>
                                    {isSelected && <Check size={14} color="#d4af37" />}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
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
                    {artwork.status === 'venduto' 
                      ? (language === 'en' ? 'Sale Price' : 'Prezzo di vendita') 
                      : (language === 'en' ? 'Declared Price' : 'Prezzo di listino')}
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 800, color: 'var(--gold-300)' }}>
                    {formattedPrice}
                  </div>
                  {formattedMinPrice && artwork.status !== 'venduto' && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {language === 'en' ? 'Reserve min:' : 'Riservato min:'} <span style={{ color: '#fff', fontWeight: 600 }}>{formattedMinPrice}</span>
                    </div>
                  )}
                </div>

                {artwork.status === 'venduto' && (
                  <div style={{ textAlign: 'right' }}>
                    <div className="art-card-sold-tag" style={{ fontSize: '1.1rem' }}>
                      {language === 'en' ? 'SOLD' : 'VENDUTO'}
                    </div>
                    {artwork.buyerName && (
                      <div style={{ fontSize: '0.85rem', color: '#fff', marginTop: '4px' }}>
                        {language === 'en' ? 'Buyer:' : 'Acquirente:'} {artwork.buyerName}
                      </div>
                    )}
                    {artwork.soldDate && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {language === 'en' ? 'Date:' : 'Data:'} {artwork.soldDate}
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
                  {language === 'en' ? 'Technical Sheet & Support' : 'Dati Tecnici & Supporto'}
                </h4>

                <div className="technical-grid">
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>
                      {language === 'en' ? 'Artist / Author' : 'Autore / Artista'}
                    </span>
                    <strong style={{ color: '#fff' }}>{artwork.artist || '-'}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>
                      {language === 'en' ? 'Year of Creation' : 'Anno di Creazione'}
                    </span>
                    <strong style={{ color: '#fff' }}>{artwork.year || '-'}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>
                      {language === 'en' ? 'Technique' : 'Tecnica'}
                    </span>
                    <strong style={{ color: '#fff' }}>{artwork.technique || '-'}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>
                      {language === 'en' ? 'Support / Medium' : 'Supporto'}
                    </span>
                    <strong style={{ color: '#fff' }}>{artwork.support || '-'}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>
                      {language === 'en' ? 'Dimensions (H × W × D)' : 'Dimensioni (H × L × P)'}
                    </span>
                    <strong style={{ color: '#fff' }}>
                      {artwork.dimensions?.height} × {artwork.dimensions?.width}
                      {artwork.dimensions?.depth ? ` × ${artwork.dimensions.depth}` : ''} cm
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>
                      {language === 'en' ? 'Framing' : 'Cornice'}
                    </span>
                    <strong style={{ color: '#fff' }}>
                      {artwork.framed 
                        ? (language === 'en' ? `Yes (${artwork.frameDetails || 'Included'})` : `Sì (${artwork.frameDetails || 'Inclusa'})`)
                        : (language === 'en' ? 'Unframed' : 'Senza cornice')}
                    </strong>
                  </div>

                  {artwork.certificateNumber && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>
                        {language === 'en' ? 'Certificate / Archive No.' : 'N. Certificato Autenticità / Archivio'}
                      </span>
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
                    {language === 'en' ? 'Artistic Notes & Critique' : 'Note Artistiche & Descrizione'}
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
            onClick={() => setIsDeleteConfirmOpen(true)}
            id="btn-delete-artwork"
            title={language === 'en' ? 'Delete artwork from catalog' : 'Elimina opera dal catalogo'}
          >
            <Trash2 size={16} />
            <span>{t('delete')}</span>
          </button>

          <div className="detail-modal-footer-actions">
            {/* Pallino stampante */}
            <button 
              type="button" 
              className="btn btn-secondary btn-action-pill"
              onClick={() => onPrintCertificate(artwork)}
              id="btn-print-certificate"
              title={language === 'en' ? 'Print Sheet / Certificate of Authenticity' : 'Stampa Scheda Tecnica / Certificato di Autenticità'}
            >
              <span className="icon-circle icon-circle-print">
                <Printer size={15} />
              </span>
              <span>{language === 'en' ? 'Print' : 'Stampa'}</span>
            </button>

            {/* Pallino floppy per salvare */}
            <button 
              type="button" 
              className="btn btn-secondary btn-action-pill"
              onClick={() => onPrintCertificate(artwork)}
              id="btn-save-certificate"
              title={language === 'en' ? 'Save as PDF' : 'Salva in PDF'}
            >
              <span className="icon-circle icon-circle-save">
                <Save size={15} />
              </span>
              <span>{language === 'en' ? 'Save PDF' : 'Salva PDF'}</span>
            </button>

            {/* Pallino penna con linea per la modifica */}
            <button 
              type="button" 
              className="btn btn-primary btn-action-pill"
              onClick={() => onEdit(artwork)}
              id="btn-edit-artwork"
              title={language === 'en' ? 'Edit Artwork' : 'Modifica Opera'}
            >
              <span className="icon-circle icon-circle-edit">
                <PenLine size={15} />
              </span>
              <span>{t('edit')}</span>
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

      {/* Banner Pop-up di Conferma Eliminazione Opera a tema Bottega */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title={language === 'en' ? 'Delete Artwork' : 'Elimina Opera'}
        message={language === 'en' 
          ? 'Are you sure you want to permanently remove this artwork from your catalog?' 
          : "Sei sicuro di voler eliminare definitivamente quest'opera dal tuo archivio d'atelier?"}
        itemName={artwork.title}
        warningNote={language === 'en'
          ? 'This action cannot be undone. Technical specifications, certificate history, and photos will be removed.'
          : 'Questa azione non può essere annullata. La scheda tecnica, il certificato e le fotografie verranno cancellati.'}
        confirmLabel={language === 'en' ? 'Yes, Delete' : 'Sì, Elimina'}
        cancelLabel={language === 'en' ? 'No, Cancel' : 'No, Annulla'}
        isDanger={true}
        onConfirm={() => {
          setIsDeleteConfirmOpen(false);
          onDelete(artwork.id);
        }}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </div>
  );
};
