import React, { useRef, useState } from 'react';
import { X, Download, Upload, FileSpreadsheet, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { exportCatalogBackup, importCatalogBackup, exportCatalogToCSV } from '../services/backup';
import { clearAllArtworks } from '../services/db';

interface BackupModalProps {
  onClose: () => void;
  onDataChanged: () => void;
  onOpenSiteImporter: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ onClose, onDataChanged, onOpenSiteImporter }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [csvStatus, setCsvStatus] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      await exportCatalogBackup();
    } catch (e) {
      console.error(e);
      alert('Errore durante l\'esportazione del backup');
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await exportCatalogToCSV();
      setCsvStatus(`File "${res.filename}" scaricato! Trovi il file nella cartella Download del PC.`);
      setTimeout(() => {
        setCsvStatus(null);
      }, 7000);
    } catch (e) {
      console.error(e);
      alert('Errore durante l\'esportazione del file CSV');
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mode = confirm('Vuoi SOSTITUIRE completamente l\'inventario attuale con i dati del file?\n\n- Premi OK per Sostituire completamente\n- Premi ANNULLA per Unire (mantenere le opere esistenti ed aggiungere quelle nuove)')
      ? 'replace'
      : 'merge';

    setIsImporting(true);
    setImportStatus('Importazione opere e foto in corso...');
    try {
      const result = await importCatalogBackup(file, mode);
      setImportStatus(`Successo! Importate ${result.count} opere.`);
      onDataChanged();
      setTimeout(() => {
        setImportStatus(null);
      }, 3000);
    } catch (err: any) {
      console.error(err);
      alert(`Errore nell'importazione: ${err.message || 'File non valido'}`);
      setImportStatus(null);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };


  const handleClearAll = async () => {
    if (confirm('ATTENZIONE: Sei sicuro di voler cancellare TUTTE le opere dal catalogo?\nAssicurati di aver scaricato un backup prima di procedere!')) {
      await clearAllArtworks();
      onDataChanged();
      alert('Inventario svuotato. Puoi ora inserire le tue opere.');
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={20} color="#c5a059" />
            <h2 className="modal-title">Archivio & Backup</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          
          {/* Sezione Importazione Opere (Sito Web / Cartella) */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div>
              <h4 style={{ color: 'var(--text-primary)', fontSize: '0.92rem', marginBottom: '0.2rem' }}>
                Importa da Sito Web o Cartella
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>
                Catalogazione automatica da un link internet o da una cartella locale di foto.
              </p>
            </div>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                onClose();
                onOpenSiteImporter();
              }}
            >
              <span>Apri Importatore</span>
            </button>
          </div>

          {importStatus && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              color: '#10b981',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem'
            }}>
              <CheckCircle2 size={18} />
              <span>{importStatus}</span>
            </div>
          )}

          {/* Opzioni di Backup */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            
            {/* Esporta Backup */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-400)', fontWeight: 600, fontSize: '1rem' }}>
                  <Download size={18} />
                  <span>Esporta Backup Completo</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.4 }}>
                  Genera un singolo file <code style={{ color: 'var(--gold-300)' }}>.artvault</code> contenente l'intero inventario con tutte le foto ad alta risoluzione.
                </p>
              </div>

              <button className="btn btn-primary" onClick={handleExport} id="btn-export-backup">
                <Download size={16} />
                <span>Scarica File Backup</span>
              </button>
            </div>

            {/* Importa Backup */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-400)', fontWeight: 600, fontSize: '1rem' }}>
                  <Upload size={18} />
                  <span>Ripristina o Unisci</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.4 }}>
                  Carica un file di backup precedente o un catalogo esportato da un altro dispositivo (PC o smartphone).
                </p>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                accept=".artvault,.json" 
                style={{ display: 'none' }}
                onChange={handleFileSelected} 
              />
              <button 
                className="btn btn-secondary" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                id="btn-import-backup"
              >
                <Upload size={16} />
                <span>{isImporting ? 'Caricamento...' : 'Seleziona File .artvault'}</span>
              </button>
            </div>

          </div>

          {/* Esportazione Excel / CSV */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600, fontSize: '0.95rem' }}>
                  <FileSpreadsheet size={18} />
                  <span>Esporta Foglio Excel / CSV</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Tabella completa con prezzi, dimensioni, collocazione e note, per contabilità o elenchi mostre.
                </div>
              </div>

              <button className="btn btn-secondary btn-sm" onClick={handleExportCSV} id="btn-export-csv">
                <FileSpreadsheet size={15} />
                <span>Scarica CSV</span>
              </button>
            </div>

            {csvStatus && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                color: '#10b981',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem'
              }}>
                <CheckCircle2 size={16} />
                <span>{csvStatus}</span>
              </div>
            )}
          </div>

          {/* Gestione Catalogo */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <button className="btn-danger btn-sm" onClick={handleClearAll} style={{ fontSize: '0.8rem' }}>
              <Trash2 size={14} />
              <span>Svuota Catalogo</span>
            </button>
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
