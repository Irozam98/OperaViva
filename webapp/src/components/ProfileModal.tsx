import React, { useState } from 'react';
import { X, Check, ShieldCheck, Building, User, Mail, Globe, Phone, MapPin, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { artist, updateArtistProfile } = useAuth();

  const [studioName, setStudioName] = useState(artist?.studioName || '');
  const [artistName, setArtistName] = useState(artist?.artistName || '');
  const [phone, setPhone] = useState(artist?.phone || '');
  const [website, setWebsite] = useState(artist?.website || '');
  const [city, setCity] = useState(artist?.city || '');
  const [currency, setCurrency] = useState(artist?.currency || 'EUR');
  const [catalogPrefix, setCatalogPrefix] = useState(artist?.catalogPrefix || 'OPV-');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const updated = {
        studioName,
        artistName,
        phone,
        website,
        city,
        currency,
        catalogPrefix
      };
      await api.updateProfile(updated);
      updateArtistProfile(updated);
      setMessage('Profilo aggiornato con successo');
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 1000);
    } catch (err: any) {
      setMessage('Errore salvataggio: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog modal-md">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h2>Impostazioni Bottega & Profilo</h2>
            <span className="modal-subtitle">Dati ufficiali per intestazioni e certificati d'autenticità</span>
          </div>
          <button type="button" className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {message && (
          <div className="profile-msg-banner">
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Badge Sicurezza 2FA */}
          <div className="security-status-card">
            <div className="security-icon-wrap">
              <ShieldCheck size={28} className="gold-icon" />
            </div>
            <div className="security-details">
              <strong>Account Protetto con Verifica Authenticator (2FA)</strong>
              <span>Ogni accesso da browser o dispositivi esterni richiede il codice a 6 cifre dall'app Authenticator.</span>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label><Building size={16} /> Nome Bottega / Atelier</label>
              <input
                type="text"
                required
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
              />
            </div>
            <div className="form-group flex-1">
              <label><User size={16} /> Nome Artista / Autore</label>
              <input
                type="text"
                required
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label><Mail size={16} /> Email di Login (Non modificabile)</label>
            <input type="email" disabled value={artist?.email || ''} className="input-disabled" />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label><Phone size={16} /> Telefono Contatto</label>
              <input
                type="text"
                placeholder="+39 333 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="form-group flex-1">
              <label><Globe size={16} /> Sito Web Ufficiale</label>
              <input
                type="text"
                placeholder="https://mio-atelier.it"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label><MapPin size={16} /> Città / Sede Atelier</label>
              <input
                type="text"
                placeholder="es. Firenze, Venezia, Milano"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="form-group flex-1">
              <label><Tag size={16} /> Prefisso Catalogo Opere</label>
              <input
                type="text"
                placeholder="es. OPV-"
                value={catalogPrefix}
                onChange={(e) => setCatalogPrefix(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
              Chiudi
            </button>
            <button type="submit" className="btn-save" disabled={saving}>
              <Check size={18} />
              <span>{saving ? 'Salvataggio...' : 'Salva Impostazioni'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
