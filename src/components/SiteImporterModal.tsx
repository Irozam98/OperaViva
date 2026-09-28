import React, { useRef, useState } from 'react';
import { X, Globe, Check, CheckSquare, Square, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { ScannedArtworkCandidate, scanFolderFiles, scanUrlForArtworks, convertCandidatesToArtworks } from '../services/siteImporter';
import { StudioProfile } from '../types/artwork';
import { db } from '../services/db';

interface SiteImporterModalProps {
  studioProfile: StudioProfile;
  onClose: () => void;
  onSuccess: () => void;
}

export const SiteImporterModal: React.FC<SiteImporterModalProps> = ({
  studioProfile,
  onClose,
  onSuccess
}) => {
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'url' | 'folder'>('url');
  
  // URL mode state
  const [siteUrl, setSiteUrl] = useState('');
  
  // Parsing / Candidates state
  const [isScanning, setIsScanning] = useState(false);
  const [candidates, setCandidates] = useState<ScannedArtworkCandidate[]>([]);
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);

  // Gestione scansione da URL sito internet
  const handleUrlScan = async () => {
    if (!siteUrl.trim()) return;

    setIsScanning(true);
    setImportStatusMessage(`Collegamento a ${siteUrl}...`);

    try {
      const artistName = studioProfile.artistName || "Artista Bottega";
      const scanned = await scanUrlForArtworks(siteUrl, artistName, (msg) => {
        setImportStatusMessage(msg);
      });

      if (scanned.length === 0) {
        alert("Nessuna opera rilevata sul sito indicato. Verifica l'URL o prova con il link diretto alla galleria delle opere.");
      } else {
        setCandidates(scanned);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Errore scansione sito web: ${err.message || 'Impossibile connettersi al sito web'}`);
    } finally {
      setIsScanning(false);
      setImportStatusMessage(null);
    }
  };

  // Gestione selezione cartella locale
  const handleFolderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setIsScanning(true);
    setImportStatusMessage(`Scansione di ${fileList.length} file nella cartella...`);

    try {
      const filesArray = Array.from(fileList);
      const artistName = studioProfile.artistName || "Artista Bottega";
      const scanned = await scanFolderFiles(filesArray, artistName);

      if (scanned.length === 0) {
        alert("Nessuna immagine d'opera d'arte valida rilevata nella cartella selezionata. Assicurati che contenga file JPG, PNG o WEBP.");
      } else {
        setCandidates(scanned);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Errore durante la scansione della cartella: ${err.message || 'Errore sconosciuto'}`);
    } finally {
      setIsScanning(false);
      setImportStatusMessage(null);
      if (folderInputRef.current) folderInputRef.current.value = '';
    }
  };

  // Toggle selezione singolo candidato
  const toggleCandidateSelection = (index: number) => {
    setCandidates(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], selected: !updated[index].selected };
      return updated;
    });
  };

  // Seleziona / Deseleziona tutti
  const toggleSelectAll = (select: boolean) => {
    setCandidates(prev => prev.map(c => ({ ...c, selected: select })));
  };

  // Modifica rapida del titolo di un candidato
  const updateCandidateTitle = (index: number, newTitle: string) => {
    setCandidates(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], title: newTitle };
      return updated;
    });
  };

  // Esegui importazione nel database
  const executeImport = async (mode: 'merge' | 'replace') => {
    const selectedCandidates = candidates.filter(c => c.selected);
    if (selectedCandidates.length === 0) {
      alert('Seleziona almeno un\'opera da importare!');
      return;
    }

    const confirmMsg = mode === 'replace'
      ? `ATTENZIONE: Stai per SOSTITUIRE completamente l'inventario attuale con le ${selectedCandidates.length} nuove opere scansionate.\n\nVuoi procedere?`
      : `Vuoi aggiungere ${selectedCandidates.length} nuove opere al tuo inventario attuale?`;

    if (!confirm(confirmMsg)) return;

    setIsScanning(true);
    setImportStatusMessage("Salvataggio nell'archivio locale in corso...");

    try {
      const artworksToSave = convertCandidatesToArtworks(selectedCandidates);

      if (mode === 'replace') {
        await db.artworks.clear();
      }

      // Inserisci in blocco
      await db.artworks.bulkAdd(artworksToSave);

      alert(`Successo! Importate ${artworksToSave.length} opere nel tuo inventario OperaViva.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(`Errore durante il salvataggio: ${err.message || 'Errore database'}`);
    } finally {
      setIsScanning(false);
      setImportStatusMessage(null);
    }
  };

  const selectedCount = candidates.filter(c => c.selected).length;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: candidates.length > 0 ? '920px' : '680px', width: '100%' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Globe size={19} color="#c5a059" />
            <h2 className="modal-title">Importazione Opere</h2>
          </div>
          <button className="btn-icon" onClick={onClose} title="Chiudi">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '78vh', overflowY: 'auto' }}>

          {/* FASE 1: NESSUNA SCANSIONE ANCORA EFFETTUATA */}
          {candidates.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Spiegazione Automazione */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.9rem 1.15rem',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5
              }}>
                Catalogazione automatica da un <strong>sito web online</strong> o da una <strong>cartella locale</strong> del computer. Riconoscimento di immagini, titoli, tecniche e misure con salvataggio offline.
              </div>

              {/* Selettore Schede Pulito e Tipografico */}
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                borderBottom: '1px solid var(--border-subtle)', 
                paddingBottom: '0.75rem'
              }}>
                <button 
                  type="button"
                  className={`btn ${activeTab === 'url' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveTab('url')}
                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.88rem' }}
                >
                  <span>Sito Web (URL)</span>
                </button>
                <button 
                  type="button"
                  className={`btn ${activeTab === 'folder' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveTab('folder')}
                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.88rem' }}
                >
                  <span>Cartella Locale</span>
                </button>
              </div>

              {/* TAB 1: IMPORTAZIONE DIRETTA DA SITO INTERNET (URL) */}
              {activeTab === 'url' && (
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Indirizzo del sito web o galleria online:
                  </label>

                  <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input 
                      type="url"
                      className="form-input"
                      style={{ flex: '1 1 280px', fontSize: '0.9rem' }}
                      placeholder="es. https://miosito.it oppure https://miosito.it/galleria/"
                      value={siteUrl}
                      onChange={e => setSiteUrl(e.target.value)}
                      disabled={isScanning}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleUrlScan();
                        }
                      }}
                    />
                    <button 
                      type="button"
                      className="btn btn-primary"
                      onClick={handleUrlScan}
                      disabled={isScanning || !siteUrl.trim()}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      <span>{isScanning ? 'Scansione in corso...' : 'Scansiona Sito'}</span>
                    </button>
                  </div>

                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Inserisci l'indirizzo del tuo sito web, blog o galleria online per importarne automaticamente le opere.
                  </div>
                </div>
              )}

              {/* TAB 2: IMPORTAZIONE DA CARTELLA LOCALE DEL COMPUTER */}
              {activeTab === 'folder' && (
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px dashed var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.85rem',
                  cursor: 'pointer'
                }}
                onClick={() => folderInputRef.current?.click()}
                >
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Seleziona una cartella sul computer contenente immagini di opere o salvataggi del sito.
                  </p>

                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    style={{ pointerEvents: 'none' }}
                  >
                    <span>Sfoglia Cartella</span>
                  </button>

                  {/* Input nativo HTML5 per selezione cartella intera */}
                  <input 
                    type="file" 
                    ref={folderInputRef}
                    onChange={handleFolderChange}
                    // @ts-ignore
                    webkitdirectory="" 
                    // @ts-ignore
                    directory="" 
                    multiple 
                    style={{ display: 'none' }} 
                  />
                </div>
              )}

              {/* Indicatore di caricamento durante la scansione */}
              {isScanning && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '1.25rem', 
                  background: 'rgba(197, 160, 89, 0.08)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-gold)',
                  color: 'var(--gold-300)', 
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.65rem'
                }}>
                  <Loader2 size={20} className="animate-spin" />
                  <span>{importStatusMessage || 'Elaborazione in corso...'}</span>
                </div>
              )}

            </div>
          ) : (
            /* FASE 2: RISULTATI SCANSIONE & REVISIONE CANDIDATI */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                    Rilevate {candidates.length} Opere Pronte
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {selectedCount} di {candidates.length} selezionate per l'importazione
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => toggleSelectAll(true)}
                  >
                    Seleziona Tutte
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => toggleSelectAll(false)}
                  >
                    Deseleziona
                  </button>
                </div>
              </div>

              {/* Lista scrollabile delle opere rilevate */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '50vh', overflowY: 'auto', paddingRight: '0.4rem' }}>
                {candidates.map((cand, idx) => (
                  <div 
                    key={cand.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      background: cand.selected ? 'var(--bg-card)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${cand.selected ? 'var(--border-gold)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem',
                      transition: 'background var(--trans-fast)'
                    }}
                  >
                    {/* Checkbox */}
                    <div 
                      onClick={() => toggleCandidateSelection(idx)}
                      style={{ cursor: 'pointer', color: cand.selected ? 'var(--gold-400)' : 'var(--text-muted)' }}
                    >
                      {cand.selected ? <CheckSquare size={20} /> : <Square size={20} />}
                    </div>

                    {/* Anteprima immagine */}
                    <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, background: '#000' }}>
                      <img 
                        src={cand.imageBlobUrl} 
                        alt={cand.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>

                    {/* Dati editabili in linea */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <input 
                        type="text"
                        value={cand.title}
                        onChange={e => updateCandidateTitle(idx, e.target.value)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          borderBottom: '1px dashed var(--border-medium)',
                          color: 'var(--text-primary)',
                          fontFamily: 'var(--font-serif)',
                          fontSize: '1rem',
                          fontStyle: 'italic',
                          outline: 'none',
                          padding: '0.15rem 0'
                        }}
                        title="Clicca per modificare il titolo prima di salvare"
                      />
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span>{cand.technique}</span>
                        <span>•</span>
                        <span>{cand.dimensions.height} × {cand.dimensions.width} cm</span>
                        <span>•</span>
                        <span>Anno: {cand.year || '-'}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Origine: {cand.originalFileName}
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* Azioni di salvataggio */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setCandidates([])}
                >
                  Indietro (Nuova Scansione)
                </button>

                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => executeImport('replace')}
                    title="Svuota l'inventario e carica solo queste opere"
                  >
                    Sostituisci Tutto
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => executeImport('merge')}
                    title="Aggiungi queste opere a quelle già esistenti"
                  >
                    <Check size={18} />
                    <span>Aggiungi all'Inventario ({selectedCount})</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
