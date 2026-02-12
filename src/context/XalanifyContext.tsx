"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export interface Track {
  id: string; title: string; artist: string; thumbnail: string;
  youtubeId?: string; audioUrl?: string; isLocal?: boolean;
}

interface Playlist { id: string; name: string; tracks: Track[]; }

interface XalanifyContextType {
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  user: string | null;
  isAdmin: boolean;
  login: (name: string) => void;
  updateUserName: (name: string) => void;
  themeColor: string;
  setThemeColor: (color: string) => void;
  audioEngine: 'youtube' | 'direct';
  setAudioEngine: (e: 'youtube' | 'direct') => void;
  likedTracks: Track[];
  toggleLike: (track: Track) => void;
  playlists: Playlist[];
  addTrackToPlaylist: (pId: string, track: Track) => void;
  searchHistory: string[];
  addSearchTerm: (term: string) => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [audioEngine, setAudioEngine] = useState<'youtube' | 'direct'>('youtube');
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("xalanify_data");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed.user);
      setIsAdmin(parsed.user === "@admin1");
      setThemeColor(parsed.themeColor || "#a855f7");
      setAudioEngine(parsed.audioEngine || 'youtube');
      setLikedTracks(parsed.likedTracks || []);
      setPlaylists(parsed.playlists || []);
      setSearchHistory(parsed.searchHistory || []);
    }
  }, []);

  const save = (newData: any) => {
    const existing = JSON.parse(localStorage.getItem("xalanify_data") || "{}");
    localStorage.setItem("xalanify_data", JSON.stringify({ ...existing, ...newData }));
  };

  const login = (name: string) => { setUser(name); setIsAdmin(name === "@admin1"); save({ user: name }); };
  const updateUserName = (name: string) => { setUser(name); save({ user: name }); };
  const toggleLike = (track: Track) => {
    const newLikes = likedTracks.find(t => t.id === track.id) 
      ? likedTracks.filter(t => t.id !== track.id) 
      : [track, ...likedTracks];
    setLikedTracks(newLikes); save({ likedTracks: newLikes });
  };
  const addSearchTerm = (term: string) => {
    const newHistory = [term, ...searchHistory.filter(t => t !== term)].slice(0, 5);
    setSearchHistory(newHistory); save({ searchHistory: newHistory });
  };

  return (
    <XalanifyContext.Provider value={{ 
      currentTrack, setCurrentTrack, isPlaying, setIsPlaying, user, isAdmin, 
      login, updateUserName, themeColor, setThemeColor: (c) => { setThemeColor(c); save({ themeColor: c }); },
      audioEngine, setAudioEngine: (e) => { setAudioEngine(e); save({ audioEngine: e }); },
      likedTracks, toggleLike, playlists, addTrackToPlaylist: () => {}, // Implementar logica
      searchHistory, addSearchTerm
    }}>
      <div style={{ background: `linear-gradient(to bottom, black 60%, ${themeColor}33 100%)`, minHeight: '100vh' }}>
        {children}
      </div>
    </XalanifyContext.Provider>
  );
}

export const useXalanify = () => {
  const context = useContext(XalanifyContext);
  if (!context) throw new Error("error");
  return context;
};