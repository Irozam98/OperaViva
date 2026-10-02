import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Navbar } from './components/Navbar';
import { ArtworkList } from './components/ArtworkList';
import { ArtworkFormModal } from './components/ArtworkFormModal';
import { ArtworkDetailModal } from './components/ArtworkDetailModal';
import { CertificateModal } from './components/CertificateModal';
import { StatsModal } from './components/StatsModal';
import { ProfileModal } from './components/ProfileModal';
import { Artwork } from './types';
import { api } from './services/api';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loadingArtworks, setLoadingArtworks] = useState(false);

  // Modali
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [certArtwork, setCertArtwork] = useState<Artwork | null>(null);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const fetchArtworks = async () => {
    if (!isAuthenticated) return;
    setLoadingArtworks(true);
    try {
      const res = await api.getArtworks();
      setArtworks(res.artworks || []);
    } catch (err) {
      console.error('Errore caricamento opere:', err);
    } finally {
      setLoadingArtworks(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchArtworks();
    }
  }, [isAuthenticated]);

  const handleOpenDetail = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setIsDetailOpen(true);
  };

  const handleNewArtwork = () => {
    setEditingArtwork(null);
    setIsFormOpen(true);
  };

  const handleEditArtwork = (artwork: Artwork) => {
    setIsDetailOpen(false);
    setEditingArtwork(artwork);
    setIsFormOpen(true);
  };

  const handleDeleteArtwork = async (id: string) => {
    try {
      await api.deleteArtwork(id);
      setIsDetailOpen(false);
      setSelectedArtwork(null);
      fetchArtworks();
    } catch (err: any) {
      alert('Errore eliminazione opera: ' + err.message);
    }
  };

  const handleOpenCertificate = (artwork: Artwork) => {
    setCertArtwork(artwork);
    setIsCertOpen(true);
  };

  if (isAuthLoading) {
    return (
      <div className="app-splash-screen">
        <div className="spinner"></div>
        <p>Inizializzazione OperaViva Cloud...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModal isOpen={true} />;
  }

  return (
    <div className="app-shell">
      <Navbar
        onNewArtwork={handleNewArtwork}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <main className="main-content">
        <ArtworkList
          artworks={artworks}
          onSelectArtwork={handleOpenDetail}
          onNewArtwork={handleNewArtwork}
          isLoading={loadingArtworks}
        />
      </main>

      {/* Modali */}
      <ArtworkDetailModal
        artwork={selectedArtwork}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={handleEditArtwork}
        onDelete={handleDeleteArtwork}
        onOpenCertificate={handleOpenCertificate}
      />

      <ArtworkFormModal
        artwork={editingArtwork}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingArtwork(null);
        }}
        onSaved={fetchArtworks}
      />

      <CertificateModal
        artwork={certArtwork}
        isOpen={isCertOpen}
        onClose={() => {
          setIsCertOpen(false);
          setCertArtwork(null);
        }}
      />

      <StatsModal
        artworks={artworks}
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
