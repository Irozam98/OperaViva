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
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('q');

    let query = 'SELECT * FROM artworks WHERE artist_id = ?';
    const params: any[] = [auth.artistId];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search && search.trim() !== '') {
      query += ' AND (title LIKE ? OR code LIKE ? OR technique LIKE ? OR location LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY created_at DESC';

    const stmt = db.prepare(query);
    const { results } = await stmt.bind(...params).all();

    // Normalizza i campi per il frontend
    const artworks = (results || []).map((row: any) => ({
      id: row.id,
      code: row.code,
      title: row.title,
      artist: auth.email, // Oppure nome artista
      year: row.year,
      technique: row.technique,
      support: row.support,
      dimensions: {
        height: row.height,
        width: row.width,
        depth: row.depth || undefined
      },
      framed: Boolean(row.framed),
      frameDetails: row.frame_details,
      price: row.price,
      minPrice: row.min_price,
      currency: row.currency,
      status: row.status,
      location: row.location,
      locationNotes: row.location_notes,
      notes: row.notes,
      certificateNumber: row.certificate_number,
      buyerName: row.buyer_name,
      buyerContact: row.buyer_contact,
      soldDate: row.sold_date,
      images: row.images_json ? JSON.parse(row.images_json) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return new Response(JSON.stringify({ artworks }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Errore lettura opere' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context: any): Promise<Response> {
  try {
    const { request, env } = context;
    const auth = await getAuthArtist(request, env);
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Non autorizzato' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const artwork = await request.json();
    if (!artwork.title) {
      return new Response(JSON.stringify({ error: 'Titolo dell\'opera obbligatorio' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = env.DB;
    const id = artwork.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const code = artwork.code || `OPV-${Math.floor(100 + Math.random() * 900)}`;
    const height = artwork.dimensions?.height || 0;
    const width = artwork.dimensions?.width || 0;
    const depth = artwork.dimensions?.depth || 0;
    const framed = artwork.framed ? 1 : 0;
    const imagesJson = JSON.stringify(artwork.images || []);

    await db.prepare(`
      INSERT INTO artworks (
        id, artist_id, code, title, year, technique, support,
        height, width, depth, framed, frame_details,
        price, min_price, currency, status, location,
        location_notes, notes, certificate_number,
        buyer_name, buyer_contact, sold_date, images_json,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      auth.artistId,
      code,
      artwork.title.trim(),
      artwork.year || new Date().getFullYear(),
      artwork.technique || 'Olio su tela',
      artwork.support || 'Telaio in lino',
      height,
      width,
      depth,
      framed,
      artwork.frameDetails || null,
      artwork.price || 0,
      artwork.minPrice || 0,
      artwork.currency || 'EUR',
      artwork.status || 'bottega',
      artwork.location || 'Bottega',
      artwork.locationNotes || null,
      artwork.notes || null,
      artwork.certificateNumber || null,
      artwork.buyerName || null,
      artwork.buyerContact || null,
      artwork.soldDate || null,
      imagesJson,
      now,
      now
    ).run();

    return new Response(JSON.stringify({ success: true, id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Errore salvataggio opera' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
