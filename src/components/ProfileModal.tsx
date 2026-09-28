import React, { useState } from 'react';
import { X, Settings, Check, Building, User, Mail, Phone, Globe, MapPin, Hash } from 'lucide-react';
import { StudioProfile } from '../types/artwork';

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
            <h2 className="modal-title">Dati Bottega & Artista</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="modal-body">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Questi recapiti verranno inseriti automaticamente nei Certificati di Autenticità, nelle schede d'opera stampabili e nell'intestazione del catalogo.
            </p>

            <div className="form-grid">
              
              <div className="col-6 form-group">
                <label className="form-label">
                  <Building size={14} color="#d4af37" />
                  Nome Bottega / Atelier
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={profile.studioName || ''}
                  onChange={e => setProfile({ ...profile, studioName: e.target.value })}
                  placeholder="es. Atelier delle Belle Arti"
                  required
                />
              </div>

              <div className="col-6 form-group">
                <label className="form-label">
                  <User size={14} color="#d4af37" />
                  Nome Artista
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={profile.artistName || ''}
                  onChange={e => setProfile({ ...profile, artistName: e.target.value })}
                  placeholder="es. Leonardo Rossi"
                  required
                />
              </div>

              <div className="col-8 form-group">
                <label className="form-label">
                  <MapPin size={14} color="#d4af37" />
                  Indirizzo Studio / Bottega
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={profile.address || ''}
                  onChange={e => setProfile({ ...profile, address: e.target.value })}
                  placeholder="es. Via dei Pittori, 12"
                />
              </div>

              <div className="col-4 form-group">
                <label className="form-label">Città</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={profile.city || ''}
                  onChange={e => setProfile({ ...profile, city: e.target.value })}
                  placeholder="es. Firenze"
                />
              </div>

              <div className="col-6 form-group">
                <label className="form-label">
                  <Phone size={14} color="#d4af37" />
                  Telefono / WhatsApp
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={profile.phone || ''}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="es. +39 333 1234567"
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
                  Sito Web o Profilo Instagram
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={profile.website || ''}
                  onChange={e => setProfile({ ...profile, website: e.target.value })}
                  placeholder="es. www.artistarossi.it / @rossi_art"
                />
              </div>

              <div className="col-4 form-group">
                <label className="form-label">
                  <Hash size={14} color="#d4af37" />
                  Prefisso Codice Opere
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
                Annulla
              </button>
              <button type="submit" className="btn btn-primary" id="btn-save-profile">
                <Check size={18} />
                <span>Salva Impostazioni</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
