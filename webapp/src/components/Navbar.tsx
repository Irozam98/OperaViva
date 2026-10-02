import React from 'react';
import { Plus, BarChart3, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onNewArtwork: () => void;
  onOpenStats: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNewArtwork, onOpenStats, onOpenProfile }) => {
  const { artist, logout } = useAuth();

  return (
    <header className="atelier-navbar">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <div className="navbar-brand">
          <div className="brand-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logo-svg">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title">OPERA VIVA</span>
            <span className="brand-badge-cloud">CLOUD</span>
          </div>
        </div>

        {/* Info Artista & Studio */}
        {artist && (
          <div className="navbar-artist-info">
            <div className="artist-meta">
              <span className="artist-studio">{artist.studioName || 'Bottega d\'Arte'}</span>
              <span className="artist-name">{artist.artistName}</span>
            </div>
            <div className="security-badge" title="Tutti gli accessi sono protetti da verifica Authenticator 2FA">
              <ShieldCheck size={14} className="gold-icon" />
              <span>2FA Attivo</span>
            </div>
          </div>
        )}

        {/* Azioni */}
        <div className="navbar-actions">
          <button type="button" className="btn-action-primary" onClick={onNewArtwork}>
            <Plus size={18} />
            <span>Nuova Opera</span>
          </button>

          <button type="button" className="btn-action-ghost" onClick={onOpenStats} title="Statistiche Archivio">
            <BarChart3 size={18} />
            <span className="btn-label-desktop">Statistiche</span>
          </button>

          <button type="button" className="btn-action-ghost" onClick={onOpenProfile} title="Profilo Bottega">
            <Settings size={18} />
            <span className="btn-label-desktop">Profilo</span>
          </button>

          <button type="button" className="btn-action-logout" onClick={logout} title="Disconnetti Atelier">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
