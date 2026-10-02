import { getAuthArtist } from '../lib/crypto';

export async function onRequestGet(context: any): Promise<Response> {
  try {
    const { request, env } = context;
    const auth = await getAuthArtist(request, env);
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Non autorizzato' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = env.DB;
    const artist = await db.prepare(
      'SELECT id, email, studio_name, artist_name, phone, website, city, currency, catalog_prefix, created_at FROM artists WHERE id = ?'
    ).bind(auth.artistId).first();

    if (!artist) {
      return new Response(JSON.stringify({ error: 'Artista non trovato' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      artist: {
        id: artist.id,
        email: artist.email,
        studioName: artist.studio_name,
        artistName: artist.artist_name,
        phone: artist.phone,
        website: artist.website,
        city: artist.city,
        currency: artist.currency,
        catalogPrefix: artist.catalog_prefix,
        createdAt: artist.created_at
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Errore recupero profilo' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPut(context: any): Promise<Response> {
  try {
    const { request, env } = context;
    const auth = await getAuthArtist(request, env);
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Non autorizzato' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await request.json();
    const { studioName, artistName, phone, website, city, currency, catalogPrefix } = data;

    const db = env.DB;
    const now = new Date().toISOString();

    await db.prepare(`
      UPDATE artists SET
        studio_name = COALESCE(?, studio_name),
        artist_name = COALESCE(?, artist_name),
        phone = ?,
        website = ?,
        city = ?,
        currency = COALESCE(?, currency),
        catalog_prefix = COALESCE(?, catalog_prefix),
        updated_at = ?
      WHERE id = ?
    `).bind(
      studioName || null,
      artistName || null,
      phone || null,
      website || null,
      city || null,
      currency || null,
      catalogPrefix || null,
      now,
      auth.artistId
    ).run();

    return new Response(JSON.stringify({ success: true, message: 'Profilo bottega aggiornato' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Errore aggiornamento profilo' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
