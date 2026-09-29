import { Artwork } from '../types/artwork';

export interface ScannedArtworkCandidate {
  id: string;
  code: string;
  title: string;
  artist: string;
  year?: number;
  technique: string;
  support: string;
  dimensions: {
    height: number;
    width: number;
    depth?: number;
  };
  price?: number;
  currency: string;
  status: 'bottega' | 'mostra' | 'venduto' | 'prestito' | 'in_corso';
  location: string;
  notes: string;
  imageBlobUrl: string;
  originalFileName: string;
  selected: boolean;
}

// Helper per pulire i nomi dei file e trasformarli in titoli eleganti
function cleanFileNameToTitle(fileName: string): string {
  // Rimuovi estensione
  let name = fileName.replace(/\.[^/.]+$/, "");
  // Rimuovi suffissi casuali tipo _ne5yvk7d o hash lunghi
  name = name.replace(/_[a-z0-9]{6,12}$/i, "");
  name = name.replace(/[_-]\d+x\d+$/i, ""); // rimuovi dimensioni wordpress tipo -1024x768
  // Sostituisci trattini e underscore con spazi
  name = name.replace(/[-_]+/g, " ").trim();
  // Capitalizza parole
  return name.replace(/\b\w/g, char => char.toUpperCase());
}

export interface ParsedArtworkInfo {
  title: string;
  technique: string;
  support: string;
  dimensions: { height: number; width: number; depth?: number };
  year?: number;
}

/**
 * Analizza il nome del file per estrarre la struttura standard:
 * "titolo - tecnica - dimensione" (es. "Alba sul Mare - Olio su tela - 80x60.jpg")
 */
export function parseArtworkFileName(fileName: string): ParsedArtworkInfo {
  // Rimuovi estensione
  let clean = fileName.replace(/\.[^/.]+$/, "");
  clean = clean.replace(/_[a-z0-9]{6,12}$/i, "");

  // Dividi per trattini o underscore
  const rawParts = clean.split(/\s*[-–—]\s*/).map(p => p.trim()).filter(Boolean);

  let title = '';
  let technique = 'Olio su tela';
  let support = 'Telaio in legno e tela';
  let dimensions = { height: 80, width: 60 };
  let year: number | undefined = detectYear(clean);

  if (rawParts.length >= 3) {
    // Formato completo: Titolo - Tecnica - Dimensione
    title = rawParts[0];

    const techParsed = detectTechnique(rawParts[1]);
    technique = rawParts[1].length > 2 ? rawParts[1] : techParsed.technique;
    support = techParsed.support;

    dimensions = detectDimensions(rawParts[2]);

    if (rawParts.length >= 4) {
      const possibleYear = detectYear(rawParts[3]);
      if (possibleYear) year = possibleYear;
    }
  } else if (rawParts.length === 2) {
    title = rawParts[0];
    const part1 = rawParts[1];

    const dimRegex = /(\d{2,3})\s*(?:x|×|X|\*)\s*(\d{2,3})/i;
    if (dimRegex.test(part1)) {
      dimensions = detectDimensions(part1);
    } else {
      const techParsed = detectTechnique(part1);
      technique = part1.length > 2 ? part1 : techParsed.technique;
      support = techParsed.support;
    }
  } else {
    title = cleanFileNameToTitle(fileName);
    const techParsed = detectTechnique(clean);
    technique = techParsed.technique;
    support = techParsed.support;
    dimensions = detectDimensions(clean);
  }

  // Pulizia finale titolo
  title = title.replace(/[_-]+/g, " ").trim();
  if (title.toLowerCase() === title) {
    title = title.replace(/\b\w/g, c => c.toUpperCase());
  }

  return { title, technique, support, dimensions, year };
}


// Regex per individuare tecniche artistiche comuni nel testo
function detectTechnique(text: string): { technique: string; support: string } {
  const lower = text.toLowerCase();
  
  if (lower.includes('olio su tela') || lower.includes('olio su lino')) {
    return { technique: 'Olio su tela', support: 'Telaio in lino' };
  }
  if (lower.includes('olio su tavola') || lower.includes('olio su legno')) {
    return { technique: 'Olio su tavola', support: 'Pannello in legno' };
  }
  if (lower.includes('acrilico su tela')) {
    return { technique: 'Acrilico su tela', support: 'Telaio in tela' };
  }
  if (lower.includes('tecnica mista')) {
    return { technique: 'Tecnica mista', support: 'Supporto misto d\'autore' };
  }
  if (lower.includes('acquerello') || lower.includes('acquarello')) {
    return { technique: 'Acquerello', support: 'Carta cotone' };
  }
  if (lower.includes('restauro')) {
    return { technique: 'Restauro conservativo', support: 'Opera antica' };
  }
  if (lower.includes('scultura') || lower.includes('bronzo') || lower.includes('marmo') || lower.includes('terracotta')) {
    return { technique: 'Scultura', support: 'Bronzo / Marmo / Terracotta' };
  }
  if (lower.includes('affresco')) {
    return { technique: 'Affresco', support: 'Intonaco' };
  }
  if (lower.includes('carboncino') || lower.includes('disegno') || lower.includes('grafite')) {
    return { technique: 'Carboncino su carta', support: 'Carta d\'arte' };
  }

  return { technique: 'Olio su tela', support: 'Telaio in legno e tela' };
}

// Regex per individuare dimensioni tipo 80x60, 240 x 180, 100 x 70 x 3 cm
function detectDimensions(text: string): { height: number; width: number; depth?: number } {
  const dimRegex = /(\d{2,3})\s*(?:x|×|X|\*)\s*(\d{2,3})(?:\s*(?:x|×|X|\*)\s*(\d{1,2}))?\s*(?:cm)?/i;
  const match = text.match(dimRegex);
  if (match) {
    const h = parseInt(match[1], 10);
    const w = parseInt(match[2], 10);
    const d = match[3] ? parseFloat(match[3]) : undefined;
    if (h > 0 && w > 0) {
      return { height: h, width: w, depth: d };
    }
  }
  return { height: 80, width: 60 };
}

// Regex per individuare anno tipo 2019, 2023, 2024
function detectYear(text: string): number | undefined {
  const yearRegex = /\b(19\d{2}|20\d{2})\b/;
  const match = text.match(yearRegex);
  if (match) {
    return parseInt(match[1], 10);
  }
  return undefined;
}

// Regex per individuare prezzi tipo € 3.200 o 3500 €
function detectPrice(text: string): number | undefined {
  const priceRegex = /(?:€\s*([\d.,]+)|([\d.,]+)\s*€)/i;
  const match = text.match(priceRegex);
  if (match) {
    const raw = match[1] || match[2];
    const cleaned = raw.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num > 0) return num;
  }
  return undefined;
}

// Converte un file immagine in Data URL base64 comprimendo con Canvas per ottimizzare memoria e database
async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawData = e.target?.result as string;
      // Per file piccoli o SVG, restituisci direttamente il base64
      if (file.type === 'image/svg+xml' || file.size < 80000) {
        resolve(rawData);
        return;
      }
      const img = new window.Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxDim = 1600;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawData);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.onerror = () => resolve(rawData);
      img.src = rawData;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Scansiona una lista di File provenienti da selezione o cartella locale
 */
export async function scanFolderFiles(files: File[], defaultArtistName = 'Artista Bottega'): Promise<ScannedArtworkCandidate[]> {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.jfif', '.avif', '.bmp', '.gif', '.tiff'];
  const htmlExtensions = ['.html', '.htm'];
  
  // Separa immagini e file HTML
  const imageFiles: File[] = [];
  const htmlFiles: File[] = [];

  for (const file of files) {
    const lowerName = file.name.toLowerCase();
    
    // Ignora file di sistema (es. .DS_Store, Thumbs.db o file nascosti)
    if (lowerName.startsWith('.') || lowerName === 'thumbs.db' || lowerName === 'desktop.ini') {
      continue;
    }

    const isImage = file.type.startsWith('image/') || imageExtensions.some(ext => lowerName.endsWith(ext));
    if (isImage) {
      imageFiles.push(file);
    } else if (htmlExtensions.some(ext => lowerName.endsWith(ext))) {
      htmlFiles.push(file);
    }
  }

  // Mappa di testi associati per nome file dell'immagine estratto dagli HTML
  const imageMetadataMap = new Map<string, { title?: string; tech?: string; dimensions?: string; year?: number; notes?: string; price?: number }>();

  // Analizza gli HTML per cercare tag <img> e testi adiacenti
  const parser = new DOMParser();
  for (const htmlFile of htmlFiles) {
    try {
      const text = await htmlFile.text();
      const doc = parser.parseFromString(text, 'text/html');
      const imgElements = Array.from(doc.querySelectorAll('img'));

      for (const img of imgElements) {
        const src = img.getAttribute('src') || '';
        const fileName = src.split('/').pop()?.split('?')[0]?.toLowerCase();
        if (!fileName) continue;

        // Cerca testo nei dintorni (alt, figcaption, h1, h2, h3, parent text)
        const altText = img.getAttribute('alt') || '';
        const titleAttr = img.getAttribute('title') || '';
        
        let containerText = '';
        const parentFigure = img.closest('figure');
        if (parentFigure) {
          containerText = parentFigure.textContent || '';
        } else {
          const parentContainer = img.closest('div, article, section, li');
          if (parentContainer) {
            containerText = parentContainer.textContent?.slice(0, 500) || '';
          }
        }

        const fullContext = `${altText} ${titleAttr} ${containerText}`;
        const cleanTitle = altText.trim() || titleAttr.trim() || undefined;

        imageMetadataMap.set(fileName, {
          title: cleanTitle,
          tech: fullContext,
          dimensions: fullContext,
          year: detectYear(fullContext),
          price: detectPrice(fullContext),
          notes: containerText.trim().slice(0, 300)
        });
      }
    } catch (e) {
      console.warn('Errore lettura file HTML:', htmlFile.name, e);
    }
  }

  // Costruisci le schede candidate
  const candidates: ScannedArtworkCandidate[] = [];
  let count = 1;

  for (const imgFile of imageFiles) {
    const lowerName = imgFile.name.toLowerCase();
    const meta = imageMetadataMap.get(lowerName) || {};
    const parsed = parseArtworkFileName(imgFile.name);

    // Titolo: prioritizza testo HTML se valido, altrimenti usa il titolo estratto dal nome file
    const title = meta.title && meta.title.length > 2 && meta.title.length < 80
      ? meta.title
      : parsed.title;

    // Tecnica & Supporto
    const { technique, support } = meta.tech 
      ? detectTechnique(meta.tech) 
      : { technique: parsed.technique, support: parsed.support };

    // Dimensioni
    const dimensions = meta.dimensions 
      ? detectDimensions(meta.dimensions) 
      : parsed.dimensions;

    // Anno
    const year = meta.year || parsed.year || new Date().getFullYear();

    // Prezzo
    const price = meta.price || undefined;

    // Converti l'immagine in base64
    const dataUrl = await readFileAsDataURL(imgFile);

    const pad = String(count).padStart(3, '0');
    candidates.push({
      id: `imported-${Date.now()}-${count}`,
      code: `ART-${pad}`,
      title,
      artist: defaultArtistName,
      year,
      technique,
      support,
      dimensions,
      price,
      currency: 'EUR',
      status: 'bottega',
      location: 'Bottega - In inventario',
      notes: meta.notes || `Importato automaticamente da cartella locale (${imgFile.name})`,
      imageBlobUrl: dataUrl,
      originalFileName: imgFile.name,
      selected: true
    });

    count++;
  }

  return candidates;
}

/**
 * Converte un URL di immagine online in un Data URL base64 permanente per uso offline
 */
async function fetchImageAsDataURL(imgUrl: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(imgUrl);
    if (!response.ok) throw new Error('Fetch failed');
  } catch {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(imgUrl)}`;
    response = await fetch(proxyUrl);
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Scansiona una pagina web da un link URL per estrarre immagini d'opere e metadati
 */
export async function scanUrlForArtworks(
  rawUrl: string, 
  defaultArtistName = 'Artista Bottega',
  onProgress?: (msg: string) => void
): Promise<ScannedArtworkCandidate[]> {
  let targetUrl = rawUrl.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  onProgress?.(`Collegamento a ${targetUrl}...`);

  let htmlText = '';
  try {
    const res = await fetch(targetUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    htmlText = await res.text();
  } catch {
    onProgress?.(`Bypass restrizioni CORS tramite proxy in corso...`);
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error(`Impossibile raggiungere il sito web.`);
    htmlText = await res.text();
  }

  onProgress?.(`Analisi della struttura della pagina web e ricerca dipinti...`);
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');

  // Individua tutte le immagini
  const imgElements = Array.from(doc.querySelectorAll('img'));
  const candidateImages: { fullImgUrl: string; contextText: string; altText: string; fileName: string }[] = [];
  const seenUrls = new Set<string>();

  for (const img of imgElements) {
    let src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || '';
    if (!src && img.srcset) {
      src = img.srcset.split(',')[0].trim().split(' ')[0];
    }
    if (!src) continue;

    let fullImgUrl = '';
    try {
      fullImgUrl = new URL(src, targetUrl).href;
    } catch {
      continue;
    }

    if (seenUrls.has(fullImgUrl)) continue;
    seenUrls.add(fullImgUrl);

    const lower = fullImgUrl.toLowerCase();
    // Filtra loghi, icone, favicon, avatar, tracciatori
    if (
      lower.includes('favicon') ||
      lower.includes('logo') ||
      lower.includes('icon') ||
      lower.includes('avatar') ||
      lower.includes('social') ||
      lower.includes('button') ||
      lower.includes('badge') ||
      lower.endsWith('.svg') ||
      lower.endsWith('.gif')
    ) {
      continue;
    }

    const altText = img.getAttribute('alt') || '';
    const titleAttr = img.getAttribute('title') || '';
    let containerText = '';
    const parentFigure = img.closest('figure');
    if (parentFigure) {
      containerText = parentFigure.textContent || '';
    } else {
      const parent = img.closest('div, article, section, li');
      if (parent) {
        containerText = parent.textContent?.slice(0, 400) || '';
      }
    }

    const fileName = fullImgUrl.split('/').pop()?.split('?')[0] || 'opera.jpg';
    candidateImages.push({
      fullImgUrl,
      contextText: `${altText} ${titleAttr} ${containerText}`,
      altText: altText.trim() || titleAttr.trim(),
      fileName
    });
  }

  if (candidateImages.length === 0) {
    throw new Error('Nessuna immagine d\'opera rilevata sulla pagina web indicata. Verifica che il link contenga immagini di opere.');
  }

  onProgress?.(`Trovate ${candidateImages.length} immagini. Download e salvataggio locale offline...`);

  const candidates: ScannedArtworkCandidate[] = [];
  let count = 1;

  for (const item of candidateImages) {
    try {
      onProgress?.(`Download opera ${count} di ${candidateImages.length}: ${item.fileName}...`);
      const dataUrl = await fetchImageAsDataURL(item.fullImgUrl);

      const title = item.altText && item.altText.length > 2 && item.altText.length < 80
        ? item.altText
        : cleanFileNameToTitle(item.fileName);

      const { technique, support } = detectTechnique(item.contextText || item.fileName);
      const dimensions = detectDimensions(item.contextText || item.fileName);
      const year = detectYear(item.contextText) || detectYear(item.fileName) || new Date().getFullYear();
      const price = detectPrice(item.contextText);

      const pad = String(count).padStart(3, '0');
      candidates.push({
        id: `imported-url-${Date.now()}-${count}`,
        code: `ART-${pad}`,
        title,
        artist: defaultArtistName,
        year,
        technique,
        support,
        dimensions,
        price,
        currency: 'EUR',
        status: 'bottega',
        location: `Importato da ${new URL(targetUrl).hostname}`,
        notes: `Importato automaticamente dall'URL: ${targetUrl}`,
        imageBlobUrl: dataUrl,
        originalFileName: item.fileName,
        selected: true
      });

      count++;
    } catch (e) {
      console.warn(`Impossibile scaricare immagine da ${item.fullImgUrl}:`, e);
    }
  }

  return candidates;
}

/**
 * Converte i candidati selezionati in oggetti Artwork definitivi pronti per il salvataggio nel database
 */
export function convertCandidatesToArtworks(candidates: ScannedArtworkCandidate[]): Artwork[] {
  return candidates
    .filter(c => c.selected)
    .map(c => ({
      id: c.id,
      code: c.code,
      title: c.title,
      artist: c.artist,
      year: c.year || new Date().getFullYear(),
      technique: c.technique,
      support: c.support,
      dimensions: c.dimensions,
      framed: false,
      price: c.price || 0,
      currency: 'EUR',
      status: c.status,
      location: c.location,
      notes: c.notes,
      images: [c.imageBlobUrl],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
}
