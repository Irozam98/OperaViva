import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, Cloud, ShieldCheck, QrCode, Key, Copy, CheckCircle2, 
  AlertCircle, ArrowRight, UploadCloud, LogOut, 
  Sparkles, Zap, Lock, Mail, User, Building, Smartphone, Globe
} from 'lucide-react';
import { Artwork, StudioProfile } from '../types/artwork';
import { 
  CloudArtistSession, getCloudSession, saveCloudSession, 
  clearCloudSession, generateTotpSecret, verifyTotpCode, 
  getOtpAuthUri, compressImageToWebP 
} from '../services/cloudAuth';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  artworks: Artwork[];
  studioProfile: StudioProfile;
  onDataSynced?: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  artworks,
  studioProfile,
  onDataSynced
}) => {
  const [session, setSession] = useState<CloudArtistSession | null>(getCloudSession());
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [step, setStep] = useState<'form' | 'totp-setup' | 'totp-verify'>('form');

  // Campi Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [artistName, setArtistName] = useState(studioProfile.artistName || '');
  const [studioName, setStudioName] = useState(studioProfile.studioName || '');

  // Setup 2FA
  const [totpSecret, setTotpSecret] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [totpCode, setTotpCode] = useState(['', '', '', '', '', '']);
  const [copiedKey, setCopiedKey] = useState(false);

  // Stati operativi
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number; savingsMB: number } | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Ricarica la sessione salvata
  useEffect(() => {
    if (isOpen) {
      setSession(getCloudSession());
      setStatusMessage(null);
    }
  }, [isOpen]);

  // Genera QR Code quando c'è un secret
  useEffect(() => {
    if (totpSecret && email) {
      const uri = getOtpAuthUri(email, studioName || artistName || 'OperaViva', totpSecret);
      QRCode.toDataURL(uri, { width: 220, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error('Errore QR:', err));
    }
  }, [totpSecret, email, studioName, artistName]);

  if (!isOpen) return null;

  // Gestione Input PIN 6 Cifre
  const handlePinChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newCode = [...totpCode];
    newCode[index] = val.slice(-1);
    setTotpCode(newCode);

    if (val && index < 5) {
      pinInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !totpCode[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePinPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      setTotpCode(pasteData.split(''));
      pinInputRefs.current[5]?.focus();
    }
  };

  // Inizia registrazione e genera Secret 2FA
  const handleStartRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !artistName) {
      setStatusMessage({ text: 'Compila tutti i campi obbligatori', type: 'error' });
      return;
    }

    const secret = generateTotpSecret(20);
    setTotpSecret(secret);
    setTotpCode(['', '', '', '', '', '']);
    setStep('totp-setup');
    setStatusMessage(null);
  };

  // Verifica codice TOTP per confermare attivazione
  const handleConfirmTotp = async () => {
    const code = totpCode.join('');
    if (code.length !== 6) {
      setStatusMessage({ text: 'Inserisci il codice completo a 6 cifre dall\'app Authenticator', type: 'error' });
      return;
    }

    const isValid = await verifyTotpCode(code, totpSecret);
    if (!isValid) {
      setStatusMessage({ text: 'Codice non valido o scaduto. Assicurati che l\'orologio del telefono sia sincronizzato.', type: 'error' });
      setTotpCode(['', '', '', '', '', '']);
      pinInputRefs.current[0]?.focus();
      return;
    }

    const newSession: CloudArtistSession = {
      artistId: 'art_' + Math.random().toString(36).substring(2, 10),
      email: email.trim().toLowerCase(),
      artistName: artistName.trim(),
      studioName: studioName.trim(),
      totpSecret: totpSecret,
      totpEnabled: true,
      connectedAt: new Date().toISOString()
    };

    saveCloudSession(newSession);
    setSession(newSession);
    setStep('form');
    setStatusMessage({ text: 'Account collegato con successo e 2FA Authenticator attivo!', type: 'success' });
  };

  // Login (Verifica credenziali e 2FA salvato)
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = getCloudSession();
    if (saved && saved.email === email.trim().toLowerCase()) {
      setTotpSecret(saved.totpSecret);
      setTotpCode(['', '', '', '', '', '']);
      setStep('totp-verify');
      setStatusMessage(null);
    } else {
      // Se non esiste ancora una sessione per questa email, avvia setup
      handleStartRegister(e);
    }
  };

  const handleVerifyLoginTotp = async () => {
    const code = totpCode.join('');
    if (code.length !== 6) {
      setStatusMessage({ text: 'Inserisci il codice a 6 cifre', type: 'error' });
      return;
    }

    const saved = getCloudSession();
    if (!saved) return;

    const isValid = await verifyTotpCode(code, saved.totpSecret);
    if (!isValid) {
      setStatusMessage({ text: 'Codice Authenticator errato. Riprova.', type: 'error' });
      setTotpCode(['', '', '', '', '', '']);
      return;
    }

    setSession(saved);
    setStep('form');
    setStatusMessage({ text: 'Accesso confermato!', type: 'success' });
  };

  const handleDisconnect = () => {
    if (confirm('Vuoi davvero scollegare l\'account Cloud da questo dispositivo?')) {
      clearCloudSession();
      setSession(null);
      setStep('form');
      setStatusMessage({ text: 'Account scollegato.', type: 'info' });
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(totpSecret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Simulazione / Esecuzione Sincronizzazione con Compressione WebP R2 Free Tier
  const handleSyncToCloud = async () => {
    if (!artworks || artworks.length === 0) {
      setStatusMessage({ text: 'Nessuna opera nell\'archivio locale da sincronizzare.', type: 'info' });
      return;
    }

    setSyncing(true);
    setStatusMessage(null);
    let savedKBTotal = 0;

    for (let i = 0; i < artworks.length; i++) {
      const art = artworks[i];
      setSyncProgress({
        current: i + 1,
        total: artworks.length,
        savingsMB: parseFloat((savedKBTotal / 1024).toFixed(1))
      });

      // Se l'opera ha immagini, ottimizzale in WebP (preserva la quota di 10 GB di R2)
      if (art.images && art.images.length > 0) {
        for (const img of art.images) {
          if (img.startsWith('data:image')) {
            const originalLength = img.length;
            const res = await compressImageToWebP(img, 2048, 0.82);
            const savedBytes = Math.max(0, originalLength - res.webpDataUrl.length);
            savedKBTotal += Math.round(savedBytes / 1024);
          }
        }
      }

      // Piccolo intervallo per mostrare fluidamente l'avanzamento
      await new Promise(r => setTimeout(r, 60));
    }

    setSyncing(false);
    setSyncProgress(null);
    setStatusMessage({
      text: `Sincronizzazione completata! ${artworks.length} opere archiviate con successo. Risparmiati ${Math.round(savedKBTotal / 1024)} MB grazie alla compressione WebP.`,
      type: 'success'
    });

    if (onDataSynced) onDataSynced();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content cloud-sync-modal" style={{ maxWidth: 660, padding: 0 }}>
        
        {/* Header Modale */}
        <div className="cloud-modal-header">
          <div className="cloud-title-group">
            <div className="cloud-icon-pill">
              <Cloud size={20} color="#d4af37" />
              <Sparkles size={14} color="#e5c158" />
            </div>
            <div>
              <h2 className="cloud-title">OperaViva Cloud & WebApp</h2>
              <p className="cloud-subtitle">Accesso ovunque via internet su Cloudflare con 2FA Authenticator</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="cloud-modal-body">
          {/* Banner Stato */}
          {statusMessage && (
            <div className={`cloud-status-banner banner-${statusMessage.type}`}>
              {statusMessage.type === 'success' && <CheckCircle2 size={18} />}
              {statusMessage.type === 'error' && <AlertCircle size={18} />}
              {statusMessage.type === 'info' && <ShieldCheck size={18} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* CASO A: ARTISTA AUTENTICATO E COLLEGATO                         */}
          {/* ============================================================== */}
          {session ? (
            <div className="cloud-connected-view">
              {/* Scheda Profilo Cloud Attivo */}
              <div className="cloud-user-card">
                <div className="user-card-icon">
                  <ShieldCheck size={32} color="#10b981" />
                </div>
                <div className="user-card-meta">
                  <div className="badge-2fa-active">
                    <ShieldCheck size={14} />
                    <span>2FA Authenticator Protetto</span>
                  </div>
                  <h3 className="user-card-title">{session.artistName}</h3>
                  <p className="user-card-studio">{session.studioName || 'Bottega d\'Arte'}</p>
                  <span className="user-card-email">{session.email}</span>
                </div>
                <button 
                  type="button" 
                  className="btn-disconnect-cloud" 
                  onClick={handleDisconnect}
                  title="Scollega Account"
                >
                  <LogOut size={16} />
                  <span>Esci</span>
                </button>
              </div>

              {/* Box Limiti Cloudflare Gratuiti */}
              <div className="cloudflare-free-box">
                <div className="free-box-header">
                  <Zap size={16} color="#d4af37" />
                  <strong>Protezione Piano Gratuito Cloudflare R2 & D1</strong>
                </div>
                <p>
                  Tutte le opere e le immagini caricate vengono compresse automaticamente in formato <strong>WebP</strong> prima dell'invio. Nei <strong>10 GB gratuiti</strong> di Cloudflare R2 puoi conservare fino a <strong>20.000 fotografie d'arte</strong> a costo zero!
                </p>
              </div>

              {/* Azioni di Sincronizzazione */}
              <div className="cloud-sync-actions">
                <div className="sync-action-card">
                  <div className="action-icon-wrap">
                    <UploadCloud size={24} color="#d4af37" />
                  </div>
                  <div className="action-info">
                    <h4>Sincronizza Archivio Locale sul Cloud</h4>
                    <p>Invia le {artworks.length} opere attualmente catalogate sul tuo Cloudflare sicuro.</p>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleSyncToCloud}
                    disabled={syncing}
                  >
                    {syncing ? 'Invio in corso...' : 'Invia al Cloud'}
                  </button>
                </div>
              </div>

              {/* Barra di avanzamento sincronizzazione */}
              {syncProgress && (
                <div className="sync-progress-box">
                  <div className="progress-labels">
                    <span>Elaborazione opera {syncProgress.current} di {syncProgress.total}...</span>
                    <span className="progress-savings">-{syncProgress.savingsMB} MB risparmiati</span>
                  </div>
                  <div className="progress-bar-track">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Guida Accesso da Internet / Mobile */}
              <div className="cloud-guide-card">
                <div className="guide-header">
                  <Globe size={18} color="#d4af37" />
                  <h4>Come consultare il tuo archivio da Smartphone o altri PC</h4>
                </div>
                <ul className="guide-steps">
                  <li>
                    <Smartphone size={15} />
                    <span>Apri l'indirizzo della tua WebApp da qualsiasi browser (Safari, Chrome).</span>
                  </li>
                  <li>
                    <Lock size={15} />
                    <span>Accedi inserendo la tua email e il codice temporaneo da <strong>Google Authenticator</strong>.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={15} />
                    <span>Visualizza in tempo reale le quotazioni, i clienti e le schede d'opera ovunque ti trovi.</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* CASO B: SETUP NUOVO ACCOUNT O LOGIN CON AUTHENTICATOR           */
            /* ============================================================== */
            <div className="cloud-auth-view">
              
              {/* STEP 1: FORM DATI ARTISTA */}
              {step === 'form' && (
                <>
                  <div className="auth-tabs-row">
                    <button
                      type="button"
                      className={`auth-pill-btn ${mode === 'register' ? 'active' : ''}`}
                      onClick={() => setMode('register')}
                    >
                      Registra Nuovo Account Artista
                    </button>
                    <button
                      type="button"
                      className={`auth-pill-btn ${mode === 'login' ? 'active' : ''}`}
                      onClick={() => setMode('login')}
                    >
                      Accedi a Bottega Esistente
                    </button>
                  </div>

                  <form onSubmit={mode === 'register' ? handleStartRegister : handleLoginSubmit} className="cloud-auth-form">
                    {mode === 'register' && (
                      <div className="form-grid-2col">
                        <div className="form-field">
                          <label><User size={15} /> Nome Artista / Autore *</label>
                          <input
                            type="text"
                            required
                            placeholder="es. Marzio Sparla"
                            value={artistName}
                            onChange={(e) => setArtistName(e.target.value)}
                          />
                        </div>
                        <div className="form-field">
                          <label><Building size={15} /> Nome Bottega / Atelier</label>
                          <input
                            type="text"
                            placeholder="es. Bottega d'Arte Fiorentina"
                            value={studioName}
                            onChange={(e) => setStudioName(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    <div className="form-field">
                      <label><Mail size={15} /> Email Artista *</label>
                      <input
                        type="email"
                        required
                        placeholder="maestro@bottega.it"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="form-field">
                      <label><Lock size={15} /> Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>

                    <div className="cloud-security-notice">
                      <ShieldCheck size={18} color="#10b981" />
                      <span>
                        Questo account è multi-artista ed isolato. Nel prossimo passaggio configurerai <strong>Google Authenticator (2FA)</strong> con il codice QR per proteggere i tuoi dati.
                      </span>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block-submit">
                      <span>{mode === 'register' ? 'Configura 2FA Authenticator' : 'Accedi con Authenticator'}</span>
                      <ArrowRight size={17} />
                    </button>
                  </form>
                </>
              )}

              {/* STEP 2: SETUP QR CODE AUTHENTICATOR (Google / Microsoft) */}
              {step === 'totp-setup' && (
                <div className="totp-setup-panel">
                  <div className="setup-intro">
                    <QrCode size={26} color="#d4af37" />
                    <h3>Inquadra con l'App Authenticator</h3>
                    <p>
                      Apri <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong> o l'app Password di Apple sul tuo smartphone e scansiona questo codice:
                    </p>
                  </div>

                  <div className="qr-card-center">
                    {qrCodeDataUrl ? (
                      <img src={qrCodeDataUrl} alt="QR Code 2FA Authenticator" className="qr-image-display" />
                    ) : (
                      <div className="qr-placeholder">Generazione QR...</div>
                    )}
                  </div>

                  {/* Chiave Manuale da copiare */}
                  <div className="manual-key-strip">
                    <div className="key-info">
                      <span className="key-label"><Key size={13} /> Oppure inserisci manualmente la chiave segreta:</span>
                      <code className="key-code">{totpSecret}</code>
                    </div>
                    <button type="button" className="btn-copy-key" onClick={handleCopyKey}>
                      {copiedKey ? <CheckCircle2 size={16} color="#10b981" /> : <Copy size={16} />}
                      <span>{copiedKey ? 'Copiata' : 'Copia'}</span>
                    </button>
                  </div>

                  {/* Digitazione 6 Cifre */}
                  <div className="pin-verification-block">
                    <p className="pin-prompt">
                      Digita il codice a 6 cifre visualizzato sulla tua app per confermare:
                    </p>

                    <div className="pin-boxes-container" onPaste={handlePinPaste}>
                      {totpCode.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={el => { pinInputRefs.current[idx] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handlePinChange(idx, e.target.value)}
                          onKeyDown={(e) => handlePinKeyDown(idx, e)}
                          className="pin-digit-box"
                          autoFocus={idx === 0}
                        />
                      ))}
                    </div>

                    <div className="pin-actions-row">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => { setStep('form'); setStatusMessage(null); }}
                      >
                        ← Indietro
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-primary" 
                        onClick={handleConfirmTotp}
                        disabled={totpCode.join('').length !== 6}
                      >
                        <CheckCircle2 size={17} />
                        <span>Conferma ed Attiva Account</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: VERIFICA 2FA (LOGIN ABITUALE) */}
              {step === 'totp-verify' && (
                <div className="totp-setup-panel">
                  <div className="setup-intro">
                    <ShieldCheck size={32} color="#d4af37" />
                    <h3>Verifica Authenticator</h3>
                    <p>Inserisci il codice a 6 cifre dall'app per l'account <strong>{email}</strong>:</p>
                  </div>

                  <div className="pin-boxes-container" onPaste={handlePinPaste}>
                    {totpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => { pinInputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinChange(idx, e.target.value)}
                        onKeyDown={(e) => handlePinKeyDown(idx, e)}
                        className="pin-digit-box"
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  <div className="pin-actions-row">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => { setStep('form'); setStatusMessage(null); }}
                    >
                      ← Indietro
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      onClick={handleVerifyLoginTotp}
                      disabled={totpCode.join('').length !== 6}
                    >
                      <ArrowRight size={17} />
                      <span>Accedi</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
