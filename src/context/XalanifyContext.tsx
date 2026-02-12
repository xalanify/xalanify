"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  audioUrl?: string; // Adicionado aqui
  isLocal?: boolean;
}

interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}

interface XalanifyContextType {
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  user: string | null;
  isAdmin: boolean;
  login: (name: string) => void;
  updateUserName: (name: string) => void; // Adicionado
  themeColor: string;
  setThemeColor: (color: string) => void;
  likedTracks: Track[];
  toggleLike: (track: Track) => void;
  playlists: Playlist[];
  createPlaylist: (name: string) => void;
  clearAdminCache: () => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("xalanify_user");
    if (savedUser) {
      setUser(savedUser);
      setIsAdmin(savedUser === "@admin1");
    }
  }, []);

  const login = (name: string) => {
    setUser(name);
    setIsAdmin(name === "@admin1");
    localStorage.setItem("xalanify_user", name);
  };

  const updateUserName = (name: string) => {
    setUser(name);
    setIsAdmin(name === "@admin1");
    localStorage.setItem("xalanify_user", name);
  };

  const clearAdminCache = () => {
    localStorage.clear();
    window.location.reload();
  };

  const toggleLike = (track: Track) => {
    setLikedTracks(prev => prev.some(t => t.id === track.id) 
      ? prev.filter(t => t.id !== track.id) 
      : [...prev, track]);
  };

  const createPlaylist = (name: string) => {
    setPlaylists(prev => [...prev, { id: Date.now().toString(), name, tracks: [] }]);
  };

  return (
    <XalanifyContext.Provider value={{ 
      currentTrack, setCurrentTrack, isPlaying, setIsPlaying, 
      user, isAdmin, login, updateUserName, themeColor, setThemeColor,
      likedTracks, toggleLike, playlists, createPlaylist, clearAdminCache 
    }}>
      {children}
    </XalanifyContext.Provider>
  );
}

export const useXalanify = () => {
  const context = useContext(XalanifyContext);
  if (!context) throw new Error("useXalanify must be used within provider");
  return context;
};