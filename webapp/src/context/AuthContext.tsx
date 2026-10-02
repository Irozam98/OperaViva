import React, { createContext, useContext, useState, useEffect } from 'react';
import { ArtistProfile } from '../types';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '../services/api';

interface AuthContextType {
  artist: ArtistProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginSuccess: (token: string, artist: ArtistProfile) => void;
  updateArtistProfile: (profile: Partial<ArtistProfile>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    api.getMe()
      .then((res) => {
        setArtist(res.artist);
      })
      .catch((err) => {
        console.warn('Sessione non valida o scaduta:', err);
        removeStoredToken();
        setArtist(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const loginSuccess = (token: string, artistData: ArtistProfile) => {
    setStoredToken(token);
    setArtist(artistData);
  };

  const updateArtistProfile = (profile: Partial<ArtistProfile>) => {
    if (artist) {
      setArtist({ ...artist, ...profile });
    }
  };

  const logout = () => {
    removeStoredToken();
    setArtist(null);
  };

  return (
    <AuthContext.Provider
      value={{
        artist,
        isAuthenticated: !!artist,
        isLoading,
        loginSuccess,
        updateArtistProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
