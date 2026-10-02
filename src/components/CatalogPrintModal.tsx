import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, BookOpen, Save, Eye, Check, ExternalLink, ChevronDown, Layers } from 'lucide-react';
import { Artwork, StudioProfile } from '../types/artwork';
import { useI18n } from '../i18n';
import { AtelierActionSheet, SelectOption } from './AtelierActionSheet';

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

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccessPath, setSavedSuccessPath] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isScopeSheetOpen, setIsScopeSheetOpen] = useState(false);

  const availableCount = useMemo(() => {
    return artworks.filter(a => a.status === 'bottega' || a.status === 'mostra').length;
  }, [artworks]);

  const scopeOptions: SelectOption[] = useMemo(() => [
    {
      value: 'all',
      label: language === 'en' ? `All artworks (${artworks.length})` : `Tutte le opere (${artworks.length})`
    },
    {
      value: 'available',
      label: language === 'en' ? `Available only (${availableCount})` : `Solo disponibili (${availableCount})`
    },
    ...(selectedArtworkIds.length > 0 ? [{
      value: 'selected',
      label: language === 'en' ? `Selected only (${selectedArtworkIds.length})` : `Solo selezionate (${selectedArtworkIds.length})`
    }] : [])
  ], [artworks.length, availableCount, selectedArtworkIds.length, language]);

  const currentScopeLabel = useMemo(() => {
    return scopeOptions.find(o => o.value === scope)?.label || (language === 'en' ? 'All artworks' : 'Tutte le opere');
  }, [scopeOptions, scope, language]);

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
      const artistClean = (studioProfile.artistName || 'Artista').replace(/[^a-zA-Z0-9_-]/g, '_');
      const year = new Date().getFullYear();
      const defaultFileName = `Catalogo_Opere_${artistClean}_${year}.pdf`;

      if (window.electronAPI?.savePDF) {
        const res = await window.electronAPI.savePDF({
          defaultFileName,
          title: language === 'en' ? 'Save Catalog as PDF' : 'Salva Catalogo d\'Arte in PDF'
        });

        if (res.success && res.filePath) {
          setSavedSuccessPath(res.filePath);
        } else if (res.error) {
          setActionError(res.error);
        }
      } else {
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
        const artistClean = (studioProfile.artistName || 'Artista').replace(/[^a-zA-Z0-9_-]/g, '_');
        await window.electronAPI.previewPDF({
          title: `Catalogo_${artistClean}`
        });
      } else {
        window.print();
      }
    } catch (err: any) {
      setActionError(err?.message || 'Errore anteprima PDF');
    }
  };

  const handleOpenSavedFile = async () => {
    if (savedSuccessPath && window.electronAPI?.openPath) {
      await window.electronAPI.openPath(savedSuccessPath);
    }
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
        width: isPrint ? '210mm' : '100%',
        maxWidth: isPrint ? '210mm' : '720px',
        height: isPrint ? '297mm' : 'auto',
        maxHeight: isPrint ? '297mm' : undefined,
        minHeight: !isPrint ? '960px' : undefined,
        background: '#ffffff',
        color: '#1a1a1a',
        padding: isPrint ? '12mm 15mm' : '45px 50px',
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
        breakInside: 'avoid',
        overflow: 'hidden'
      }}
    >
      {/* Cornice decorativa classica */}
      <div style={{
        position: 'absolute',
        top: '3.5mm',
        left: '3.5mm',
        right: '3.5mm',
        bottom: '3.5mm',
        border: '1px solid #d4af37',
        pointerEvents: 'none'
      }}></div>

      {/* Intestazione Superiore Bottega */}
      <div style={{ marginTop: '10mm' }}>
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
          fontSize: '26pt',
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
      <div style={{ marginBottom: '10mm', borderTop: '1px solid #d4af37', paddingTop: '14px' }}>
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
          <div style={{ textAlign: 'center', flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '110mm', maxHeight: '125mm', marginBottom: '10px' }}>
            {mainImg ? (
              <img 
                src={mainImg} 
                alt={art.title} 
                style={{ maxHeight: '120mm', maxWidth: '100%', objectFit: 'contain', border: '1px solid #c5a059', padding: '3px', background: '#fff' }} 
              />
            ) : (
              <div style={{ width: '100%', height: '90mm', border: '1px dashed #c5a059', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontStyle: 'italic' }}>
                Nessuna foto disponibile
              </div>
            )}
          </div>

          <div style={{ background: '#faf9f5', border: '1px solid #e8e3d5', padding: '12px 16px', borderRadius: '3px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #d4af37', paddingBottom: '5px', marginBottom: '6px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '16pt', fontWeight: 700, margin: 0, color: '#111' }}>
                "{art.title}"
              </h2>
              {showPrices && (
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: '12pt', fontWeight: 700, color: '#8c6d23' }}>
                  {formatPrice(art.price, art.currency)}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', fontSize: '8.5pt', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <div><strong style={{ color: '#666' }}>Codice:</strong> <div>{art.code}</div></div>
              <div><strong style={{ color: '#666' }}>Anno:</strong> <div>{art.year || '—'}</div></div>
              <div><strong style={{ color: '#666' }}>Tecnica:</strong> <div>{art.technique}</div></div>
              <div><strong style={{ color: '#666' }}>Dimensioni:</strong> <div>{art.dimensions?.height || 0} × {art.dimensions?.width || 0}{art.dimensions?.depth ? ` × ${art.dimensions.depth}` : ''} cm</div></div>
              <div><strong style={{ color: '#666' }}>Supporto:</strong> <div>{art.support || '—'}</div></div>
              <div><strong style={{ color: '#666' }}>Incorniciatura:</strong> <div>{art.framed ? (art.frameDetails || 'Incorniciato') : 'Senza cornice'}</div></div>
              <div><strong style={{ color: '#666' }}>Stato:</strong> <div style={{ textTransform: 'capitalize' }}>{art.status}</div></div>
              <div><strong style={{ color: '#666' }}>Collocazione:</strong> <div>{art.location || 'Bottega'}</div></div>
            </div>

            {art.notes && (
              <div style={{ marginTop: '6px', paddingTop: '5px', borderTop: '1px dashed #ded8c8', fontSize: '8pt', color: '#444', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                <strong>Note d'opera:</strong> {art.notes}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (layoutType === '2') {
      // 2 Opere per Foglio: perfetto equilibrio curatoriale calibrato per A4
      return (
        <div key={art.id} style={{
          height: '112mm',
          maxHeight: '112mm',
          display: 'flex',
          gap: '14px',
          borderBottom: '1px solid #e2d9c2',
          paddingBottom: '4mm',
          marginBottom: '4mm',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          {/* Immagine a Sinistra */}
          <div style={{ width: '40%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {mainImg ? (
              <img 
                src={mainImg} 
                alt={art.title} 
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', border: '1px solid #c5a059', padding: '2px', background: '#fff' }} 
              />
            ) : (
              <div style={{ width: '100%', height: '75mm', border: '1px dashed #c5a059', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '8pt', fontStyle: 'italic' }}>
                Senza immagine
              </div>
            )}
          </div>

          {/* Dati Opera a Destra */}
          <div style={{ width: '60%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3px' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '13pt', fontWeight: 700, margin: 0, color: '#111', lineHeight: 1.2 }}>
                  "{art.title}"
                </h3>
              </div>
              
              <div style={{ fontSize: '8pt', color: '#8c6d23', fontFamily: "'Cinzel', serif", fontWeight: 600, letterSpacing: '1px', marginBottom: '6px' }}>
                {art.code} • {art.year || 'Senza anno'}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '8pt', lineHeight: 1.3, color: '#333' }}>
                <div><strong>Tecnica:</strong> {art.technique}</div>
                <div><strong>Supporto:</strong> {art.support || '—'}</div>
                <div><strong>Misure:</strong> {art.dimensions?.height || 0}×{art.dimensions?.width || 0}{art.dimensions?.depth ? `×${art.dimensions.depth}` : ''} cm</div>
                <div><strong>Cornice:</strong> {art.framed ? 'Sì' : 'No'}</div>
                <div><strong>Collocazione:</strong> {art.location || 'In Bottega'}</div>
                <div><strong>Stato:</strong> <span style={{ textTransform: 'capitalize' }}>{art.status}</span></div>
              </div>

              {art.notes && (
                <div style={{ fontSize: '7.5pt', color: '#555', marginTop: '4px', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {art.notes}
                </div>
              )}
            </div>

            {showPrices && (
              <div style={{ borderTop: '1px dashed #c5a059', paddingTop: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '7.5pt', color: '#777', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quotazione:</span>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: '10.5pt', fontWeight: 700, color: '#8c6d23' }}>
                  {formatPrice(art.price, art.currency)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Layout 4: Griglia 2x2 calibrata
    return (
      <div key={art.id} style={{
        height: '112mm',
        maxHeight: '112mm',
        border: '1px solid #e8e3d5',
        background: '#faf9f5',
        padding: '6px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        overflow: 'hidden'
      }}>
        <div style={{ height: '62mm', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {mainImg ? (
            <img src={mainImg} alt={art.title} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
          ) : (
            <div style={{ color: '#999', fontSize: '7.5pt', fontStyle: 'italic' }}>Nessuna foto</div>
          )}
        </div>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '10pt', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            "{art.title}"
          </div>
          <div style={{ fontSize: '7.5pt', color: '#666', marginTop: '2px' }}>
            {art.technique} • {art.dimensions?.height || 0}×{art.dimensions?.width || 0} cm • {art.year}
          </div>
          {showPrices && (
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '8.5pt', fontWeight: 700, color: '#8c6d23', marginTop: '2px' }}>
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
        width: isPrint ? '210mm' : '100%',
        maxWidth: isPrint ? '210mm' : '720px',
        height: isPrint ? '297mm' : 'auto',
        maxHeight: isPrint ? '297mm' : undefined,
        minHeight: !isPrint ? '960px' : undefined,
        background: '#ffffff',
        color: '#1a1a1a',
        padding: isPrint ? '8mm 12mm' : '35px 40px',
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
        breakInside: 'avoid',
        overflow: 'hidden'
      }}
    >
      {/* Running Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #d4af37',
        paddingBottom: '4px',
        marginBottom: '4mm'
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
        gap: layout === '4' ? '6mm' : '0',
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
        paddingTop: '4px',
        marginTop: '4mm',
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
        width: isPrint ? '210mm' : '100%',
        maxWidth: isPrint ? '210mm' : '720px',
        height: isPrint ? '297mm' : 'auto',
        maxHeight: isPrint ? '297mm' : undefined,
        minHeight: !isPrint ? '960px' : undefined,
        background: '#ffffff',
        color: '#1a1a1a',
        padding: isPrint ? '12mm 15mm' : '45px 50px',
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
        breakInside: 'avoid',
        overflow: 'hidden'
      }}
    >
      {/* Cornice interna */}
      <div style={{
        position: 'absolute',
        top: '3.5mm',
        left: '3.5mm',
        right: '3.5mm',
        bottom: '3.5mm',
        border: '1px solid #d4af37',
        pointerEvents: 'none'
      }}></div>

      <div style={{ textAlign: 'center', marginTop: '8mm' }}>
        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '17pt', fontWeight: 800, color: '#8c6d23', letterSpacing: '3px', textTransform: 'uppercase', margin: 0 }}>
          {language === 'en' ? 'ATELIER & DIRECT CONTACTS' : 'BOTTEGA & CONTATTI'}
        </h2>
        <div style={{ fontSize: '9.5pt', color: '#555', marginTop: '4px', fontStyle: 'italic' }}>
          {language === 'en' ? 'Official Inquiries, Acquisitions & Exhibitions' : 'Informazioni per Collezionisti, Gallerie e Acquisizioni'}
        </div>
        <div style={{ width: '50px', height: '1.5px', background: '#d4af37', margin: '12px auto' }}></div>
      </div>

      <div style={{
        background: '#faf9f5',
        border: '1px solid #e8e3d5',
        padding: '20px 24px',
        borderRadius: '4px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '9.5pt',
        lineHeight: 1.7,
        maxWidth: '520px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ marginBottom: '8px' }}>
          <strong style={{ color: '#8c6d23', textTransform: 'uppercase', fontSize: '8.5pt', letterSpacing: '1px' }}>Studio / Bottega:</strong>
          <div style={{ fontSize: '11.5pt', fontWeight: 700, color: '#111' }}>{studioProfile.studioName || "Atelier d'Arte"}</div>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <strong style={{ color: '#8c6d23', textTransform: 'uppercase', fontSize: '8.5pt', letterSpacing: '1px' }}>Autore:</strong>
          <div style={{ fontSize: '10.5pt', fontWeight: 600, color: '#111' }}>{studioProfile.artistName || "Direzione Artistica"}</div>
        </div>

        {studioProfile.address && (
          <div style={{ marginBottom: '6px' }}>
            <strong style={{ color: '#666' }}>Indirizzo:</strong> {studioProfile.address} {studioProfile.city && `• ${studioProfile.city}`}
          </div>
        )}

        {studioProfile.phone && (
          <div style={{ marginBottom: '6px' }}>
            <strong style={{ color: '#666' }}>Telefono:</strong> {studioProfile.phone}
          </div>
        )}

        {studioProfile.email && (
          <div style={{ marginBottom: '6px' }}>
            <strong style={{ color: '#666' }}>Email:</strong> {studioProfile.email}
          </div>
        )}

        {studioProfile.website && (
          <div style={{ marginBottom: '6px' }}>
            <strong style={{ color: '#666' }}>Sito Web / Social:</strong> {studioProfile.website}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '8mm', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <p style={{ fontSize: '8pt', color: '#666', fontStyle: 'italic', maxWidth: '460px', margin: '0 auto 16px', lineHeight: 1.45 }}>
          {language === 'en'
            ? 'All artworks documented in this catalog are registered originals. For each acquisition, an official Certificate of Authenticity signed by the artist will be delivered.'
            : 'Tutte le opere documentate nel presente catalogo sono originali registrati in bottega. Ad ogni acquisizione viene rilasciato il Certificato di Autenticità ufficiale munito di timbro e firma autografa.'}
        </p>

        <div style={{ width: '180px', borderBottom: '1px solid #111', margin: '0 auto 6px', height: '22px' }}></div>
        <div style={{ fontSize: '8pt', color: '#444', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {language === 'en' ? "Artist's Signature" : "Firma dell'Autore"}
        </div>
      </div>
    </div>
  );

  // Calcolo totale pagine del catalogo stampabile
  const totalPagesCount = pages.length;

  // Foglio di stampa montato direttamente nel body tramite createPortal con dimensioni A4 esatte
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
          <div className="modal-header" style={{ borderBottom: '1px solid var(--border-subtle)', padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
              <BookOpen size={22} color="#d4af37" style={{ flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <h3 className="modal-title" style={{ fontSize: '1.15rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {language === 'en' ? 'A4 Art Catalog' : 'Catalogo A4 dell\'Archivio'}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {filteredArtworks.length} {language === 'en' ? 'artworks' : 'opere'} • {pages.length + (includeCover ? 1 : 0) + (includeColophon ? 1 : 0)} {language === 'en' ? 'A4 sheets' : 'fogli A4'}
                </span>
              </div>
            </div>

            {/* Pulsanti Azione (Desktop in testata, su mobile sono nel footer) + Tasto Chiudi */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
              <div className="desktop-header-actions">
                {/* Anteprima PDF in Windows */}
                <button 
                  type="button" 
                  className="btn btn-secondary btn-action-pill"
                  onClick={handlePreviewPDF}
                  title={language === 'en' ? 'Open real PDF preview in Windows' : 'Apri anteprima PDF reale in Windows'}
                  id="btn-preview-catalog"
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
                  onClick={handleSavePDF}
                  disabled={isSaving}
                  title={language === 'en' ? 'Save as PDF (prompts save location)' : 'Salva Catalogo in PDF (scegli cartella di destinazione)'}
                  id="btn-save-pdf-catalog"
                >
                  <span className="icon-circle icon-circle-save">
                    <Save size={15} />
                  </span>
                  <span>{isSaving ? '...' : (language === 'en' ? 'Save PDF' : 'Salva PDF')}</span>
                </button>
              </div>

              <button className="btn-icon" onClick={onClose} title={language === 'en' ? 'Close' : 'Chiudi'}>
                <X size={20} />
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
                  {language === 'en' ? 'Catalog PDF saved successfully to:' : 'Catalogo PDF salvato con successo in:'} <strong>{savedSuccessPath}</strong>
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

          {/* Barra Strumenti di Configurazione Impaginazione */}
          <div className="catalog-toolbar">
            <div className="catalog-toolbar-grid">
              {/* Scelta Layout Pagine A4 */}
              <div className="catalog-toolbar-row">
                <span className="catalog-toolbar-label">
                  {language === 'en' ? 'Layout:' : 'Impaginazione:'}
                </span>
                <div className="catalog-layout-segmented">
                  <button
                    type="button"
                    onClick={() => setLayout('1')}
                    className={`catalog-layout-btn ${layout === '1' ? 'active' : ''}`}
                  >
                    {language === 'en' ? '1 per page' : '1 per foglio'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayout('2')}
                    title="2 opere per foglio (Consigliato)"
                    className={`catalog-layout-btn ${layout === '2' ? 'active' : ''}`}
                  >
                    {language === 'en' ? '2 per page' : '2 per foglio'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayout('4')}
                    className={`catalog-layout-btn ${layout === '4' ? 'active' : ''}`}
                  >
                    {language === 'en' ? '4 per page' : '4 per foglio'}
                  </button>
                </div>
              </div>

              {/* Opzioni Filtro Opere con Atelier Action Sheet */}
              <div className="catalog-toolbar-row">
                <span className="catalog-toolbar-label">
                  {language === 'en' ? 'Include:' : 'Includi:'}
                </span>
                <div 
                  className="catalog-scope-selector"
                  onClick={() => setIsScopeSheetOpen(true)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="catalog-scope-text">
                    {currentScopeLabel}
                  </span>
                  <ChevronDown size={14} className="select-chevron-icon" style={{ color: 'var(--gold-400)', flexShrink: 0 }} />
                </div>
              </div>
            </div>

            {/* Toggles Copertina, Prezzi, Colophon */}
            <div className="catalog-toolbar-checkboxes">
              <label className="catalog-toolbar-checkbox">
                <input 
                  type="checkbox" 
                  checked={showPrices} 
                  onChange={e => setShowPrices(e.target.checked)} 
                />
                <span>{language === 'en' ? 'Show Prices' : 'Mostra Prezzi'}</span>
              </label>

              <label className="catalog-toolbar-checkbox">
                <input 
                  type="checkbox" 
                  checked={includeCover} 
                  onChange={e => setIncludeCover(e.target.checked)} 
                />
                <span>{language === 'en' ? 'Art Cover' : 'Copertina d\'Arte'}</span>
              </label>

              <label className="catalog-toolbar-checkbox">
                <input 
                  type="checkbox" 
                  checked={includeColophon} 
                  onChange={e => setIncludeColophon(e.target.checked)} 
                />
                <span>{language === 'en' ? 'Contact Page' : 'Pagina Contatti'}</span>
              </label>
            </div>
          </div>

          {/* Anteprima Documento A4 a Video */}
          <div className="modal-body" style={{ background: '#0e1117', padding: '2rem 1.5rem', overflowY: 'auto' }}>
            <div style={{ maxWidth: '740px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {includeCover && (
                <div>
                  <div style={{ color: 'var(--gold-400)', fontSize: '0.78rem', marginBottom: '0.4rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Copertina d'Atelier (Foglio 1)
                  </div>
                  <div style={{ boxShadow: '0 12px 35px rgba(0,0,0,0.6)', borderRadius: '2px', overflow: 'hidden' }}>
                    {renderCoverPage(false)}
                  </div>
                </div>
              )}

              {pages.map((chunk, idx) => (
                <div key={idx}>
                  <div style={{ color: 'var(--gold-400)', fontSize: '0.78rem', marginBottom: '0.4rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {language === 'en' ? 'Page' : 'Foglio'} {idx + 1 + (includeCover ? 1 : 0)} / {totalPagesCount + (includeCover ? 1 : 0) + (includeColophon ? 1 : 0)}
                  </div>
                  <div style={{ boxShadow: '0 12px 35px rgba(0,0,0,0.6)', borderRadius: '2px', overflow: 'hidden' }}>
                    {renderArtworkPage(chunk, idx, totalPagesCount, false)}
                  </div>
                </div>
              ))}

              {includeColophon && (
                <div>
                  <div style={{ color: 'var(--gold-400)', fontSize: '0.78rem', marginBottom: '0.4rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {language === 'en' ? 'Final Page (Contacts & Colophon)' : 'Pagina Finale (Contatti & Registro)'}
                  </div>
                  <div style={{ boxShadow: '0 12px 35px rgba(0,0,0,0.6)', borderRadius: '2px', overflow: 'hidden' }}>
                    {renderColophonPage(false)}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Footer Modale */}
          <div className="modal-footer catalog-modal-footer">
            <button className="btn btn-secondary btn-close" onClick={onClose}>
              {language === 'en' ? 'Close' : 'Chiudi'}
            </button>

            <div className="catalog-footer-actions">
              {/* Anteprima PDF */}
              <button 
                type="button" 
                className="btn btn-secondary btn-action-pill"
                onClick={handlePreviewPDF}
                title={language === 'en' ? 'Open real PDF preview in Windows' : 'Apri anteprima PDF reale in Windows'}
                id="btn-footer-preview-catalog"
              >
                <span className="icon-circle" style={{ background: 'rgba(96, 165, 250, 0.2)', color: '#60a5fa' }}>
                  <Eye size={15} />
                </span>
                <span>{language === 'en' ? 'PDF Preview' : 'Anteprima PDF'}</span>
              </button>

              {/* Stampa */}
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

              {/* Salva PDF */}
              <button 
                type="button" 
                className="btn btn-primary btn-action-pill btn-save-main"
                onClick={handleSavePDF}
                disabled={isSaving}
              >
                <span className="icon-circle icon-circle-save">
                  <Save size={15} />
                </span>
                <span>{isSaving ? '...' : (language === 'en' ? 'Save as PDF (A4)' : 'Salva in PDF (A4)')}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Montaggio Area Stampa all'esterno di .app-container tramite createPortal */}
      {typeof document !== 'undefined' && createPortal(printCatalogContent, document.body)}

      {/* Atelier Action Sheet per Selettore Includi Opere */}
      <AtelierActionSheet
        isOpen={isScopeSheetOpen}
        title={language === 'en' ? 'Include Artworks' : 'Opere da Includere'}
        icon={<Layers size={20} />}
        options={scopeOptions}
        selectedValue={scope}
        onSelect={val => setScope(val as any)}
        onClose={() => setIsScopeSheetOpen(false)}
      />
    </>
  );
};
