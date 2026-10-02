# 🏛️ OperaViva WebApp — Architettura Cloudflare 100% Gratuita

Versione Web Multi-Artista di **OperaViva**, progettata per funzionare interamente su **Cloudflare** sfruttando al 100% i piani gratuiti (*Free Tier*) senza mai sforare i costi.

---

## ⚡ Come Rispettiamo i Limiti Gratuiti di Cloudflare

| Servizio Cloudflare | Limite Piano Free | Come lo usiamo in OperaViva | Rischio Costi |
| :--- | :--- | :--- | :--- |
| **Cloudflare Pages** | **Banda Illimitata**, deploy illimitati | Hosting del frontend React compilato | **Zero** (100% gratis per sempre) |
| **Pages Functions** | **100.000 richieste al giorno** | API Serverless (Login, 2FA, CRUD Opere) | **Zero** (servono decine di migliaia di visualizzazioni al giorno per avvicinarsi) |
| **Cloudflare D1 (SQL)** | **5 GB di spazio**, 5 milioni di letture/giorno | Database relazionale SQLite per le schede d'opera | **Zero** (le schede d'opera sono solo testo, 5 GB bastano per oltre **1 milione di opere**) |
| **Cloudflare R2 (Storage)** | **10 GB di spazio/mese**, 0 costi di download | Immagini ad alta definizione delle opere | **Protetto da compressione WebP client-side** |

### 🛡️ La Strategia Chiave per lo Spazio Immagini (R2 Free Tier)
1. **Compressione WebP automatica nel browser**: quando un artista carica una foto da 10-15 MB scattata con smartphone o reflex, l'app nel browser la ridimensiona (max 2048px) e la comprime in formato WebP (~500 KB).
2. **Generazione automatica Miniature (Thumbnail)**: crea una versione a 400px (~30 KB) usata nella griglia catalogo, risparmiando banda e caricamenti.
3. **Risultato pratico**: con 10 GB gratuiti di Cloudflare R2, si possono ospitare tra le **15.000 e le 20.000 fotografie d'arte** a costo zero!
4. **Zero Egress Fee**: a differenza di Amazon S3 o Google Cloud che fanno pagare ogni Gigabyte scaricato dai visitatori, **Cloudflare R2 non fa pagare nulla per il traffico in uscita**.

---

## 🔐 Sicurezza Multi-Artista & Authenticator 2FA

- **Multi-Tenant (Più Artisti)**: ogni artista ha il suo account isolato. Tutte le query D1 verificano `WHERE artist_id = ?`. Nessun artista può visualizzare o modificare le opere, i clienti o le quotazioni riservate di altri.
- **Verifica con Authenticator (2FA / TOTP RFC 6238)**:
  - Compatibile con: **Google Authenticator**, **Microsoft Authenticator**, **Apple Passwords**, **1Password**, **Authy**.
  - In fase di registrazione viene mostrato il **codice QR** da scansionare con l'app del telefono.
  - Al login, dopo email e password viene richiesto il codice a 6 cifre temporaneo generato dall'Authenticator.
  - Crittografia nativa con **Web Crypto API** (PBKDF2 per password, HMAC-SHA1 per TOTP a livello di Edge Worker, zero dipendenze pesanti).

---

## 🚀 Istruzioni di Configurazione & Deploy su Cloudflare

### 1. Prerequisiti
Assicurati di avere un account Cloudflare gratuito attivo e la CLI Wrangler installata.

### 2. Creazione Database D1 su Cloudflare
Dalla cartella `webapp`:
```bash
# 1. Crea il database D1
npx wrangler d1 create operaviva-db
```
Il comando restituirà il `database_id` (es. `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).
Incollalo dentro `webapp/wrangler.jsonc` alla voce `database_id`.

```bash
# 2. Inizializza le tabelle del database su Cloudflare D1
npx wrangler d1 execute operaviva-db --remote --file=./schema.sql

# (Opzionale) Per testare in locale sul tuo PC:
npx wrangler d1 execute operaviva-db --local --file=./schema.sql
```

### 3. Creazione Bucket R2 per le Foto
```bash
# Crea il bucket per conservare le fotografie delle opere
npx wrangler r2 bucket create operaviva-images
```

### 4. Test in Locale
```bash
npm install
npm run dev
# Oppure per testare anche il backend serverless Functions + D1 in locale:
npm run pages:dev
```

### 5. Deploy Ufficiale su Cloudflare Pages
```bash
npm run build
npx wrangler pages deploy dist --project-name=operaviva-webapp
```
La tua webapp sarà online su un indirizzo come `operaviva-webapp.pages.dev` (o sul tuo dominio personalizzato con HTTPS gratis).
