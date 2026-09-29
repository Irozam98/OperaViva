import React, { useState } from 'react';
import { X, Settings, Check, Building, User, Mail, Phone, Globe, MapPin, Hash, DollarSign } from 'lucide-react';
import { StudioProfile } from '../types/artwork';
import { useI18n } from '../i18n';

interface ProfileModalProps {
  studioProfile: StudioProfile;
  onSave: (profile: StudioProfile) => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  studioProfile,
  onSave,
  onClose
}) => {
  const { t, language } = useI18n();
  const [profile, setProfile] = useState<StudioProfile>({ ...studioProfile });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profile);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Settings size={22} color="#d4af37" />
            <h2 className="modal-title">
              {language === 'en' ? 'Studio & Artist Settings' : 'Dati Bottega & Artista'}
            </h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="modal-body">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              {language === 'en'
                ? 'These details will automatically appear on Certificates of Authenticity, printable technical sheets, and catalog headers.'
                : 'Questi recapiti verranno inseriti automaticamente nei Certificati di Autenticità, nelle schede d\'opera stampabili e nell\'intestazione del catalogo.'}
            </p>

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
                  {language === 'en' ? 'Website or Instagram Profile' : 'Sito Web o Profilo Instagram'}
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
                  <option value="EUR">€ Euro (EUR)</option>
                  <option value="USD">$ Dollaro USA (USD)</option>
                  <option value="GBP">£ Sterlina UK (GBP)</option>
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

            </div>
          </div>

          <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              OperaViva v1.0.0 · Created by Marzio Sparla
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                {t('cancel')}
              </button>
              <button type="submit" className="btn btn-primary" id="btn-save-profile">
                <Check size={18} />
                <span>{language === 'en' ? 'Save Settings' : 'Salva Impostazioni'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
