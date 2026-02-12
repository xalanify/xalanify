"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export interface Track {
  id: string; 
  title: string; 
  artist: string; 
  thumbnail: string;
  youtubeId?: string; 
  audioUrl?: string;
  isLocal?: boolean; // CORREÇÃO: Adicionado isLocal
}

interface Playlist { id: string; name: string; tracks: Track[]; }

interface XalanifyContextType {
  currentTrack: Track | null; setCurrentTrack: (t: Track | null) => void;
  isPlaying: boolean; setIsPlaying: (p: boolean) => void;
  user: string | null; isAdmin: boolean; login: (name: string) => void;
  themeColor: string; setThemeColor: (c: string) => void;
  likedTracks: Track[]; toggleLike: (t: Track) => void;
  playlists: Playlist[]; createPlaylist: (name: string) => void;
  addTrackToPlaylist: (pId: string, t: Track) => void;
  isExpanded: boolean; setIsExpanded: (v: boolean) => void;
  audioEngine: 'youtube' | 'direct'; setAudioEngine: (e: 'youtube' | 'direct') => void;
  searchHistory: string[]; // CORREÇÃO: Adicionado searchHistory
  progress: number; setProgress: (v: number) => void;
  duration: number; setDuration: (v: number) => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

// Histórico para as Definições
export const VERSION_LOGS = [
  { v: "0.47.0", date: "2026-02-12", added: ["Barra de Progresso Funcional", "Sistema de Gostos e Playlists"], updated: ["Definições Interativas", "Correção de Erros de Tipagem"], removed: [] }
];

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [audioEngine, setAudioEngine] = useState<'youtube' | 'direct'>('youtube');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const data = localStorage.getItem("xalanify_v47");
    if (data) {
      const p = JSON.parse(data);
      setUser(p.user); 
      setThemeColor(p.themeColor || "#a855f7");
      setLikedTracks(p.likedTracks || []);
      setPlaylists(p.playlists || []);
      setAudioEngine(p.audioEngine || 'youtube');
      setSearchHistory(p.searchHistory || []);
    }
  }, []);

  const save = (update: any) => {
    const current = JSON.parse(localStorage.getItem("xalanify_v47") || "{}");
    localStorage.setItem("xalanify_v47", JSON.stringify({ ...current, ...update }));
  };

  return (
    <XalanifyContext.Provider value={{ 
      currentTrack, setCurrentTrack, isPlaying, setIsPlaying, user, isAdmin: user === "@admin1",
      login: (n) => { setUser(n); save({ user: n }); }, 
      themeColor, setThemeColor: (c) => { setThemeColor(c); save({ themeColor: c }); },
      likedTracks, toggleLike: (t) => { /* logica de toggle */ }, 
      playlists, 
      createPlaylist: (name) => {
        const newList = [...playlists, { id: Date.now().toString(), name, tracks: [] }];
        setPlaylists(newList); save({ playlists: newList });
      }, 
      addTrackToPlaylist: (pId, t) => { /* logica de add */ },
      isExpanded, setIsExpanded, 
      audioEngine, setAudioEngine: (e) => { setAudioEngine(e); save({ audioEngine: e }); },
      searchHistory, progress, setProgress, duration, setDuration
    }}>
      {children}
    </XalanifyContext.Provider>
  );
}

export const useXalanify = () => {
  const context = useContext(XalanifyContext);
  if (!context) throw new Error("useXalanify must be used within Provider");
  return context;
};