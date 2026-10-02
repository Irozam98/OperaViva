import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { ShieldCheck, Lock, Mail, User, Building, QrCode, ArrowRight, CheckCircle2, AlertCircle, Copy, Key } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArtistProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen }) => {
  const { loginSuccess } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'form' | 'totp-setup' | 'totp-verify'>('form');

  // Campi Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studioName, setStudioName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [city, setCity] = useState('');

  // Dati 2FA
  const [tempToken, setTempToken] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [otpauthUri, setOtpauthUri] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [totpCode, setTotpCode] = useState(['', '', '', '', '', '']);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Errori e caricamento
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Genera QR code se c'è un URI
  useEffect(() => {
    if (otpauthUri) {
      QRCode.toDataURL(otpauthUri, { width: 220, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error('Errore QR:', err));
    }
  }, [otpauthUri]);

  // Gestione Input Codice 6 Cifre
  const handlePinChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newCode = [...totpCode];
    newCode[index] = val.slice(-1);
    setTotpCode(newCode);

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !totpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setTotpCode(digits);
      inputRefs.current[5]?.focus();
    }
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(email, password);
      setTempToken(res.tempToken);
      setTotpCode(['', '', '', '', '', '']);
      setStep('totp-verify');
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    } catch (err: any) {
      setError(err.message || 'Errore durante il login');
    } finally {
      setLoading(false);
    }
  };

  // Submit Registrazione
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.register({
        email,
        password,
        studioName,
        artistName,
        city
      });

      setTempToken(res.tempToken);
      setTotpSecret(res.totpSecret);
      setOtpauthUri(res.otpauthUri);
      setTotpCode(['', '', '', '', '', '']);
      setStep('totp-setup');
    } catch (err: any) {
      setError(err.message || 'Errore durante la registrazione');
    } finally {
      setLoading(false);
    }
  };

  // Verifica Codice TOTP
  const handleVerifyTOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = totpCode.join('');
    if (code.length !== 6) {
      setError('Inserisci il codice a 6 cifre completo');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.verify2FA(tempToken, code);
      loginSuccess(res.token, res.artist);
    } catch (err: any) {
      setError(err.message || 'Codice Authenticator non valido o scaduto');
      setTotpCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        {/* Intestazione Brand */}
        <div className="auth-header">
          <div className="auth-badge">
            <ShieldCheck size={18} className="gold-icon" />
            <span>Autenticazione 2FA & Multi-Artista</span>
          </div>
          <h1 className="auth-title">OperaViva Cloud</h1>
          <p className="auth-subtitle">Archivio Personale d'Arte & Bottega Digitale</p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: FORM LOGIN / REGISTRAZIONE */}
        {step === 'form' && (
          <>
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                onClick={() => { setMode('login'); setError(null); }}
              >
                Accedi all'Atelier
              </button>
              <button
                type="button"
                className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
                onClick={() => { setMode('register'); setError(null); }}
              >
                Registra Nuovo Artista
              </button>
            </div>

            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="auth-form">
                <div className="form-group">
                  <label><Mail size={16} /> Email Artista / Bottega</label>
                  <input
                    type="email"
                    required
                    placeholder="maestro@atelier.it"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label><Lock size={16} /> Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'Verifica credenziali...' : 'Continua con Authenticator'}
                  <ArrowRight size={18} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="auth-form">
                <div className="form-row">
                  <div className="form-group">
                    <label><User size={16} /> Nome Artista</label>
                    <input
                      type="text"
                      required
                      placeholder="es. Leonardo Da Vinci"
                      value={artistName}
                      onChange={(e) => setArtistName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label><Building size={16} /> Nome Bottega / Atelier</label>
                    <input
                      type="text"
                      required
                      placeholder="es. Bottega Fiorentina"
                      value={studioName}
                      onChange={(e) => setStudioName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label><Mail size={16} /> Email</label>
                  <input
                    type="email"
                    required
                    placeholder="artista@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label><Lock size={16} /> Password (minimo 8 caratteri)</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'Creazione account...' : 'Configura 2FA Authenticator'}
                  <ArrowRight size={18} />
                </button>
              </form>
            )}
          </>
        )}

        {/* STEP 2A: SETUP 2FA (MOSTRA QR CODE AL PRIMO ACCESSO) */}
        {step === 'totp-setup' && (
          <div className="totp-setup-container">
            <div className="totp-intro">
              <QrCode size={24} className="gold-icon" />
              <h3>Scansiona con l'App Authenticator</h3>
              <p>Apri <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong> o <strong>Apple Password</strong> e inquadra questo codice QR:</p>
            </div>

            <div className="qr-wrapper">
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="QR Code 2FA" className="qr-image" />
              ) : (
                <div className="qr-placeholder">Generazione QR...</div>
              )}
            </div>

            <div className="manual-secret-box">
              <span className="manual-label"><Key size={14} /> Chiave di configurazione manuale:</span>
              <div className="secret-code-row">
                <code>{totpSecret}</code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(totpSecret)}
                  className="copy-btn"
                  title="Copia chiave"
                >
                  {copiedSecret ? <CheckCircle2 size={16} className="text-green" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="totp-pin-section">
              <p className="totp-pin-hint">Inserisci il codice temporaneo a 6 cifre mostrato sull'app per confermare l'attivazione:</p>
              
              <div className="pin-inputs-row" onPaste={handlePaste}>
                {totpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="pin-box"
                  />
                ))}
              </div>

              <button
                type="button"
                className="auth-submit-btn"
                onClick={() => handleVerifyTOTP()}
                disabled={loading || totpCode.join('').length !== 6}
              >
                {loading ? 'Verifica in corso...' : 'Conferma ed Entra nell\'Atelier'}
                <CheckCircle2 size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2B: VERIFICA 2FA (LOGIN ABITUALE) */}
        {step === 'totp-verify' && (
          <div className="totp-verify-container">
            <div className="totp-intro">
              <ShieldCheck size={32} className="gold-icon" />
              <h3>Verifica Authenticator</h3>
              <p>Inserisci il codice a 6 cifre generato dalla tua app di autenticazione per <strong>{email}</strong>.</p>
            </div>

            <div className="pin-inputs-row" onPaste={handlePaste}>
              {totpCode.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="pin-box"
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            <button
              type="button"
              className="auth-submit-btn"
              onClick={() => handleVerifyTOTP()}
              disabled={loading || totpCode.join('').length !== 6}
            >
              {loading ? 'Verifica in corso...' : 'Accedi all\'Archivio'}
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="auth-back-btn"
              onClick={() => { setStep('form'); setError(null); }}
            >
              ← Torna all'accesso con email e password
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
