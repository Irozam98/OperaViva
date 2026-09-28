import React from 'react';
import { X, BarChart3, TrendingUp, DollarSign, MapPin, Palette, CheckCircle2 } from 'lucide-react';
import { Artwork } from '../types/artwork';

interface StatsModalProps {
  artworks: Artwork[];
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ artworks, onClose }) => {
  const total = artworks.length;
  const inBottega = artworks.filter(a => a.status === 'bottega');
  const inMostra = artworks.filter(a => a.status === 'mostra');
  const vendute = artworks.filter(a => a.status === 'venduto');
  const inCorso = artworks.filter(a => a.status === 'in_corso');
  const inPrestito = artworks.filter(a => a.status === 'prestito');

  const valBottega = inBottega.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  const valMostra = inMostra.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  const valVendute = vendute.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  const valTotaleDisponibile = valBottega + valMostra;

  const avgPrice = total > 0 
    ? Math.round(artworks.reduce((sum, a) => sum + (Number(a.price) || 0), 0) / total)
    : 0;

  // Ripartizione per Tecnica
  const techniqueCounts: Record<string, number> = {};
  artworks.forEach(a => {
    const tech = a.technique || 'Altro';
    techniqueCounts[tech] = (techniqueCounts[tech] || 0) + 1;
  });

  // Ripartizione per Collocazione
  const locationCounts: Record<string, number> = {};
  artworks.forEach(a => {
    const loc = a.location || 'Non specificata';
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });

  const formatEuro = (val: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-card-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BarChart3 size={22} color="#d4af37" />
            <h2 className="modal-title">Statistiche Atelier & Valore Economico</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Card Principali KPI */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-md)', padding: '1.2rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Valore Opere in Bottega
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--gold-400)', fontFamily: 'var(--font-serif)', marginTop: '4px' }}>
                {formatEuro(valBottega)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {inBottega.length} opere disponibili subito
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.2rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Valore Opere in Mostra
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#60a5fa', fontFamily: 'var(--font-serif)', marginTop: '4px' }}>
                {formatEuro(valMostra)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {inMostra.length} opere esposte in galleria
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.2rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Incasso Opere Vendute
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#c084fc', fontFamily: 'var(--font-serif)', marginTop: '4px' }}>
                {formatEuro(valVendute)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {vendute.length} opere vendute
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.2rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Prezzo Medio ad Opera
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-serif)', marginTop: '4px' }}>
                {formatEuro(avgPrice)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Su {total} opere totali
              </div>
            </div>

          </div>

          {/* Griglia Dettaglio Tecniche & Collocazioni */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            
            {/* Ripartizione Collocazioni */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--gold-400)', fontWeight: 600 }}>
                <MapPin size={18} />
                <span>Opere per Collocazione ({Object.keys(locationCounts).length} luoghi)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '200px', overflowY: 'auto' }}>
                {Object.entries(locationCounts).map(([loc, count], idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>{loc}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold-300)' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ripartizione Tecniche */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--gold-400)', fontWeight: 600 }}>
                <Palette size={18} />
                <span>Opere per Tecnica Esecutiva</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '200px', overflowY: 'auto' }}>
                {Object.entries(techniqueCounts).map(([tech, count], idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>{tech}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
