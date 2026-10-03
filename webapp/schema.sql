-- ====================================================================
-- OperaViva WebApp — Schema Database SQLite per Cloudflare D1
-- Multi-Tenant con autenticazione 2FA Authenticator & Isolamento Artisti
-- ====================================================================

-- Tabella Artisti / Utenti registrati
CREATE TABLE IF NOT EXISTS artists (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    studio_name TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    phone TEXT,
    website TEXT,
    city TEXT,
    currency TEXT DEFAULT 'EUR',
    catalog_prefix TEXT DEFAULT 'ART-',
    totp_secret TEXT NOT NULL,
    totp_enabled INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_artists_email ON artists(email);

-- Tabella Opere d'Arte (Isolata rigorosamente per artist_id)
CREATE TABLE IF NOT EXISTS artworks (
    id TEXT PRIMARY KEY,
    artist_id TEXT NOT NULL,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    year INTEGER,
    technique TEXT,
    support TEXT,
    height REAL DEFAULT 0,
    width REAL DEFAULT 0,
    depth REAL DEFAULT 0,
    framed INTEGER DEFAULT 0,
    frame_details TEXT,
    price REAL DEFAULT 0,
    min_price REAL DEFAULT 0,
    currency TEXT DEFAULT 'EUR',
    status TEXT DEFAULT 'bottega', -- 'bottega', 'mostra', 'venduto', 'prestito', 'in_corso'
    location TEXT,
    location_notes TEXT,
    notes TEXT,
    certificate_number TEXT,
    buyer_name TEXT,
    buyer_contact TEXT,
    sold_date TEXT,
    images_json TEXT, -- JSON array di stringhe URL (R2 Cloudflare): ["/api/images/...", ...]
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_artworks_artist ON artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artworks_artist_status ON artworks(artist_id, status);
CREATE INDEX IF NOT EXISTS idx_artworks_artist_code ON artworks(artist_id, code);
CREATE INDEX IF NOT EXISTS idx_artworks_created ON artworks(artist_id, created_at DESC);

-- Tabella Token di Reset Password (monouso, scadenza 1 ora)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token TEXT PRIMARY KEY,
    artist_id TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reset_tokens_artist ON password_reset_tokens(artist_id);
