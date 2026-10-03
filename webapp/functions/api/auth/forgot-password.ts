/**
 * POST /api/auth/forgot-password
 * Genera un token di reset password valido 1 ora e invia email all'artista.
 * Non rivela se l'email esiste o no (sicurezza anti-enumeration).
 */
export async function onRequestPost(context: any): Promise<Response> {
  const headers = { 'Content-Type': 'application/json' };

  try {
    const { request, env } = context;
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email non valida' }), { status: 400, headers });
    }

    const db = env.DB;
    const normalizedEmail = email.toLowerCase().trim();

    // Cerca l'artista (risposta generica anche se non trovato, per sicurezza)
    const artist = await db.prepare(
      'SELECT id, artist_name FROM artists WHERE email = ?'
    ).bind(normalizedEmail).first();

    // Risposta identica sia che l'email esista o no (anti-enumeration)
    const genericResponse = new Response(JSON.stringify({
      success: true,
      message: 'Se l\'email è registrata, riceverai le istruzioni a breve.'
    }), { status: 200, headers });

    if (!artist) return genericResponse;

    // Genera token sicuro (32 byte hex = 64 caratteri)
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const token = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('');

    // Scadenza: 1 ora
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Invalida eventuali token precedenti e salva il nuovo
    await db.prepare(
      'DELETE FROM password_reset_tokens WHERE artist_id = ?'
    ).bind(artist.id).run();

    await db.prepare(
      'INSERT INTO password_reset_tokens (token, artist_id, expires_at) VALUES (?, ?, ?)'
    ).bind(token, artist.id, expiresAt).run();

    // URL di reset (usa il dominio base dal header Origin o dalla variabile env)
    const origin = request.headers.get('Origin') || env.APP_ORIGIN || 'https://app.operaviva.pages.dev';
    const resetUrl = `${origin}/reset-password?token=${token}`;

    // Invio email tramite MailChannels (integrato nativamente in Cloudflare Pages)
    try {
      const emailPayload = {
        personalizations: [
          {
            to: [{ email: normalizedEmail, name: artist.artist_name }]
          }
        ],
        from: {
          email: env.MAIL_FROM || 'noreply@operaviva.pages.dev',
          name: 'OperaViva WebApp'
        },
        subject: 'Ripristino Password — OperaViva',
        content: [
          {
            type: 'text/html',
            value: buildResetEmailHtml(artist.artist_name, resetUrl)
          },
          {
            type: 'text/plain',
            value: `Ciao ${artist.artist_name},\n\nHai richiesto il ripristino della password per il tuo account OperaViva.\n\nClicca su questo link per impostare una nuova password (valido 1 ora):\n${resetUrl}\n\nSe non hai fatto questa richiesta, ignora questa email.\n\n— OperaViva WebApp`
          }
        ]
      };

      await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      });
    } catch (_emailErr) {
      // Se l'email fallisce (dev locale), non blocchiamo la risposta
      console.error('Email send error:', _emailErr);
    }

    return genericResponse;
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Errore server' }), { status: 500, headers });
  }
}

function buildResetEmailHtml(artistName: string, resetUrl: string): string {
  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0c10;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0c10;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#12151e;border-radius:16px;border:1px solid rgba(212,175,55,0.25);overflow:hidden;max-width:560px;">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1a1e2e,#12151e);padding:32px;text-align:center;border-bottom:1px solid rgba(212,175,55,0.2);">
          <p style="margin:0 0 8px;font-size:13px;color:#d4af37;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;">⚜ OperaViva WebApp</p>
          <h1 style="margin:0;color:#f3f5f9;font-size:24px;font-weight:700;">Ripristino Password</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px;">
          <p style="color:#9ba4b8;font-size:15px;line-height:1.7;margin:0 0 16px;">Ciao <strong style="color:#f3f5f9;">${artistName}</strong>,</p>
          <p style="color:#9ba4b8;font-size:15px;line-height:1.7;margin:0 0 28px;">
            Abbiamo ricevuto una richiesta di ripristino della password per il tuo account OperaViva.<br>
            Clicca sul pulsante qui sotto per impostare una nuova password sicura.
          </p>
          <div style="text-align:center;margin:0 0 28px;">
            <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#dfba73,#c5a059);color:#0a0c10;font-weight:700;font-size:15px;padding:14px 36px;border-radius:10px;text-decoration:none;letter-spacing:0.02em;">
              Reimposta Password
            </a>
          </div>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px 20px;margin-bottom:24px;">
            <p style="color:#677189;font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.08em;">⏱ Link valido per</p>
            <p style="color:#f3f5f9;font-size:15px;font-weight:600;margin:0;">1 ora dalla ricezione di questa email</p>
          </div>
          <p style="color:#677189;font-size:13px;line-height:1.6;margin:0;">
            Se non hai richiesto il ripristino della password, ignora questa email. Il tuo account rimane al sicuro.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#0d0f18;padding:20px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
          <p style="color:#677189;font-size:12px;margin:0;">© 2026 OperaViva — Archivio Personale d'Arte &amp; Bottega Digitale</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
