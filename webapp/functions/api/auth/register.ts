import { hashPassword, createJWT } from '../lib/crypto';
import { generateBase32Secret, generateOtpAuthUri } from '../lib/totp';

export async function onRequestPost(context: any): Promise<Response> {
  try {
    const { request, env } = context;
    const data = await request.json();
    const { email, password, studioName, artistName, phone, website, city } = data;

    if (!email || !password || !studioName || !artistName) {
      return new Response(JSON.stringify({ error: 'Campi obbligatori mancanti' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (password.length < 8) {
      return new Response(JSON.stringify({ error: 'La password deve contenere almeno 8 caratteri' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = env.DB;
    // Verifica se l'email esiste già
    const existing = await db.prepare('SELECT id FROM artists WHERE email = ?').bind(email.toLowerCase().trim()).first();
    if (existing) {
      return new Response(JSON.stringify({ error: 'Un account con questa email esiste già' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const artistId = crypto.randomUUID();
    const { hash, salt } = await hashPassword(password);
    const totpSecret = generateBase32Secret(20);
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO artists (
        id, email, password_hash, password_salt, studio_name, artist_name,
        phone, website, city, totp_secret, totp_enabled, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).bind(
      artistId,
      email.toLowerCase().trim(),
      hash,
      salt,
      studioName.trim(),
      artistName.trim(),
      phone || null,
      website || null,
      city || null,
      totpSecret,
      now,
      now
    ).run();

    const otpauthUri = generateOtpAuthUri('OperaViva Cloud', email.toLowerCase().trim(), totpSecret);
    const tempToken = await createJWT({ tempArtistId: artistId, email: email.toLowerCase().trim(), step: 'setup-2fa' }, env.JWT_SECRET, 900);

    return new Response(JSON.stringify({
      success: true,
      tempToken,
      totpSecret,
      otpauthUri,
      artist: {
        id: artistId,
        email: email.toLowerCase().trim(),
        studioName: studioName.trim(),
        artistName: artistName.trim()
      }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Errore durante la registrazione' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
