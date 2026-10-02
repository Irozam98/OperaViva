import React from 'react';
import { X, TrendingUp, DollarSign, Palette, Award, Layers } from 'lucide-react';
import { Artwork } from '../types';

interface StatsModalProps {
  artworks: Artwork[];
  isOpen: boolean;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ artworks, isOpen, onClose }) => {
  if (!isOpen) return null;

  const totalCount = artworks.length;
  const inBottega = artworks.filter(a => a.status === 'bottega').length;
  const inMostra = artworks.filter(a => a.status === 'mostra').length;
  const vendute = artworks.filter(a => a.status === 'venduto').length;
  const inPrestito = artworks.filter(a => a.status === 'prestito').length;

  const totalValue = artworks.reduce((acc, a) => acc + (a.price || 0), 0);
  const availableValue = artworks.filter(a => a.status === 'bottega' || a.status === 'mostra').reduce((acc, a) => acc + (a.price || 0), 0);
  const soldValue = artworks.filter(a => a.status === 'venduto').reduce((acc, a) => acc + (a.price || 0), 0);
  const avgPrice = totalCount > 0 ? Math.round(totalValue / totalCount) : 0;

  // Raggruppamento per Tecnica
  const techniqueMap: Record<string, number> = {};
  artworks.forEach(a => {
    const tech = a.technique || 'Altro';
    techniqueMap[tech] = (techniqueMap[tech] || 0) + 1;
  });

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog modal-md">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h2>Statistiche & Patrimonio Artistico</h2>
            <span className="modal-subtitle">Analisi economica e consistenza del catalogo bottega</span>
          </div>
          <button type="button" className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="stats-content">
          {/* Valori Economici */}
          <div className="stats-cards-grid">
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Valore Totale Archivio</span>
                <DollarSign size={18} className="gold-icon" />
              </div>
              <div className="stat-card-number">{totalValue.toLocaleString('it-IT')} €</div>
              <span className="stat-card-sub">Stima su {totalCount} opere catalogate</span>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Patrimonio Disponibile</span>
                <TrendingUp size={18} className="gold-icon" />
              </div>
              <div className="stat-card-number text-green">{availableValue.toLocaleString('it-IT')} €</div>
              <span className="stat-card-sub">Opere pronte per la vendita</span>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Capitale Realizzato (Venduto)</span>
                <Award size={18} className="gold-icon" />
              </div>
              <div className="stat-card-number">{soldValue.toLocaleString('it-IT')} €</div>
              <span className="stat-card-sub">{vendute} opere collocate</span>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Quotazione Media</span>
                <Palette size={18} className="gold-icon" />
              </div>
              <div className="stat-card-number">{avgPrice.toLocaleString('it-IT')} €</div>
              <span className="stat-card-sub">Prezzo medio per opera</span>
            </div>
          </div>

          {/* Ripartizione Stato */}
          <div className="stats-section">
            <h4 className="stats-section-title">Ripartizione Collocazione Opere</h4>
            <div className="status-bars">
              <div className="status-bar-row">
                <span className="bar-label">In Bottega / Atelier ({inBottega})</span>
                <div className="bar-track">
                  <div className="bar-fill bg-gold" style={{ width: `${totalCount ? (inBottega / totalCount) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div className="status-bar-row">
                <span className="bar-label">In Mostra / Esposizione ({inMostra})</span>
                <div className="bar-track">
                  <div className="bar-fill bg-blue" style={{ width: `${totalCount ? (inMostra / totalCount) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div className="status-bar-row">
                <span className="bar-label">Vendute ({vendute})</span>
                <div className="bar-track">
                  <div className="bar-fill bg-green" style={{ width: `${totalCount ? (vendute / totalCount) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div className="status-bar-row">
                <span className="bar-label">In Prestito ({inPrestito})</span>
                <div className="bar-track">
                  <div className="bar-fill bg-purple" style={{ width: `${totalCount ? (inPrestito / totalCount) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Tecniche */}
          <div className="stats-section">
            <h4 className="stats-section-title">Tecniche Più Utilizzate</h4>
            <div className="technique-tags-cloud">
              {Object.entries(techniqueMap).map(([tech, count]) => (
                <div key={tech} className="tech-badge">
                  <span>{tech}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
