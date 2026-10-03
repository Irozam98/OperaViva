import React, { useState, useRef } from 'react';
import { X, Lock, ShieldCheck, CheckCircle2, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [totpCode, setTotpCode] = useState(['', '', '', '', '', '']);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePinChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newCode = [...totpCode];
    newCode[index] = val.slice(-1);
    setTotpCode(newCode);
    if (val && index < 5) inputRefs.current[index + 1]?.focus();
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
      setTotpCode(pasteData.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const reset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTotpCode(['', '', '', '', '', '']);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Le due password non coincidono.');
      return;
    }
    if (newPassword.length < 8) {
      setError('La nuova password deve avere almeno 8 caratteri.');
      return;
    }
    const code = totpCode.join('');
    if (code.length !== 6) {
      setError('Inserisci il codice Authenticator a 6 cifre completo.');
      return;
    }

    setLoading(true);
    try {
      await api.changePassword(currentPassword, newPassword, code);
      setSuccess(true);
      setTimeout(() => { handleClose(); }, 2000);
    } catch (err: any) {
      setError(err.message || 'Errore durante il cambio password.');
      setTotpCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Calcola forza password
  const getStrength = (pwd: string): { level: number; label: string; color: string } => {
    if (!pwd) return { level: 0, label: '', color: '#334155' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: 1, label: 'Debole', color: '#ef4444' };
    if (score <= 2) return { level: 2, label: 'Discreta', color: '#f59e0b' };
    if (score <= 3) return { level: 3, label: 'Buona', color: '#3b82f6' };
    return { level: 4, label: 'Ottima', color: '#22c55e' };
  };

  const strength = getStrength(newPassword);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={{ zIndex: 1100 }}>
      <div className="modal-dialog modal-sm">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h2>Cambia Password</h2>
            <span className="modal-subtitle">Verifica a 2 fattori obbligatoria</span>
          </div>
          <button type="button" className="btn-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="chpwd-success">
            <CheckCircle2 size={48} className="gold-icon" />
            <h3>Password aggiornata!</h3>
            <p>La tua password è stata cambiata con successo.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="chpwd-form">
            {error && (
              <div className="auth-error-banner">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Password attuale */}
            <div className="form-group">
              <label><Lock size={15} /> Password Attuale</label>
              <div className="input-password-wrap">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  placeholder="••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button type="button" className="toggle-pw-btn" onClick={() => setShowCurrent(!showCurrent)} tabIndex={-1}>
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Nuova password */}
            <div className="form-group">
              <label><Lock size={15} /> Nuova Password <span className="label-hint">(min. 8 caratteri)</span></label>
              <div className="input-password-wrap">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  minLength={8}
                  placeholder="••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button type="button" className="toggle-pw-btn" onClick={() => setShowNew(!showNew)} tabIndex={-1}>
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Indicatore forza password */}
              {newPassword && (
                <div className="pwd-strength">
                  <div className="pwd-strength-bars">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="pwd-bar"
                        style={{ background: i <= strength.level ? strength.color : '#1e2535' }}
                      />
                    ))}
                  </div>
                  <span className="pwd-strength-label" style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Conferma nuova password */}
            <div className="form-group">
              <label><Lock size={15} /> Conferma Nuova Password</label>
              <div className="input-password-wrap">
                <input
                  type="password"
                  required
                  placeholder="••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  style={{ borderColor: confirmPassword && confirmPassword !== newPassword ? '#ef4444' : undefined }}
                />
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="field-error">Le password non coincidono</p>
              )}
            </div>

            {/* Codice 2FA */}
            <div className="totp-section-compact">
              <div className="totp-label-row">
                <ShieldCheck size={16} className="gold-icon" />
                <span>Codice Authenticator (2FA)</span>
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
                  />
                ))}
              </div>
              <p className="totp-hint-sm">Apri Google/Microsoft Authenticator e inserisci il codice attuale.</p>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={handleClose} disabled={loading}>
                Annulla
              </button>
              <button
                type="submit"
                className="btn-save"
                disabled={loading || totpCode.join('').length !== 6 || !currentPassword || !newPassword || newPassword !== confirmPassword}
              >
                {loading ? 'Aggiornamento...' : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Aggiorna Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
