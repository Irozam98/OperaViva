import { getAuthArtist } from './lib/crypto';

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

    if (!env.IMAGES_BUCKET) {
      return new Response(JSON.stringify({ error: 'Bucket Cloudflare R2 (IMAGES_BUCKET) non configurato in wrangler.jsonc' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const contentType = request.headers.get('content-type') || '';
    let fileBuffer: ArrayBuffer;
    let mimeType = 'image/webp';
    let fileExt = 'webp';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return new Response(JSON.stringify({ error: 'Nessun file inviato' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      fileBuffer = await file.arrayBuffer();
      mimeType = file.type || 'image/webp';
      if (file.name.includes('.')) {
        fileExt = file.name.split('.').pop() || 'webp';
      }
    } else {
      fileBuffer = await request.arrayBuffer();
      mimeType = contentType.split(';')[0] || 'image/webp';
    }

    // Limite dimensione max 5 MB (grazie alla compressione client-side le immagini peseranno < 1 MB)
    if (fileBuffer.byteLength > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'Dimensione immagine superiore a 5 MB' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const imageId = crypto.randomUUID();
    const key = `artworks/${auth.artistId}/${imageId}.${fileExt}`;

    await env.IMAGES_BUCKET.put(key, fileBuffer, {
      httpMetadata: {
        contentType: mimeType,
        cacheControl: 'public, max-age=31536000, immutable'
      },
      customMetadata: {
        artistId: auth.artistId,
        uploadedAt: new Date().toISOString()
      }
    });

    const publicUrl = `/api/images/${key}`;

    return new Response(JSON.stringify({
      success: true,
      url: publicUrl,
      key,
      sizeBytes: fileBuffer.byteLength
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Errore durante l\'upload' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
