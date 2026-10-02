import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Printer, Award, ShieldCheck } from 'lucide-react';
import { Artwork } from '../types';
import { useAuth } from '../context/AuthContext';

interface CertificateModalProps {
  artwork: Artwork | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ artwork, isOpen, onClose }) => {
  const { artist } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    if (artwork) {
      const verifyUrl = `${window.location.origin}/?verify=${artwork.id}&code=${artwork.code}`;
      QRCode.toDataURL(verifyUrl, { width: 140, margin: 1 })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error(err));
    }
  }, [artwork]);

  if (!isOpen || !artwork) return null;

  const handlePrint = () => {
    window.print();
  };

  const coverImage = artwork.images && artwork.images.length > 0 ? artwork.images[0] : null;

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog modal-cert-container">
        <div className="cert-toolbar no-print">
          <div className="cert-toolbar-title">
            <Award size={20} className="gold-icon" />
            <span>Certificato d'Autenticità Ufficiale (Formato A4)</span>
          </div>
          <div className="cert-toolbar-buttons">
            <button type="button" className="btn-print" onClick={handlePrint}>
              <Printer size={18} />
              <span>Stampa Certificato A4</span>
            </button>
            <button type="button" className="btn-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Foglio A4 Stampabile */}
        <div className="cert-a4-sheet" id="printable-certificate">
          <div className="cert-border-outer">
            <div className="cert-border-inner">
              {/* Header Certificato */}
              <div className="cert-header">
                <div className="cert-studio-title">{artist?.studioName || 'ATELIER D\'ARTE'}</div>
                <h1 className="cert-main-heading">CERTIFICATO DI AUTENTICITÀ</h1>
                <div className="cert-number">
                  Archivio N°: <strong>{artwork.certificateNumber || artwork.code}</strong>
                </div>
              </div>

              {/* Corpo Principale con Foto e Dati */}
              <div className="cert-body">
                <div className="cert-photo-frame">
                  {coverImage ? (
                    <img src={coverImage} alt={artwork.title} className="cert-artwork-img" />
                  ) : (
                    <div className="cert-photo-empty">Riproduzione Fotografica</div>
                  )}
                </div>

                <div className="cert-artwork-data">
                  <div className="cert-row">
                    <span className="cert-label">Titolo dell'Opera:</span>
                    <span className="cert-value cert-title-italic">"{artwork.title}"</span>
                  </div>

                  <div className="cert-row">
                    <span className="cert-label">Autore / Artista:</span>
                    <span className="cert-value font-bold">{artist?.artistName || 'Maestro d\'Arte'}</span>
                  </div>

                  <div className="cert-row">
                    <span className="cert-label">Anno di Creazione:</span>
                    <span className="cert-value">{artwork.year}</span>
                  </div>

                  <div className="cert-row">
                    <span className="cert-label">Tecnica e Materiali:</span>
                    <span className="cert-value">{artwork.technique}</span>
                  </div>

                  <div className="cert-row">
                    <span className="cert-label">Supporto:</span>
                    <span className="cert-value">{artwork.support}</span>
                  </div>

                  <div className="cert-row">
                    <span className="cert-label">Dimensioni:</span>
                    <span className="cert-value font-bold">
                      {artwork.dimensions.height} × {artwork.dimensions.width} cm
                      {artwork.dimensions.depth ? ` (prof. ${artwork.dimensions.depth} cm)` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dichiarazione Legale di Autenticità */}
              <div className="cert-statement">
                <p>
                  Si certifica formalmente che l'opera d'arte sopra descritta e riprodotta fotograficamente è un pezzo unico ed originale, interamente ideato e realizzato dalla mano dell'Artista, conforme a tutti gli standard conservativi d'atelier e regolarmente iscritto nel registro ufficiale dell'archivio.
                </p>
              </div>

              {/* Footer con Firma e QR Code */}
              <div className="cert-footer">
                <div className="cert-qr-col">
                  {qrCodeUrl && (
                    <img src={qrCodeUrl} alt="QR Verifica" className="cert-qr-img" />
                  )}
                  <span className="cert-qr-hint">Verifica Registro Digitale</span>
                </div>

                <div className="cert-date-col">
                  <span className="cert-date-label">Rilasciato il:</span>
                  <span className="cert-date-val">{new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  {artist?.city && <span className="cert-city">{artist.city}</span>}
                </div>

                <div className="cert-signature-col">
                  <span className="cert-sig-label">Firma Autografa dell'Artista:</span>
                  <div className="cert-sig-line"></div>
                  <span className="cert-artist-name">{artist?.artistName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
