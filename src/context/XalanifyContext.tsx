"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  youtubeId?: string;
  isLocalTest?: boolean;
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
  updateUserName: (newName: string) => void; // NOVO: Mudar nome
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
    const savedColor = localStorage.getItem("xalanify_theme");
    if (savedColor) setThemeColor(savedColor);
  }, []);

  const login = (name: string) => {
    setUser(name);
    const adminStatus = name === "@admin1";
    setIsAdmin(adminStatus);
    localStorage.setItem("xalanify_user", name);
  };

  const updateUserName = (newName: string) => {
    setUser(newName);
    localStorage.setItem("xalanify_user", newName);
    setIsAdmin(newName === "@admin1");
  };

  const clearAdminCache = () => {
    localStorage.clear();
    window.location.reload();
  };

  const toggleLike = (track: Track) => {
    const isLiked = likedTracks.some(t => t.id === track.id);
    setLikedTracks(isLiked ? likedTracks.filter(t => t.id !== track.id) : [...likedTracks, track]);
  };

  const createPlaylist = (name: string) => {
    setPlaylists([...playlists, { id: Date.now().toString(), name, tracks: [] }]);
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
  if (!context) throw new Error("useXalanify error");
  return context;
};