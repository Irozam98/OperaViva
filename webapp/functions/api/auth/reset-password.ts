/**
 * POST /api/auth/reset-password
 * Verifica il token di reset, richiede il codice 2FA, e aggiorna la password.
 * Body: { token, newPassword, totpCode }
 */
import { hashPassword, verifyJWT } from '../lib/crypto';
import { verifyTOTP } from '../lib/totp';

export async function onRequestPost(context: any): Promise<Response> {
  const headers = { 'Content-Type': 'application/json' };

  try {
    const { request, env } = context;
    const { token, newPassword, totpCode } = await request.json();

    if (!token || !newPassword || !totpCode) {
      return new Response(JSON.stringify({ error: 'Dati mancanti: token, nuova password e codice Authenticator sono obbligatori.' }), { status: 400, headers });
    }

    if (newPassword.length < 8) {
      return new Response(JSON.stringify({ error: 'La password deve essere di almeno 8 caratteri.' }), { status: 400, headers });
    }

    const db = env.DB;

    // 1. Verifica il token di reset
    const resetRecord = await db.prepare(
      'SELECT artist_id, expires_at FROM password_reset_tokens WHERE token = ?'
    ).bind(token).first();

    if (!resetRecord) {
      return new Response(JSON.stringify({ error: 'Link di reset non valido o già utilizzato.' }), { status: 400, headers });
    }

    if (new Date(resetRecord.expires_at) < new Date()) {
      await db.prepare('DELETE FROM password_reset_tokens WHERE token = ?').bind(token).run();
      return new Response(JSON.stringify({ error: 'Il link di reset è scaduto. Richiedi un nuovo reset.' }), { status: 400, headers });
    }

    // 2. Carica l'artista e verifica il codice TOTP (2FA)
    const artist = await db.prepare(
      'SELECT id, totp_secret FROM artists WHERE id = ?'
    ).bind(resetRecord.artist_id).first();

    if (!artist) {
      return new Response(JSON.stringify({ error: 'Account non trovato.' }), { status: 404, headers });
    }

    const isTotpValid = verifyTOTP(totpCode, artist.totp_secret);
    if (!isTotpValid) {
      return new Response(JSON.stringify({ error: 'Codice Authenticator non valido o scaduto. Riprova.' }), { status: 401, headers });
    }

    // 3. Hash della nuova password e aggiornamento nel DB
    const { hash, salt } = await hashPassword(newPassword);
    const now = new Date().toISOString();

    await db.prepare(
      'UPDATE artists SET password_hash = ?, password_salt = ?, updated_at = ? WHERE id = ?'
    ).bind(hash, salt, now, artist.id).run();

    // 4. Invalida tutti i token di reset per questo artista
    await db.prepare(
      'DELETE FROM password_reset_tokens WHERE artist_id = ?'
    ).bind(artist.id).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Password aggiornata con successo. Puoi ora accedere con la nuova password.'
    }), { status: 200, headers });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Errore durante il reset della password.' }), { status: 500, headers });
  }
}
