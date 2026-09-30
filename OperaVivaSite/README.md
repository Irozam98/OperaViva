# OperaViva — Sito Vetrina per Cloudflare Pages
*Nota: Cloudflare è impiegato ESCLUSIVAMENTE per questo sito web di presentazione (`operaviva.pages.dev`). Non c'entra nulla con GitHub, con il codice dell'applicazione o con il programma desktop.*

Questa cartella contiene il sito statico completo e autonomo di presentazione di **OperaViva**.

## 🚀 Come pubblicarlo con Wrangler o Dashboard
Per pubblicare le modifiche su Cloudflare Pages tramite Wrangler, eseguire da questa cartella:
```bash
npx wrangler pages deploy .
```
Oppure tramite Direct Upload sulla dashboard:

1. Accedi alla dashboard di **[Cloudflare](https://dash.cloudflare.com/)**.
2. Vai nella sezione **Compute (Workers) > Workers & Pages** oppure **Pages**.
3. Clicca su **Create application** > scheda **Pages** > **Upload assets** (Direct Upload).
4. Assegna un nome al tuo progetto (es. `operaviva` o `operaviva-dev`).
5. Trascina l'intera cartella `sito` (o seleziona il suo contenuto: `index.html`, `style.css`, `script.js`).
6. Clicca su **Deploy site**.
7. In pochi secondi il sito sarà online con certificato SSL HTTPS gratuito e CDN ultraveloce a livello globale (es. `https://operaviva.pages.dev`).

## 📁 Contenuto della cartella
- `index.html`: Pagina di atterraggio principale con copywriting curatoriale, sezioni dettagliate di tutte le funzionalità, anteprima mockup dell'interfaccia, certificato di autenticità e FAQ.
- `style.css`: Design System Atelier d'Arte (Dark Slate & Golden Ochre) con tipografia Cinzel, vetromorfismo e layout 100% responsive.
- `script.js`: Accordion interattivo FAQ, menu mobile e animazioni di navigazione.
