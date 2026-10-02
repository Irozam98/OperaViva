import { getAuthArtist } from '../lib/crypto';

export async function onRequestGet(context: any): Promise<Response> {
  try {
    const { request, env, params } = context;
    const auth = await getAuthArtist(request, env);
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Non autorizzato' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = params;
    const db = env.DB;
    const row = await db.prepare(
      'SELECT * FROM artworks WHERE id = ? AND artist_id = ?'
    ).bind(id, auth.artistId).first();

    if (!row) {
      return new Response(JSON.stringify({ error: 'Opera non trovata' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const artwork = {
      id: row.id,
      code: row.code,
      title: row.title,
      artist: auth.email,
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
    };

    return new Response(JSON.stringify({ artwork }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Errore recupero opera' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPut(context: any): Promise<Response> {
  try {
    const { request, env, params } = context;
    const auth = await getAuthArtist(request, env);
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Non autorizzato' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = params;
    const artwork = await request.json();
    const db = env.DB;
    const now = new Date().toISOString();

    const height = artwork.dimensions?.height || 0;
    const width = artwork.dimensions?.width || 0;
    const depth = artwork.dimensions?.depth || 0;
    const framed = artwork.framed ? 1 : 0;
    const imagesJson = JSON.stringify(artwork.images || []);

    const res = await db.prepare(`
      UPDATE artworks SET
        code = ?, title = ?, year = ?, technique = ?, support = ?,
        height = ?, width = ?, depth = ?, framed = ?, frame_details = ?,
        price = ?, min_price = ?, currency = ?, status = ?, location = ?,
        location_notes = ?, notes = ?, certificate_number = ?,
        buyer_name = ?, buyer_contact = ?, sold_date = ?, images_json = ?,
        updated_at = ?
      WHERE id = ? AND artist_id = ?
    `).bind(
      artwork.code,
      artwork.title,
      artwork.year,
      artwork.technique,
      artwork.support,
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
      id,
      auth.artistId
    ).run();

    if (res.meta?.changes === 0) {
      return new Response(JSON.stringify({ error: 'Opera non trovata o non autorizzato' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Opera aggiornata' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Errore aggiornamento opera' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestDelete(context: any): Promise<Response> {
  try {
    const { request, env, params } = context;
    const auth = await getAuthArtist(request, env);
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Non autorizzato' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = params;
    const db = env.DB;

    const res = await db.prepare(
      'DELETE FROM artworks WHERE id = ? AND artist_id = ?'
    ).bind(id, auth.artistId).run();

    if (res.meta?.changes === 0) {
      return new Response(JSON.stringify({ error: 'Opera non trovata' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Opera eliminata' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Errore eliminazione opera' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
