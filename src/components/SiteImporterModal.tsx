import React, { useRef, useState } from 'react';
import { X, FolderOpen, FolderDown, Image as ImageIcon, Check, CheckSquare, Square, Loader2, Info } from 'lucide-react';
import { ScannedArtworkCandidate, scanFolderFiles, convertCandidatesToArtworks } from '../services/siteImporter';
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
  const imagesInputRef = useRef<HTMLInputElement>(null);
  
  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);

  // Parsing / Candidates state
  const [isScanning, setIsScanning] = useState(false);
  const [candidates, setCandidates] = useState<ScannedArtworkCandidate[]>([]);
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);

  // Processa i file passati (da selezione cartella, file multipli o drag & drop)
  const processFiles = async (filesList: FileList | File[]) => {
    const filesArray = Array.from(filesList);
    if (filesArray.length === 0) return;

    setIsScanning(true);
    setImportStatusMessage(`Scansione di ${filesArray.length} file in corso...`);

    try {
      const artistName = studioProfile.artistName || "Artista Bottega";
      const scanned = await scanFolderFiles(filesArray, artistName);

      if (scanned.length === 0) {
        alert("Nessuna immagine d'opera d'arte rilevata tra i file selezionati. Assicurati di selezionare file immagine (JPG, PNG, WEBP, JFIF).");
      } else {
        setCandidates(scanned);
      }
    } catch (err: any) {
      console.error('Errore durante la scansione:', err);
      alert(`Errore durante la scansione: ${err.message || 'Errore sconosciuto'}`);
    } finally {
      setIsScanning(false);
      setImportStatusMessage(null);
    }
  };

  // Gestione selezione cartella
  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  // Gestione selezione immagini singole / multiple
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  // Gestione Drag & Drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
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

      // Inserisci o aggiorna in blocco in Dexie
      await db.artworks.bulkPut(artworksToSave);

      alert(`Successo! Importate ${artworksToSave.length} opere nel tuo inventario OperaViva.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Errore durante il salvataggio:', err);
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
            <FolderOpen size={20} color="#c5a059" />
            <h2 className="modal-title">Importa da Cartella Locale</h2>
          </div>
          <button className="btn-icon" onClick={onClose} title="Chiudi">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '78vh', overflowY: 'auto' }}>

          {/* FASE 1: NESSUNA SCANSIONE ANCORA EFFETTUATA */}
          {candidates.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              
              {/* Spiegazione 100% Locale e Offline */}
              <div style={{
                background: 'rgba(197, 160, 89, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.9rem 1.15rem',
                fontSize: '0.86rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.55
              }}>
                Catalogazione rapida <strong>100% locale e offline</strong> direttamente dal tuo computer.
                Clicca sull'area sottostante per selezionare una o più foto (o un'intera cartella).
                OperaViva estrarrà le immagini, ricaverà titoli e proporzioni e le predisporrà per il catalogo.
              </div>

              {/* Box Guida Convenzione Nomi File: titolo - tecnica - dimensione */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-gold)',
                borderRadius: 'var(--radius-md)',
                padding: '0.9rem 1.15rem',
                fontSize: '0.82rem',
                lineHeight: 1.5,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-400)', fontWeight: 600 }}>
                  <Info size={16} />
                  <span>Regola per la compilazione automatica dei dati nel catalogo</span>
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                  Per permettere all'importatore di valorizzare automaticamente tutti i campi, nomina i file separando gli elementi con un trattino <strong>"-"</strong>:
                </p>
                <div style={{ 
                  background: 'var(--bg-card)', 
                  border: '1px dashed var(--border-gold)', 
                  borderRadius: 'var(--radius-sm)', 
                  padding: '0.45rem 0.75rem', 
                  fontFamily: 'monospace', 
                  color: 'var(--gold-300)',
                  fontSize: '0.88rem',
                  fontWeight: 600
                }}>
                  titolo - tecnica - dimensione.jpg
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <em>Esempio:</em> <strong style={{ color: 'var(--text-primary)' }}>Tramonto a Venezia - Olio su tela - 80x60.jpg</strong> (oppure con anno: <em>Tramonto a Venezia - Olio su tela - 80x60 - 2024.jpg</em>).
                </div>
              </div>

              {/* AREA DI TRASCINAMENTO E SELEZIONE CARTELLA / FILE (INTERA AREA CLICCABILE) */}
              <div 
                style={{
                  background: isDragging ? 'rgba(197, 160, 89, 0.15)' : 'var(--bg-card)',
                  border: isDragging ? '2px dashed var(--gold-400)' : '2px dashed var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1.25rem',
                  transition: 'all var(--trans-fast)',
                  cursor: isScanning ? 'wait' : 'pointer'
                }}
                onClick={() => {
                  if (!isScanning) imagesInputRef.current?.click();
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                title="Clicca per selezionare una o più foto"
              >
                <div style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '50%',
                  background: 'rgba(197, 160, 89, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--gold-400)'
                }}>
                  <FolderDown size={30} />
                </div>

                <div>
                  <h3 style={{ fontSize: '1.08rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Clicca qui per selezionare una foto o trascinala dentro
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                    Supporta tutti i formati: JPG, JPEG, PNG, WEBP, JFIF
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {/* Pulsante Principale: Scegli Foto (Singola o Multiple) */}
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      imagesInputRef.current?.click();
                    }}
                    disabled={isScanning}
                  >
                    <ImageIcon size={17} />
                    <span>Scegli Foto (Singola o Multiple)</span>
                  </button>

                  {/* Pulsante Secondario: Sfoglia Intera Cartella */}
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      folderInputRef.current?.click();
                    }}
                    disabled={isScanning}
                    title="Seleziona una cartella contenente più immagini"
                  >
                    <FolderOpen size={17} />
                    <span>Sfoglia Intera Cartella</span>
                  </button>
                </div>

                {/* Input nativo HTML5 per selezione cartella intera */}
                <input 
                  type="file" 
                  ref={folderInputRef}
                  onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                  onChange={handleFolderChange}
                  // @ts-ignore
                  webkitdirectory="" 
                  // @ts-ignore
                  directory="" 
                  multiple 
                  style={{ display: 'none' }} 
                />

                {/* Input nativo HTML5 per selezione immagini singole / multiple */}
                <input 
                  type="file" 
                  ref={imagesInputRef}
                  onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                  onChange={handleImagesChange}
                  accept="image/*,.jpg,.jpeg,.png,.webp,.jfif,.avif,.bmp,.gif,.tiff"
                  multiple 
                  style={{ display: 'none' }} 
                />
              </div>

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
                        File originale: {cand.originalFileName}
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
