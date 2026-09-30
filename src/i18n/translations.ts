// Dizionario completo di traduzione per OperaViva (Italiano & Inglese)
export type Language = 'it' | 'en';

export const translations = {
  it: {
    // Header & Atelier Brand
    brandTitle: 'OPERAVIVA',
    brandSubtitle: 'IL MIO ATELIER',
    defaultArchiveTitle: "ARCHIVIO PERSONALE D'ARTE",
    newArtwork: 'Nuova Opera',
    stats: 'Statistiche',
    backup: 'Archivio & Backup',
    catalog: 'Catalogo PDF',
    settings: 'Impostazioni',
    profileSettings: "Impostazioni Bottega & Artista",
    
    // Fascia Curatoriale
    archiveGeneral: 'Archivio',
    opereCount: 'opere',
    operaSingular: 'opera',
    inBottega: 'in bottega',
    inMostra: 'in mostra',
    inCollezioniPrivate: 'in private',
    valoreDisponibili: 'Valore disponibili:',

    // Toolbar & Filtri
    searchPlaceholder: 'Cerca opera, tecnica, codice...',
    allLocations: 'Collocazione',
    allTechniques: 'Tecniche',
    sortLatest: 'Recenti',
    sortOldest: 'Meno recenti',
    sortPriceDesc: 'Prezzo (max)',
    sortPriceAsc: 'Prezzo (min)',
    sortTitleAsc: 'Titolo (A - Z)',
    sortYearDesc: 'Anno (recente)',
    sortDimensionsDesc: 'Dimensioni (max)',

    // Schede di Stato
    tabAll: 'Tutte le Opere',
    tabBottega: 'In Bottega',
    tabMostra: 'In Mostra',
    tabVenduto: 'Vendute / Private',
    tabPrestito: 'In Prestito',
    tabInCorso: 'In Corso d\'Opera',

    // Barra Selezione Multipla
    catalogCount: 'Opere nel catalogo:',
    multiSelectBtn: 'Selezione Multipla',
    exitMultiSelect: 'Esci da Selezione',
    selectedArtworks: 'Opere Selezionate',
    selectAllVisible: 'Seleziona Tutte ({count})',
    deselectAll: 'Deseleziona',
    bulkDeleteBtn: 'Elimina Selezionate',
    confirmBulkDeleteSingle: "Sei sicuro di voler eliminare definitivamente l'opera selezionata?\n\nQuesta azione non può essere annullata.",
    confirmBulkDeleteMulti: "ATTENZIONE: Sei sicuro di voler eliminare definitivamente le {count} opere selezionate?\n\nQuesta azione non può essere annullata.",

    // Card Opera
    code: 'Cod.',
    framed: 'Con cornice',
    unframed: 'Senza cornice',
    clickToManage: 'Clicca per dettagli e certificato',
    statusBottega: 'In Bottega',
    statusMostra: 'In Mostra',
    statusVenduto: 'Venduto',
    statusPrestito: 'In Prestito',
    statusInCorso: 'In Corso',

    // Dettaglio Opera & Modali
    close: 'Chiudi',
    edit: 'Modifica Opera',
    delete: 'Elimina Opera',
    certificateOfAuth: 'Certificato di Autenticità',
    print: 'Stampa Certificato',
    quickStatusChange: 'Cambia Stato Rapido',
    quickLocationChange: 'Collocazione Attuale',
    artworkDetails: 'Scheda Tecnica dell\'Opera',
    technique: 'Tecnica',
    support: 'Supporto',
    dimensions: 'Dimensioni',
    year: 'Anno',
    declaredPrice: 'Prezzo / Valore Dichiarato',
    location: 'Collocazione',
    notes: 'Note dell\'Opera & Critica',
    buyer: 'Acquirente / Collezione',
    soldDate: 'Data di Vendita',
    createdDate: 'Data Inserimento',
    noNotes: 'Nessuna nota critica presente.',
    noBuyer: 'Nessun acquirente registrato.',
    editImage: 'Modifica Foto (Editor)',
    addImage: 'Aggiungi Foto',

    // Form Nuova / Modifica Opera
    modalNewTitle: 'Nuova Opera nel Catalogo',
    modalEditTitle: 'Modifica Scheda Opera',
    fieldTitle: 'Titolo dell\'Opera *',
    fieldArtist: 'Artista / Autore',
    fieldYear: 'Anno di Realizzazione *',
    fieldTechnique: 'Tecnica Pittorica / Artistica *',
    fieldSupport: 'Supporto (es. Telaio in lino, Tavola, Carta...)',
    fieldDimensions: 'Dimensioni (cm) *',
    fieldHeight: 'Altezza (cm)',
    fieldWidth: 'Larghezza (cm)',
    fieldDepth: 'Profondità (cm opzionale)',
    fieldFramed: 'Opera incorniciata',
    fieldFrameDetails: 'Dettagli cornice (es. Legno dorato, Bianca a cassetta)',
    fieldPrice: 'Prezzo di Vendita',
    fieldMinPrice: 'Prezzo Minimo Trattabile',
    fieldStatus: 'Stato Attuale *',
    fieldLocation: 'Collocazione Fisica Specifica *',
    fieldNotes: 'Note Critiche, Mostre o Ispirazione',
    fieldImages: 'Fotografie dell\'Opera',
    saveArtwork: 'Salva nel Catalogo',
    cancel: 'Annulla',
    requiredFieldsWarning: 'Compila tutti i campi obbligatori contrassegnati con *',

    // Modale Importatore Cartella Locale
    importerTitle: 'Importa da Cartella Locale',
    importerDropTitle: 'Trascina le foto dell\'Atelier qui',
    importerDropSubtitle: 'oppure clicca per scegliere i file dal tuo computer',
    importerChooseSingleOrMulti: 'Scegli Foto (Singola o Multiple)',
    importerBrowseFolder: 'Sfoglia Intera Cartella',
    importerNamingCardTitle: 'Convenzione Nome File per compilazione automatica:',
    importerNamingCardExample: 'Es: "Tramonto a Venezia - Olio su tela - 80x60.jpg"',
    importerNamingCardNote: 'I campi titolo, tecnica e dimensioni verranno estratti automaticamente!',
    importerFoundFiles: 'File immagine pronti per l\'importazione:',
    importerImportBtn: 'Importa {count} Opere nell\'Inventario',
    importerProcessing: 'Elaborazione e ottimizzazione immagini in corso...',
    importerSuccess: 'Importazione completata con successo!',
    importerDuplicateSkipped: 'opere importate, duplicati saltati.',

    // Modale Backup & Archivio
    backupModalTitle: 'Archivio & Sicurezza Dati',
    backupSubtitle: 'Custodia locale, backup e ripristino del patrimonio artistico',
    backupExportVault: 'Esporta Archivio Completo (.artvault)',
    backupExportVaultDesc: 'Salva l\'intero inventario comprese tutte le fotografie ad alta definizione in un singolo file protetto.',
    backupImportVault: 'Ripristina da Archivio (.artvault)',
    backupImportVaultDesc: 'Ripristina o unisci un archivio precedentemente salvato.',
    backupExportCsv: 'Esporta Catalogo Excel/CSV (.csv)',
    backupExportCsvDesc: 'Esporta le schede tecniche in formato tabellare per consultazione su Excel o Google Fogli.',
    backupLocalImportTitle: 'Importatore da Cartella Locale',
    backupLocalImportDesc: 'Importa massivamente fotografie di quadri e sculture già presenti sul tuo computer.',
    backupOpenLocalImporter: 'Apri Importatore Locale',

    // Modale Statistiche
    statsModalTitle: 'Statistiche & Patrimonio dell\'Atelier',
    statsTotalArtworks: 'Totale Opere Registrate',
    statsAvailableValue: 'Valore Opere in Bottega / Mostra',
    statsSoldValue: 'Totale Opere Vendute',
    statsAveragePrice: 'Valore Medio per Opera',
    statsTechniquesChart: 'Distribuzione per Tecnica',
    statsStatusChart: 'Distribuzione per Stato',

    // Modale Profilo Studio
    profileModalTitle: 'Profilo Atelier & Artista',
    profileStudioName: 'Nome Studio / Atelier',
    profileArtistName: 'Nome Artista Principale',
    profileEmail: 'Email di Contatto',
    profilePhone: 'Telefono',
    profileWebsite: 'Sito Web o Profilo Social',
    profileCity: 'Città / Sede Bottega',
    profileAddress: 'Indirizzo Studio',
    profileCurrency: 'Valuta Predefinita',
    profilePrefix: 'Prefisso Codice Catalogo (es. OPV-)',
    profileLanguage: 'Lingua Applicazione',
    profileSaveBtn: 'Salva Profilo Bottega',

    // Certificato di Autenticità (Bilingue Ufficiale)
    certDocTitle: 'CERTIFICATO DI AUTENTICITÀ',
    certDocSubtitle: 'CERTIFICATE OF AUTHENTICITY',
    certDeclaredPrice: 'Valore Dichiarato / Prezzo:',
    certFrame: 'Incorniciatura:',
    certDeclarationText: "Si certifica con il presente documento che l'opera sopra descritta e riprodotta è un originale autentico, eseguito a mano dall'artista e registrato presso l'archivio ufficiale di bottega.",
    certArtistSignature: "Firma dell'Autore / Artist Signature",
    certStamp: 'Timbro Bottega',
    certArchiveCode: 'Codice di Registrazione Archivio:'
  },

  en: {
    // Header & Atelier Brand
    brandTitle: 'OPERAVIVA',
    brandSubtitle: 'MY STUDIO & ATELIER',
    defaultArchiveTitle: "PERSONAL FINE ART ARCHIVE",
    newArtwork: 'New Artwork',
    stats: 'Analytics',
    backup: 'Archive & Backup',
    catalog: 'PDF Catalog',
    settings: 'Settings',
    profileSettings: "Studio & Artist Settings",

    // Curator Bar
    archiveGeneral: 'Archive',
    opereCount: 'artworks',
    operaSingular: 'artwork',
    inBottega: 'in studio',
    inMostra: 'in exhibition',
    inCollezioniPrivate: 'in private',
    valoreDisponibili: 'Available value:',

    // Toolbar & Filters
    searchPlaceholder: 'Search artwork, technique, code...',
    allLocations: 'Location',
    allTechniques: 'Techniques',
    sortLatest: 'Recent',
    sortOldest: 'Oldest',
    sortPriceDesc: 'Price (high)',
    sortPriceAsc: 'Price (low)',
    sortTitleAsc: 'Title (A - Z)',
    sortYearDesc: 'Year (newest)',
    sortDimensionsDesc: 'Dimensions (max)',

    // Status Tabs
    tabAll: 'All Artworks',
    tabBottega: 'In Studio',
    tabMostra: 'In Exhibition',
    tabVenduto: 'Sold / Private',
    tabPrestito: 'On Loan',
    tabInCorso: 'Work in Progress',

    // Multi-Selection Bar
    catalogCount: 'Artworks in catalog:',
    multiSelectBtn: 'Select Multiple',
    exitMultiSelect: 'Exit Selection',
    selectedArtworks: 'Selected Artworks',
    selectAllVisible: 'Select All Visible ({count})',
    deselectAll: 'Deselect',
    bulkDeleteBtn: 'Delete Selected',
    confirmBulkDeleteSingle: "Are you sure you want to permanently delete the selected artwork?\n\nThis action cannot be undone.",
    confirmBulkDeleteMulti: "WARNING: Are you sure you want to permanently delete the {count} selected artworks?\n\nThis action cannot be undone.",

    // Artwork Card
    code: 'Code',
    framed: 'Framed',
    unframed: 'Unframed',
    clickToManage: 'Click for details & certificate',
    statusBottega: 'In Studio',
    statusMostra: 'In Exhibition',
    statusVenduto: 'Sold',
    statusPrestito: 'On Loan',
    statusInCorso: 'In Progress',

    // Artwork Detail & Modals
    close: 'Close',
    edit: 'Edit Artwork',
    delete: 'Delete Artwork',
    certificateOfAuth: 'Certificate of Authenticity',
    print: 'Print Certificate',
    quickStatusChange: 'Quick Status Change',
    quickLocationChange: 'Current Location',
    artworkDetails: 'Artwork Technical Sheet',
    technique: 'Technique',
    support: 'Support / Medium',
    dimensions: 'Dimensions',
    year: 'Year',
    declaredPrice: 'Declared Value / Price',
    location: 'Location',
    notes: 'Artwork Notes & Critique',
    buyer: 'Buyer / Private Collection',
    soldDate: 'Sale Date',
    createdDate: 'Registration Date',
    noNotes: 'No critical notes added.',
    noBuyer: 'No buyer recorded.',
    editImage: 'Edit Photo',
    addImage: 'Add Photo',

    // New / Edit Artwork Modal
    modalNewTitle: 'Add New Artwork to Catalog',
    modalEditTitle: 'Edit Artwork Record',
    fieldTitle: 'Artwork Title *',
    fieldArtist: 'Artist / Author',
    fieldYear: 'Year of Creation *',
    fieldTechnique: 'Medium / Artistic Technique *',
    fieldSupport: 'Support (e.g. Linen Canvas, Wood Panel, Cotton Paper...)',
    fieldDimensions: 'Dimensions (cm) *',
    fieldHeight: 'Height (cm)',
    fieldWidth: 'Width (cm)',
    fieldDepth: 'Depth (cm optional)',
    fieldFramed: 'Framed artwork',
    fieldFrameDetails: 'Frame details (e.g. Gilded wood, Floating white box)',
    fieldPrice: 'Selling Price',
    fieldMinPrice: 'Minimum Reserve Price',
    fieldStatus: 'Current Status *',
    fieldLocation: 'Specific Physical Location *',
    fieldNotes: 'Critical Notes, Exhibitions or Inspiration',
    fieldImages: 'Artwork Photographs',
    saveArtwork: 'Save to Catalog',
    cancel: 'Cancel',
    requiredFieldsWarning: 'Please fill in all required fields marked with *',

    // Local Folder Importer Modal
    importerTitle: 'Import from Local Folder',
    importerDropTitle: 'Drop Studio Photos Here',
    importerDropSubtitle: 'or click to browse image files from your computer',
    importerChooseSingleOrMulti: 'Choose Photos (Single or Multiple)',
    importerBrowseFolder: 'Browse Entire Folder',
    importerNamingCardTitle: 'Smart File Naming Convention for auto-fill:',
    importerNamingCardExample: 'E.g.: "Sunset in Venice - Oil on canvas - 80x60.jpg"',
    importerNamingCardNote: 'Title, technique and dimensions will be extracted automatically!',
    importerFoundFiles: 'Image files ready for import:',
    importerImportBtn: 'Import {count} Artworks to Inventory',
    importerProcessing: 'Processing and optimizing image files...',
    importerSuccess: 'Import completed successfully!',
    importerDuplicateSkipped: 'artworks imported, duplicates skipped.',

    // Backup & Archive Modal
    backupModalTitle: 'Data Vault & Archive Safety',
    backupSubtitle: 'Local custody, backup and restoration of your artistic heritage',
    backupExportVault: 'Export Full Archive (.artvault)',
    backupExportVaultDesc: 'Save your entire inventory including high-definition photographs in a single protected archive.',
    backupImportVault: 'Restore from Archive (.artvault)',
    backupImportVaultDesc: 'Restore or merge a previously saved archive file.',
    backupExportCsv: 'Export Excel/CSV Catalog (.csv)',
    backupExportCsvDesc: 'Export technical records in tabular format for spreadsheet applications.',
    backupLocalImportTitle: 'Local Folder Importer',
    backupLocalImportDesc: 'Bulk import paintings and sculpture photographs already stored on your computer.',
    backupOpenLocalImporter: 'Open Local Importer',

    // Analytics Modal
    statsModalTitle: 'Studio Analytics & Heritage Value',
    statsTotalArtworks: 'Total Artworks Cataloged',
    statsAvailableValue: 'Value of Artworks in Studio / Exhibition',
    statsSoldValue: 'Total Sold Artworks Value',
    statsAveragePrice: 'Average Value per Artwork',
    statsTechniquesChart: 'Distribution by Technique',
    statsStatusChart: 'Distribution by Status',

    // Studio Profile Modal
    profileModalTitle: 'Studio & Artist Profile',
    profileStudioName: 'Studio / Atelier Name',
    profileArtistName: 'Primary Artist Name',
    profileEmail: 'Contact Email',
    profilePhone: 'Phone Number',
    profileWebsite: 'Website or Social Profile',
    profileCity: 'City / Studio Location',
    profileAddress: 'Studio Address',
    profileCurrency: 'Default Currency',
    profilePrefix: 'Catalog Code Prefix (e.g. OPV-)',
    profileLanguage: 'Application Language',
    profileSaveBtn: 'Save Studio Profile',

    // Certificate of Authenticity (Official International Format)
    certDocTitle: 'CERTIFICATE OF AUTHENTICITY',
    certDocSubtitle: 'CERTIFICATO DI AUTENTICITÀ',
    certDeclaredPrice: 'Declared Value / Price:',
    certFrame: 'Framing:',
    certDeclarationText: 'This document certifies that the artwork described and reproduced above is an authentic, original handmade work executed by the artist and registered in the official studio archive.',
    certArtistSignature: "Author's Signature / Artist Signature",
    certStamp: 'Studio Seal',
    certArchiveCode: 'Archive Registration Code:'
  }
};

export type TranslationKey = keyof typeof translations.it;

// Funzione helper per ottenere la traduzione con interpolazione di parametri {count}
export function getTranslation(lang: Language, key: TranslationKey, params?: Record<string, string | number>): string {
  const dict = translations[lang] || translations.it;
  let text = dict[key] || translations.it[key] || (key as string);
  
  if (params) {
    Object.entries(params).forEach(([paramKey, val]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
    });
  }
  
  return text;
}
