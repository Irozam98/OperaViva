import React from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Save, PenLine } from 'lucide-react';
import { Artwork, StudioProfile } from '../types/artwork';
import { useI18n } from '../i18n';

interface CertificatePrintViewProps {
  artwork: Artwork;
  studioProfile: StudioProfile;
  onClose: () => void;
  onEdit?: (artwork: Artwork) => void;
}

export const CertificatePrintView: React.FC<CertificatePrintViewProps> = ({
  artwork,
  studioProfile,
  onClose,
  onEdit
}) => {
  const { language } = useI18n();

  const handlePrint = () => {
    window.print();
  };

  const artCurrency = /^[A-Z]{3}$/.test(artwork.currency ?? '') ? artwork.currency : 'EUR';
  const formattedPrice = new Intl.NumberFormat(language === 'en' ? 'en-US' : 'it-IT', {
    style: 'currency',
    currency: artCurrency,
    maximumFractionDigits: 0
  }).format(artwork.price || 0);

  const mainImage = artwork.images && artwork.images.length > 0 ? artwork.images[0] : '';
  const today = new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Foglio di stampa vero e proprio montato direttamente sul body tramite createPortal
  const printSheetContent = (
    <div className="printable-area" id="operaviva-print-portal">
      <div style={{
        background: '#ffffff',
        color: '#1a1a1a',
        padding: '12mm 15mm',
        fontFamily: "'Playfair Display', Georgia, serif",
        width: '100%',
        boxSizing: 'border-box',
        border: '3px double #8c6d23',
        position: 'relative'
      }}>
        {/* Cornice decorativa classica */}
        <div style={{
          position: 'absolute',
          top: '3mm',
          left: '3mm',
          right: '3mm',
          bottom: '3mm',
          border: '1px solid #d4af37',
          pointerEvents: 'none'
        }}></div>

        {/* Intestazione Stampa */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #8c6d23', paddingBottom: '12px', marginBottom: '14px' }}>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '20pt', fontWeight: 800, letterSpacing: '3px', margin: 0, color: '#111' }}>
            {studioProfile.studioName || "ATELIER D'ARTE"}
          </h1>
          <div style={{ fontSize: '12pt', letterSpacing: '2px', color: '#8c6d23', textTransform: 'uppercase', marginTop: '3px', fontWeight: 600 }}>
            {studioProfile.artistName}
          </div>
          <div style={{ fontSize: '9pt', color: '#555', marginTop: '3px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {studioProfile.address} {studioProfile.city && `• ${studioProfile.city}`} {studioProfile.phone && `• Tel: ${studioProfile.phone}`} {studioProfile.email && `• ${studioProfile.email}`}
          </div>
        </div>

        {/* Titolo Certificato */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '15pt', fontWeight: 700, letterSpacing: '2px', color: '#8c6d23', margin: 0, textTransform: 'uppercase' }}>
            {language === 'en'
              ? 'CERTIFICATE OF AUTHENTICITY & ARCHIVE RECORD'
              : 'CERTIFICATO DI AUTENTICITÀ & ARCHIVIO'}
          </h2>
          <div style={{ fontSize: '10pt', color: '#555', marginTop: '2px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {language === 'en' ? 'Inventory Code:' : 'Codice di Catalogo:'} <strong>{artwork.code}</strong> • {language === 'en' ? 'Archive No.:' : 'N. Certificato / Archivio:'} <strong>{artwork.certificateNumber || artwork.code}</strong>
          </div>
        </div>

        {/* Immagine dell'opera */}
        {mainImage && (
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <img 
              src={mainImage} 
              alt={artwork.title} 
              style={{ maxHeight: '80mm', maxWidth: '100%', objectFit: 'contain', border: '1px solid #c5a059', padding: '3px', background: '#fff' }} 
            />
          </div>
        )}

        {/* Scheda Tecnica Descrittiva */}
        <div style={{
          background: '#faf9f5',
          border: '1px solid #d4af37',
          padding: '12px 16px',
          marginBottom: '14px',
          fontSize: '10.5pt',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: '6px', columnGap: '16px' }}>
            <div><strong style={{ color: '#666', fontSize: '9pt', textTransform: 'uppercase' }}>{language === 'en' ? 'Title:' : 'Titolo:'}</strong> <div style={{ fontSize: '13pt', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>"{artwork.title}"</div></div>
            <div><strong style={{ color: '#666', fontSize: '9pt', textTransform: 'uppercase' }}>{language === 'en' ? 'Author:' : 'Autore:'}</strong> <div style={{ fontWeight: 600 }}>{artwork.artist || studioProfile.artistName}</div></div>
            <div><strong style={{ color: '#666', fontSize: '9pt', textTransform: 'uppercase' }}>{language === 'en' ? 'Year:' : 'Anno:'}</strong> {artwork.year}</div>
            <div><strong style={{ color: '#666', fontSize: '9pt', textTransform: 'uppercase' }}>{language === 'en' ? 'Medium / Technique:' : 'Tecnica:'}</strong> {artwork.technique}</div>
            <div><strong style={{ color: '#666', fontSize: '9pt', textTransform: 'uppercase' }}>{language === 'en' ? 'Support:' : 'Supporto:'}</strong> {artwork.support || (language === 'en' ? 'Original Support' : 'Supporto originale')}</div>
            <div><strong style={{ color: '#666', fontSize: '9pt', textTransform: 'uppercase' }}>{language === 'en' ? 'Dimensions:' : 'Dimensioni:'}</strong> {artwork.dimensions.height} × {artwork.dimensions.width} {artwork.dimensions.depth ? `× ${artwork.dimensions.depth}` : ''} cm</div>
            <div><strong style={{ color: '#666', fontSize: '9pt', textTransform: 'uppercase' }}>{language === 'en' ? 'Framing:' : 'Incorniciatura:'}</strong> {artwork.framed ? (language === 'en' ? `Framed (${artwork.frameDetails || 'Yes'})` : `Incorniciato (${artwork.frameDetails || 'Sì'})`) : (language === 'en' ? 'Unframed' : 'Senza cornice')}</div>
            <div><strong style={{ color: '#666', fontSize: '9pt', textTransform: 'uppercase' }}>{language === 'en' ? 'Declared Value:' : 'Valore Dichiarato / Prezzo:'}</strong> <span style={{ fontWeight: 700, color: '#8c6d23' }}>{formattedPrice}</span></div>
          </div>
          {artwork.notes && (
            <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dotted #ccc', fontSize: '9.5pt' }}>
              <strong>{language === 'en' ? 'Notes:' : 'Note:'}</strong> {artwork.notes}
            </div>
          )}
        </div>

        {/* Dichiarazione di Autenticità */}
        <div style={{ fontSize: '10pt', fontStyle: 'italic', lineHeight: 1.45, marginBottom: '22px', textAlign: 'justify' }}>
          {language === 'en'
            ? 'This document certifies that the work of art described and reproduced above is an authentic original, created solely by hand by the artist and registered under the catalog number above in the official studio archive.'
            : "Si certifica con il presente documento che l'opera sopra descritta e riprodotta è un originale autentico, realizzato unicamente a mano dall'artista e registrato con il numero di catalogo sopra indicato presso l'archivio ufficiale di bottega."}
        </div>

        {/* Firme e Luogo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '14px' }}>
          <div style={{ fontSize: '10pt' }}>
            <div>{language === 'en' ? 'Place & Date of Issue:' : 'Luogo e Data di rilascio:'}</div>
            <strong style={{ color: '#111' }}>{studioProfile.city || (language === 'en' ? 'In Studio' : 'In Bottega')}, {today}</strong>
          </div>

          <div style={{ textAlign: 'center', width: '220px' }}>
            <div style={{ borderBottom: '1px solid #111', height: '35px', marginBottom: '4px' }}></div>
            <div style={{ fontSize: '9pt', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {language === 'en' ? "Artist's Signature / Direction" : "Firma dell'Artista / Direzione"}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '8pt', color: '#777', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Registro Ufficiale OperaViva • Created by Marzio Sparla
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Schermata di anteprima modale a schermo intero prima della stampa */}
      <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 200, padding: '1rem' }}>
        <div 
          className="modal-card" 
          onClick={e => e.stopPropagation()} 
          style={{ maxWidth: '850px', maxHeight: '96vh', background: '#252936', border: '1px solid var(--border-gold)' }}
        >
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Printer size={20} color="#d4af37" />
              <h3 className="modal-title" style={{ fontSize: '1.15rem' }}>
                {language === 'en'
                  ? 'Artwork Record Preview & Certificate of Authenticity'
                  : 'Anteprima Scheda Opera & Certificato di Autenticità'}
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Pallino stampante */}
              <button 
                type="button"
                className="btn btn-secondary btn-action-pill" 
                onClick={handlePrint}
                title={language === 'en' ? 'Print Sheet / Certificate' : 'Stampa Scheda / Certificato'}
                id="btn-cert-header-print"
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
                onClick={handlePrint}
                title={language === 'en' ? 'Save as PDF' : 'Salva in PDF'}
                id="btn-cert-header-save"
              >
                <span className="icon-circle icon-circle-save">
                  <Save size={15} />
                </span>
                <span>{language === 'en' ? 'Save PDF' : 'Salva PDF'}</span>
              </button>

              {/* Pallino penna con linea per la modifica */}
              {onEdit && (
                <button 
                  type="button"
                  className="btn btn-primary btn-action-pill" 
                  onClick={() => onEdit(artwork)}
                  title={language === 'en' ? 'Edit Artwork' : 'Modifica Opera'}
                  id="btn-cert-header-edit"
                >
                  <span className="icon-circle icon-circle-edit">
                    <PenLine size={15} />
                  </span>
                  <span>{language === 'en' ? 'Edit' : 'Modifica'}</span>
                </button>
              )}

              <button className="btn-icon" onClick={onClose} title={language === 'en' ? 'Close' : 'Chiudi'}>
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="modal-body" style={{ background: '#e2e8f0', padding: '1.5rem', overflowY: 'auto' }}>
            
            {/* Foglio Certificato Reale con stile tipografico per Belle Arti (Anteprima a video) */}
            <div id="print-sheet" style={{
              background: '#ffffff',
              color: '#1a1a1a',
              padding: '40px 45px',
              borderRadius: '4px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              fontFamily: "'Playfair Display', Georgia, serif",
              maxWidth: '750px',
              margin: '0 auto',
              border: '2px solid #c5a059',
              position: 'relative'
            }}>
              
              {/* Cornice decorativa classica */}
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                right: '8px',
                bottom: '8px',
                border: '1px solid #d4af37',
                pointerEvents: 'none'
              }}></div>

              {/* Intestazione Bottega / Artista */}
              <div style={{ textAlign: 'center', borderBottom: '1px solid #d4af37', paddingBottom: '18px', marginBottom: '22px' }}>
                <h1 style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '24px',
                  fontWeight: 800,
                  letterSpacing: '3px',
                  color: '#1a1a1a',
                  textTransform: 'uppercase',
                  margin: 0
                }}>
                  {studioProfile.studioName || "ATELIER D'ARTE"}
                </h1>
                <div style={{ fontSize: '14px', letterSpacing: '2px', color: '#8c6d23', textTransform: 'uppercase', marginTop: '4px', fontWeight: 600 }}>
                  {studioProfile.artistName || "Bottega d'Arte"}
                </div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '6px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {studioProfile.address} {studioProfile.city && `• ${studioProfile.city}`} {studioProfile.phone && `• Tel: ${studioProfile.phone}`} {studioProfile.email && `• ${studioProfile.email}`}
                </div>
              </div>

              {/* Titolo Certificato */}
              <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <h2 style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '18px',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  color: '#8c6d23',
                  textTransform: 'uppercase',
                  margin: 0
                }}>
                  {language === 'en'
                    ? 'CERTIFICATE OF AUTHENTICITY & ARCHIVE RECORD'
                    : 'CERTIFICATO DI AUTENTICITÀ & ARCHIVIO'}
                </h2>
                <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic', marginTop: '3px' }}>
                  {language === 'en' ? 'Inventory Code:' : 'Codice di Catalogo:'} <strong>{artwork.code}</strong> • {language === 'en' ? 'Archive No.:' : 'N. Certificato / Archivio:'} <strong>{artwork.certificateNumber || artwork.code}</strong>
                </div>
              </div>

              {/* Immagine dell'opera */}
              {mainImage && (
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                  <img 
                    src={mainImage} 
                    alt={artwork.title} 
                    style={{
                      maxHeight: '260px',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      border: '4px solid #f4f1ea',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }} 
                  />
                </div>
              )}

              {/* Scheda Descrittiva dell'Opera */}
              <div style={{
                background: '#faf9f5',
                border: '1px solid #e8e3d5',
                padding: '16px 20px',
                borderRadius: '4px',
                marginBottom: '20px',
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: '10px', columnGap: '20px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: '#777', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {language === 'en' ? 'Title of Artwork:' : "Titolo dell'Opera:"}
                    </span>
                    <div style={{ fontWeight: 700, fontSize: '16px', color: '#111', fontFamily: "'Playfair Display', serif" }}>
                      "{artwork.title}"
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#777', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {language === 'en' ? 'Artist / Author:' : 'Autore:'}
                    </span>
                    <div style={{ fontWeight: 600, color: '#111' }}>
                      {artwork.artist || studioProfile.artistName}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#777', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {language === 'en' ? 'Year of Creation:' : 'Anno di realizzazione:'}
                    </span>
                    <div style={{ fontWeight: 600, color: '#111' }}>
                      {artwork.year}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#777', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {language === 'en' ? 'Technique / Medium:' : 'Tecnica esecutiva:'}
                    </span>
                    <div style={{ fontWeight: 600, color: '#111' }}>
                      {artwork.technique}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#777', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {language === 'en' ? 'Support / Substrate:' : 'Supporto:'}
                    </span>
                    <div style={{ fontWeight: 600, color: '#111' }}>
                      {artwork.support || (language === 'en' ? 'Original substrate' : 'Supporto originale')}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#777', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {language === 'en' ? 'Dimensions:' : 'Dimensioni:'}
                    </span>
                    <div style={{ fontWeight: 700, color: '#111' }}>
                      {artwork.dimensions.height} × {artwork.dimensions.width}
                      {artwork.dimensions.depth ? ` × ${artwork.dimensions.depth}` : ''} cm
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#777', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {language === 'en' ? 'Framing:' : 'Incorniciatura:'}
                    </span>
                    <div style={{ fontWeight: 600, color: '#111' }}>
                      {artwork.framed 
                        ? (language === 'en' ? `Framed (${artwork.frameDetails || 'Yes'})` : `Incorniciato (${artwork.frameDetails || 'Sì'})`)
                        : (language === 'en' ? 'Unframed' : 'Senza cornice')}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#777', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {language === 'en' ? 'Declared Value / Price:' : 'Valore Dichiarato / Prezzo:'}
                    </span>
                    <div style={{ fontWeight: 700, color: '#8c6d23', fontSize: '15px' }}>
                      {formattedPrice}
                    </div>
                  </div>
                </div>

                {artwork.notes && (
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #ded8c8', fontSize: '12px', color: '#444' }}>
                    <strong style={{ color: '#222' }}>{language === 'en' ? 'Artwork Notes:' : "Note dell'opera:"}</strong> {artwork.notes}
                  </div>
                )}
              </div>

              {/* Dichiarazione di Autenticità Ufficiale */}
              <div style={{ fontSize: '12px', color: '#333', textAlign: 'justify', lineHeight: 1.5, marginBottom: '35px', fontStyle: 'italic' }}>
                {language === 'en'
                  ? 'This document certifies that the work of art described and reproduced above is an authentic original, created solely by hand by the artist and registered under the catalog number above in the official studio archive.'
                  : "Si certifica con il presente documento che l'opera sopra descritta e riprodotta è un originale autentico, realizzato unicamente a mano dall'artista e registrato con il numero di catalogo sopra indicato presso l'archivio ufficiale di bottega."}
              </div>

              {/* Firme e Luogo */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px' }}>
                <div style={{ fontSize: '12px', color: '#444' }}>
                  <div>{language === 'en' ? 'Place & Date of Issue:' : 'Luogo e Data di rilascio:'}</div>
                  <strong style={{ color: '#111' }}>{studioProfile.city || (language === 'en' ? 'In Studio' : 'In Bottega')}, {today}</strong>
                </div>

                <div style={{ textAlign: 'center', width: '220px' }}>
                  <div style={{ borderBottom: '1px solid #111', height: '35px', marginBottom: '6px' }}></div>
                  <div style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {language === 'en' ? "Artist's Signature / Direction" : "Firma dell'Artista / Direzione"}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '10px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Registro Ufficiale OperaViva • Created by Marzio Sparla
              </div>

            </div>

          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              {language === 'en' ? 'Close' : 'Chiudi'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {/* Pallino stampante */}
              <button 
                type="button"
                className="btn btn-secondary btn-action-pill" 
                onClick={handlePrint}
                title={language === 'en' ? 'Send to printer' : 'Invia a stampante'}
                id="btn-cert-footer-print"
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
                onClick={handlePrint}
                title={language === 'en' ? 'Save as PDF' : 'Salva in PDF'}
                id="btn-cert-footer-save"
              >
                <span className="icon-circle icon-circle-save">
                  <Save size={15} />
                </span>
                <span>{language === 'en' ? 'Save PDF' : 'Salva PDF'}</span>
              </button>

              {/* Pallino penna con linea per la modifica */}
              {onEdit && (
                <button 
                  type="button"
                  className="btn btn-primary btn-action-pill" 
                  onClick={() => onEdit(artwork)}
                  title={language === 'en' ? 'Edit Artwork' : 'Modifica Scheda Opera'}
                  id="btn-cert-footer-edit"
                >
                  <span className="icon-circle icon-circle-edit">
                    <PenLine size={15} />
                  </span>
                  <span>{language === 'en' ? 'Edit' : 'Modifica'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Montaggio Area Stampa all'esterno di .app-container per evitare che display:none nasconda la stampa */}
      {typeof document !== 'undefined' && createPortal(printSheetContent, document.body)}
    </>
  );
};
