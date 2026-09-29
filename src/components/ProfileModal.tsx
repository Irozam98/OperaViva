import React, { useState } from 'react';
import { X, Building, User, Mail, Phone, Globe, MapPin, Hash, DollarSign, Languages } from 'lucide-react';
import { StudioProfile } from '../types/artwork';
import { useI18n } from '../i18n';
import { FlagIcon } from './FlagIcon';

interface ProfileModalProps {
  studioProfile: StudioProfile;
  onSave: (profile: StudioProfile) => void;
  onClose: () => void;
  isFirstRun?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  studioProfile,
  onSave,
  onClose,
  isFirstRun = false
}) => {
  const { t, language, setLanguage } = useI18n();
  const [profile, setProfile] = useState<StudioProfile>({ ...studioProfile });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profile);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: '640px',
          maxHeight: 'calc(100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 3.5rem)'
        }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Building size={22} color="#d4af37" />
            <h2 className="modal-title">
              {isFirstRun
                ? (language === 'en' ? 'Welcome to OperaViva — Studio Setup' : 'Benvenuto in OperaViva — Configurazione Bottega')
                : (language === 'en' ? 'Studio & Artist Settings' : 'Dati Bottega & Artista')}
            </h2>
          </div>
          {!isFirstRun && (
            <button className="btn-icon" onClick={onClose} title={language === 'en' ? 'Close' : 'Chiudi'}>
              <X size={20} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div className="modal-body">
            {isFirstRun && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.16) 0%, rgba(20, 24, 34, 0.95) 100%)',
                border: '1.5px solid var(--gold-400)',
                borderRadius: '12px',
                padding: '1rem 1.2rem',
                marginBottom: '1.1rem',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5), 0 0 20px rgba(212, 175, 55, 0.15)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <Building size={18} color="#d4af37" />
                  <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.05rem', margin: 0, color: 'var(--gold-300)', fontWeight: 700, letterSpacing: '0.5px' }}>
                    {language === 'en' ? 'First Launch: Setup Your Atelier' : 'Primo Avvio: Configura la tua Bottega'}
                  </h4>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                  {language === 'en'
                    ? 'Welcome to OperaViva! Enter your studio details and artist name below. These will be automatically stamped on your official Certificates of Authenticity, printable technical records, and catalog exports.'
                    : 'Benvenuto in OperaViva! Inserisci qui sotto le informazioni della tua bottega artistica e il nome dell\'artista. Verranno stampate automaticamente sui tuoi Certificati di Autenticità ufficiali e sulle schede d\'archivio.'}
                </p>
              </div>
            )}

            {!isFirstRun && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                {language === 'en'
                  ? 'These details will automatically appear on Certificates of Authenticity, printable technical sheets, and catalog headers.'
                  : 'Questi recapiti verranno inseriti automaticamente nei Certificati di Autenticità, nelle schede d\'opera stampabili e nell\'intestazione del catalogo.'}
              </p>
            )}

            <div className="form-grid">
              
              <div className="col-6 form-group">
                <label className="form-label">
                  <Building size={14} color="#d4af37" />
                  {language === 'en' ? 'Studio / Atelier Name' : 'Nome Bottega / Atelier'}
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={profile.studioName || ''}
                  onChange={e => setProfile({ ...profile, studioName: e.target.value })}
                  placeholder={language === 'en' ? 'e.g. Fine Arts Atelier' : 'es. Atelier delle Belle Arti'}
                  required
                />
              </div>

              <div className="col-6 form-group">
                <label className="form-label">
                  <User size={14} color="#d4af37" />
                  {language === 'en' ? 'Artist Name' : 'Nome Artista'}
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={profile.artistName || ''}
                  onChange={e => setProfile({ ...profile, artistName: e.target.value })}
                  placeholder={language === 'en' ? 'e.g. Leonardo Rossi' : 'es. Leonardo Rossi'}
                  required
                />
              </div>

              <div className="col-8 form-group">
                <label className="form-label">
                  <MapPin size={14} color="#d4af37" />
                  {language === 'en' ? 'Studio Address' : 'Indirizzo Studio / Bottega'}
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={profile.address || ''}
                  onChange={e => setProfile({ ...profile, address: e.target.value })}
                  placeholder={language === 'en' ? 'e.g. 12 Painter St.' : 'es. Via dei Pittori, 12'}
                />
              </div>

              <div className="col-4 form-group">
                <label className="form-label">{language === 'en' ? 'City' : 'Città'}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={profile.city || ''}
                  onChange={e => setProfile({ ...profile, city: e.target.value })}
                  placeholder={language === 'en' ? 'e.g. Florence' : 'es. Firenze'}
                />
              </div>

              <div className="col-6 form-group">
                <label className="form-label">
                  <Phone size={14} color="#d4af37" />
                  {language === 'en' ? 'Phone / WhatsApp' : 'Telefono / WhatsApp'}
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={profile.phone || ''}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  placeholder={language === 'en' ? 'e.g. +39 333 1234567' : 'es. +39 333 1234567'}
                />
              </div>

              <div className="col-6 form-group">
                <label className="form-label">
                  <Mail size={14} color="#d4af37" />
                  Email
                </label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={profile.email || ''}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  placeholder="es. info@atelier-arte.it"
                />
              </div>

              <div className="col-8 form-group">
                <label className="form-label">
                  <Globe size={14} color="#d4af37" />
                  {language === 'en' ? 'Website or Social Profile' : 'Sito Web o Profilo Social'}
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={profile.website || ''}
                  onChange={e => setProfile({ ...profile, website: e.target.value })}
                  placeholder={language === 'en' ? 'e.g. www.artiststudio.com / @artist_name' : 'es. www.artistarossi.it / @rossi_art'}
                />
              </div>

              <div className="col-4 form-group">
                <label className="form-label">
                  <DollarSign size={14} color="#d4af37" />
                  {language === 'en' ? 'Default Currency' : 'Valuta Predefinita'}
                </label>
                <select
                  className="form-select"
                  value={profile.currency || 'EUR'}
                  onChange={e => setProfile({ ...profile, currency: e.target.value })}
                >
                  <option value="EUR">€ (EUR)</option>
                  <option value="USD">$ (USD)</option>
                  <option value="GBP">£ (GBP)</option>
                  <option value="CHF">CHF (CHF)</option>
                </select>
              </div>

              <div className="col-4 form-group">
                <label className="form-label">
                  <Hash size={14} color="#d4af37" />
                  {language === 'en' ? 'Catalog Code Prefix' : 'Prefisso Codice Opere'}
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={profile.catalogPrefix || 'ART-'}
                  onChange={e => setProfile({ ...profile, catalogPrefix: e.target.value.toUpperCase() })}
                  placeholder="es. ART-"
                />
              </div>

              <div className="col-4 form-group">
                <label className="form-label">
                  <Languages size={14} color="#d4af37" />
                  {language === 'en' ? 'App Language' : 'Lingua Applicazione'}
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', height: '38px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setLanguage('it')}
                    className={`btn ${language === 'it' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, height: '38px', padding: '0 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Italiano"
                  >
                    <FlagIcon language="it" size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`btn ${language === 'en' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, height: '38px', padding: '0 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="English"
                  >
                    <FlagIcon language="en" size={22} />
                  </button>
                </div>
              </div>

            </div>
          </div>

          <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              OperaViva v1.0.0 · Created by Marzio Sparla
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {!isFirstRun ? (
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  {t('cancel')}
                </button>
              ) : null}
              <button type="submit" className="btn btn-primary" id="btn-save-profile">
                <span>
                  {isFirstRun
                    ? (language === 'en' ? 'Enter' : 'Accedi')
                    : (language === 'en' ? 'Save Settings' : 'Salva Impostazioni')}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
