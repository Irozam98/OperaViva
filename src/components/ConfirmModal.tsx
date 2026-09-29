import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, Check, X } from 'lucide-react';
import { useI18n } from '../i18n';

export interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  itemName?: string;
  warningNote?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  itemName,
  warningNote,
  confirmLabel,
  cancelLabel,
  isDanger = true,
  onConfirm,
  onCancel
}) => {
  const { language } = useI18n();

  // Gestione tastiera (Escape per chiudere, Enter per confermare)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen) return null;

  const defaultTitle = language === 'en' ? 'Confirm Deletion' : 'Conferma Eliminazione';
  const defaultMessage = language === 'en'
    ? 'Are you sure you want to permanently delete this artwork from the archive?'
    : "Sei sicuro di voler eliminare definitivamente quest'opera dall'archivio?";
  const defaultWarning = language === 'en'
    ? 'This action cannot be undone and will remove all technical data.'
    : "L'operazione non può essere annullata e rimuoverà la scheda dall'inventario.";
  const defaultConfirm = language === 'en' ? 'Yes, Delete' : 'Sì, Elimina';
  const defaultCancel = language === 'en' ? 'No, Cancel' : 'No, Annulla';

  return (
    <div 
      className="confirm-modal-overlay" 
      onClick={onCancel}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 7, 10, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        className="confirm-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'linear-gradient(160deg, #1e222d 0%, #13161f 100%)',
          borderRadius: '16px',
          border: isDanger ? '1px solid rgba(239, 68, 68, 0.45)' : '1px solid rgba(212, 175, 55, 0.45)',
          boxShadow: isDanger 
            ? '0 25px 50px rgba(0,0,0,0.7), 0 0 30px rgba(239, 68, 68, 0.15)' 
            : '0 25px 50px rgba(0,0,0,0.7), 0 0 30px rgba(212, 175, 55, 0.15)',
          padding: '2rem 1.75rem',
          textAlign: 'center',
          position: 'relative',
          animation: 'confirmModalScale 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Pulsante Chiusura rapida in alto a destra */}
        <button
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          title={language === 'en' ? 'Close' : 'Chiudi'}
        >
          <X size={18} />
        </button>

        {/* Badge Icona Circolare Centrale */}
        <div 
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            margin: '0 auto 1.1rem',
            background: isDanger ? 'rgba(239, 68, 68, 0.12)' : 'rgba(212, 175, 55, 0.12)',
            border: isDanger ? '2px solid rgba(239, 68, 68, 0.35)' : '2px solid rgba(212, 175, 55, 0.35)',
            color: isDanger ? '#ef4444' : 'var(--gold-400)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isDanger ? '0 0 20px rgba(239, 68, 68, 0.25)' : '0 0 20px rgba(212, 175, 55, 0.25)'
          }}
        >
          {isDanger ? <Trash2 size={28} /> : <AlertTriangle size={28} />}
        </div>

        {/* Titolo Principale */}
        <h3 
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '1.25rem',
            fontWeight: 700,
            letterSpacing: '1px',
            color: '#ffffff',
            margin: '0 0 0.5rem',
            textTransform: 'uppercase'
          }}
        >
          {title || defaultTitle}
        </h3>

        {/* Messaggio esplicativo */}
        <p 
          style={{
            fontSize: '0.92rem',
            color: '#cbd5e1',
            lineHeight: 1.5,
            margin: '0 0 0.8rem'
          }}
        >
          {message || defaultMessage}
        </p>

        {/* Box Titolo Opera evidenziata */}
        {itemName && (
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: '8px',
              padding: '0.65rem 1rem',
              marginBottom: '1rem',
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.05rem',
              fontWeight: 600,
              color: 'var(--gold-300)',
              fontStyle: 'italic',
              wordBreak: 'break-word'
            }}
          >
            "{itemName}"
          </div>
        )}

        {/* Nota informativa / avviso */}
        <div 
          style={{
            fontSize: '0.8rem',
            color: isDanger ? '#f87171' : 'var(--text-muted)',
            marginBottom: '1.75rem',
            lineHeight: 1.4,
            opacity: 0.9
          }}
        >
          {warningNote || defaultWarning}
        </div>

        {/* Bottoni "Sì, Elimina" e "No, Annulla" */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.85rem'
          }}
        >
          {/* Tasto NO / ANNULLA */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            id="btn-confirm-cancel"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
            <span>{cancelLabel || defaultCancel}</span>
          </button>

          {/* Tasto SÌ / CONFERMA */}
          <button
            type="button"
            onClick={onConfirm}
            id="btn-confirm-proceed"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              border: isDanger ? '1px solid #ef4444' : '1px solid var(--gold-400)',
              background: isDanger 
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)' 
                : 'linear-gradient(135deg, #e5c07b 0%, #d4af37 60%, #b8860b 100%)',
              color: isDanger ? '#ffffff' : '#12141a',
              boxShadow: isDanger 
                ? '0 4px 15px rgba(239, 68, 68, 0.4)' 
                : '0 4px 15px rgba(212, 175, 55, 0.4)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isDanger ? <Trash2 size={16} /> : <Check size={16} />}
            <span>{confirmLabel || defaultConfirm}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
