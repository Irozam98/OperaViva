# 📌 NOTA: Ruolo di Cloudflare, GitHub e l'Applicazione

Questa nota definisce in modo inequivocabile i ruoli dei servizi utilizzati in questo progetto:

---

### 🌐 1. Cloudflare (Cloudflare Pages)
- **Scopo:** Serve **SOLO ed ESCLUSIVAMENTE per ospitare il sito web vetrina** di presentazione dell'applicazione (`OperaVivaSite/`, visibile online su `operaviva.pages.dev`).
- **Deploy:** Viene sincronizzato separatamente tramite comando Wrangler (`npx wrangler pages deploy .`) eseguito dentro la cartella `OperaVivaSite/`.
- **Indipendenza:** **NON c'entra assolutamente nulla con GitHub, NON c'entra con il codice sorgente dell'app e NON c'entra con il programma o i dati.**

---

### 🐙 2. GitHub
- **Scopo:** È la piattaforma per il tracciamento del codice sorgente di sviluppo.
- Permette di sincronizzare lo sviluppo tra più PC senza conflitti.
- Gestisce la distribuzione pubblica dei file di installazione tramite le **GitHub Releases** (`OperaViva_Setup.exe`, `OperaViva_Portable.exe`, `OperaViva.apk`).

---

### 💻 3. L'Applicazione OperaViva (Desktop & Mobile)
- **Desktop (Windows):** Eseguibili `.exe` (Installer e Portable).
- **Mobile (Android):** Pacchetto `.apk` per smartphone e tablet.
- **Dati & Database:** **100% Locale e Offline** su IndexedDB / cartella locale `OperaViva_Dati`. L'app non invia né riceve alcun dato da Cloudflare o server remoti.
