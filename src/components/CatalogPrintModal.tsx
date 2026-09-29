import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, BookOpen, Save } from 'lucide-react';
import { Artwork, StudioProfile } from '../types/artwork';
import { useI18n } from '../i18n';

interface CatalogPrintModalProps {
  artworks: Artwork[];
  selectedArtworkIds: string[];
  studioProfile: StudioProfile;
  onClose: () => void;
}

export const CatalogPrintModal: React.FC<CatalogPrintModalProps> = ({
  artworks,
  selectedArtworkIds,
  studioProfile,
  onClose
}) => {
  const { language } = useI18n();

  // Opzioni configurazione catalogo
  const [layout, setLayout] = useState<'1' | '2' | '4'>('2');
  const [scope, setScope] = useState<'all' | 'available' | 'selected'>(
    selectedArtworkIds.length > 0 ? 'selected' : 'all'
  );
  const [showPrices, setShowPrices] = useState(true);
  const [includeCover, setIncludeCover] = useState(true);
  const [includeColophon, setIncludeColophon] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  // Filtraggio delle opere in base all'ambito scelto
  const filteredArtworks = useMemo(() => {
    let list: Artwork[] = [];
    if (scope === 'selected') {
      list = artworks.filter(a => selectedArtworkIds.includes(a.id));
    } else if (scope === 'available') {
      list = artworks.filter(a => a.status === 'bottega' || a.status === 'mostra');
    } else {
      list = [...artworks];
    }
    // Ordine: per anno discendente, poi titolo
    return list.sort((a, b) => (b.year || 0) - (a.year || 0));
  }, [artworks, selectedArtworkIds, scope]);

  // Suddivisione in pagine in base al layout (1, 2 o 4 opere per foglio A4)
  const itemsPerPage = layout === '1' ? 1 : layout === '2' ? 2 : 4;
  const pages = useMemo(() => {
    const chunks: Artwork[][] = [];
    for (let i = 0; i < filteredArtworks.length; i += itemsPerPage) {
      chunks.push(filteredArtworks.slice(i, i + itemsPerPage));
    }
    return chunks;
  }, [filteredArtworks, itemsPerPage]);

  const today = new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const currentYear = new Date().getFullYear();

  const formatPrice = (price?: number, cur?: string) => {
    if (!price) return language === 'en' ? 'Price upon request' : 'Quotazione su richiesta';
    const currencyCode = /^[A-Z]{3}$/.test(cur ?? '') ? cur : 'EUR';
    return new Intl.NumberFormat(language === 'en' ? 'en-US' : 'it-IT', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0
    }).format(price);
  };

  // --- Rendering Copertina d'Arte A4 ---
  const renderCoverPage = (isPrint = false) => (
    <div 
      className="catalog-a4-page"
      style={{
        width: '100%',
        height: isPrint ? '275mm' : 'auto',
        minHeight: !isPrint ? '920px' : undefined,
        background: '#ffffff',
        color: '#1a1a1a',
        padding: isPrint ? '15mm 18mm' : '45px 50px',
        boxSizing: 'border-box',
        border: '3px double #8c6d23',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        textAlign: 'center',
        margin: '0 auto',
        pageBreakAfter: isPrint ? 'always' : 'auto',
        breakAfter: isPrint ? 'page' : 'auto',
        pageBreakInside: 'avoid',
        breakInside: 'avoid'
      }}
    >
      {/* Cornice decorativa classica */}
      <div style={{
        position: 'absolute',
        top: '4mm',
        left: '4mm',
        right: '4mm',
        bottom: '4mm',
        border: '1px solid #d4af37',
        pointerEvents: 'none'
      }}></div>

      {/* Intestazione Superiore Bottega */}
      <div style={{ marginTop: '15mm' }}>
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '11pt',
          letterSpacing: '4px',
          color: '#8c6d23',
          textTransform: 'uppercase',
          fontWeight: 700
        }}>
          {studioProfile.studioName || "ATELIER D'ARTE"}
        </div>
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '18pt',
          fontWeight: 800,
          color: '#111111',
          letterSpacing: '3px',
          marginTop: '6px',
          textTransform: 'uppercase'
        }}>
          {studioProfile.artistName || "Archivio delle Opere"}
        </div>
        <div style={{ width: '60px', height: '2px', background: '#d4af37', margin: '12px auto' }}></div>
      </div>

      {/* Titolo Principale Copertina */}
      <div style={{ margin: 'auto 0' }}>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '28pt',
          fontWeight: 800,
          letterSpacing: '1px',
          color: '#111111',
          margin: '0 0 10px',
          lineHeight: 1.2
        }}>
          {language === 'en' ? 'CATALOGUE OF WORKS' : 'CATALOGO GENERALE'}
        </h1>
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '12pt',
          letterSpacing: '3px',
          color: '#8c6d23',
          textTransform: 'uppercase',
          fontWeight: 600
        }}>
          {language === 'en' ? 'Fine Art Studio & Private Archive' : 'Archivio d\'Atelier & Collezione d\'Arte'}
        </div>
        <div style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '10pt',
          color: '#666',
          marginTop: '15px',
          fontStyle: 'italic'
        }}>
          {language === 'en'
            ? `Curated selection of ${filteredArtworks.length} artworks • Issued on ${today}`
            : `Raccolta curata di ${filteredArtworks.length} opere • Emesso il ${today}`}
        </div>
      </div>

      {/* Piede Copertina */}
      <div style={{ marginBottom: '15mm', borderTop: '1px solid #d4af37', paddingTop: '15px' }}>
        <div style={{ fontSize: '9pt', color: '#555', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {studioProfile.city && `${studioProfile.city} • `}
          {studioProfile.address && `${studioProfile.address} • `}
          {studioProfile.phone && `Tel: ${studioProfile.phone} • `}
          {studioProfile.email || ''}
        </div>
        <div style={{ fontSize: '8pt', color: '#888', marginTop: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Registro Ufficiale OperaViva • Anno {currentYear}
        </div>
      </div>
    </div>
  );

  // --- Rendering Singola Opera in base al Layout ---
  const renderArtworkItem = (art: Artwork, layoutType: '1' | '2' | '4') => {
    const mainImg = art.images && art.images.length > 0 ? art.images[0] : null;

    if (layoutType === '1') {
      // Monografica: Grande impatto a pagina intera
      return (
        <div key={art.id} style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center', flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '125mm', maxHeight: '140mm', marginBottom: '12px' }}>
            {mainImg ? (
              <img 
                src={mainImg} 
                alt={art.title} 
                style={{ maxHeight: '135mm', maxWidth: '100%', objectFit: 'contain', border: '1px solid #c5a059', padding: '3px', background: '#fff' }} 
              />
            ) : (
              <div style={{ width: '100%', height: '100mm', border: '1px dashed #c5a059', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontStyle: 'italic' }}>
                Nessuna foto disponibile
              </div>
            )}
          </div>

          <div style={{ background: '#faf9f5', border: '1px solid #e8e3d5', padding: '14px 18px', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #d4af37', paddingBottom: '6px', marginBottom: '8px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18pt', fontWeight: 700, margin: 0, color: '#111' }}>
                "{art.title}"
              </h2>
              {showPrices && (
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: '13pt', fontWeight: 700, color: '#8c6d23' }}>
                  {formatPrice(art.price, art.currency)}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '9pt', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <div><strong style={{ color: '#666' }}>Codice:</strong> <div>{art.code}</div></div>
              <div><strong style={{ color: '#666' }}>Anno:</strong> <div>{art.year || '—'}</div></div>
              <div><strong style={{ color: '#666' }}>Tecnica:</strong> <div>{art.technique}</div></div>
              <div><strong style={{ color: '#666' }}>Dimensioni:</strong> <div>{art.dimensions.height} × {art.dimensions.width}{art.dimensions.depth ? ` × ${art.dimensions.depth}` : ''} cm</div></div>
              <div><strong style={{ color: '#666' }}>Supporto:</strong> <div>{art.support || '—'}</div></div>
              <div><strong style={{ color: '#666' }}>Incorniciatura:</strong> <div>{art.framed ? (art.frameDetails || 'Incorniciato') : 'Senza cornice'}</div></div>
              <div><strong style={{ color: '#666' }}>Stato:</strong> <div style={{ textTransform: 'capitalize' }}>{art.status}</div></div>
              <div><strong style={{ color: '#666' }}>Collocazione:</strong> <div>{art.location || 'Bottega'}</div></div>
            </div>

            {art.notes && (
              <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #ded8c8', fontSize: '8.5pt', color: '#444', fontStyle: 'italic' }}>
                <strong>Note d'opera:</strong> {art.notes}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (layoutType === '2') {
      // 2 Opere per Foglio: perfetto equilibrio curatoriale
      return (
        <div key={art.id} style={{
          height: '114mm',
          maxHeight: '114mm',
          display: 'flex',
          gap: '16px',
          borderBottom: '1px solid #e2d9c2',
          paddingBottom: '8mm',
          marginBottom: '8mm',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          {/* Immagine a Sinistra */}
          <div style={{ width: '42%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {mainImg ? (
              <img 
                src={mainImg} 
                alt={art.title} 
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', border: '1px solid #c5a059', padding: '2px', background: '#fff' }} 
              />
            ) : (
              <div style={{ width: '100%', height: '80mm', border: '1px dashed #c5a059', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '8pt', fontStyle: 'italic' }}>
                Senza immagine
              </div>
            )}
          </div>

          {/* Dati Opera a Destra */}
          <div style={{ width: '58%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '14pt', fontWeight: 700, margin: 0, color: '#111', lineHeight: 1.2 }}>
                  "{art.title}"
                </h3>
              </div>
              
              <div style={{ fontSize: '8.5pt', color: '#8c6d23', fontFamily: "'Cinzel', serif", fontWeight: 600, letterSpacing: '1px', marginBottom: '8px' }}>
                {art.code} • {art.year || 'Senza anno'}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', fontSize: '8.5pt', lineHeight: 1.35, color: '#333' }}>
                <div><strong>Tecnica:</strong> {art.technique}</div>
                <div><strong>Supporto:</strong> {art.support || '—'}</div>
                <div><strong>Misure:</strong> {art.dimensions.height}×{art.dimensions.width}{art.dimensions.depth ? `×${art.dimensions.depth}` : ''} cm</div>
                <div><strong>Cornice:</strong> {art.framed ? 'Sì' : 'No'}</div>
                <div><strong>Collocazione:</strong> {art.location || 'In Bottega'}</div>
                <div><strong>Stato:</strong> <span style={{ textTransform: 'capitalize' }}>{art.status}</span></div>
              </div>

              {art.notes && (
                <div style={{ fontSize: '7.8pt', color: '#555', marginTop: '6px', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {art.notes}
                </div>
              )}
            </div>

            {showPrices && (
              <div style={{ borderTop: '1px dashed #c5a059', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '8pt', color: '#777', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quotazione:</span>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: '11pt', fontWeight: 700, color: '#8c6d23' }}>
                  {formatPrice(art.price, art.currency)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Layout 4: Griglia 2x2
    return (
      <div key={art.id} style={{
        height: '110mm',
        border: '1px solid #e8e3d5',
        background: '#faf9f5',
        padding: '8px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        <div style={{ height: '62mm', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {mainImg ? (
            <img src={mainImg} alt={art.title} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
          ) : (
            <div style={{ color: '#999', fontSize: '8pt', fontStyle: 'italic' }}>Nessuna foto</div>
          )}
        </div>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '10.5pt', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            "{art.title}"
          </div>
          <div style={{ fontSize: '7.5pt', color: '#666', marginTop: '2px' }}>
            {art.technique} • {art.dimensions.height}×{art.dimensions.width} cm • {art.year}
          </div>
          {showPrices && (
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '9pt', fontWeight: 700, color: '#8c6d23', marginTop: '3px' }}>
              {formatPrice(art.price, art.currency)}
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- Rendering Pagine Opere A4 ---
  const renderArtworkPage = (chunk: Artwork[], pageIndex: number, totalPages: number, isPrint = false) => (
    <div 
      key={pageIndex}
      className="catalog-a4-page"
      style={{
        width: '100%',
        height: isPrint ? '275mm' : 'auto',
        minHeight: !isPrint ? '920px' : undefined,
        background: '#ffffff',
        color: '#1a1a1a',
        padding: isPrint ? '10mm 12mm' : '35px 40px',
        boxSizing: 'border-box',
        border: '1px solid #d4af37',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        margin: '0 auto',
        pageBreakAfter: isPrint ? 'always' : 'auto',
        breakAfter: isPrint ? 'page' : 'auto',
        pageBreakInside: 'avoid',
        breakInside: 'avoid'
      }}
    >
      {/* Running Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #d4af37',
        paddingBottom: '6px',
        marginBottom: '8mm'
      }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: '8.5pt', letterSpacing: '1.5px', color: '#8c6d23', textTransform: 'uppercase', fontWeight: 600 }}>
          {studioProfile.studioName || "ATELIER D'ARTE"} • {studioProfile.artistName || "OPERE"}
        </div>
        <div style={{ fontSize: '8pt', color: '#777', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {language === 'en' ? 'Archive Catalog' : 'Catalogo d\'Archivio'}
        </div>
      </div>

      {/* Area Opere */}
      <div style={{
        flex: 1,
        display: layout === '4' ? 'grid' : 'flex',
        gridTemplateColumns: layout === '4' ? '1fr 1fr' : undefined,
        gridTemplateRows: layout === '4' ? '1fr 1fr' : undefined,
        flexDirection: layout !== '4' ? 'column' : undefined,
        gap: layout === '4' ? '8mm' : '0',
        justifyContent: 'space-between'
      }}>
        {chunk.map(art => renderArtworkItem(art, layout))}
      </div>

      {/* Running Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #d4af37',
        paddingTop: '6px',
        marginTop: '6mm',
        fontSize: '7.5pt',
        color: '#777',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        <div>OperaViva • Registro di Bottega {currentYear}</div>
        <div>
          {language === 'en' ? 'Page' : 'Pagina'} {pageIndex + 1} / {totalPages}
        </div>
      </div>
    </div>
  );

  // --- Rendering Colophon / Pagina Finale A4 ---
  const renderColophonPage = (isPrint = false) => (
    <div 
      className="catalog-a4-page"
      style={{
        width: '100%',
        height: isPrint ? '275mm' : 'auto',
        minHeight: !isPrint ? '920px' : undefined,
        background: '#ffffff',
        color: '#1a1a1a',
        padding: isPrint ? '15mm 18mm' : '45px 50px',
        boxSizing: 'border-box',
        border: '3px double #8c6d23',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        margin: '0 auto',
        pageBreakAfter: isPrint ? 'auto' : 'auto',
        breakAfter: isPrint ? 'auto' : 'auto',
        pageBreakInside: 'avoid',
        breakInside: 'avoid'
      }}
    >
      {/* Cornice interna */}
      <div style={{
        position: 'absolute',
        top: '4mm',
        left: '4mm',
        right: '4mm',
        bottom: '4mm',
        border: '1px solid #d4af37',
        pointerEvents: 'none'
      }}></div>

      <div style={{ textAlign: 'center', marginTop: '10mm' }}>
        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '18pt', fontWeight: 800, color: '#8c6d23', letterSpacing: '3px', textTransform: 'uppercase', margin: 0 }}>
          {language === 'en' ? 'ATELIER & DIRECT CONTACTS' : 'BOTTEGA & CONTATTI'}
        </h2>
        <div style={{ fontSize: '10pt', color: '#555', marginTop: '4px', fontStyle: 'italic' }}>
          {language === 'en' ? 'Official Inquiries, Acquisitions & Exhibitions' : 'Informazioni per Collezionisti, Gallerie e Acquisizioni'}
        </div>
        <div style={{ width: '50px', height: '1.5px', background: '#d4af37', margin: '14px auto' }}></div>
      </div>

      <div style={{
        background: '#faf9f5',
        border: '1px solid #e8e3d5',
        padding: '24px 28px',
        borderRadius: '6px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '10pt',
        lineHeight: 1.8,
        maxWidth: '550px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <strong style={{ color: '#8c6d23', textTransform: 'uppercase', fontSize: '9pt', letterSpacing: '1px' }}>Studio / Bottega:</strong>
          <div style={{ fontSize: '12pt', fontWeight: 700, color: '#111' }}>{studioProfile.studioName || "Atelier d'Arte"}</div>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <strong style={{ color: '#8c6d23', textTransform: 'uppercase', fontSize: '9pt', letterSpacing: '1px' }}>Autore:</strong>
          <div style={{ fontSize: '11pt', fontWeight: 600, color: '#111' }}>{studioProfile.artistName || "Direzione Artistica"}</div>
        </div>

        {studioProfile.address && (
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#666' }}>Indirizzo:</strong> {studioProfile.address} {studioProfile.city && `• ${studioProfile.city}`}
          </div>
        )}

        {studioProfile.phone && (
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#666' }}>Telefono:</strong> {studioProfile.phone}
          </div>
        )}

        {studioProfile.email && (
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#666' }}>Email:</strong> {studioProfile.email}
          </div>
        )}

        {studioProfile.website && (
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#666' }}>Sito Web / Social:</strong> {studioProfile.website}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '10mm', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <p style={{ fontSize: '8.5pt', color: '#666', fontStyle: 'italic', maxWidth: '480px', margin: '0 auto 20px', lineHeight: 1.5 }}>
          {language === 'en'
            ? 'All artworks documented in this catalog are registered originals. For each acquisition, an official Certificate of Authenticity signed by the artist will be delivered.'
            : 'Tutte le opere documentate nel presente catalogo sono originali registrati in bottega. Ad ogni acquisizione viene rilasciato il Certificato di Autenticità ufficiale munito di timbro e firma autografa.'}
        </p>

        <div style={{ width: '180px', borderBottom: '1px solid #111', margin: '0 auto 6px', height: '25px' }}></div>
        <div style={{ fontSize: '8.5pt', color: '#444', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {language === 'en' ? "Artist's Signature" : "Firma dell'Autore"}
        </div>
      </div>
    </div>
  );

  // Calcolo totale pagine del catalogo stampabile
  const totalPagesCount = pages.length;

  // Foglio di stampa montato direttamente nel body tramite createPortal
  const printCatalogContent = (
    <div className="printable-area catalog-printable-area" id="operaviva-catalog-portal">
      {includeCover && renderCoverPage(true)}
      {pages.map((chunk, idx) => renderArtworkPage(chunk, idx, totalPagesCount, true))}
      {includeColophon && renderColophonPage(true)}
    </div>
  );

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 190, padding: '1rem' }}>
        <div 
          className="modal-card" 
          onClick={e => e.stopPropagation()} 
          style={{ maxWidth: '980px', maxHeight: '96vh', background: '#1c202a', border: '1px solid var(--border-gold)' }}
        >
          {/* Header Modale con Controlli */}
          <div className="modal-header" style={{ borderBottom: '1px solid var(--border-subtle)', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <BookOpen size={22} color="#d4af37" />
              <div>
                <h3 className="modal-title" style={{ fontSize: '1.15rem', margin: 0 }}>
                  {language === 'en' ? 'A4 Art Archive Catalog & Portfolio' : 'Catalogo & Portfolio A4 dell\'Archivio'}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {filteredArtworks.length} {language === 'en' ? 'artworks in document' : 'opere incluse'} • {pages.length} {language === 'en' ? 'pages' : 'pagine di catalogo'}
                </span>
              </div>
            </div>

            {/* Pulsanti Azione Principali (Stampante, Floppy, Chiudi) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Pallino stampante */}
              <button 
                type="button" 
                className="btn btn-secondary btn-action-pill"
                onClick={handlePrint}
                title={language === 'en' ? 'Print A4 Catalog' : 'Stampa Catalogo A4'}
                id="btn-print-catalog"
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
                onClick={handlePrint}
                title={language === 'en' ? 'Save as PDF (via print dialog)' : 'Salva Catalogo in PDF'}
                id="btn-save-pdf-catalog"
              >
                <span className="icon-circle icon-circle-save">
                  <Save size={15} />
                </span>
                <span>{language === 'en' ? 'Save PDF' : 'Salva PDF'}</span>
              </button>

              <button className="btn-icon" onClick={onClose} title={language === 'en' ? 'Close' : 'Chiudi'}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Barra Strumenti di Configurazione Impaginazione */}
          <div style={{
            background: 'rgba(10, 12, 16, 0.65)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.85rem'
          }}>
            {/* Scelta Layout Pagine A4 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--gold-400)', fontWeight: 600 }}>Impaginazione:</span>
              <div style={{ display: 'flex', background: '#13161f', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setLayout('1')}
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '4px',
                    border: 'none',
                    background: layout === '1' ? 'var(--gold-500)' : 'transparent',
                    color: layout === '1' ? '#12141a' : 'var(--text-secondary)',
                    fontWeight: layout === '1' ? 700 : 500,
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  1 per foglio
                </button>
                <button
                  type="button"
                  onClick={() => setLayout('2')}
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '4px',
                    border: 'none',
                    background: layout === '2' ? 'var(--gold-500)' : 'transparent',
                    color: layout === '2' ? '#12141a' : 'var(--text-secondary)',
                    fontWeight: layout === '2' ? 700 : 500,
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  2 per foglio (Consigliato)
                </button>
                <button
                  type="button"
                  onClick={() => setLayout('4')}
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '4px',
                    border: 'none',
                    background: layout === '4' ? 'var(--gold-500)' : 'transparent',
                    color: layout === '4' ? '#12141a' : 'var(--text-secondary)',
                    fontWeight: layout === '4' ? 700 : 500,
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  4 per foglio
                </button>
              </div>
            </div>

            {/* Opzioni Filtro Opere */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Includi:</span>
              <select 
                className="form-select" 
                value={scope} 
                onChange={e => setScope(e.target.value as any)}
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
              >
                <option value="all">Tutte le opere ({artworks.length})</option>
                <option value="available">Solo disponibili ({artworks.filter(a => a.status === 'bottega' || a.status === 'mostra').length})</option>
                {selectedArtworkIds.length > 0 && (
                  <option value="selected">Solo selezionate ({selectedArtworkIds.length})</option>
                )}
              </select>
            </div>

            {/* Toggles Copertina, Prezzi, Colophon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <input 
                  type="checkbox" 
                  checked={showPrices} 
                  onChange={e => setShowPrices(e.target.checked)} 
                />
                <span>Mostra Prezzi</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <input 
                  type="checkbox" 
                  checked={includeCover} 
                  onChange={e => setIncludeCover(e.target.checked)} 
                />
                <span>Copertina d'Arte</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <input 
                  type="checkbox" 
                  checked={includeColophon} 
                  onChange={e => setIncludeColophon(e.target.checked)} 
                />
                <span>Pagina Contatti</span>
              </label>
            </div>
          </div>

          {/* Anteprima Documento A4 a Video */}
          <div className="modal-body" style={{ background: '#0e1117', padding: '2rem 1.5rem', overflowY: 'auto' }}>
            <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              
              {includeCover && (
                <div style={{ boxShadow: '0 12px 35px rgba(0,0,0,0.6)', borderRadius: '2px', overflow: 'hidden' }}>
                  {renderCoverPage(false)}
                </div>
              )}

              {pages.map((chunk, idx) => (
                <div key={idx} style={{ boxShadow: '0 12px 35px rgba(0,0,0,0.6)', borderRadius: '2px', overflow: 'hidden' }}>
                  {renderArtworkPage(chunk, idx, totalPagesCount, false)}
                </div>
              ))}

              {includeColophon && (
                <div style={{ boxShadow: '0 12px 35px rgba(0,0,0,0.6)', borderRadius: '2px', overflow: 'hidden' }}>
                  {renderColophonPage(false)}
                </div>
              )}

            </div>
          </div>

          {/* Footer Modale */}
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              {language === 'en' ? 'Close' : 'Chiudi'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-action-pill"
                onClick={handlePrint}
              >
                <span className="icon-circle icon-circle-print">
                  <Printer size={15} />
                </span>
                <span>{language === 'en' ? 'Print A4' : 'Stampa A4'}</span>
              </button>

              <button 
                type="button" 
                className="btn btn-primary btn-action-pill"
                onClick={handlePrint}
              >
                <span className="icon-circle icon-circle-save">
                  <Save size={15} />
                </span>
                <span>{language === 'en' ? 'Save as PDF (A4)' : 'Salva in PDF (A4)'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Montaggio Area Stampa all'esterno di .app-container tramite createPortal */}
      {typeof document !== 'undefined' && createPortal(printCatalogContent, document.body)}
    </>
  );
};
