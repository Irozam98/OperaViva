import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Check, Sparkles, Crop } from 'lucide-react';
import { Artwork, ArtworkStatus, StudioProfile } from '../types/artwork';
import { ImageEditorModal } from './ImageEditorModal';
import { useI18n } from '../i18n';

interface ArtworkModalProps {
  artworkToEdit?: Artwork | null;
  studioProfile: StudioProfile;
  existingArtworks: Artwork[];
  onSave: (artwork: Artwork) => void;
  onClose: () => void;
}

const COMMON_TECHNIQUES_IT = [
  'Olio su tela',
  'Acrilico su tela',
  'Acquerello su carta',
  'Tecnica mista e foglia d\'oro',
  'Olio su tavola',
  'Inchiostro di china',
  'Pastello a cera',
  'Scultura in bronzo/marmo'
];

const COMMON_TECHNIQUES_EN = [
  'Oil on canvas',
  'Acrylic on canvas',
  'Watercolor on paper',
  'Mixed media & gold leaf',
  'Oil on wood panel',
  'India ink on paper',
  'Wax pastel',
  'Bronze / Marble sculpture'
];

const COMMON_LOCATIONS_IT = [
  'Bottega - Parete Principale',
  'Bottega - Cavalletto',
  'Bottega - Cassettiera Disegni',
  'Bottega - Magazzino Archivi',
  'Galleria d\'Arte',
  'In Mostra Personale',
  'Studio Privato'
];

const COMMON_LOCATIONS_EN = [
  'Studio - Main Wall',
  'Studio - Easel',
  'Studio - Flat File Drawer',
  'Studio - Archive Storage',
  'Fine Art Gallery',
  'Solo Exhibition',
  'Private Studio'
];

export const ArtworkModal: React.FC<ArtworkModalProps> = ({
  artworkToEdit,
  studioProfile,
  existingArtworks,
  onSave,
  onClose
}) => {
  const { t, language } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const commonTechniques = language === 'en' ? COMMON_TECHNIQUES_EN : COMMON_TECHNIQUES_IT;
  const commonLocations = language === 'en' ? COMMON_LOCATIONS_EN : COMMON_LOCATIONS_IT;

  // Genera prossimo codice catalogo progressivo se nuova opera
  const generateNextCode = (): string => {
    const prefix = studioProfile.catalogPrefix || 'ART-';
    const numbers = existingArtworks
      .map(a => {
        const match = a.code?.replace(prefix, '');
        return match ? parseInt(match, 10) : 0;
      })
      .filter(n => !isNaN(n));
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
  };

  const [formData, setFormData] = useState<Partial<Artwork>>(() => {
    if (artworkToEdit) {
      return { ...artworkToEdit };
    }
    return {
      id: `art-${Date.now()}`,
      code: generateNextCode(),
      title: '',
      artist: studioProfile.artistName || '',
      year: new Date().getFullYear(),
      technique: 'Olio su tela',
      support: 'Telaio in lino',
      dimensions: { height: 80, width: 60, depth: 3 },
      framed: false,
      frameDetails: '',
      price: 1000,
      minPrice: 850,
      currency: studioProfile.currency || 'EUR',
      status: 'bottega' as ArtworkStatus,
      location: 'Bottega - Cavalletto',
      locationNotes: '',
      notes: '',
      certificateNumber: `CERT-${new Date().getFullYear()}-${String(existingArtworks.length + 1).padStart(3, '0')}`,
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Funzione per comprimere le foto caricate per ottimizzare performance & database
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1600; // Ottima risoluzione per cataloghi e stampe

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(readerEvent.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => reject(new Error('Errore nel caricamento immagine'));
        img.src = readerEvent.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Errore lettura file'));
      reader.readAsDataURL(file);
    });
  };

  // Funzione comune per processare file da click o drag & drop
  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    setIsProcessingImage(true);
    try {
      const newImages: string[] = [];
      for (const file of fileArray) {
        const compressedBase64 = await compressImage(file);
        newImages.push(compressedBase64);
      }
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newImages]
      }));
    } catch (err) {
      console.error('Errore compressione immagini:', err);
      alert('Si è verificato un errore durante il caricamento della foto.');
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFiles(files);
  };

  // Handler Drag & Drop — funziona sia in browser che in Electron desktop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Ignora dragLeave se si entra in un elemento figlio
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFiles(files);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      alert('Inserisci il titolo dell\'opera');
      return;
    }

    const completedArtwork: Artwork = {
      id: formData.id || `art-${Date.now()}`,
      code: formData.code || generateNextCode(),
      title: formData.title.trim(),
      artist: formData.artist?.trim() || studioProfile.artistName || 'Artista',
      year: Number(formData.year) || new Date().getFullYear(),
      technique: formData.technique || 'Tecnica mista',
      support: formData.support || '',
      dimensions: {
        height: Number(formData.dimensions?.height) || 0,
        width: Number(formData.dimensions?.width) || 0,
        depth: formData.dimensions?.depth ? Number(formData.dimensions.depth) : undefined
      },
      framed: !!formData.framed,
      frameDetails: formData.frameDetails || '',
      price: Number(formData.price) || 0,
      minPrice: formData.minPrice ? Number(formData.minPrice) : undefined,
      currency: formData.currency || 'EUR',
      status: (formData.status as ArtworkStatus) || 'bottega',
      location: formData.location?.trim() || 'In Bottega',
      locationNotes: formData.locationNotes?.trim() || '',
      notes: formData.notes?.trim() || '',
      certificateNumber: formData.certificateNumber?.trim() || '',
      buyerName: formData.buyerName?.trim() || '',
      buyerContact: formData.buyerContact?.trim() || '',
      soldDate: formData.soldDate || undefined,
      images: formData.images || [],
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(completedArtwork);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-card-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={20} color="#d4af37" />
            <h2 className="modal-title">
              {artworkToEdit ? t('modalEditTitle') : t('modalNewTitle')}
            </h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            
            {/* Foto dell'opera */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">
                <Camera size={16} color="#d4af37" />
                {language === 'en'
                  ? 'Artwork Photographs (Primary photo, brushwork details, back/signature)'
                  : "Fotografie dell'Opera (Foto principale, dettagli pennellata, retro/firma)"}
              </label>

              <div 
                className={`image-upload-zone${isDragOver ? ' drag-over' : ''}`}
                onClick={() => !isProcessingImage && fileInputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload size={32} color={isDragOver ? '#f0d060' : '#d4af37'} />
                <div>
                  <div style={{ fontWeight: 600, color: isDragOver ? '#f0d060' : '#fff', fontSize: '0.95rem' }}>
                    {isProcessingImage 
                      ? (language === 'en' ? 'Processing image...' : 'Elaborazione immagine in corso...')
                      : isDragOver
                        ? (language === 'en' ? 'Release to add photos' : 'Rilascia per aggiungere le foto')
                        : (language === 'en' ? 'Drag photos here or click to browse' : 'Trascina le foto qui oppure clicca per sfogliarle')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                    {language === 'en'
                      ? 'Supported formats: JPG, PNG, WEBP (Automatic lossless optimization)'
                      : 'Formati supportati: JPG, PNG, WEBP (Ottimizzazione automatica risoluzione)'}
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  multiple 
                  style={{ display: 'none' }}
                  onChange={handleImageUpload} 
                />
              </div>

              {formData.images && formData.images.length > 0 && (
                <div className="image-preview-strip">
                  {formData.images.map((imgUrl, idx) => (
                    <div key={idx} className="image-preview-thumb" style={{ position: 'relative' }}>
                      <img src={imgUrl} alt={`Foto ${idx + 1}`} />
                      {idx === 0 && (
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'rgba(212,175,55,0.9)',
                          color: '#000',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          padding: '1px'
                        }}>
                          {language === 'en' ? 'PRIMARY' : 'PRINCIPALE'}
                        </div>
                      )}
                      
                      {/* Tasto Editor/Ritaglia */}
                      <button
                        type="button"
                        onClick={() => setEditingImageIndex(idx)}
                        title={language === 'en' ? 'Crop, straighten or adjust colors' : 'Ritaglia, raddrizza o regola colore'}
                        style={{
                          position: 'absolute',
                          bottom: idx === 0 ? '16px' : '3px',
                          left: '3px',
                          background: 'rgba(20,24,35,0.85)',
                          color: 'var(--gold-300)',
                          border: '1px solid var(--border-gold)',
                          borderRadius: '4px',
                          padding: '2px 4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Crop size={12} />
                      </button>

                      <button 
                        type="button" 
                        className="image-preview-remove"
                        onClick={() => handleRemoveImage(idx)}
                        title={language === 'en' ? 'Remove photo' : 'Rimuovi foto'}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dati Principali */}
            <div className="form-grid">
              
              {/* Codice Catalogo */}
              <div className="col-4 form-group">
                <label className="form-label">{language === 'en' ? 'Inventory Code *' : 'Codice Inventario *'}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.code || ''}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  placeholder="es. ART-001"
                  required
                />
              </div>

              {/* Titolo Opera */}
              <div className="col-8 form-group">
                <label className="form-label">{t('fieldTitle')}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.title || ''}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder={language === 'en' ? 'e.g. Sunrise over the Lagoon' : 'es. Alba sulla laguna'}
                  required
                />
              </div>

              {/* Artista */}
              <div className="col-6 form-group">
                <label className="form-label">{t('fieldArtist')}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.artist || ''}
                  onChange={e => setFormData({ ...formData, artist: e.target.value })}
                  placeholder={language === 'en' ? "Artist's full name" : "Nome dell'artista"}
                />
              </div>

              {/* Anno */}
              <div className="col-3 form-group">
                <label className="form-label">{t('year')} *</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={formData.year || new Date().getFullYear()}
                  onChange={e => setFormData({ ...formData, year: parseInt(e.target.value, 10) })}
                />
              </div>

              {/* Certificato N. */}
              <div className="col-3 form-group">
                <label className="form-label">{language === 'en' ? 'Certificate / Archive No.' : 'N. Certificato / Archivio'}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.certificateNumber || ''}
                  onChange={e => setFormData({ ...formData, certificateNumber: e.target.value })}
                  placeholder="es. CERT-2026-001"
                />
              </div>

              {/* Tecnica */}
              <div className="col-6 form-group">
                <label className="form-label">{t('fieldTechnique')}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  list="technique-list"
                  value={formData.technique || ''}
                  onChange={e => setFormData({ ...formData, technique: e.target.value })}
                  placeholder={language === 'en' ? 'e.g. Oil on canvas' : 'es. Olio su tela'}
                />
                <datalist id="technique-list">
                  {commonTechniques.map((tech, idx) => (
                    <option key={idx} value={tech} />
                  ))}
                </datalist>
              </div>

              {/* Supporto */}
              <div className="col-6 form-group">
                <label className="form-label">{t('fieldSupport')}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.support || ''}
                  onChange={e => setFormData({ ...formData, support: e.target.value })}
                  placeholder={language === 'en' ? 'e.g. Linen canvas on stretcher, Poplar wood panel, 300g cotton paper' : 'es. Telaio in lino, Tavola in pioppo, Carta cotone 300g'}
                />
              </div>

              {/* Dimensioni (Altezza, Larghezza, Profondità) */}
              <div className="col-4 form-group">
                <label className="form-label">{t('fieldHeight')} *</label>
                <input 
                  type="number" 
                  step="0.5"
                  className="form-input" 
                  value={formData.dimensions?.height || ''}
                  onChange={e => setFormData({ 
                    ...formData, 
                    dimensions: { ...formData.dimensions, height: parseFloat(e.target.value) || 0, width: formData.dimensions?.width || 0 } 
                  })}
                  placeholder="es. 100"
                  required
                />
              </div>

              <div className="col-4 form-group">
                <label className="form-label">{t('fieldWidth')} *</label>
                <input 
                  type="number" 
                  step="0.5"
                  className="form-input" 
                  value={formData.dimensions?.width || ''}
                  onChange={e => setFormData({ 
                    ...formData, 
                    dimensions: { ...formData.dimensions, width: parseFloat(e.target.value) || 0, height: formData.dimensions?.height || 0 } 
                  })}
                  placeholder="es. 80"
                  required
                />
              </div>

              <div className="col-4 form-group">
                <label className="form-label">{t('fieldDepth')}</label>
                <input 
                  type="number" 
                  step="0.5"
                  className="form-input" 
                  value={formData.dimensions?.depth || ''}
                  onChange={e => setFormData({ 
                    ...formData, 
                    dimensions: { ...formData.dimensions, depth: parseFloat(e.target.value) || undefined, height: formData.dimensions?.height || 0, width: formData.dimensions?.width || 0 } 
                  })}
                  placeholder={language === 'en' ? 'e.g. 3.5 (optional)' : 'es. 3.5 (opzionale)'}
                />
              </div>

              {/* Cornice */}
              <div className="col-4 form-group" style={{ justifyContent: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', marginTop: '1.2rem' }}>
                  <input 
                    type="checkbox" 
                    checked={!!formData.framed}
                    onChange={e => setFormData({ ...formData, framed: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--gold-400)' }}
                  />
                  <span style={{ fontSize: '0.9rem', color: '#fff' }}>{t('fieldFramed')}</span>
                </label>
              </div>

              <div className="col-8 form-group">
                <label className="form-label">{t('fieldFrameDetails')}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.frameDetails || ''}
                  onChange={e => setFormData({ ...formData, frameDetails: e.target.value })}
                  placeholder={language === 'en' ? 'e.g. Floating gilded wood frame, museum glass' : 'es. Cornice a cassetta dorata, pass-partout museale'}
                  disabled={!formData.framed}
                />
              </div>

              {/* Prezzo Listino, Prezzo Riserva & Valuta */}
              <div className="col-4 form-group">
                <label className="form-label">{t('fieldPrice')} *</label>
                <input 
                  type="number" 
                  step="10"
                  className="form-input" 
                  value={formData.price ?? ''}
                  onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="es. 1500"
                  required
                />
              </div>

              <div className="col-4 form-group">
                <label className="form-label">{t('fieldMinPrice')}</label>
                <input 
                  type="number" 
                  step="10"
                  className="form-input" 
                  value={formData.minPrice ?? ''}
                  onChange={e => setFormData({ ...formData, minPrice: parseFloat(e.target.value) || undefined })}
                  placeholder={language === 'en' ? 'Confidential reserve (e.g. 1200)' : 'Trattativa confidenziale (es. 1200)'}
                />
              </div>

              <div className="col-4 form-group">
                <label className="form-label">{language === 'en' ? 'Currency' : 'Valuta'}</label>
                <select
                  className="form-select"
                  value={formData.currency || 'EUR'}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                >
                  <option value="EUR">€ Euro</option>
                  <option value="USD">$ Dollaro USA</option>
                  <option value="GBP">£ Sterlina UK</option>
                </select>
              </div>

              {/* DOV'È PRESENTE: Stato & Collocazione */}
              <div className="col-4 form-group">
                <label className="form-label">{t('fieldStatus')}</label>
                <select 
                  className="form-select"
                  value={formData.status || 'bottega'}
                  onChange={e => setFormData({ ...formData, status: e.target.value as ArtworkStatus })}
                >
                  <option value="bottega">{language === 'en' ? 'In Studio' : 'In Bottega / Studio'}</option>
                  <option value="mostra">{language === 'en' ? 'In Exhibition' : 'In Mostra / Galleria'}</option>
                  <option value="venduto">{language === 'en' ? 'Sold / Private' : 'Venduto'}</option>
                  <option value="prestito">{language === 'en' ? 'On Loan' : 'In Prestito'}</option>
                  <option value="in_corso">{language === 'en' ? 'Work in Progress' : 'In Lavorazione'}</option>
                </select>
              </div>

              <div className="col-8 form-group">
                <label className="form-label">{t('fieldLocation')}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  list="locations-list"
                  value={formData.location || ''}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder={language === 'en' ? 'e.g. Studio - North Wall, Easel 2, Gallery Exhibition' : 'es. Bottega - Parete Nord, Cavalletto 2, Galleria Borghese'}
                  required
                />
                <datalist id="locations-list">
                  {commonLocations.map((loc, idx) => (
                    <option key={idx} value={loc} />
                  ))}
                </datalist>
              </div>

              <div className="col-12 form-group">
                <label className="form-label">{language === 'en' ? 'Location Details & Logistics Notes' : 'Dettagli Collocazione / Note Logistiche'}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.locationNotes || ''}
                  onChange={e => setFormData({ ...formData, locationNotes: e.target.value })}
                  placeholder={language === 'en' ? 'e.g. On display in room 2 until Nov 10; transit crate no. 4' : 'es. Esposto nella sala 2 fino al 10 novembre; cassa di trasporto n. 4'}
                />
              </div>

              {/* Se venduto, campi acquirente */}
              {formData.status === 'venduto' && (
                <>
                  <div className="col-6 form-group">
                    <label className="form-label">{language === 'en' ? 'Buyer / Gallery Name' : 'Nome Acquirente / Galleria'}</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.buyerName || ''}
                      onChange={e => setFormData({ ...formData, buyerName: e.target.value })}
                      placeholder={language === 'en' ? 'e.g. Collector Smith / Fine Arts Gallery' : 'es. Collezionista Rossi / Galleria'}
                    />
                  </div>

                  <div className="col-3 form-group">
                    <label className="form-label">{language === 'en' ? 'Buyer Contact' : 'Contatto Acquirente'}</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.buyerContact || ''}
                      onChange={e => setFormData({ ...formData, buyerContact: e.target.value })}
                      placeholder="Email / Tel"
                    />
                  </div>

                  <div className="col-3 form-group">
                    <label className="form-label">{language === 'en' ? 'Sale Date' : 'Data Vendita'}</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={formData.soldDate || ''}
                      onChange={e => setFormData({ ...formData, soldDate: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* Note e descrizione artistica */}
              <div className="col-12 form-group">
                <label className="form-label">{t('fieldNotes')}</label>
                <textarea 
                  className="form-textarea" 
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={language === 'en' ? 'Subject matter description, inspiration, artistic intent...' : "Descrizione del soggetto, ispirazione, significato dell'opera..."}
                />
              </div>

            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn btn-primary" id="btn-save-artwork">
              <Check size={18} />
              <span>{artworkToEdit ? (language === 'en' ? 'Update Artwork Record' : 'Aggiorna Scheda Opera') : t('saveArtwork')}</span>
            </button>
          </div>
        </form>
      </div>

      {editingImageIndex !== null && formData.images && formData.images[editingImageIndex] && (
        <ImageEditorModal
          imageUrl={formData.images[editingImageIndex]}
          onSave={(newImg) => {
            const updated = [...(formData.images || [])];
            updated[editingImageIndex] = newImg;
            setFormData({ ...formData, images: updated });
            setEditingImageIndex(null);
          }}
          onClose={() => setEditingImageIndex(null)}
        />
      )}
    </div>
  );
};
