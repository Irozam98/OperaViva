/**
 * Servizio Cloud & 2FA Authenticator per OperaViva
 * Gestisce l'autenticazione multi-artista con verifica a due fattori (Google Authenticator / RFC 6238 TOTP)
 * e la compressione intelligente WebP per rispettare i limiti gratuiti di Cloudflare R2.
 */

export interface CloudArtistSession {
  artistId: string;
  email: string;
  artistName: string;
  studioName: string;
  totpSecret: string;
  totpEnabled: boolean;
  connectedAt: string;
}

const STORAGE_SESSION_KEY = 'operaviva_cloud_session';
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// 1. Genera Secret Base32 per Authenticator (Google / Microsoft / Apple)
export function generateTotpSecret(byteLength: number = 20): string {
  const bytes = new Uint8Array(byteLength);
  window.crypto.getRandomValues(bytes);
  let bits = '';
  for (let i = 0; i < bytes.length; i++) {
    bits += bytes[i].toString(2).padStart(8, '0');
  }
  let secret = '';
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    const chunk = bits.substring(i, i + 5);
    secret += BASE32_CHARS[parseInt(chunk, 2)];
  }
  return secret;
}

function base32ToBytes(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = '';
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_CHARS.indexOf(clean[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return new Uint8Array(bytes);
}

// 2. Calcola codice TOTP a 6 cifre via Web Crypto API (HMAC-SHA1 standard RFC 6238)
export async function calculateTotpCode(secret: string, counter: number): Promise<string> {
  const keyBytes = base32ToBytes(secret);
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyBytes as unknown as BufferSource,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const counterBuffer = new ArrayBuffer(8);
  const counterView = new DataView(counterBuffer);
  counterView.setUint32(0, Math.floor(counter / 0x100000000));
  counterView.setUint32(4, counter & 0xffffffff);

  const hmac = await window.crypto.subtle.sign('HMAC', cryptoKey, counterBuffer);
  const hmacBytes = new Uint8Array(hmac);

  const offset = hmacBytes[hmacBytes.length - 1] & 0x0f;
  const binary =
    ((hmacBytes[offset] & 0x7f) << 24) |
    ((hmacBytes[offset + 1] & 0xff) << 16) |
    ((hmacBytes[offset + 2] & 0xff) << 8) |
    (hmacBytes[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

// 3. Verifica codice a 6 cifre inserito dall'utente (con tolleranza +/- 1 finestra temporale da 30s)
export async function verifyTotpCode(token: string, secret: string): Promise<boolean> {
  const clean = token.trim().replace(/\s+/g, '');
  if (!/^\d{6}$/.test(clean)) return false;

  const epoch = Math.floor(Date.now() / 1000);
  const currentStep = Math.floor(epoch / 30);

  for (let stepOffset = -1; stepOffset <= 1; stepOffset++) {
    const expected = await calculateTotpCode(secret, currentStep + stepOffset);
    if (expected === clean) {
      return true;
    }
  }

  return false;
}

// 4. Genera URI otpauth:// per QR Code compatibile con tutte le app
export function getOtpAuthUri(accountEmail: string, studioOrArtist: string, secret: string): string {
  const issuer = encodeURIComponent('OperaViva Cloud');
  const label = encodeURIComponent(`${studioOrArtist} (${accountEmail})`);
  return `otpauth://totp/${issuer}:${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
}

// 5. Gestione Sessione Locale
export function getCloudSession(): CloudArtistSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCloudSession(session: CloudArtistSession): void {
  localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
}

export function clearCloudSession(): void {
  localStorage.removeItem(STORAGE_SESSION_KEY);
}

// 6. Ottimizzatore WebP Client-Side per preservare i 10 GB gratuiti di Cloudflare R2
export async function compressImageToWebP(base64OrUrl: string, maxDim: number = 2048, quality: number = 0.82): Promise<{ webpDataUrl: string; sizeEstimateKB: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let w = img.naturalWidth;
      let h = img.naturalHeight;

      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ webpDataUrl: base64OrUrl, sizeEstimateKB: 200 });
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);

      const webpUrl = canvas.toDataURL('image/webp', quality);
      const estKB = Math.round((webpUrl.length * 0.75) / 1024);
      resolve({ webpDataUrl: webpUrl, sizeEstimateKB: estKB });
    };
    img.onerror = () => {
      resolve({ webpDataUrl: base64OrUrl, sizeEstimateKB: 300 });
    };
    img.src = base64OrUrl;
  });
}
