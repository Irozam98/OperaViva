import { Artwork, StudioProfile } from '../types/artwork';
import { db, getAllArtworks, getStudioProfile } from './db';

export interface BackupData {
  version: number;
  exportedAt: string;
  studioProfile: StudioProfile;
  artworks: Artwork[];
}

// Esporta l'intero catalogo e foto in un file di backup ArtVault
export async function exportCatalogBackup(): Promise<void> {
  const artworks = await getAllArtworks();
  const studioProfile = await getStudioProfile();

  const backupData: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    studioProfile,
    artworks
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const filename = `Catalogo_Bottega_${dateStr}.artvault`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    try {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {}
  }, 10000);
}

// Importa catalogo da file (.artvault o .json)
export async function importCatalogBackup(file: File, mode: 'merge' | 'replace'): Promise<{ count: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text) as BackupData;

        if (!data || !Array.isArray(data.artworks)) {
          throw new Error('Formato file non valido. Seleziona un file .artvault o .json esportato dall\'applicazione.');
        }

        if (mode === 'replace') {
          await db.artworks.clear();
        }

        if (data.studioProfile) {
          await db.settings.put({ key: 'studioProfile', value: data.studioProfile });
        }

        for (const art of data.artworks) {
          await db.artworks.put(art);
        }

        resolve({ count: data.artworks.length });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Errore durante la lettura del file'));
    reader.readAsText(file);
  });
}

// Esporta in formato CSV (compatibile con Microsoft Excel e LibreOffice Calc)
export async function exportCatalogToCSV(): Promise<{ filename: string; count: number; csvContent: string }> {
  const artworks = await getAllArtworks();
  
  const headers = [
    'Codice',
    'Titolo',
    'Artista',
    'Anno',
    'Tecnica',
    'Supporto',
    'Altezza (cm)',
    'Larghezza (cm)',
    'Profondita (cm)',
    'Incorniciato',
    'Prezzo Listino (EUR)',
    'Prezzo Minimo (EUR)',
    'Stato',
    'Collocazione',
    'Dettagli Collocazione',
    'Certificato N.',
    'Acquirente',
    'Data Vendita',
    'Note'
  ];

  const rows = artworks.map(art => [
    `"${art.code || ''}"`,
    `"${(art.title || '').replace(/"/g, '""')}"`,
    `"${(art.artist || '').replace(/"/g, '""')}"`,
    art.year || '',
    `"${(art.technique || '').replace(/"/g, '""')}"`,
    `"${(art.support || '').replace(/"/g, '""')}"`,
    art.dimensions?.height || 0,
    art.dimensions?.width || 0,
    art.dimensions?.depth || 0,
    art.framed ? 'Sì' : 'No',
    art.price || 0,
    art.minPrice || '',
    `"${art.status || ''}"`,
    `"${(art.location || '').replace(/"/g, '""')}"`,
    `"${(art.locationNotes || '').replace(/"/g, '""')}"`,
    `"${(art.certificateNumber || '').replace(/"/g, '""')}"`,
    `"${(art.buyerName || '').replace(/"/g, '""')}"`,
    art.soldDate || '',
    `"${(art.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const filename = `Inventario_Opere_${dateStr}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    try {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {}
  }, 10000);

  return { filename, count: artworks.length, csvContent };
}
