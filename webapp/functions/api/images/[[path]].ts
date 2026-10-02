export async function onRequestGet(context: any): Promise<Response> {
  try {
    const { params, env } = context;
    if (!env.IMAGES_BUCKET) {
      return new Response('Bucket non configurato', { status: 500 });
    }

    // params.path è un array di segmenti es. ['artworks', 'artist-id', 'img.webp']
    const pathArray = params.path;
    const key = Array.isArray(pathArray) ? pathArray.join('/') : pathArray;

    if (!key) {
      return new Response('File non specificato', { status: 400 });
    }

    const object = await env.IMAGES_BUCKET.get(key);
    if (!object) {
      return new Response('Immagine non trovata', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new Response(object.body, {
      headers
    });
  } catch (err: any) {
    return new Response('Errore recupero immagine', { status: 500 });
  }
}
