import React, { useState } from 'react';
import { X, Upload, Check, Trash2, Zap, AlertCircle } from 'lucide-react';
import { Artwork, ArtworkStatus } from '../types';
import { optimizeImageForCloud, formatBytes, OptimizedImageResult } from '../services/imageOptimizer';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ArtworkFormModalProps {
  artwork?: Artwork | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ArtworkFormModal: React.FC<ArtworkFormModalProps> = ({
  artwork,
  isOpen,
  onClose,
  onSaved
}) => {
  const { artist } = useAuth();

  const [title, setTitle] = useState(artwork?.title || '');
  const [code, setCode] = useState(artwork?.code || `${artist?.catalogPrefix || 'OPV-'}${Math.floor(100 + Math.random() * 900)}`);
  const [year, setYear] = useState(artwork?.year || new Date().getFullYear());
  const [technique, setTechnique] = useState(artwork?.technique || 'Olio su tela');
  const [support, setSupport] = useState(artwork?.support || 'Telaio in lino maestoso');
  const [height, setHeight] = useState(artwork?.dimensions?.height || '');
  const [width, setWidth] = useState(artwork?.dimensions?.width || '');
  const [depth, setDepth] = useState(artwork?.dimensions?.depth || '');
  const [framed, setFramed] = useState(artwork?.framed || false);
  const [frameDetails, setFrameDetails] = useState(artwork?.frameDetails || '');
  const [price, setPrice] = useState(artwork?.price || '');
  const [minPrice, setMinPrice] = useState(artwork?.minPrice || '');
  const [status, setStatus] = useState<ArtworkStatus>(artwork?.status || 'bottega');
  const [location, setLocation] = useState(artwork?.location || 'Cavalletto Bottega');
  const [locationNotes, setLocationNotes] = useState(artwork?.locationNotes || '');
  const [certificateNumber, setCertificateNumber] = useState(artwork?.certificateNumber || '');
  const [notes, setNotes] = useState(artwork?.notes || '');
  const [images, setImages] = useState<string[]>(artwork?.images || []);

  // Stato per l'ottimizzazione dell'immagine
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationStats, setOptimizationStats] = useState<OptimizedImageResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setOptimizing(true);

    try {
      // 1. Ottimizzazione client-side WebP (riduce del 90-95% il peso senza perdita visibile)
      const optimized = await optimizeImageForCloud(file, 2048, 0.82);
      setOptimizationStats(optimized);

      // 2. Upload sul Bucket Cloudflare R2
      const uploadRes = await api.uploadImage(optimized.file);
      setImages([uploadRes.url, ...images]);
    } catch (err: any) {
      console.error('Errore compressione/upload:', err);
      setError('Errore durante il caricamento della foto: ' + (err.message || ''));
    } finally {
      setOptimizing(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Il titolo dell\'opera è obbligatorio');
      return;
    }

    setSaving(true);
    setError(null);

    const artworkData: Partial<Artwork> = {
      code,
      title: title.trim(),
      year: Number(year) || new Date().getFullYear(),
      technique,
      support,
      dimensions: {
        height: Number(height) || 0,
        width: Number(width) || 0,
        depth: depth ? Number(depth) : undefined
      },
      framed,
      frameDetails: framed ? frameDetails : '',
      price: Number(price) || 0,
      minPrice: minPrice ? Number(minPrice) : undefined,
      currency: artist?.currency || 'EUR',
      status,
      location,
      locationNotes,
      certificateNumber,
      notes,
      images
    };

    try {
      if (artwork?.id) {
        await api.updateArtwork(artwork.id, artworkData);
      } else {
        await api.createArtwork(artworkData);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog modal-lg">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h2>{artwork ? 'Modifica Scheda Opera' : 'Nuova Catalogazione Opera'}</h2>
            <span className="modal-subtitle">Salvataggio sicuro nel Cloud Cloudflare con R2 & D1</span>
          </div>
          <button type="button" className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="form-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="artwork-form">
          {/* Sezione Caricamento Foto con Ottimizzazione R2 */}
          <div className="form-section">
            <label className="section-label">Fotografia Principale & Archivio Immagini</label>
            
            <div className="image-upload-zone">
              <input
                type="file"
                id="artwork-photo-input"
                accept="image/*"
                onChange={handleImageFileChange}
                style={{ display: 'none' }}
                disabled={optimizing}
              />
              <label htmlFor="artwork-photo-input" className={`upload-drop-target ${optimizing ? 'uploading' : ''}`}>
                <Upload size={28} className="gold-icon" />
                <div className="upload-text">
                  <strong>{optimizing ? 'Compressione WebP in corso...' : 'Carica Fotografia Opera'}</strong>
                  <span>Clicca per selezionare da PC o fotocamera smartphone</span>
                </div>
              </label>

              {/* R2 Protection Badge */}
              <div className="r2-free-badge">
                <Zap size={14} className="gold-icon" />
                <span>
                  <strong>Compressione Intelligente:</strong> La foto viene ridotta fino al 95% in WebP nel browser prima dell'invio a Cloudflare R2 per mantenere l'archivio gratis per sempre.
                </span>
              </div>

              {/* Statistiche di Compressione */}
              {optimizationStats && (
                <div className="compression-stat-box">
                  <div className="stat-pill">
                    Originale: <span>{formatBytes(optimizationStats.originalSizeBytes)}</span>
                  </div>
                  <div className="stat-arrow">→</div>
                  <div className="stat-pill success">
                    WebP: <span>{formatBytes(optimizationStats.compressedSizeBytes)}</span>
                  </div>
                  <div className="stat-savings">
                    -{optimizationStats.savingsPercent}% spazio risparmiato
                  </div>
                </div>
              )}

              {/* Galleria Anteprime */}
              {images.length > 0 && (
                <div className="image-previews-list">
                  {images.map((imgUrl, i) => (
                    <div key={i} className="preview-thumb-box">
                      <img src={imgUrl} alt={`Foto ${i + 1}`} />
                      <button
                        type="button"
                        className="thumb-remove-btn"
                        onClick={() => handleRemoveImage(i)}
                        title="Rimuovi foto"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dati Catalogo Base */}
          <div className="form-row">
            <div className="form-group flex-2">
              <label>Titolo dell'Opera *</label>
              <input
                type="text"
                required
                placeholder="es. Alba sul Brenta"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group flex-1">
              <label>Codice Catalogo</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div className="form-group flex-1">
              <label>Anno</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Tecnica Pittorica / Artistica</label>
              <input
                type="text"
                placeholder="es. Olio su tela, Acrilico, Mista"
                value={technique}
                onChange={(e) => setTechnique(e.target.value)}
              />
            </div>
            <div className="form-group flex-1">
              <label>Supporto</label>
              <input
                type="text"
                placeholder="es. Telaio in lino, Tavola in pioppo"
                value={support}
                onChange={(e) => setSupport(e.target.value)}
              />
            </div>
          </div>

          {/* Dimensioni & Cornice */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Altezza (cm)</label>
              <input
                type="number"
                step="0.5"
                placeholder="es. 100"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
            <div className="form-group flex-1">
              <label>Larghezza (cm)</label>
              <input
                type="number"
                step="0.5"
                placeholder="es. 80"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
            </div>
            <div className="form-group flex-1">
              <label>Spessore (cm)</label>
              <input
                type="number"
                step="0.5"
                placeholder="es. 3.5"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={framed}
                  onChange={(e) => setFramed(e.target.checked)}
                />
                <span>Opera fornita con Cornice</span>
              </label>
            </div>
            {framed && (
              <div className="form-group flex-2">
                <label>Specifiche Cornice</label>
                <input
                  type="text"
                  placeholder="es. Dorata a foglia, Noce scuro, Passe-partout"
                  value={frameDetails}
                  onChange={(e) => setFrameDetails(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Stato, Collocazione & Prezzi */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Stato Opera</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as ArtworkStatus)}>
                <option value="bottega">In Bottega / Disponibile</option>
                <option value="mostra">In Mostra / Esposizione</option>
                <option value="prestito">In Prestito Temporaneo</option>
                <option value="venduto">Venduto</option>
                <option value="in_corso">In Lavorazione / Bozzetto</option>
              </select>
            </div>
            <div className="form-group flex-2">
              <label>Collocazione Fisica Specifica</label>
              <input
                type="text"
                placeholder="es. Parete Est Atelier, Deposito A, Galleria Civica"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Prezzo Ufficiale (€)</label>
              <input
                type="number"
                placeholder="es. 2500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="form-group flex-1">
              <label>Prezzo Minimo Riservato (€)</label>
              <input
                type="number"
                placeholder="Trattativa riservata"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div className="form-group flex-1">
              <label>N. Certificato Autenticità</label>
              <input
                type="text"
                placeholder="es. CERT-2026-001"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Note Artistiche & Descrizione Critica</label>
            <textarea
              rows={3}
              placeholder="Descrizione dell'ispirazione, dettagli materici, esposizioni passate..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
              Annulla
            </button>
            <button type="submit" className="btn-save" disabled={saving || optimizing}>
              <Check size={18} />
              <span>{saving ? 'Salvataggio in corso...' : 'Salva nel Cloud'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
