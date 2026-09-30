import React, { useEffect } from 'react';
import { X, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface AtelierActionSheetProps {
  isOpen: boolean;
  title: string;
  icon?: React.ReactNode;
  options: SelectOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export const AtelierActionSheet: React.FC<AtelierActionSheetProps> = ({
  isOpen,
  title,
  icon,
  options,
  selectedValue,
  onSelect,
  onClose
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop atelier-sheet-backdrop" onClick={onClose}>
      <div 
        className="atelier-sheet-card" 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header Selettore */}
        <div className="atelier-sheet-header">
          <div className="atelier-sheet-title-group">
            {icon && <span className="atelier-sheet-icon">{icon}</span>}
            <h3 className="atelier-sheet-title">{title}</h3>
          </div>
          <button 
            type="button" 
            className="btn-icon" 
            onClick={onClose}
            aria-label="Chiudi"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lista Opzioni con Selezione Dorata */}
        <div className="atelier-sheet-body">
          {options.map((opt) => {
            const isSelected = opt.value === selectedValue;
            return (
              <button
                key={opt.value}
                type="button"
                className={`atelier-sheet-item ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  onSelect(opt.value);
                  onClose();
                }}
              >
                <span className="atelier-sheet-item-label">{opt.label}</span>
                {isSelected && (
                  <span className="atelier-sheet-check">
                    <Check size={18} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
