import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, ImageOff, Trash2, CheckSquare, Square, X, MapPin, Palette, ArrowUpDown, ChevronDown, BookOpen } from 'lucide-react';
import { Artwork, ArtworkStatus, FilterState, StudioProfile } from './types/artwork';
import { getAllArtworks, getStudioProfile, saveArtwork, deleteArtwork, deleteArtworks, saveStudioProfile, initializeDatabase } from './services/db';
import { DEFAULT_STUDIO_PROFILE } from './services/sampleData';
import { Header } from './components/Header';
import { ArtworkCard } from './components/ArtworkCard';
import { ArtworkModal } from './components/ArtworkModal';
import { ArtworkDetailModal } from './components/ArtworkDetailModal';
import { CertificatePrintView } from './components/CertificatePrintView';
import { StatsModal } from './components/StatsModal';
import { BackupModal } from './components/BackupModal';
import { ProfileModal } from './components/ProfileModal';
import { SiteImporterModal } from './components/SiteImporterModal';
import { ConfirmModal } from './components/ConfirmModal';
import { CatalogPrintModal } from './components/CatalogPrintModal';
import { AtelierActionSheet } from './components/AtelierActionSheet';
import { CloudSyncModal } from './components/CloudSyncModal';
import { useI18n } from './i18n';

export function App() {
  const { t, language } = useI18n();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [studioProfile, setStudioProfile] = useState<StudioProfile>(DEFAULT_STUDIO_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  // Modali
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [artworkToEdit, setArtworkToEdit] = useState<Artwork | null>(null);
  const [isNewArtworkModalOpen, setIsNewArtworkModalOpen] = useState(false);
  const [artworkToPrint, setArtworkToPrint] = useState<Artwork | null>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSiteImporterOpen, setIsSiteImporterOpen] = useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [activeActionSheet, setActiveActionSheet] = useState<'location' | 'technique' | 'sort' | null>(null);

  // Multi-Selezione Opere per Eliminazione di Gruppo
  const [selectedArtworkIds, setSelectedArtworkIds] = useState<string[]>([]);

  // Filtri & Ricerca
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    status: 'all',
    location: '',
    technique: '',
    minPrice: 0,
    maxPrice: 0,
    sortBy: 'date_desc',
    onlyFramed: false
  });

  const loadData = async () => {
    try {
      const [list, profile] = await Promise.all([getAllArtworks(), getStudioProfile()]);
      setArtworks(list);
      setStudioProfile(profile);
    } catch (err) {
      console.error('Errore caricamento dati:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    initializeDatabase()
      .then(() => Promise.all([getAllArtworks(), getStudioProfile()]))
      .then(([list, profile]) => {
        if (active) {
          setArtworks(list);
          setStudioProfile(profile);
          setIsLoading(false);

          // Controllo Primo Avvio: verifica se la bottega deve ancora essere configurata
          const isSetupDone = localStorage.getItem('operaviva_setup_completed');
          const isProfileEmpty = !profile?.studioName?.trim() && !profile?.artistName?.trim();
          if (!isSetupDone || isProfileEmpty) {
            setIsFirstRun(true);
            setIsProfileModalOpen(true);
          }
        }
      })
      .catch((err) => {
        console.error('Errore inizializzazione:', err);
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Previene navigazione accidentale di Electron o Chromium quando si trascina un file da Windows
  useEffect(() => {
    const preventDefaultDrop = (e: DragEvent) => {
      e.preventDefault();
    };
    window.addEventListener('dragover', preventDefaultDrop);
    window.addEventListener('drop', preventDefaultDrop);
    return () => {
      window.removeEventListener('dragover', preventDefaultDrop);
      window.removeEventListener('drop', preventDefaultDrop);
    };
  }, []);

  // Lista univoca di tutte le collocazioni esistenti per il filtro
  const uniqueLocations = useMemo(() => {
    const locs = new Set<string>();
    artworks.forEach(a => {
      if (a.location?.trim()) locs.add(a.location.trim());
    });
    return Array.from(locs).sort();
  }, [artworks]);

  // Lista univoca di tutte le tecniche esistenti per il filtro
  const uniqueTechniques = useMemo(() => {
    const techs = new Set<string>();
    artworks.forEach(a => {
      if (a.technique?.trim()) techs.add(a.technique.trim());
    });
    return Array.from(techs).sort();
  }, [artworks]);

  // Filtraggio & Ordinamento
  const filteredArtworks = useMemo(() => {
    return artworks
      .filter(art => {
        // Ricerca testo
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchCode = art.code?.toLowerCase().includes(q);
          const matchTitle = art.title?.toLowerCase().includes(q);
          const matchArtist = art.artist?.toLowerCase().includes(q);
          const matchTech = art.technique?.toLowerCase().includes(q);
          const matchLoc = art.location?.toLowerCase().includes(q);
          const matchNotes = art.notes?.toLowerCase().includes(q);
          if (!matchCode && !matchTitle && !matchArtist && !matchTech && !matchLoc && !matchNotes) {
            return false;
          }
        }

        // Filtro Stato
        if (filters.status !== 'all' && art.status !== filters.status) {
          return false;
        }

        // Filtro Collocazione
        if (filters.location && art.location !== filters.location) {
          return false;
        }

        // Filtro Tecnica
        if (filters.technique && art.technique !== filters.technique) {
          return false;
        }

        // Filtro Cornice
        if (filters.onlyFramed && !art.framed) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'date_desc':
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          case 'date_asc':
            return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          case 'price_desc':
            return (b.price || 0) - (a.price || 0);
          case 'price_asc':
            return (a.price || 0) - (b.price || 0);
          case 'title_asc':
            return (a.title || '').localeCompare(b.title || '');
          case 'year_desc':
            return (b.year || 0) - (a.year || 0);
          default:
            return 0;
        }
      });
  }, [artworks, filters]);

  // Salvataggio nuova o modificata opera
  const handleSaveArtwork = async (artwork: Artwork) => {
    await saveArtwork(artwork);
    await loadData();
    setIsNewArtworkModalOpen(false);
    setArtworkToEdit(null);
    if (selectedArtwork && selectedArtwork.id === artwork.id) {
      setSelectedArtwork(artwork);
    }
  };

  // Eliminazione singola opera
  const handleDeleteArtwork = async (id: string) => {
    await deleteArtwork(id);
    await loadData();
    setSelectedArtwork(null);
    setSelectedArtworkIds(prev => prev.filter(item => item !== id));
  };

  // Gestione Selezione Multipla
  const handleToggleSelectArtwork = (id: string) => {
    setSelectedArtworkIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    setSelectedArtworkIds(filteredArtworks.map(a => a.id));
  };

  const handleDeselectAll = () => {
    setSelectedArtworkIds([]);
  };

  // Eliminazione Multipla di Gruppo
  const handleOpenBulkDeleteConfirm = () => {
    if (selectedArtworkIds.length === 0) return;
    setIsBulkDeleteConfirmOpen(true);
  };

  const handleExecuteBulkDelete = async () => {
    setIsBulkDeleteConfirmOpen(false);
    try {
      await deleteArtworks(selectedArtworkIds);
      await loadData();
      if (selectedArtwork && selectedArtworkIds.includes(selectedArtwork.id)) {
        setSelectedArtwork(null);
      }
      setSelectedArtworkIds([]);
    } catch (err: any) {
      console.error('Errore durante eliminazione di gruppo:', err);
    }
  };

  // Aggiornamento rapido dello stato
  const handleQuickUpdateStatus = async (artwork: Artwork, newStatus: ArtworkStatus) => {
    const updated: Artwork = {
      ...artwork,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    await saveArtwork(updated);
    await loadData();
    setSelectedArtwork(updated);
  };

  // Aggiornamento rapido della collocazione (dov'è presente)
  const handleQuickUpdateLocation = async (artwork: Artwork, newLocation: string) => {
    const updated: Artwork = {
      ...artwork,
      location: newLocation,
      updatedAt: new Date().toISOString()
    };
    await saveArtwork(updated);
    await loadData();
    setSelectedArtwork(updated);
  };

  // Aggiornamento immagine opera (dall'editor foto)
  const handleUpdateArtworkImage = async (artwork: Artwork, newImage: string, imageIndex: number) => {
    const images = [...(artwork.images || [])];
    if (images.length === 0) {
      images.push(newImage);
    } else {
      images[imageIndex] = newImage;
    }
    const updated: Artwork = {
      ...artwork,
      images,
      updatedAt: new Date().toISOString()
    };
    await saveArtwork(updated);
    await loadData();
    setSelectedArtwork(updated);
  };

  // Salvataggio profilo bottega
  const handleSaveProfile = async (profile: StudioProfile) => {
    await saveStudioProfile(profile);
    setStudioProfile(profile);
    localStorage.setItem('operaviva_setup_completed', 'true');
    setIsFirstRun(false);
  };

  return (
    <div className="app-container">
      
      {/* Header Principale */}
      <Header 
        artworks={artworks}
        studioProfile={studioProfile}
        onOpenNewArtworkModal={() => {
          setArtworkToEdit(null);
          setIsNewArtworkModalOpen(true);
        }}
        onOpenStatsModal={() => setIsStatsModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenCatalogModal={() => setIsCatalogModalOpen(true)}
        onOpenCloudModal={() => setIsCloudModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main-wrapper">
        
        {/* Barra Ricerca & Filtri Dinamici */}
        <div className="toolbar-card">
          <div className="toolbar-search-row">
            
            {/* Input di Ricerca Immediata */}
            <div className="search-input-wrapper">
              <Search className="search-icon" size={17} />
              <input 
                type="text" 
                className="search-input"
                placeholder={t('searchPlaceholder')}
                value={filters.searchQuery}
                onChange={e => setFilters({ ...filters, searchQuery: e.target.value })}
                id="search-artworks"
              />
            </div>

            {/* Raggruppamento Filtri Dropdown con Icone e Design Atelier */}
            <div className="filter-dropdowns-group">
              {/* Filtro Collocazione */}
              <div 
                className={`filter-select-box ${filters.location ? 'has-value' : ''}`} 
                title={t('location')}
                onClick={() => setActiveActionSheet('location')}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
              >
                <MapPin size={15} className="select-lead-icon" />
                <span className="filter-select-input" style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {filters.location || t('allLocations')}
                </span>
                <ChevronDown size={14} className="select-chevron-icon" />
              </div>

              {/* Filtro Tecnica */}
              <div 
                className={`filter-select-box ${filters.technique ? 'has-value' : ''}`} 
                title={t('technique')}
                onClick={() => setActiveActionSheet('technique')}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
              >
                <Palette size={15} className="select-lead-icon" />
                <span className="filter-select-input" style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {filters.technique || t('allTechniques')}
                </span>
                <ChevronDown size={14} className="select-chevron-icon" />
              </div>

              {/* Ordinamento */}
              <div 
                className={`filter-select-box ${filters.sortBy !== 'date_desc' ? 'has-value' : ''}`} 
                title="Ordina"
                onClick={() => setActiveActionSheet('sort')}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
              >
                <ArrowUpDown size={15} className="select-lead-icon" />
                <span className="filter-select-input" style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {filters.sortBy === 'date_desc' ? t('sortLatest') :
                   filters.sortBy === 'date_asc' ? t('sortOldest') :
                   filters.sortBy === 'price_desc' ? t('sortPriceDesc') :
                   filters.sortBy === 'price_asc' ? t('sortPriceAsc') :
                   filters.sortBy === 'title_asc' ? t('sortTitleAsc') :
                   filters.sortBy === 'year_desc' ? t('sortYearDesc') : t('sortLatest')}
                </span>
                <ChevronDown size={14} className="select-chevron-icon" />
              </div>
            </div>

          </div>

          {/* Schede Filtro Stato Rapido */}
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filters.status === 'all' ? 'active' : ''}`}
              onClick={() => setFilters({ ...filters, status: 'all' })}
            >
              {t('tabAll')} ({artworks.length})
            </button>

            <button 
              className={`filter-tab ${filters.status === 'bottega' ? 'active' : ''}`}
              onClick={() => setFilters({ ...filters, status: 'bottega' })}
            >
              <span style={{ color: 'var(--status-bottega)', marginRight: '4px' }}>●</span>
              {t('tabBottega')} ({artworks.filter(a => a.status === 'bottega').length})
            </button>

            <button 
              className={`filter-tab ${filters.status === 'mostra' ? 'active' : ''}`}
              onClick={() => setFilters({ ...filters, status: 'mostra' })}
            >
              <span style={{ color: 'var(--status-mostra)', marginRight: '4px' }}>●</span>
              {t('tabMostra')} ({artworks.filter(a => a.status === 'mostra').length})
            </button>

            <button 
              className={`filter-tab ${filters.status === 'venduto' ? 'active' : ''}`}
              onClick={() => setFilters({ ...filters, status: 'venduto' })}
            >
              <span style={{ color: 'var(--status-venduto)', marginRight: '4px' }}>●</span>
              {t('tabVenduto')} ({artworks.filter(a => a.status === 'venduto').length})
            </button>

            <button 
              className={`filter-tab ${filters.status === 'in_corso' ? 'active' : ''}`}
              onClick={() => setFilters({ ...filters, status: 'in_corso' })}
            >
              <span style={{ color: 'var(--status-in_corso)', marginRight: '4px' }}>●</span>
              {t('tabInCorso')} ({artworks.filter(a => a.status === 'in_corso').length})
            </button>

            <button 
              className={`filter-tab ${filters.status === 'prestito' ? 'active' : ''}`}
              onClick={() => setFilters({ ...filters, status: 'prestito' })}
            >
              <span style={{ color: 'var(--status-prestito)', marginRight: '4px' }}>●</span>
              {t('tabPrestito')} ({artworks.filter(a => a.status === 'prestito').length})
            </button>

            {(filters.searchQuery || filters.status !== 'all' || filters.location || filters.technique) && (
              <button 
                type="button"
                className="btn-reset-filters"
                onClick={() => setFilters({
                  searchQuery: '',
                  status: 'all',
                  location: '',
                  technique: '',
                  minPrice: 0,
                  maxPrice: 0,
                  sortBy: 'date_desc',
                  onlyFramed: false
                })}
              >
                <X size={13} style={{ strokeWidth: 2.5 }} />
                <span>{language === 'en' ? 'Reset filters' : 'Azzera filtri'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Barra di Stato Catalogo & Selezione Multipla */}
        {!isLoading && filteredArtworks.length > 0 && (
          <div className="catalog-meta-bar">
            <div className="catalog-count-info">
              <span>{t('catalogCount')} <strong>{filteredArtworks.length}</strong></span>
              {selectedArtworkIds.length > 0 && (
                <span className="selected-tag">{selectedArtworkIds.length} {t('selectedArtworks').toLowerCase()}</span>
              )}
            </div>

            <div className="catalog-actions-right">
              <button 
                type="button"
                className={`btn ${selectedArtworkIds.length > 0 ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => {
                  if (selectedArtworkIds.length > 0) {
                    handleDeselectAll();
                  } else {
                    handleSelectAllVisible();
                  }
                }}
                id="btn-multi-select"
                title={t('multiSelectBtn')}
              >
                <CheckSquare size={16} />
                <span>
                  {selectedArtworkIds.length > 0 
                    ? `${t('deselectAll')} (${selectedArtworkIds.length})` 
                    : t('multiSelectBtn')}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Griglia Opere */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
            {language === 'en' ? 'Loading studio catalog...' : 'Caricamento inventario in corso...'}
          </div>
        ) : filteredArtworks.length > 0 ? (
          <div className="artworks-grid">
            {filteredArtworks.map(artwork => (
              <ArtworkCard 
                key={artwork.id}
                artwork={artwork}
                onSelect={(art) => setSelectedArtwork(art)}
                isSelected={selectedArtworkIds.includes(artwork.id)}
                isSelectionMode={selectedArtworkIds.length > 0}
                onToggleSelect={handleToggleSelectArtwork}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <ImageOff className="empty-state-icon" />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
              {language === 'en' ? 'No artworks found' : 'Nessuna opera trovata'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {filters.searchQuery || filters.status !== 'all' || filters.location
                ? (language === 'en'
                    ? 'Try adjusting your search query, status tabs, or selected location.'
                    : 'Prova a modificare i filtri di ricerca o la collocazione selezionata.')
                : (language === 'en'
                    ? 'Your studio inventory is empty. Start by cataloging your first painting or sculpture!'
                    : 'Il tuo inventario è vuoto. Inizia registrando il primo quadro o scultura presente in bottega!')}
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setArtworkToEdit(null);
                setIsNewArtworkModalOpen(true);
              }}
            >
              <Plus size={18} />
              <span>{language === 'en' ? 'Register your first artwork' : 'Registra la tua prima opera'}</span>
            </button>
          </div>
        )}

        {/* Floating Batch Action Bar per Multi-Selezione & Multi-Eliminazione */}
        {selectedArtworkIds.length > 0 && (
          <div className="batch-action-bar">
            <div className="batch-info">
              <span className="batch-count-badge">
                {selectedArtworkIds.length}
              </span>
              <span className="batch-label">
                {selectedArtworkIds.length === 1 ? t('operaSingular') : t('opereCount')} {t('selectedArtworks').toLowerCase()}
              </span>
            </div>

            <div className="batch-buttons">
              {/* Seleziona tutte le visibili / Deseleziona */}
              {selectedArtworkIds.length < filteredArtworks.length ? (
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={handleSelectAllVisible}
                  title={t('selectAllVisible', { count: filteredArtworks.length })}
                >
                  <CheckSquare size={15} />
                  <span>{t('selectAllVisible', { count: filteredArtworks.length })}</span>
                </button>
              ) : (
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={handleDeselectAll}
                >
                  <Square size={15} />
                  <span>{t('deselectAll')}</span>
                </button>
              )}

              {/* Pulsante Eliminazione Multipla */}
              <button 
                type="button" 
                className="btn btn-sm"
                onClick={handleOpenBulkDeleteConfirm}
                style={{
                  background: 'rgba(239, 68, 68, 0.22)',
                  border: '1px solid #ef4444',
                  color: '#fca5a5',
                  fontWeight: 600
                }}
                title={t('bulkDeleteBtn')}
              >
                <Trash2 size={15} />
                <span>{t('bulkDeleteBtn')} ({selectedArtworkIds.length})</span>
              </button>

              {/* Genera Catalogo A4 per Opere Selezionate */}
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => setIsCatalogModalOpen(true)}
                title={language === 'en' ? 'Generate A4 PDF Catalog for selected' : 'Genera Catalogo A4 PDF per le opere selezionate'}
                id="btn-batch-catalog"
              >
                <BookOpen size={15} color="#d4af37" />
                <span>{language === 'en' ? 'A4 Catalog' : 'Catalogo A4'} ({selectedArtworkIds.length})</span>
              </button>

              {/* Annulla Selezione */}
              <button 
                type="button" 
                className="btn-icon"
                onClick={handleDeselectAll}
                title={t('exitMultiSelect')}
                style={{ marginLeft: '0.35rem' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer Ufficiale con Firma d'Autore */}
      <footer style={{
        textAlign: 'center',
        padding: '2.5rem 1rem 3rem',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        letterSpacing: '0.05em',
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        marginTop: '3rem'
      }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.92rem', color: 'var(--gold-400)', marginBottom: '0.35rem', letterSpacing: '0.12em' }}>
          OPERAVIVA
        </div>
        <div style={{ textTransform: 'uppercase', fontSize: '0.74rem', opacity: 0.85 }}>
          Created by Marzio Sparla
        </div>
      </footer>

      {/* Modale Dettaglio Opera */}
      {selectedArtwork && (
        <ArtworkDetailModal 
          artwork={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
          onEdit={(art) => {
            setSelectedArtwork(null);
            setArtworkToEdit(art);
            setIsNewArtworkModalOpen(true);
          }}
          onDelete={handleDeleteArtwork}
          onPrintCertificate={(art) => setArtworkToPrint(art)}
          onQuickUpdateStatus={handleQuickUpdateStatus}
          onQuickUpdateLocation={handleQuickUpdateLocation}
          onUpdateImage={handleUpdateArtworkImage}
        />
      )}

      {/* Modale Inserimento / Modifica Opera */}
      {isNewArtworkModalOpen && (
        <ArtworkModal 
          artworkToEdit={artworkToEdit}
          studioProfile={studioProfile}
          existingArtworks={artworks}
          onSave={handleSaveArtwork}
          onClose={() => {
            setIsNewArtworkModalOpen(false);
            setArtworkToEdit(null);
          }}
        />
      )}

      {/* Scheda / Certificato di Autenticità Stampabile */}
      {artworkToPrint && (
        <CertificatePrintView 
          artwork={artworkToPrint}
          studioProfile={studioProfile}
          onClose={() => setArtworkToPrint(null)}
          onEdit={(art) => {
            setArtworkToPrint(null);
            setSelectedArtwork(null);
            setArtworkToEdit(art);
            setIsNewArtworkModalOpen(true);
          }}
        />
      )}

      {/* Modale Statistiche Bottega */}
      {isStatsModalOpen && (
        <StatsModal 
          artworks={artworks}
          studioProfile={studioProfile}
          onClose={() => setIsStatsModalOpen(false)}
        />
      )}

      {/* Modale Backup & Condivisione Dati */}
      {isBackupModalOpen && (
        <BackupModal 
          onClose={() => setIsBackupModalOpen(false)}
          onDataChanged={loadData}
          onOpenSiteImporter={() => setIsSiteImporterOpen(true)}
        />
      )}

      {/* Modale Importazione Automatica da Sito Web / Cartella */}
      {isSiteImporterOpen && (
        <SiteImporterModal 
          studioProfile={studioProfile}
          onClose={() => setIsSiteImporterOpen(false)}
          onSuccess={loadData}
        />
      )}

      {/* Modale Profilo Bottega & Artista */}
      {isProfileModalOpen && (
        <ProfileModal 
          studioProfile={studioProfile}
          isFirstRun={isFirstRun}
          onSave={handleSaveProfile}
          onClose={() => {
            setIsProfileModalOpen(false);
            setIsFirstRun(false);
          }}
        />
      )}

      {/* Banner Pop-up di Conferma Eliminazione Multipla a tema Bottega */}
      <ConfirmModal
        isOpen={isBulkDeleteConfirmOpen}
        title={language === 'en' ? 'Delete Selected Artworks' : 'Eliminazione Opere Selezionate'}
        message={language === 'en'
          ? `Are you sure you want to permanently delete the ${selectedArtworkIds.length} selected artworks from your catalog?`
          : `Sei sicuro di voler eliminare definitivamente le ${selectedArtworkIds.length} opere selezionate dall'archivio?`}
        warningNote={language === 'en'
          ? 'This batch operation cannot be undone. All technical records, photos, and certificates will be erased.'
          : 'Questa operazione di gruppo è irreversibile. Tutte le schede, le foto e i certificati selezionati verranno rimossi.'}
        confirmLabel={language === 'en' ? `Yes, Delete (${selectedArtworkIds.length})` : `Sì, Elimina (${selectedArtworkIds.length})`}
        cancelLabel={language === 'en' ? 'No, Cancel' : 'No, Annulla'}
        isDanger={true}
        onConfirm={handleExecuteBulkDelete}
        onCancel={() => setIsBulkDeleteConfirmOpen(false)}
      />

      {/* Modale Generatore Catalogo & Portfolio A4 d'Archivio */}
      {isCatalogModalOpen && (
        <CatalogPrintModal
          artworks={artworks}
          selectedArtworkIds={selectedArtworkIds}
          studioProfile={studioProfile}
          onClose={() => setIsCatalogModalOpen(false)}
        />
      )}

      {/* Modale OperaViva Cloud WebApp & 2FA Authenticator */}
      <CloudSyncModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        artworks={artworks}
        studioProfile={studioProfile}
        onDataSynced={loadData}
      />

      {/* Atelier Action Sheets per Filtri e Ordinamento (Mobile e Desktop) */}
      <AtelierActionSheet
        isOpen={activeActionSheet === 'location'}
        title={t('location')}
        icon={<MapPin size={20} />}
        options={[
          { value: '', label: t('allLocations') },
          ...uniqueLocations.map(loc => ({ value: loc, label: loc }))
        ]}
        selectedValue={filters.location}
        onSelect={val => setFilters(f => ({ ...f, location: val }))}
        onClose={() => setActiveActionSheet(null)}
      />

      <AtelierActionSheet
        isOpen={activeActionSheet === 'technique'}
        title={t('technique')}
        icon={<Palette size={20} />}
        options={[
          { value: '', label: t('allTechniques') },
          ...uniqueTechniques.map(tech => ({ value: tech, label: tech }))
        ]}
        selectedValue={filters.technique}
        onSelect={val => setFilters(f => ({ ...f, technique: val }))}
        onClose={() => setActiveActionSheet(null)}
      />

      <AtelierActionSheet
        isOpen={activeActionSheet === 'sort'}
        title="Ordina Opere"
        icon={<ArrowUpDown size={20} />}
        options={[
          { value: 'date_desc', label: t('sortLatest') },
          { value: 'date_asc', label: t('sortOldest') },
          { value: 'price_desc', label: t('sortPriceDesc') },
          { value: 'price_asc', label: t('sortPriceAsc') },
          { value: 'title_asc', label: t('sortTitleAsc') },
          { value: 'year_desc', label: t('sortYearDesc') }
        ]}
        selectedValue={filters.sortBy}
        onSelect={val => setFilters(f => ({ ...f, sortBy: val as any }))}
        onClose={() => setActiveActionSheet(null)}
      />

    </div>
  );
}
export default App;
