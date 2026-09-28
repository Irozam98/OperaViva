import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Plus, SlidersHorizontal, ImageOff, ArrowUpDown, MapPin, Tag } from 'lucide-react';
import { Artwork, ArtworkStatus, FilterState, StudioProfile } from './types/artwork';
import { db, getAllArtworks, getStudioProfile, saveArtwork, deleteArtwork, saveStudioProfile, initializeDatabase } from './services/db';
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

export function App() {
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
      await initializeDatabase();
      const list = await getAllArtworks();
      const profile = await getStudioProfile();
      setArtworks(list);
      setStudioProfile(profile);
    } catch (err) {
      console.error('Errore caricamento dati:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

  // Eliminazione opera
  const handleDeleteArtwork = async (id: string) => {
    await deleteArtwork(id);
    await loadData();
    setSelectedArtwork(null);
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
                placeholder="Cerca per titolo opera, codice, tecnica, collocazione..."
                value={filters.searchQuery}
                onChange={e => setFilters({ ...filters, searchQuery: e.target.value })}
                id="search-artworks"
              />
            </div>

            {/* Raggruppamento Filtri Dropdown Responsive */}
            <div className="filter-dropdowns-group">
              <select 
                className="filter-dropdown-select"
                value={filters.location}
                onChange={e => setFilters({ ...filters, location: e.target.value })}
                id="filter-location"
                title="Filtra per collocazione"
              >
                <option value="">Tutte le Collocazioni</option>
                {uniqueLocations.map((loc, idx) => (
                  <option key={idx} value={loc}>{loc}</option>
                ))}
              </select>

              <select 
                className="filter-dropdown-select"
                value={filters.technique}
                onChange={e => setFilters({ ...filters, technique: e.target.value })}
                id="filter-technique"
                title="Filtra per tecnica pittorica"
              >
                <option value="">Tutte le Tecniche</option>
                {uniqueTechniques.map((tech, idx) => (
                  <option key={idx} value={tech}>{tech}</option>
                ))}
              </select>

              <select 
                className="filter-dropdown-select"
                value={filters.sortBy}
                onChange={e => setFilters({ ...filters, sortBy: e.target.value as any })}
                id="filter-sort"
                title="Ordinamento catalogo"
              >
                <option value="date_desc">Più recenti inseriti</option>
                <option value="date_asc">Meno recenti inseriti</option>
                <option value="price_desc">Prezzo: dal più alto</option>
                <option value="price_asc">Prezzo: dal più basso</option>
                <option value="title_asc">Titolo (A - Z)</option>
                <option value="year_desc">Anno di realizzazione</option>
              </select>
            </div>

          </div>

          {/* Schede Filtro Stato Rapido */}
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filters.status === 'all' ? 'active' : ''}`}
              onClick={() => setFilters({ ...filters, status: 'all' })}
            >
              Tutte le Opere ({artworks.length})
            </button>

            <button 
              className={`filter-tab ${filters.status === 'bottega' ? 'active' : ''}`}
              onClick={() => setFilters({ ...filters, status: 'bottega' })}
            >
              <span style={{ color: 'var(--status-bottega)', marginRight: '4px' }}>●</span>
              In Bottega ({artworks.filter(a => a.status === 'bottega').length})
            </button>

            <button 
              className={`filter-tab ${filters.status === 'mostra' ? 'active' : ''}`}
              onClick={() => setFilters({ ...filters, status: 'mostra' })}
            >
              <span style={{ color: 'var(--status-mostra)', marginRight: '4px' }}>●</span>
              In Mostra ({artworks.filter(a => a.status === 'mostra').length})
            </button>

            <button 
              className={`filter-tab ${filters.status === 'venduto' ? 'active' : ''}`}
              onClick={() => setFilters({ ...filters, status: 'venduto' })}
            >
              <span style={{ color: 'var(--status-venduto)', marginRight: '4px' }}>●</span>
              Venduti ({artworks.filter(a => a.status === 'venduto').length})
            </button>

            <button 
              className={`filter-tab ${filters.status === 'in_corso' ? 'active' : ''}`}
              onClick={() => setFilters({ ...filters, status: 'in_corso' })}
            >
              <span style={{ color: 'var(--status-in_corso)', marginRight: '4px' }}>●</span>
              In Lavorazione ({artworks.filter(a => a.status === 'in_corso').length})
            </button>

            <button 
              className={`filter-tab ${filters.status === 'prestito' ? 'active' : ''}`}
              onClick={() => setFilters({ ...filters, status: 'prestito' })}
            >
              <span style={{ color: 'var(--status-prestito)', marginRight: '4px' }}>●</span>
              In Prestito ({artworks.filter(a => a.status === 'prestito').length})
            </button>

            {(filters.searchQuery || filters.status !== 'all' || filters.location || filters.technique) && (
              <button 
                className="btn-ghost btn-sm"
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
                style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--gold-400)' }}
              >
                Azzera filtri
              </button>
            )}
          </div>
        </div>

        {/* Griglia Opere */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
            Caricamento inventario in corso...
          </div>
        ) : filteredArtworks.length > 0 ? (
          <div className="artworks-grid">
            {filteredArtworks.map(artwork => (
              <ArtworkCard 
                key={artwork.id}
                artwork={artwork}
                onSelect={(art) => setSelectedArtwork(art)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <ImageOff className="empty-state-icon" />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
              Nessuna opera trovata
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {filters.searchQuery || filters.status !== 'all' || filters.location
                ? 'Prova a modificare i filtri di ricerca o la collocazione selezionata.'
                : 'Il tuo inventario è vuoto. Inizia registrando il primo quadro o scultura presente in bottega!'}
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setArtworkToEdit(null);
                setIsNewArtworkModalOpen(true);
              }}
            >
              <Plus size={18} />
              <span>Registra la tua prima opera</span>
            </button>
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
        />
      )}

      {/* Modale Statistiche Bottega */}
      {isStatsModalOpen && (
        <StatsModal 
          artworks={artworks}
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
          onSave={handleSaveProfile}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}

    </div>
  );
}
export default App;
