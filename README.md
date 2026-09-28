# OperaViva — Archivio Personale d'Arte & Bottega
*Created by Marzio Sparla*

[![Version](https://img.shields.io/badge/Versione-1.0.0-c5a059.svg)](https://github.com/)
[![Author](https://img.shields.io/badge/Author-Marzio%20Sparla-c5a059.svg)](https://github.com/)
[![Piattaforme](https://img.shields.io/badge/Piattaforme-Windows%20Portable%20%7C%20Setup%20%7C%20Android%20APK-17181c.svg)](https://github.com/)
[![Offline](https://img.shields.io/badge/Database-100%25%20Offline%20Locale-4ade80.svg)](https://github.com/)

**OperaViva** è un sistema di catalogazione e inventario d'archivio d'autore progettato e ideato da **Marzio Sparla** specificamente per artisti, pittori, scultori, botteghe d'arte e restauratori. Permette di gestire il patrimonio artistico con foto ad alta risoluzione, schede tecniche museali, quotazioni economiche, ubicazione fisica (*"dov'è presente l'opera"*), editor fotografico integrato e stampa istantanea dei Certificati di Autenticità.

---

## 📥 Download Rapido

| Versione | Descrizione | Come usarla |
| :--- | :--- | :--- |
| **💼 Windows Portable (.exe)** | **Versione consigliata.** Nessuna installazione richiesta, pronta per chiavetta USB. Salva tutti i dati nella cartella locale `OperaViva_Dati`. | Scarica `OperaViva_Portable.exe` dalla cartella [portable/](portable/) o dalle **Releases di GitHub** e fai doppio clic per avviare! |
| **🖥️ Windows Installer (.exe)** | Installatore completo con creazione icona sul desktop e menu Start. | Esegui `OperaViva_Setup.exe` nella cartella [exe/](exe/). |
| **📱 Android App (.apk)** | Pacchetto nativo per smartphone e tablet Android con accesso fotocamera da bottega ed editor touch. | Installa `OperaViva.apk` dalla cartella [apk/](apk/). |

> [!TIP]
> **Consiglio per la pubblicazione su GitHub:**  
> Poiché i file binari compilati (`.exe` ~104MB) superano il limite standard di 100MB per singolo commit Git, il file `.gitignore` del progetto è già configurato per escluderli dal codice sorgente. È consigliato caricare il codice sorgente nel repository Git e pubblicare `OperaViva_Portable.exe` come file allegato nella sezione **Releases** di GitHub (dove sono supportati file fino a 2GB).

---

## 🏛️ Caratteristiche & Funzionalità

### 1. Catalogazione Museale delle Opere
- **Schede tecniche d'autore**: Titolo in corsivo editoriale, autore, anno, codice progressivo catalogo, tecnica, supporto, dimensioni tridimensionali (A × L × P cm) e stato cornice.
- **Tracciamento Collocazione Fisica (*"Dov'è presente"*)**: Monitoraggio della posizione in bottega (*Cavalletto centrale, Parete d'onore, Reparto restauri*), in mostre/gallerie esterne o presso collezionisti privati.
- **Gestione Quotazioni e Trattative**: Prezzo di listino ufficiale e prezzo minimo riservato trattabile per acquirenti.
- **Stati dell'Opera**: *In Bottega*, *In Esposizione*, *In Prestito*, *Venduto*, *In Lavorazione*.

### 2. Editor Fotografico Integrato da Atelier
- **Livella angolare fine**: Rotazione calibrata da -10° a +10° per correggere quadri fotografati leggermente storti.
- **Ritaglio con proporzioni d'arte**: Preset 1:1 quadrato, 4:3 classico, 3:2 fotografico, 16:9 panoramico e ritaglio libero, con griglia a terzi.
- **Correzione Luce & Colore**: Luminosità, contrasto, saturazione e calore cromatico (warmth).
- **Cornici Virtuali da Galleria**: Anteprima istantanea con cornice barocca dorata, legno noce naturale, nero contemporaneo o passe-partout avorio.
- **Firma & Timbro d'Autore**: Watermark digitale per proteggere le immagini prima dell'invio a galleristi o social.

### 3. Certificato di Autenticità (PDF / Stampa)
- Generazione con un clic del **Certificato di Autenticità ufficiale numerato**.
- Completo di riproduzione fotografica, dichiarazione d'autenticità conforme alla legge sull'arte, stima economica, dati del collezionista e spazio per la firma originale dell'artista.

### 4. Privacy e Funzionamento 100% Offline
- Tutti i dati risiedono in locale (IndexedDB / Dexie locale).
- Nessun abbonamento, nessun dato inviato a server cloud terzi.
- Funzione di **Backup & Esporta Archivio ZIP** per trasferire l'intero catalogo (dati + foto originali) tra PC e smartphone.

---

## 🛠️ Architettura Tecnica

- **Frontend**: React 19, TypeScript, Vite.
- **Stile**: CSS puro (Atelier Design System, estetica calda da pinacoteca con tipografia *Playfair Display* e *Plus Jakarta Sans*).
- **Database Locale**: Dexie.js (IndexedDB ad alte prestazioni offline).
- **Desktop Windows**: Electron con target NSIS (installer) e Portable a dati residenti (`PORTABLE_EXECUTABLE_DIR`).
- **Mobile Android**: Capacitor Android nativo.

---

## 💻 Comandi di Sviluppo

```bash
# Installa le dipendenze
npm install

# Avvia l'ambiente di sviluppo web
npm run dev

# Compila il bundle di produzione
npm run build

# Compila i pacchetti Windows (.exe installer e portable)
npm run electron:build

# Sincronizza e compila l'applicazione Android (.apk)
npm run android:build
```

## 📄 Licenza & Accesso
**100% Gratuito & Senza Limiti**:
- **Nessuna versione di prova o demo**: tutte le funzionalità sono complete e sbloccate per sempre.
- **Nessun limite al numero di opere**: puoi catalogare decine, centinaia o migliaia di quadri e sculture.
- **Nessuna scadenza o abbonamento**: l'archivio funziona interamente offline in locale sui tuoi dispositivi.
- Utilizzabile liberamente per uso personale, bottega d'arte e attività artistico-commerciale.

