/**
 * Ottimizzatore Immagini Client-Side per OperaViva Cloud
 * 
 * SCOPO FONDAMENTALE PER IL PIANO GRATUITO:
 * Comprime le fotografie scattate da fotocamere/smartphone (spesso 10-20 MB) 
 * direttamente nel browser dell'utente in formato WebP prima di inviarle a Cloudflare R2.
 * 
 * - Risoluzione bilanciata: max 2048px lato lungo (qualità da galleria d'arte)
 * - Formato WebP al 82% di qualità: file da ~400-600 KB anziché 15 MB (-95% di peso)
 * - Risultato: I 10 GB gratuiti di Cloudflare R2 possono contenere oltre 18.000 fotografie d'arte!
 */

export interface OptimizedImageResult {
  file: File;
  previewUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  savingsPercent: number;
  width: number;
  height: number;
}

export async function optimizeImageForCloud(file: File, maxDimension: number = 2048, quality: number = 0.82): Promise<OptimizedImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Errore lettura file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato immagine non supportato'));
      img.onload = () => {
        let width = img.naturalWidth;
        let height = img.naturalHeight;

        // Calcola proporzioni mantenendo l'aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Impossibile inizializzare Canvas 2D'));
          return;
        }

        // Smoothing di alta qualità per preservare dettagli pittorici
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Converti in WebP (standard universale moderno)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Errore compressione WebP'));
              return;
            }

            const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
            const compressedFile = new File([blob], cleanName, { type: 'image/webp' });
            const previewUrl = URL.createObjectURL(blob);
            const savingsPercent = Math.max(0, Math.round(((file.size - blob.size) / file.size) * 100));

            resolve({
              file: compressedFile,
              previewUrl,
              originalSizeBytes: file.size,
              compressedSizeBytes: blob.size,
              savingsPercent,
              width,
              height
            });
          },
          'image/webp',
          quality
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
