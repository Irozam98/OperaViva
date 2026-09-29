import React, { useRef, useState } from 'react';
import { X, Download, Upload, FileSpreadsheet, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { exportCatalogBackup, importCatalogBackup, exportCatalogToCSV } from '../services/backup';
import { clearAllArtworks } from '../services/db';
import { ConfirmModal } from './ConfirmModal';
import { useI18n } from '../i18n';

interface BackupModalProps {
  onClose: () => void;
  onDataChanged: () => void;
  onOpenSiteImporter: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ onClose, onDataChanged, onOpenSiteImporter }) => {
  const { t, language } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [csvStatus, setCsvStatus] = useState<string | null>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const handleExport = async () => {
    try {
      await exportCatalogBackup();
    } catch (e) {
      console.error(e);
      alert(language === 'en' ? 'Error exporting backup archive' : 'Errore durante l\'esportazione del backup');
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await exportCatalogToCSV();
      setCsvStatus(
        language === 'en'
          ? `File "${res.filename}" downloaded! Check your PC Downloads folder.`
          : `File "${res.filename}" scaricato! Trovi il file nella cartella Download del PC.`
      );
      setTimeout(() => {
        setCsvStatus(null);
      }, 7000);
    } catch (e) {
      console.error(e);
      alert(language === 'en' ? 'Error exporting CSV spreadsheet' : 'Errore durante l\'esportazione del file CSV');
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmMsg = language === 'en'
      ? 'Do you want to completely REPLACE the current inventory with the backup data?\n\n- Click OK to Replace completely\n- Click CANCEL to Merge (keep existing artworks and add new ones)'
      : 'Vuoi SOSTITUIRE completamente l\'inventario attuale con i dati del file?\n\n- Premi OK per Sostituire completamente\n- Premi ANNULLA per Unire (mantenere le opere esistenti ed aggiungere quelle nuove)';

    const mode = confirm(confirmMsg) ? 'replace' : 'merge';

    setIsImporting(true);
    setImportStatus(language === 'en' ? 'Importing artworks and photographs...' : 'Importazione opere e foto in corso...');
    try {
      const result = await importCatalogBackup(file, mode);
      setImportStatus(
        language === 'en'
          ? `Success! Imported ${result.count} artworks.`
          : `Successo! Importate ${result.count} opere.`
      );
      onDataChanged();
      setTimeout(() => {
        setImportStatus(null);
      }, 3000);
    } catch (err: any) {
      console.error(err);
      alert(
        language === 'en'
          ? `Import error: ${err.message || 'Invalid file'}`
          : `Errore nell'importazione: ${err.message || 'File non valido'}`
      );
      setImportStatus(null);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExecuteClearAll = async () => {
    setIsClearConfirmOpen(false);
    await clearAllArtworks();
    onDataChanged();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={20} color="#c5a059" />
            <h2 className="modal-title">{t('backupModalTitle')}</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          
          {/* Sezione Importazione Opere (Cartella Locale) */}
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
                {t('backupLocalImportTitle')}
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>
                {t('backupLocalImportDesc')}
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
              <span>{t('backupOpenLocalImporter')}</span>
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
                  <span>{t('backupExportVault')}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.4 }}>
                  {t('backupExportVaultDesc')}
                </p>
              </div>

              <button className="btn btn-primary" onClick={handleExport} id="btn-export-backup">
                <Download size={16} />
                <span>{language === 'en' ? 'Download Archive (.artvault)' : 'Scarica File Backup'}</span>
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
                  <span>{t('backupImportVault')}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.4 }}>
                  {t('backupImportVaultDesc')}
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
                <span>{isImporting ? (language === 'en' ? 'Importing...' : 'Caricamento...') : (language === 'en' ? 'Select .artvault File' : 'Seleziona File .artvault')}</span>
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
                  <span>{t('backupExportCsv')}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {t('backupExportCsvDesc')}
                </div>
              </div>

              <button className="btn btn-secondary btn-sm" onClick={handleExportCSV} id="btn-export-csv">
                <FileSpreadsheet size={15} />
                <span>{language === 'en' ? 'Download CSV' : 'Scarica CSV'}</span>
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
            <button className="btn-danger btn-sm" onClick={() => setIsClearConfirmOpen(true)} style={{ fontSize: '0.8rem' }}>
              <Trash2 size={14} />
              <span>{language === 'en' ? 'Erase Entire Catalog' : 'Svuota Catalogo'}</span>
            </button>
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            {t('close')}
          </button>
        </div>
      </div>

      {/* Banner Pop-up di Conferma Svuota Catalogo */}
      <ConfirmModal
        isOpen={isClearConfirmOpen}
        title={language === 'en' ? 'Erase Entire Catalog' : 'Svuota Tutto il Catalogo'}
        message={language === 'en'
          ? 'Are you sure you want to permanently erase ALL artworks from the catalog?'
          : 'Sei sicuro di voler cancellare TUTTE le opere dall\'inventario?'}
        warningNote={language === 'en'
          ? 'Make sure you have downloaded a backup before proceeding. This action cannot be reversed!'
          : 'Assicurati di aver scaricato un backup prima di procedere. Questa azione cancellerà ogni dato!'}
        confirmLabel={language === 'en' ? 'Yes, Erase All' : 'Sì, Cancella Tutto'}
        cancelLabel={language === 'en' ? 'No, Cancel' : 'No, Annulla'}
        isDanger={true}
        onConfirm={handleExecuteClearAll}
        onCancel={() => setIsClearConfirmOpen(false)}
      />
    </div>
  );
};
