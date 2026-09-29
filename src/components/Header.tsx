import React from 'react';
import { Palette, Plus, Download, BarChart3, Settings, BookOpen } from 'lucide-react';
import { Artwork, StudioProfile } from '../types/artwork';
import { useI18n } from '../i18n';
import { FlagIcon } from './FlagIcon';

interface HeaderProps {
  artworks: Artwork[];
  studioProfile: StudioProfile;
  onOpenNewArtworkModal: () => void;
  onOpenStatsModal: () => void;
  onOpenBackupModal: () => void;
  onOpenProfileModal: () => void;
  onOpenCatalogModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  artworks,
  studioProfile,
  onOpenNewArtworkModal,
  onOpenStatsModal,
  onOpenBackupModal,
  onOpenProfileModal,
  onOpenCatalogModal,
}) => {
  const { language, setLanguage, t } = useI18n();

  // Statistiche rapide calcolate in tempo reale
  const totalArtworks = artworks.length;
  const inBottega = artworks.filter(a => a.status === 'bottega').length;
  const inMostra = artworks.filter(a => a.status === 'mostra').length;
  const vendute = artworks.filter(a => a.status === 'venduto').length;
  
  // Valore economico opere attualmente in bottega (disponibili per la vendita)
  const availableValue = artworks
    .filter(a => a.status === 'bottega' || a.status === 'mostra')
    .reduce((sum, a) => sum + (Number(a.price) || 0), 0);

  // Sanitize currency: Intl.NumberFormat needs ISO 4217 codes (EUR, USD…), not symbols (€, $…)
  const isoCurrency = /^[A-Z]{3}$/.test(studioProfile.currency ?? '') 
    ? studioProfile.currency 
    : 'EUR';
  const formattedValue = new Intl.NumberFormat(language === 'it' ? 'it-IT' : 'en-US', {
    style: 'currency',
    currency: isoCurrency,
    maximumFractionDigits: 0
  }).format(availableValue);

  // Bottone unificato lingua solo con bandierina italiana e inglese grafica SVG che cambia al click
  const renderLangSwitch = (extraClass = '') => (
    <button
      type="button"
      className={`btn-lang-unified ${extraClass}`}
      onClick={() => setLanguage(language === 'it' ? 'en' : 'it')}
      title={language === 'it' ? 'Lingua attuale: Italiano (clicca per passare in Inglese)' : 'Current language: English (click to switch to Italian)'}
      aria-label="Cambia Lingua"
    >
      <FlagIcon language={language} size={24} />
    </button>
  );

  return (
    <>
      <header className="header-bar">
        <div className="header-content">
          <div className="header-brand-wrap">
            <div className="logo-section" onClick={onOpenProfileModal} title={t('profileSettings')}>
              <div className="logo-icon-wrapper">
                <Palette size={22} color="#c5a059" />
              </div>
              <div className="logo-text">
                <h1>{t('brandTitle')}</h1>
                <p>
                  {[studioProfile.studioName, studioProfile.artistName].filter(Boolean).join(' • ') || t('defaultArchiveTitle')}
                </p>
              </div>
            </div>

            {/* Controlli rapidi mobile: Switch lingua a scorrimento + Impostazioni */}
            <div className="mobile-header-tools">
              {renderLangSwitch('mobile-switch')}

              <button 
                className="btn-icon header-settings-btn mobile-only-btn"
                onClick={onOpenProfileModal}
                id="btn-profile-mobile"
                title={t('profileSettings')}
                aria-label={t('profileSettings')}
              >
                <Settings size={18} />
              </button>
            </div>
          </div>

          <div className="header-actions">
            <button 
              className="btn btn-primary btn-add-main"
              onClick={onOpenNewArtworkModal}
              id="btn-add-artwork"
              title={t('newArtwork')}
            >
              <Plus size={17} />
              <span>{t('newArtwork')}</span>
            </button>

            <button 
              className="btn btn-secondary header-btn-secondary"
              onClick={onOpenStatsModal}
              id="btn-stats"
              title={t('stats')}
            >
              <BarChart3 size={15} />
              <span>{t('stats')}</span>
            </button>

            <button 
              className="btn btn-secondary header-btn-secondary"
              onClick={onOpenBackupModal}
              id="btn-backup"
              title={t('backup')}
            >
              <Download size={15} />
              <span>{t('backup')}</span>
            </button>

            <button 
              className="btn btn-secondary header-btn-secondary"
              onClick={onOpenCatalogModal}
              id="btn-catalog"
              title={t('catalog')}
            >
              <BookOpen size={15} color="#d4af37" />
              <span>{t('catalog')}</span>
            </button>

            {/* Switch Lingua a scorrimento con bandierine su desktop */}
            {renderLangSwitch('desktop-only-switch')}

            {/* Pulsante Impostazioni visibile su desktop */}
            <button 
              className="btn-icon header-settings-btn desktop-only-btn"
              onClick={onOpenProfileModal}
              id="btn-profile"
              title={t('profileSettings')}
              aria-label={t('profileSettings')}
            >
              <Settings size={17} />
            </button>
          </div>
        </div>
      </header>

      {/* Fascia Curatoriale d'Atelier */}
      <div className="curator-summary-bar">
        <div className="curator-counts">
          <span className="curator-label">{t('archiveGeneral')}:</span>
          <strong>{totalArtworks} {totalArtworks === 1 ? t('operaSingular') : t('opereCount')}</strong>
          <span className="curator-sep">/</span>
          <span>{inBottega} {t('inBottega')}</span>
          <span className="curator-sep">/</span>
          <span>{inMostra} {t('inMostra')}</span>
          {vendute > 0 && (
            <>
              <span className="curator-sep">/</span>
              <span>{vendute} {t('inCollezioniPrivate')}</span>
            </>
          )}
        </div>
        <div className="curator-value">
          <span>{t('valoreDisponibili')}</span>
          <strong>{formattedValue}</strong>
        </div>
      </div>
    </>
  );
};
