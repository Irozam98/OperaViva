import { verifyJWT, createJWT } from '../lib/crypto';
import { verifyTOTP } from '../lib/totp';

export async function onRequestPost(context: any): Promise<Response> {
  try {
    const { request, env } = context;
    const { tempToken, code } = await request.json();

    if (!tempToken || !code) {
      return new Response(JSON.stringify({ error: 'Token temporaneo o codice mancante' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const payload = await verifyJWT(tempToken, env.JWT_SECRET);
    if (!payload || !payload.tempArtistId) {
      return new Response(JSON.stringify({ error: 'Sessione di verifica scaduta o non valida. Effettua nuovamente il login.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = env.DB;
    const artist = await db.prepare(
      'SELECT id, email, studio_name, artist_name, phone, website, city, currency, catalog_prefix, totp_secret FROM artists WHERE id = ?'
    ).bind(payload.tempArtistId).first();

    if (!artist) {
      return new Response(JSON.stringify({ error: 'Artista non trovato' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verifica il codice TOTP a 6 cifre dall'app Authenticator
    const isCodeValid = await verifyTOTP(code, artist.totp_secret);
    if (!isCodeValid) {
      return new Response(JSON.stringify({ error: 'Codice Authenticator errato o scaduto. Riprova.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Genera il session token finale JWT valido 7 giorni
    const sessionToken = await createJWT({
      artistId: artist.id,
      email: artist.email,
      artistName: artist.artist_name,
      studioName: artist.studio_name
    }, env.JWT_SECRET, 86400 * 7);

    return new Response(JSON.stringify({
      success: true,
      token: sessionToken,
      artist: {
        id: artist.id,
        email: artist.email,
        studioName: artist.studio_name,
        artistName: artist.artist_name,
        phone: artist.phone,
        website: artist.website,
        city: artist.city,
        currency: artist.currency,
        catalogPrefix: artist.catalog_prefix
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Errore durante la verifica 2FA' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
