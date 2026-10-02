import { verifyPassword, createJWT } from '../lib/crypto';

export async function onRequestPost(context: any): Promise<Response> {
  try {
    const { request, env } = context;
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Inserisci email e password' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = env.DB;
    const artist = await db.prepare(
      'SELECT id, email, password_hash, password_salt, artist_name, totp_enabled FROM artists WHERE email = ?'
    ).bind(email.toLowerCase().trim()).first();

    if (!artist) {
      return new Response(JSON.stringify({ error: 'Credenziali non valide' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const isValid = await verifyPassword(password, artist.password_hash, artist.password_salt);
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Credenziali non valide' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Genera un token temporaneo per la verifica 2FA valido 5 minuti
    const tempToken = await createJWT(
      { tempArtistId: artist.id, email: artist.email, step: 'verify-2fa' },
      env.JWT_SECRET,
      300
    );

    return new Response(JSON.stringify({
      requires2FA: true,
      tempToken,
      artistName: artist.artist_name
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Errore durante il login' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
