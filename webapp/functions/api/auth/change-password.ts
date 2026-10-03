/**
 * POST /api/auth/change-password
 * Cambia la password mentre l'artista è già autenticato.
 * Body: { currentPassword, newPassword, totpCode }
 * Richiede Bearer token valido.
 */
import { hashPassword, verifyPassword, getAuthArtist } from '../lib/crypto';
import { verifyTOTP } from '../lib/totp';

export async function onRequestPost(context: any): Promise<Response> {
  const headers = { 'Content-Type': 'application/json' };

  try {
    const { request, env } = context;

    // 1. Verifica autenticazione JWT
    const auth = await getAuthArtist(request, env);
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Non autenticato.' }), { status: 401, headers });
    }

    const { currentPassword, newPassword, totpCode } = await request.json();

    if (!currentPassword || !newPassword || !totpCode) {
      return new Response(JSON.stringify({ error: 'Password attuale, nuova password e codice Authenticator sono obbligatori.' }), { status: 400, headers });
    }

    if (newPassword.length < 8) {
      return new Response(JSON.stringify({ error: 'La nuova password deve essere di almeno 8 caratteri.' }), { status: 400, headers });
    }

    if (currentPassword === newPassword) {
      return new Response(JSON.stringify({ error: 'La nuova password deve essere diversa da quella attuale.' }), { status: 400, headers });
    }

    const db = env.DB;

    // 2. Carica l'artista con hash corrente e segreto TOTP
    const artist = await db.prepare(
      'SELECT id, password_hash, password_salt, totp_secret FROM artists WHERE id = ?'
    ).bind(auth.artistId).first();

    if (!artist) {
      return new Response(JSON.stringify({ error: 'Account non trovato.' }), { status: 404, headers });
    }

    // 3. Verifica password attuale
    const isCurrentValid = await verifyPassword(currentPassword, artist.password_hash, artist.password_salt);
    if (!isCurrentValid) {
      return new Response(JSON.stringify({ error: 'La password attuale non è corretta.' }), { status: 401, headers });
    }

    // 4. Verifica codice TOTP (2FA obbligatorio anche per cambio password)
    const isTotpValid = verifyTOTP(totpCode, artist.totp_secret);
    if (!isTotpValid) {
      return new Response(JSON.stringify({ error: 'Codice Authenticator non valido o scaduto. Riprova.' }), { status: 401, headers });
    }

    // 5. Hash nuova password e salva
    const { hash, salt } = await hashPassword(newPassword);
    const now = new Date().toISOString();

    await db.prepare(
      'UPDATE artists SET password_hash = ?, password_salt = ?, updated_at = ? WHERE id = ?'
    ).bind(hash, salt, now, artist.id).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Password cambiata con successo.'
    }), { status: 200, headers });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Errore durante il cambio password.' }), { status: 500, headers });
  }
}
