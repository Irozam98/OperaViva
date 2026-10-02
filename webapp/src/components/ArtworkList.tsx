import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Palette } from 'lucide-react';
import { Artwork, ArtworkStatus } from '../types';
import { ArtworkCard } from './ArtworkCard';

interface ArtworkListProps {
  artworks: Artwork[];
  onSelectArtwork: (artwork: Artwork) => void;
  onNewArtwork: () => void;
  isLoading: boolean;
}

export const ArtworkList: React.FC<ArtworkListProps> = ({
  artworks,
  onSelectArtwork,
  onNewArtwork,
  isLoading
}) => {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ArtworkStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'price_desc' | 'price_asc' | 'title'>('recent');

  const filteredArtworks = useMemo(() => {
    return artworks.filter((item) => {
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        item.title.toLowerCase().includes(term) ||
        item.code.toLowerCase().includes(term) ||
        item.technique.toLowerCase().includes(term) ||
        (item.location && item.location.toLowerCase().includes(term));

      return matchesStatus && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [artworks, search, selectedStatus, sortBy]);

  return (
    <div className="catalog-container">
      {/* Barra Ricerca & Filtri */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Cerca per titolo, codice, tecnica, collocazione..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch('')}>×</button>
          )}
        </div>

        <div className="filter-controls">
          <div className="status-pills">
            <button
              type="button"
              className={`pill ${selectedStatus === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('all')}
            >
              Tutte ({artworks.length})
            </button>
            <button
              type="button"
              className={`pill ${selectedStatus === 'bottega' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('bottega')}
            >
              Bottega
            </button>
            <button
              type="button"
              className={`pill ${selectedStatus === 'mostra' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('mostra')}
            >
              Mostra
            </button>
            <button
              type="button"
              className={`pill ${selectedStatus === 'venduto' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('venduto')}
            >
              Vendute
            </button>
          </div>

          <div className="sort-box">
            <Filter size={16} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="recent">Più Recenti</option>
              <option value="price_desc">Prezzo più alto</option>
              <option value="price_asc">Prezzo più basso</option>
              <option value="title">Titolo (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Griglia Opere */}
      {isLoading ? (
        <div className="catalog-loading">
          <div className="spinner"></div>
          <p>Caricamento archivio d'arte da Cloudflare...</p>
        </div>
      ) : filteredArtworks.length > 0 ? (
        <div className="artworks-grid">
          {filteredArtworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              onClick={() => onSelectArtwork(artwork)}
            />
          ))}
        </div>
      ) : (
        <div className="catalog-empty">
          <div className="empty-icon-wrap">
            <Palette size={48} />
          </div>
          <h3>Nessuna opera trovata</h3>
          <p>
            {search || selectedStatus !== 'all'
              ? 'Nessun quadro corrisponde ai criteri di ricerca impostati.'
              : 'Il tuo archivio cloud è ancora vuoto. Inizia a catalogare la tua prima creazione!'}
          </p>
          <button type="button" className="btn-action-primary" onClick={onNewArtwork}>
            <Plus size={18} />
            <span>Nuova Scheda Opera</span>
          </button>
        </div>
      )}
    </div>
  );
};
