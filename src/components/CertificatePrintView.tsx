import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Save, PenLine, Eye, Check, ExternalLink, RotateCw } from 'lucide-react';
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

  // Orientamento foglio A4: 'portrait' (verticale) o 'landscape' (orizzontale)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccessPath, setSavedSuccessPath] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isLandscape = orientation === 'landscape';

  const toggleOrientation = () => {
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
  };

  const handlePrint = async () => {
    if (window.electronAPI?.print) {
      await window.electronAPI.print();
    } else {
      window.print();
    }
  };

  const handleSavePDF = async () => {
    setIsSaving(true);
    setActionError(null);
    try {
      const safeTitle = (artwork.title || 'Opera').replace(/[^a-zA-Z0-9_-]/g, '_');
      const suffix = isLandscape ? '_orizzontale' : '_verticale';
      const defaultFileName = `Certificato_${artwork.code}_${safeTitle}${suffix}.pdf`;

      if (window.electronAPI?.savePDF) {
        const res = await window.electronAPI.savePDF({
          defaultFileName,
          title: language === 'en' ? 'Save Certificate of Authenticity as PDF' : 'Salva Certificato di Autenticità in PDF',
          landscape: isLandscape
        });

        if (res.success && res.filePath) {
          setSavedSuccessPath(res.filePath);
        } else if (res.error) {
          setActionError(res.error);
        }
      } else {
        // Fallback browser standard
        window.print();
      }
    } catch (err: any) {
      setActionError(err?.message || 'Errore durante il salvataggio');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewPDF = async () => {
    setActionError(null);
    try {
      if (window.electronAPI?.previewPDF) {
        const safeTitle = (artwork.title || 'Opera').replace(/[^a-zA-Z0-9_-]/g, '_');
        await window.electronAPI.previewPDF({
          title: `Certificato_${artwork.code}_${safeTitle}`,
          landscape: isLandscape
        });
      } else {
        window.print();
      }
    } catch (err: any) {
      setActionError(err?.message || 'Errore apertura anteprima');
    }
  };

  const handleOpenSavedFile = async () => {
    if (savedSuccessPath && window.electronAPI?.openPath) {
      await window.electronAPI.openPath(savedSuccessPath);
    }
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

  // Foglio di stampa calcolato con precisione millimetrica A4 (210 x 297 mm o 297 x 210 mm)
  // Montato direttamente sul body tramite createPortal
  const printSheetContent = (
    <div className={`printable-area ${isLandscape ? 'portal-landscape' : ''}`} id="operaviva-print-portal">
      <style>{`
        @media print {
          @page {
            size: A4 ${isLandscape ? 'landscape' : 'portrait'};
            margin: 8mm;
          }
        }
      `}</style>

      {isLandscape ? (
        /* ================== FORMATO ORIZZONTALE (A4 LANDSCAPE: 297 x 210 mm) ================== */
        <div style={{
          background: '#ffffff',
          color: '#1a1a1a',
          padding: '6mm 10mm',
          width: '100%',
          boxSizing: 'border-box',
          border: '3px double #8c6d23',
          position: 'relative',
          fontFamily: "'Playfair Display', Georgia, serif"
        }}>
          {/* Filetto oro sottile interno classico */}
          <div style={{
            position: 'absolute',
            top: '2.5mm',
            left: '2.5mm',
            right: '2.5mm',
            bottom: '2.5mm',
            border: '1px solid #d4af37',
            pointerEvents: 'none'
          }}></div>

          {/* Intestazione Stampa Bottega / Artista in testata orizzontale */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1.5px solid #8c6d23',
            paddingBottom: '5px',
            marginBottom: '7px'
          }}>
            <div>
              <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '16pt', fontWeight: 800, letterSpacing: '2px', margin: 0, color: '#111', lineHeight: 1.1 }}>
                {studioProfile.studioName || "ATELIER D'ARTE"}
              </h1>
              <div style={{ fontSize: '10pt', letterSpacing: '1.5px', color: '#8c6d23', textTransform: 'uppercase', marginTop: '1px', fontWeight: 600 }}>
                {studioProfile.artistName}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '7.5pt', color: '#555', fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: '55%' }}>
              {studioProfile.address} {studioProfile.city && `• ${studioProfile.city}`} {studioProfile.phone && `• Tel: ${studioProfile.phone}`} {studioProfile.email && `• ${studioProfile.email}`}
            </div>
          </div>

          {/* Griglia a 2 Colonne perfettamente incastrata e simmetrica */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.05fr 1.35fr',
            gap: '8mm',
            alignItems: 'center',
            minHeight: '138mm'
          }}>
            {/* Colonna Sinistra: Opera Protagonista */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              padding: '2mm'
            }}>
              {mainImage && (
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <img 
                    src={mainImage} 
                    alt={artwork.title} 
                    style={{ 
                      maxHeight: '108mm', 
                      maxWidth: '100%', 
                      objectFit: 'contain', 
                      border: '1px solid #c5a059', 
                      padding: '3px', 
                      background: '#fff',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                    }} 
                  />
                </div>
              )}
              <div style={{ marginTop: '5px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '12pt', fontWeight: 700, color: '#111' }}>
                  "{artwork.title}"
                </div>
                <div style={{ fontSize: '8pt', color: '#666', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {artwork.year && `${artwork.year} • `}{artwork.technique}
                </div>
              </div>
            </div>

            {/* Colonna Destra: Certificato, Scheda Tecnica, Dichiarazione e Firme */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              {/* Titolo e Codici */}
              <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '13.5pt', fontWeight: 700, letterSpacing: '1.8px', color: '#8c6d23', margin: 0, textTransform: 'uppercase' }}>
                  {language === 'en'
                    ? 'CERTIFICATE OF AUTHENTICITY'
                    : 'CERTIFICATO DI AUTENTICITÀ'}
                </h2>
                <div style={{ fontSize: '7.5pt', color: '#555', marginTop: '1px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {language === 'en' ? 'Inventory Code:' : 'Codice di Catalogo:'} <strong>{artwork.code}</strong> • {language === 'en' ? 'Certificate No.:' : 'N. Certificato:'} <strong>{artwork.certificateNumber || artwork.code}</strong>
                </div>
              </div>

              {/* Scheda Tecnica Descrittiva Compatta */}
              <div style={{
                background: '#faf9f5',
                border: '1px solid #d4af37',
                padding: '6px 10px',
                marginBottom: '6px',
                fontSize: '8pt',
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: '3px', columnGap: '12px' }}>
                  <div><strong style={{ color: '#666', fontSize: '7pt', textTransform: 'uppercase' }}>{language === 'en' ? 'Author:' : 'Autore:'}</strong> <div style={{ fontWeight: 600 }}>{artwork.artist || studioProfile.artistName}</div></div>
                  <div><strong style={{ color: '#666', fontSize: '7pt', textTransform: 'uppercase' }}>{language === 'en' ? 'Year:' : 'Anno:'}</strong> {artwork.year}</div>
                  <div><strong style={{ color: '#666', fontSize: '7pt', textTransform: 'uppercase' }}>{language === 'en' ? 'Medium:' : 'Tecnica:'}</strong> {artwork.technique}</div>
                  <div><strong style={{ color: '#666', fontSize: '7pt', textTransform: 'uppercase' }}>{language === 'en' ? 'Support:' : 'Supporto:'}</strong> {artwork.support || (language === 'en' ? 'Original Support' : 'Supporto originale')}</div>
                  <div><strong style={{ color: '#666', fontSize: '7pt', textTransform: 'uppercase' }}>{language === 'en' ? 'Dimensions:' : 'Dimensioni:'}</strong> {artwork.dimensions.height} × {artwork.dimensions.width} {artwork.dimensions.depth ? `× ${artwork.dimensions.depth}` : ''} cm</div>
                  <div><strong style={{ color: '#666', fontSize: '7pt', textTransform: 'uppercase' }}>{language === 'en' ? 'Framing:' : 'Incorniciatura:'}</strong> {artwork.framed ? (language === 'en' ? `Framed (${artwork.frameDetails || 'Yes'})` : `Incorniciato (${artwork.frameDetails || 'Sì'})`) : (language === 'en' ? 'Unframed' : 'Senza cornice')}</div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <strong style={{ color: '#666', fontSize: '7pt', textTransform: 'uppercase' }}>{language === 'en' ? 'Declared Value:' : 'Valore / Prezzo:'}</strong> <span style={{ fontWeight: 700, color: '#8c6d23', marginLeft: '4px' }}>{formattedPrice}</span>
                  </div>
                </div>
                {artwork.notes && (
                  <div style={{ marginTop: '3px', paddingTop: '2px', borderTop: '1px dotted #ccc', fontSize: '7pt', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    <strong>{language === 'en' ? 'Notes:' : 'Note:'}</strong> {artwork.notes}
                  </div>
                )}
              </div>

              {/* Dichiarazione di Autenticità Ufficiale */}
              <div style={{ fontSize: '7.8pt', fontStyle: 'italic', lineHeight: 1.35, textAlign: 'justify', color: '#222', marginBottom: '6px' }}>
                {language === 'en'
                  ? 'This document certifies that the work of art described and reproduced above is an authentic original, created solely by hand by the artist and registered under the catalog number above in the official studio archive.'
                  : "Si certifica con il presente documento che l'opera sopra descritta e riprodotta è un originale autentico, realizzato unicamente a mano dall'artista e registrato con il numero di catalogo sopra indicato presso l'archivio ufficiale di bottega."}
              </div>

              {/* Firme e Luogo di rilascio */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2px' }}>
                <div style={{ fontSize: '8pt' }}>
                  <div>{language === 'en' ? 'Place & Date of Issue:' : 'Luogo e Data di rilascio:'}</div>
                  <strong style={{ color: '#111' }}>{studioProfile.city || (language === 'en' ? 'In Studio' : 'In Bottega')}, {today}</strong>
                </div>

                <div style={{ textAlign: 'center', width: '180px' }}>
                  <div style={{ borderBottom: '1px solid #111', height: '24px', marginBottom: '3px' }}></div>
                  <div style={{ fontSize: '7.5pt', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {language === 'en' ? "Artist's Signature / Direction" : "Firma dell'Artista / Direzione"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quel pezzetto: Piè di pagina regolato all'interno della cornice con safe margin */}
          <div style={{ marginTop: '6px', textAlign: 'center', fontSize: '7pt', color: '#777', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Registro Ufficiale OperaViva • Created by Marzio Sparla
          </div>
        </div>
      ) : (
        /* ================== FORMATO VERTICALE CLASSICO (A4 PORTRAIT: 210 x 297 mm) ================== */
        <div style={{
          background: '#ffffff',
          color: '#1a1a1a',
          padding: '8mm 12mm',
          width: '100%',
          boxSizing: 'border-box',
          border: '3px double #8c6d23',
          position: 'relative',
          fontFamily: "'Playfair Display', Georgia, serif"
        }}>
          {/* Filetto oro sottile interno classico */}
          <div style={{
            position: 'absolute',
            top: '2.5mm',
            left: '2.5mm',
            right: '2.5mm',
            bottom: '2.5mm',
            border: '1px solid #d4af37',
            pointerEvents: 'none'
          }}></div>

          {/* Intestazione Stampa Bottega / Artista */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #8c6d23', paddingBottom: '10px', marginBottom: '12px' }}>
            <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '19pt', fontWeight: 800, letterSpacing: '2.5px', margin: 0, color: '#111' }}>
              {studioProfile.studioName || "ATELIER D'ARTE"}
            </h1>
            <div style={{ fontSize: '11.5pt', letterSpacing: '1.8px', color: '#8c6d23', textTransform: 'uppercase', marginTop: '2px', fontWeight: 600 }}>
              {studioProfile.artistName}
            </div>
            <div style={{ fontSize: '8.5pt', color: '#555', marginTop: '3px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {studioProfile.address} {studioProfile.city && `• ${studioProfile.city}`} {studioProfile.phone && `• Tel: ${studioProfile.phone}`} {studioProfile.email && `• ${studioProfile.email}`}
            </div>
          </div>

          {/* Titolo Certificato */}
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '14.5pt', fontWeight: 700, letterSpacing: '2px', color: '#8c6d23', margin: 0, textTransform: 'uppercase' }}>
              {language === 'en'
                ? 'CERTIFICATE OF AUTHENTICITY'
                : 'CERTIFICATO DI AUTENTICITÀ'}
            </h2>
            <div style={{ fontSize: '9pt', color: '#555', marginTop: '2px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {language === 'en' ? 'Inventory Code:' : 'Codice di Catalogo:'} <strong>{artwork.code}</strong> • {language === 'en' ? 'Certificate No.:' : 'N. Certificato:'} <strong>{artwork.certificateNumber || artwork.code}</strong>
            </div>
          </div>

          {/* Immagine dell'opera protagonista (grande e nitida come nella versione originale) */}
          {mainImage && (
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <img 
                src={mainImage} 
                alt={artwork.title} 
                style={{ maxHeight: '72mm', maxWidth: '100%', objectFit: 'contain', border: '1px solid #c5a059', padding: '3px', background: '#fff' }} 
              />
            </div>
          )}

          {/* Scheda Tecnica Descrittiva */}
          <div style={{
            background: '#faf9f5',
            border: '1px solid #d4af37',
            padding: '10px 14px',
            marginBottom: '12px',
            fontSize: '9.5pt',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: '5px', columnGap: '16px' }}>
              <div><strong style={{ color: '#666', fontSize: '8pt', textTransform: 'uppercase' }}>{language === 'en' ? 'Title:' : 'Titolo:'}</strong> <div style={{ fontSize: '12pt', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>"{artwork.title}"</div></div>
              <div><strong style={{ color: '#666', fontSize: '8pt', textTransform: 'uppercase' }}>{language === 'en' ? 'Author:' : 'Autore:'}</strong> <div style={{ fontWeight: 600 }}>{artwork.artist || studioProfile.artistName}</div></div>
              <div><strong style={{ color: '#666', fontSize: '8pt', textTransform: 'uppercase' }}>{language === 'en' ? 'Year:' : 'Anno:'}</strong> {artwork.year}</div>
              <div><strong style={{ color: '#666', fontSize: '8pt', textTransform: 'uppercase' }}>{language === 'en' ? 'Medium / Technique:' : 'Tecnica:'}</strong> {artwork.technique}</div>
              <div><strong style={{ color: '#666', fontSize: '8pt', textTransform: 'uppercase' }}>{language === 'en' ? 'Support:' : 'Supporto:'}</strong> {artwork.support || (language === 'en' ? 'Original Support' : 'Supporto originale')}</div>
              <div><strong style={{ color: '#666', fontSize: '8pt', textTransform: 'uppercase' }}>{language === 'en' ? 'Dimensions:' : 'Dimensioni:'}</strong> {artwork.dimensions.height} × {artwork.dimensions.width} {artwork.dimensions.depth ? `× ${artwork.dimensions.depth}` : ''} cm</div>
              <div><strong style={{ color: '#666', fontSize: '8pt', textTransform: 'uppercase' }}>{language === 'en' ? 'Framing:' : 'Incorniciatura:'}</strong> {artwork.framed ? (language === 'en' ? `Framed (${artwork.frameDetails || 'Yes'})` : `Incorniciato (${artwork.frameDetails || 'Sì'})`) : (language === 'en' ? 'Unframed' : 'Senza cornice')}</div>
              <div><strong style={{ color: '#666', fontSize: '8pt', textTransform: 'uppercase' }}>{language === 'en' ? 'Declared Value:' : 'Valore / Prezzo:'}</strong> <span style={{ fontWeight: 700, color: '#8c6d23' }}>{formattedPrice}</span></div>
            </div>
            {artwork.notes && (
              <div style={{ marginTop: '6px', paddingTop: '4px', borderTop: '1px dotted #ccc', fontSize: '8.5pt', fontStyle: 'italic' }}>
                <strong>{language === 'en' ? 'Notes:' : 'Note:'}</strong> {artwork.notes}
              </div>
            )}
          </div>

          {/* Dichiarazione di Autenticità Ufficiale */}
          <div style={{ fontSize: '9pt', fontStyle: 'italic', lineHeight: 1.45, textAlign: 'justify', color: '#222', marginBottom: '14px' }}>
            {language === 'en'
              ? 'This document certifies that the work of art described and reproduced above is an authentic original, created solely by hand by the artist and registered under the catalog number above in the official studio archive.'
              : "Si certifica con il presente documento che l'opera sopra descritta e riprodotta è un originale autentico, realizzato unicamente a mano dall'artista e registrato con il numero di catalogo sopra indicato presso l'archivio ufficiale di bottega."}
          </div>

          {/* Firme e Luogo di rilascio */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
            <div style={{ fontSize: '9pt' }}>
              <div>{language === 'en' ? 'Place & Date of Issue:' : 'Luogo e Data di rilascio:'}</div>
              <strong style={{ color: '#111' }}>{studioProfile.city || (language === 'en' ? 'In Studio' : 'In Bottega')}, {today}</strong>
            </div>

            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ borderBottom: '1px solid #111', height: '28px', marginBottom: '4px' }}></div>
              <div style={{ fontSize: '8.5pt', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {language === 'en' ? "Artist's Signature / Direction" : "Firma dell'Artista / Direzione"}
              </div>
            </div>
          </div>

          {/* Quel pezzetto: Piè di pagina regolato all'interno della cornice con safe margin */}
          <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '7.5pt', color: '#777', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Registro Ufficiale OperaViva • Created by Marzio Sparla
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Schermata di anteprima modale a schermo intero prima della stampa */}
      <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 200, padding: '1rem' }}>
        <div 
          className="modal-card" 
          onClick={e => e.stopPropagation()} 
          style={{ 
            maxWidth: isLandscape ? '1060px' : '940px', 
            maxHeight: '96vh', 
            background: '#252936', 
            border: '1px solid var(--border-gold)',
            transition: 'max-width 0.3s ease'
          }}
        >
          <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.85rem 1.25rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                <Printer size={20} color="#d4af37" />
                <h3 className="modal-title" style={{ fontSize: '1.15rem', margin: 0, whiteSpace: 'nowrap' }}>
                  {language === 'en'
                    ? 'Certificate Preview'
                    : 'Anteprima Certificato'}
                </h3>
              </div>

              {/* Selettore rapido e chiaro: [ 📄 Verticale ] [ 🖼️ Orizzontale ] */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'rgba(10, 13, 20, 0.85)',
                padding: '3px',
                borderRadius: '999px',
                border: '1px solid var(--border-gold)',
                gap: '2px'
              }}>
                <button
                  type="button"
                  onClick={() => setOrientation('portrait')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    border: 'none',
                    background: !isLandscape ? 'var(--gold-400)' : 'transparent',
                    color: !isLandscape ? '#000' : '#aaa',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  id="btn-cert-select-portrait"
                  title={language === 'en' ? 'Portrait format (vertical)' : 'Formato verticale A4'}
                >
                  <span>📄</span>
                  <span>{language === 'en' ? 'Portrait' : 'Verticale'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    border: 'none',
                    background: isLandscape ? 'var(--gold-400)' : 'transparent',
                    color: isLandscape ? '#000' : '#aaa',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  id="btn-cert-select-landscape"
                  title={language === 'en' ? 'Landscape format (horizontal)' : 'Formato orizzontale A4'}
                >
                  <span>🖼️</span>
                  <span>{language === 'en' ? 'Landscape' : 'Orizzontale'}</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', flexShrink: 0 }}>
              {/* Pulsante Gira Foglio (Verticale / Orizzontale) */}
              <button 
                type="button" 
                className="btn btn-secondary btn-action-pill" 
                onClick={toggleOrientation}
                title={language === 'en' 
                  ? (isLandscape ? 'Rotate: Switch to Portrait (A4 Vertical)' : 'Rotate: Switch to Landscape (A4 Horizontal)') 
                  : (isLandscape ? 'Gira: Passa a Verticale (A4)' : 'Gira: Passa a Orizzontale (A4)')}
                id="btn-cert-header-rotate"
                style={{
                  borderColor: isLandscape ? 'var(--gold-400)' : undefined,
                  background: isLandscape ? 'rgba(212, 175, 55, 0.18)' : undefined,
                  color: isLandscape ? 'var(--gold-300)' : undefined
                }}
              >
                <span className="icon-circle" style={{ background: isLandscape ? 'rgba(212, 175, 55, 0.3)' : 'rgba(212, 175, 55, 0.15)', color: '#d4af37' }}>
                  <RotateCw size={15} style={{ transform: isLandscape ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s ease' }} />
                </span>
                <span>{language === 'en' ? 'Rotate' : 'Gira'}</span>
              </button>

              {/* Pulsante Anteprima PDF (apre il PDF nel lettore di sistema con zoom e anteprima reale) */}
              <button 
                type="button" 
                className="btn btn-secondary btn-action-pill" 
                onClick={handlePreviewPDF}
                title={language === 'en' ? 'Open real PDF preview in Windows' : 'Apri anteprima PDF reale in Windows'}
                id="btn-cert-header-preview"
              >
                <span className="icon-circle" style={{ background: 'rgba(96, 165, 250, 0.2)', color: '#60a5fa' }}>
                  <Eye size={15} />
                </span>
                <span>{language === 'en' ? 'PDF Preview' : 'Anteprima PDF'}</span>
              </button>

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

              {/* Pallino floppy per salvare PDF */}
              <button 
                type="button" 
                className="btn btn-secondary btn-action-pill" 
                onClick={handleSavePDF}
                disabled={isSaving}
                title={language === 'en' ? 'Save as PDF (prompts save location)' : 'Salva in PDF (scegli cartella di destinazione)'}
                id="btn-cert-header-save"
              >
                <span className="icon-circle icon-circle-save">
                  <Save size={15} />
                </span>
                <span>{isSaving ? '...' : (language === 'en' ? 'Save PDF' : 'Salva PDF')}</span>
              </button>

              {/* Pallino penna per la modifica */}
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

          {/* Banner di successo o errore salvataggio PDF */}
          {savedSuccessPath && (
            <div style={{
              background: 'rgba(74, 222, 128, 0.15)',
              borderBottom: '1px solid rgba(74, 222, 128, 0.35)',
              padding: '0.65rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              color: '#86efac',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={16} />
                <span>
                  {language === 'en' ? 'Certificate saved successfully to:' : 'Certificato salvato con successo in:'} <strong>{savedSuccessPath}</strong>
                </span>
              </div>
              <button 
                type="button" 
                onClick={handleOpenSavedFile}
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <ExternalLink size={13} />
                <span>{language === 'en' ? 'Open PDF' : 'Apri PDF'}</span>
              </button>
            </div>
          )}

          {actionError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              borderBottom: '1px solid rgba(239, 68, 68, 0.35)',
              padding: '0.65rem 1.25rem',
              color: '#fca5a5',
              fontSize: '0.85rem'
            }}>
              {actionError}
            </div>
          )}

          <div className="modal-body" style={{ background: '#11141b', padding: '1.5rem', overflowY: 'auto' }}>
            
            {/* Foglio Certificato Reale con stile tipografico per Belle Arti (Anteprima a video) */}
            <div id="print-sheet" style={{
              background: '#ffffff',
              color: '#1a1a1a',
              padding: isLandscape ? '24px 30px' : '35px 40px',
              borderRadius: '3px',
              boxShadow: '0 12px 35px rgba(0,0,0,0.5)',
              fontFamily: "'Playfair Display', Georgia, serif",
              maxWidth: isLandscape ? '920px' : '720px',
              width: '100%',
              margin: '0 auto',
              border: '2px solid #c5a059',
              position: 'relative',
              transition: 'all 0.3s ease'
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

              {isLandscape ? (
                /* ================== ANTEPRIMA ORIZZONTALE A VIDEO ================== */
                <div>
                  {/* Intestazione Bottega / Artista Orizzontale */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #d4af37',
                    paddingBottom: '10px',
                    marginBottom: '14px'
                  }}>
                    <div>
                      <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '20px', fontWeight: 800, letterSpacing: '2px', color: '#1a1a1a', textTransform: 'uppercase', margin: 0, lineHeight: 1.1 }}>
                        {studioProfile.studioName || "ATELIER D'ARTE"}
                      </h1>
                      <div style={{ fontSize: '12px', letterSpacing: '1.5px', color: '#8c6d23', textTransform: 'uppercase', marginTop: '2px', fontWeight: 600 }}>
                        {studioProfile.artistName || "Bottega d'Arte"}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '10px', color: '#666', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {studioProfile.address} {studioProfile.city && `• ${studioProfile.city}`} {studioProfile.phone && `• Tel: ${studioProfile.phone}`}
                    </div>
                  </div>

                  {/* 2 Colonne */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '24px', alignItems: 'center' }}>
                    {/* Colonna Sinistra: Opera */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      {mainImage && (
                        <div style={{ textAlign: 'center', width: '100%' }}>
                          <img 
                            src={mainImage} 
                            alt={artwork.title} 
                            style={{
                              maxHeight: '260px',
                              maxWidth: '100%',
                              objectFit: 'contain',
                              border: '1px solid #c5a059',
                              padding: '4px',
                              background: '#fff',
                              boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
                            }} 
                          />
                        </div>
                      )}
                      <div style={{ marginTop: '8px', textAlign: 'center' }}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: 700, color: '#111' }}>
                          "{artwork.title}"
                        </div>
                        <div style={{ fontSize: '11px', color: '#666', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {artwork.year && `${artwork.year} • `}{artwork.technique}
                        </div>
                      </div>
                    </div>

                    {/* Colonna Destra: Certificato, Dati, Firme */}
                    <div>
                      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '16px', fontWeight: 700, letterSpacing: '1.8px', color: '#8c6d23', textTransform: 'uppercase', margin: 0 }}>
                          {language === 'en' ? 'CERTIFICATE OF AUTHENTICITY' : 'CERTIFICATO DI AUTENTICITÀ'}
                        </h2>
                        <div style={{ fontSize: '10px', color: '#666', fontStyle: 'italic', marginTop: '2px' }}>
                          {language === 'en' ? 'Inventory Code:' : 'Codice di Catalogo:'} <strong>{artwork.code}</strong> • {language === 'en' ? 'Certificate No.:' : 'N. Certificato:'} <strong>{artwork.certificateNumber || artwork.code}</strong>
                        </div>
                      </div>

                      {/* Scheda tecnica compatta */}
                      <div style={{
                        background: '#faf9f5',
                        border: '1px solid #d4af37',
                        padding: '10px 14px',
                        borderRadius: '2px',
                        marginBottom: '10px',
                        fontSize: '11px',
                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                      }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: '4px', columnGap: '12px' }}>
                          <div><strong style={{ color: '#666', fontSize: '9px', textTransform: 'uppercase' }}>{language === 'en' ? 'Author:' : 'Autore:'}</strong> <div style={{ fontWeight: 600 }}>{artwork.artist || studioProfile.artistName}</div></div>
                          <div><strong style={{ color: '#666', fontSize: '9px', textTransform: 'uppercase' }}>{language === 'en' ? 'Year:' : 'Anno:'}</strong> <div>{artwork.year}</div></div>
                          <div><strong style={{ color: '#666', fontSize: '9px', textTransform: 'uppercase' }}>{language === 'en' ? 'Medium:' : 'Tecnica:'}</strong> <div>{artwork.technique}</div></div>
                          <div><strong style={{ color: '#666', fontSize: '9px', textTransform: 'uppercase' }}>{language === 'en' ? 'Support:' : 'Supporto:'}</strong> <div>{artwork.support || (language === 'en' ? 'Original Support' : 'Supporto originale')}</div></div>
                          <div><strong style={{ color: '#666', fontSize: '9px', textTransform: 'uppercase' }}>{language === 'en' ? 'Dimensions:' : 'Dimensioni:'}</strong> <div>{artwork.dimensions.height} × {artwork.dimensions.width} cm</div></div>
                          <div><strong style={{ color: '#666', fontSize: '9px', textTransform: 'uppercase' }}>{language === 'en' ? 'Framing:' : 'Incorniciatura:'}</strong> <div>{artwork.framed ? 'Sì' : 'Senza cornice'}</div></div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <strong style={{ color: '#666', fontSize: '9px', textTransform: 'uppercase' }}>{language === 'en' ? 'Declared Value:' : 'Valore Dichiarato / Prezzo:'}</strong> <span style={{ fontWeight: 700, color: '#8c6d23', marginLeft: '4px' }}>{formattedPrice}</span>
                          </div>
                        </div>
                      </div>

                      {/* Dichiarazione */}
                      <div style={{ fontSize: '11px', fontStyle: 'italic', lineHeight: 1.4, color: '#222', marginBottom: '10px', textAlign: 'justify' }}>
                        {language === 'en'
                          ? 'This document certifies that the work of art described and reproduced above is an authentic original, created solely by hand by the artist and registered under the catalog number above in the official studio archive.'
                          : "Si certifica con il presente documento che l'opera sopra descritta e riprodotta è un originale autentico, realizzato unicamente a mano dall'artista e registrato con il numero di catalogo sopra indicato presso l'archivio ufficiale di bottega."}
                      </div>

                      {/* Firme e Luogo */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '6px' }}>
                        <div style={{ fontSize: '10px' }}>
                          <div>{language === 'en' ? 'Place & Date of Issue:' : 'Luogo e Data di rilascio:'}</div>
                          <strong style={{ color: '#111' }}>{studioProfile.city || 'In Bottega'}, {today}</strong>
                        </div>

                        <div style={{ textAlign: 'center', width: '180px' }}>
                          <div style={{ borderBottom: '1px solid #111', height: '26px', marginBottom: '3px' }}></div>
                          <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {language === 'en' ? "Artist's Signature / Direction" : "Firma dell'Artista / Direzione"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Piè di pagina certificato */}
                  <div style={{
                    marginTop: '16px',
                    textAlign: 'center',
                    fontSize: '9px',
                    color: '#777',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}>
                    Registro Ufficiale OperaViva • Created by Marzio Sparla
                  </div>
                </div>
              ) : (
                /* ================== ANTEPRIMA VERTICALE A VIDEO (CLASSICA) ================== */
                <div>
                  {/* Intestazione Bottega / Artista */}
                  <div style={{ textAlign: 'center', borderBottom: '1px solid #d4af37', paddingBottom: '14px', marginBottom: '16px' }}>
                    <h1 style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: '22px',
                      fontWeight: 800,
                      letterSpacing: '2.5px',
                      color: '#1a1a1a',
                      textTransform: 'uppercase',
                      margin: 0
                    }}>
                      {studioProfile.studioName || "ATELIER D'ARTE"}
                    </h1>
                    <div style={{ fontSize: '13px', letterSpacing: '1.5px', color: '#8c6d23', textTransform: 'uppercase', marginTop: '3px', fontWeight: 600 }}>
                      {studioProfile.artistName || "Bottega d'Arte"}
                    </div>
                    <div style={{ fontSize: '10px', color: '#666', marginTop: '4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {studioProfile.address} {studioProfile.city && `• ${studioProfile.city}`} {studioProfile.phone && `• Tel: ${studioProfile.phone}`} {studioProfile.email && `• ${studioProfile.email}`}
                    </div>
                  </div>

                  {/* Titolo Certificato */}
                  <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                    <h2 style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: '17px',
                      fontWeight: 700,
                      letterSpacing: '2px',
                      color: '#8c6d23',
                      textTransform: 'uppercase',
                      margin: 0
                    }}>
                      {language === 'en'
                        ? 'CERTIFICATE OF AUTHENTICITY'
                        : 'CERTIFICATO DI AUTENTICITÀ'}
                    </h2>
                    <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic', marginTop: '3px' }}>
                      {language === 'en' ? 'Inventory Code:' : 'Codice di Catalogo:'} <strong>{artwork.code}</strong> • {language === 'en' ? 'Certificate No.:' : 'N. Certificato:'} <strong>{artwork.certificateNumber || artwork.code}</strong>
                    </div>
                  </div>

                  {/* Immagine dell'opera */}
                  {mainImage && (
                    <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                      <img 
                        src={mainImage} 
                        alt={artwork.title} 
                        style={{
                          maxHeight: '220px',
                          maxWidth: '100%',
                          objectFit: 'contain',
                          border: '1px solid #c5a059',
                          padding: '4px',
                          background: '#fff'
                        }} 
                      />
                    </div>
                  )}

                  {/* Scheda Tecnica Descrittiva */}
                  <div style={{
                    background: '#faf9f5',
                    border: '1px solid #d4af37',
                    padding: '14px 18px',
                    borderRadius: '2px',
                    marginBottom: '18px',
                    fontSize: '13px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: '6px', columnGap: '16px' }}>
                      <div>
                        <strong style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase' }}>
                          {language === 'en' ? 'Title:' : 'Titolo:'}
                        </strong> 
                        <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
                          "{artwork.title}"
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase' }}>
                          {language === 'en' ? 'Author:' : 'Autore:'}
                        </strong> 
                        <div style={{ fontWeight: 600 }}>{artwork.artist || studioProfile.artistName}</div>
                      </div>
                      <div>
                        <strong style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase' }}>
                          {language === 'en' ? 'Year:' : 'Anno:'}
                        </strong> 
                        <div>{artwork.year}</div>
                      </div>
                      <div>
                        <strong style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase' }}>
                          {language === 'en' ? 'Medium / Technique:' : 'Tecnica:'}
                        </strong> 
                        <div>{artwork.technique}</div>
                      </div>
                      <div>
                        <strong style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase' }}>
                          {language === 'en' ? 'Support:' : 'Supporto:'}
                        </strong> 
                        <div>{artwork.support || (language === 'en' ? 'Original Support' : 'Supporto originale')}</div>
                      </div>
                      <div>
                        <strong style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase' }}>
                          {language === 'en' ? 'Dimensions:' : 'Dimensioni:'}
                        </strong> 
                        <div>{artwork.dimensions.height} × {artwork.dimensions.width} {artwork.dimensions.depth ? `× ${artwork.dimensions.depth}` : ''} cm</div>
                      </div>
                      <div>
                        <strong style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase' }}>
                          {language === 'en' ? 'Framing:' : 'Incorniciatura:'}
                        </strong> 
                        <div>{artwork.framed ? (language === 'en' ? `Framed (${artwork.frameDetails || 'Yes'})` : `Incorniciato (${artwork.frameDetails || 'Sì'})`) : (language === 'en' ? 'Unframed' : 'Senza cornice')}</div>
                      </div>
                      <div>
                        <strong style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase' }}>
                          {language === 'en' ? 'Declared Value:' : 'Valore Dichiarato / Prezzo:'}
                        </strong> 
                        <div style={{ fontWeight: 700, color: '#8c6d23' }}>{formattedPrice}</div>
                      </div>
                    </div>

                    {artwork.notes && (
                      <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dotted #ccc', fontSize: '12px' }}>
                        <strong>{language === 'en' ? 'Notes:' : 'Note:'}</strong> {artwork.notes}
                      </div>
                    )}
                  </div>

                  {/* Dichiarazione di Autenticità Ufficiale */}
                  <div style={{
                    fontSize: '12.5px',
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                    color: '#222',
                    marginBottom: '20px',
                    textAlign: 'justify'
                  }}>
                    {language === 'en'
                      ? 'This document certifies that the work of art described and reproduced above is an authentic original, created solely by hand by the artist and registered under the catalog number above in the official studio archive.'
                      : "Si certifica con il presente documento che l'opera sopra descritta e riprodotta è un originale autentico, realizzato unicamente a mano dall'artista e registrato con il numero di catalogo sopra indicato presso l'archivio ufficiale di bottega."}
                  </div>

                  {/* Firme e Luogo */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    marginTop: '15px'
                  }}>
                    <div style={{ fontSize: '12px' }}>
                      <div>{language === 'en' ? 'Place & Date of Issue:' : 'Luogo e Data di rilascio:'}</div>
                      <strong style={{ color: '#111' }}>{studioProfile.city || (language === 'en' ? 'In Studio' : 'In Bottega')}, {today}</strong>
                    </div>

                    <div style={{ textAlign: 'center', width: '220px' }}>
                      <div style={{ borderBottom: '1px solid #111', height: '35px', marginBottom: '4px' }}></div>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {language === 'en' ? "Artist's Signature / Direction" : "Firma dell'Artista / Direzione"}
                      </div>
                    </div>
                  </div>

                  {/* Piè di pagina certificato */}
                  <div style={{
                    marginTop: '25px',
                    textAlign: 'center',
                    fontSize: '9px',
                    color: '#777',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}>
                    Registro Ufficiale OperaViva • Created by Marzio Sparla
                  </div>
                </div>
              )}

            </div>

          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              {language === 'en' ? 'Close' : 'Chiudi'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              {/* Pulsante Gira Foglio anche nel footer */}
              <button 
                type="button" 
                className="btn btn-secondary btn-action-pill" 
                onClick={toggleOrientation}
                title={language === 'en' 
                  ? (isLandscape ? 'Rotate: Switch to Portrait (A4 Vertical)' : 'Rotate: Switch to Landscape (A4 Horizontal)') 
                  : (isLandscape ? 'Gira: Passa a Verticale (A4)' : 'Gira: Passa a Orizzontale (A4)')}
                id="btn-cert-footer-rotate"
                style={{
                  borderColor: isLandscape ? 'var(--gold-400)' : undefined,
                  background: isLandscape ? 'rgba(212, 175, 55, 0.18)' : undefined,
                  color: isLandscape ? 'var(--gold-300)' : undefined
                }}
              >
                <span className="icon-circle" style={{ background: isLandscape ? 'rgba(212, 175, 55, 0.3)' : 'rgba(212, 175, 55, 0.15)', color: '#d4af37' }}>
                  <RotateCw size={15} style={{ transform: isLandscape ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s ease' }} />
                </span>
                <span>{language === 'en' ? 'Rotate' : 'Gira'}</span>
              </button>

              {/* Anteprima PDF */}
              <button 
                type="button" 
                className="btn btn-secondary btn-action-pill" 
                onClick={handlePreviewPDF}
                title={language === 'en' ? 'Open real PDF preview in Windows' : 'Apri anteprima PDF reale in Windows'}
                id="btn-cert-footer-preview"
              >
                <span className="icon-circle" style={{ background: 'rgba(96, 165, 250, 0.2)', color: '#60a5fa' }}>
                  <Eye size={15} />
                </span>
                <span>{language === 'en' ? 'PDF Preview' : 'Anteprima PDF'}</span>
              </button>

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

              {/* Pallino floppy per salvare PDF */}
              <button 
                type="button" 
                className="btn btn-primary btn-action-pill" 
                onClick={handleSavePDF}
                disabled={isSaving}
                title={language === 'en' ? 'Save as PDF' : 'Salva in PDF'}
                id="btn-cert-footer-save"
              >
                <span className="icon-circle icon-circle-save">
                  <Save size={15} />
                </span>
                <span>{isSaving ? '...' : (language === 'en' ? 'Save as PDF' : 'Salva in PDF')}</span>
              </button>

              {/* Pallino penna per la modifica */}
              {onEdit && (
                <button 
                  type="button" 
                  className="btn btn-secondary btn-action-pill" 
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
