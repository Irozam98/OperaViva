# OperaViva — Archivio Personale d'Arte & Bottega
*Ideato e sviluppato da **Marzio Sparla***

[![Versione](https://img.shields.io/badge/Versione-1.0.0-c5a059.svg?style=for-the-badge)](https://github.com/)
[![Piattaforme](https://img.shields.io/badge/Piattaforme-Windows%20%7C%20Android-1e2330.svg?style=for-the-badge)](https://github.com/)
[![Database](https://img.shields.io/badge/Database-100%25%20Offline%20Locale-22c55e.svg?style=for-the-badge)](https://github.com/)
[![Licenza](https://img.shields.io/badge/Licenza-Gratuito%20%26%20Illimitato-eab308.svg?style=for-the-badge)](https://github.com/)

---

**OperaViva** è una suite completa per la **catalogazione, gestione dell'archivio d'autore e inventario museale** concepita specificamente per **pittori, scultori, botteghe d'arte, gallerie e restauratori**. 

Progettato con una filosofia **100% Locale e Offline**, OperaViva garantisce che nessuna informazione (immagini originali, quotazioni riservate, ubicazioni delle opere o dati dei collezionisti) venga mai trasmessa a server esterni o cloud terzi.

---

## 📥 Versioni & Download

| Formato | Descrizione | Come si usa |
| :--- | :--- | :--- |
| **💼 Windows Portable (.exe)** | **Versione consigliata.** Non richiede installazione, perfetta per chiavette USB o dischi esterni. | Scarica `OperaViva_Portable.exe` ed eseguilo direttamente con un doppio clic. Tutti i dati e le foto rimangono nella cartella `OperaViva_Dati` accanto all'eseguibile. |
| **🖥️ Windows Installer (.exe)** | Programma di installazione classico con icona sul Desktop e integrazione nel menu Start di Windows. | Esegui `OperaViva_Setup.exe` e segui la procedura guidata a schermo. |
| **📱 Android App (.apk)** | Pacchetto per smartphone e tablet Android con accesso rapido alla fotocamera da atelier ed editor touch. | Installa `OperaViva.apk` sul tuo dispositivo abilitando l'installazione da origini note. |

> [!TIP]
> **Gestione dei file binari su GitHub:**  
> Gli eseguibili compilati per Windows (~105MB) superano la soglia standard consigliata di 100MB per singolo commit Git. Il file `.gitignore` del repository è già configurato per escluderli dal tracciamento git. Per distribuirli al pubblico, caricali come allegati nella sezione **Releases** del repository GitHub.

---

## 🌟 Funzionalità Principali

### 🏛️ 1. Catalogazione Museale Completa
- **Schede tecniche d'opera:** Codice catalogo progressivo personalizzabile (es. `OPV-001`), titolo, anno di creazione, tecnica pittorica/scultorea, supporto (es. *telaio in lino maestoso*), dimensioni tridimensionali ($A \times L \times P$ in cm) e specifiche della cornice.
- **Tracciamento Collocazione Fisica (*"Dov'è presente"*)**: Monitora in ogni momento se un'opera si trova sul cavalletto centrale, sulla parete d'onore, in deposito, prestata per una mostra temporanea o conservata in collezione privata.
- **Gestione Quotazioni e Trattative**: Prezzo di listino ufficiale al pubblico e soglia minima di riserva per trattative riservate.
- **Stati Opera Dinamici**: *In Bottega*, *In Esposizione*, *In Prestito*, *Venduto*, *In Lavorazione*.

### 🎨 2. Camera Oscura & Editor Fotografico Integrato
- **Livella angolare fine**: Rotazione calibrata da -10° a +10° per raddrizzare all'istante quadri e dipinti fotografati con prospettiva imperfetta.
- **Ritaglio con proporzioni d'arte**: Preset standardizzati (*1:1 quadrato, 4:3 classico, 3:2 fotografico, 16:9 panoramico*) e ritaglio libero guidato da griglia a terzi.
- **Ottimizzazione Luce & Colore**: Regolazione istantanea di luminosità, contrasto, saturazione e calore cromatico (warmth).
- **Cornici Virtuali d'Atelier**: Anteprima istantanea dell'opera incorniciata in *Oro Barocco da Galleria*, *Noce Scuro*, *Nero Moderno da Pinacoteca* o *Passe-partout Avorio*.
- **Filigrana & Firma Digitale**: Applicazione di watermark con trasparenza regolabile per proteggere le fotografie prima della pubblicazione sui social o dell'invio a galleristi.

### 📜 3. Certificato di Autenticità Stampabile (A4 / PDF)
- Generazione istantanea con un clic del **Certificato di Autenticità ufficiale numerato**.
- Impaginato in tipografia museale d'alta gamma (*Playfair Display* e *Plus Jakarta Sans*), include riproduzione fotografica ad alta definizione, scheda descrittiva, dichiarazione d'autenticità a norma di legge, numero progressivo e spazio per la firma autografa dell'artista.

### 📊 4. Statistiche & Valorizzazione Economica
- Dashboard finanziaria con stima in tempo reale del valore complessivo dell'archivio.
- Ripartizione del capitale artistico disponibile in bottega vs opere già vendute o locate in mostra.
- Statistiche analitiche per tecnica, anno di produzione e stato conservativo.

### 💾 5. Salvataggio, Backup ZIP & Portabilità Assoluta
- **Zero Cloud, Zero Abbonamenti**: I dati risiedono esclusivamente sul dispositivo dell'utente.
- **Backup Unificato (.zip)**: Esporta con un clic l'intero archivio (database, storico e fotografie originali ad alta risoluzione compresse) in un singolo archivio ZIP.
- **Ripristino & Unione**: Importa il backup su qualsiasi altro computer scegliendo tra sostituzione completa o fusione delle collezioni.
- **Esportazione Fogli di Calcolo (.csv)**: Genera tabelle complete per commercialisti, assicuratori o elenchi mostre.
- **Importatore da Portfolio Web / Cartella**: Estrae automaticamente titoli e fotografie da cartelle del computer o dal proprio sito web personale.

---

## 📁 Gestione dei Dati (Versione Portable)

Quando utilizzi `OperaViva_Portable.exe`:
1. Al primo avvio, l'applicazione crea automaticamente una cartella denominata **`OperaViva_Dati`** nella stessa cartella dell'eseguibile.
2. In questa cartella vengono memorizzati in sicurezza il database locale Dexie, le impostazioni della bottega e le miniature fotografiche.
3. **Per spostare l'archivio da un computer all'altro:**
   - **Metodo A (Chiavetta USB):** Copia l'intera cartella contenente sia `OperaViva_Portable.exe` che `OperaViva_Dati`. L'archivio funzionerà su qualsiasi PC Windows senza dover riconfigurare nulla.
   - **Metodo B (Backup ZIP):** All'interno dell'applicazione clicca su **Archivio & Backup** $\rightarrow$ **Scarica Backup (.zip)** e ripristinalo sul nuovo computer.

---

## 🛠️ Stack Tecnologico

- **Interfaccia Utente**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Iconografia**: [Lucide React](https://lucide.dev/)
- **Stile Visivo**: Vanilla CSS con Atelier Design System (palette dorata su fondo ardesia profondo, contrasti calibrati per non affaticare la vista)
- **Motore Dati Locale**: [Dexie.js](https://dexie.org/) su API W3C IndexedDB
- **Ambiente Desktop**: [Electron](https://www.electronjs.org/) con impacchettamento [electron-builder](https://www.electron.build/) (NSIS + Portable)
- **Ambiente Mobile**: [Capacitor](https://capacitorjs.com/) per compilazione nativa Android

---

## 🚀 Istruzioni per lo Sviluppo

### Prerequisiti
- [Node.js](https://nodejs.org/) v20 o superiore
- npm v10 o superiore

### Installazione ed Esecuzione Locale
```bash
# 1. Clona il repository
git clone https://github.com/tuo-account/OperaViva.git
cd OperaViva

# 2. Installa le dipendenze
npm install

# 3. Avvia il server di sviluppo web
npm run dev
```

### Compilazione Pacchetti Desktop (Windows)
```bash
# Compila l'interfaccia e genera sia l'installer NSIS che l'eseguibile Portable
npm run electron:build
```
I file compilati vengono salvati in `release/`, pronti per essere distribuiti tramite gli script batch dedicati:
- `scripts/Compila_Nuovo_Portable.bat`
- `scripts/Compila_Nuovo_Exe.bat`

### Compilazione Pacchetto Android (.apk)
```bash
# Sincronizza i file web con il progetto Android e compila l'APK di debug
npm run android:build
```

---

## 📄 Licenza d'Uso & Filosofia

**100% Gratuito, Autonomo e Privo di Vincoli**:
- **Nessuna versione demo o a pagamento**: tutte le funzionalità sono completamente aperte e utilizzabili senza limitazioni.
- **Nessun tetto al numero di opere**: puoi inserire da poche unità a decine di migliaia di pezzi d'arte.
- **Nessuna scadenza**: il software non dipende da server centralizzati e continuerà a funzionare per sempre sul tuo hardware.

---

*Progetto ideato e sviluppato con passione da **Marzio Sparla**.*
