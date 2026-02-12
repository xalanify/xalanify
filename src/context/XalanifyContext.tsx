"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export interface Track {
  id: string; title: string; artist: string; thumbnail: string;
  youtubeId?: string; audioUrl?: string; isLocal?: boolean;
}

interface Playlist { id: string; name: string; tracks: Track[]; }

interface XalanifyContextType {
  currentTrack: Track | null; setCurrentTrack: (t: Track | null) => void;
  isPlaying: boolean; setIsPlaying: (p: boolean) => void;
  user: string | null; isAdmin: boolean; login: (name: string) => void;
  themeColor: string; setThemeColor: (c: string) => void;
  audioEngine: 'youtube' | 'direct'; setAudioEngine: (e: 'youtube' | 'direct') => void;
  likedTracks: Track[]; toggleLike: (t: Track) => void;
  playlists: Playlist[]; createPlaylist: (name: string) => void;
  addTrackToPlaylist: (pId: string, t: Track) => void;
  searchHistory: string[]; addSearchTerm: (term: string) => void;
  isExpanded: boolean; setIsExpanded: (v: boolean) => void;
  progress: number; setProgress: (v: number) => void;
  duration: number; setDuration: (v: number) => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export const VERSION_LOGS = [
  { v: "0.47.0", date: "2026-02-12", added: ["Barra de Progresso Funcional (Seek)", "Controlo de Tempo Real", "Menu de Debug Admin Reforçado"], updated: ["Estética do Player Expandido"], removed: [] },
  { v: "0.46.0", date: "2026-02-12", added: ["Player Expandido", "Pop-up de Patch Notes"], updated: ["Layout Search"], removed: [] }
];

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [audioEngine, setAudioEngine] = useState<'youtube' | 'direct'>('youtube');
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPatch, setShowPatch] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("xalanify_v3");
    const lastV = localStorage.getItem("xalanify_version");
    if (data) {
      const p = JSON.parse(data);
      setUser(p.user); setThemeColor(p.themeColor || "#a855f7");
      setAudioEngine(p.audioEngine || 'youtube');
      setLikedTracks(p.likedTracks || []);
      setPlaylists(p.playlists || []);
      setSearchHistory(p.searchHistory || []);
    }
    if (lastV !== "0.47.0") {
      setShowPatch(true);
      localStorage.setItem("xalanify_version", "0.47.0");
    }
  }, []);

  const save = (update: any) => {
    const current = JSON.parse(localStorage.getItem("xalanify_v3") || "{}");
    localStorage.setItem("xalanify_v3", JSON.stringify({ ...current, ...update }));
  };

  const login = (name: string) => { setUser(name); save({ user: name }); };

  return (
    <XalanifyContext.Provider value={{ 
      currentTrack, setCurrentTrack, isPlaying, setIsPlaying, user, isAdmin: user === "@admin1",
      login, themeColor, setThemeColor: (c) => { setThemeColor(c); save({ themeColor: c }); },
      audioEngine, setAudioEngine: (e) => { setAudioEngine(e); save({ audioEngine: e }); },
      likedTracks, toggleLike: (t) => { /* logic */ }, playlists, createPlaylist: (n) => {}, addTrackToPlaylist: (id, t) => {},
      searchHistory, addSearchTerm: (t) => {}, isExpanded, setIsExpanded, progress, setProgress, duration, setDuration
    }}>
      <div className="min-h-screen text-white" style={{ background: `linear-gradient(to bottom, black 75%, ${themeColor}15 100%)` }}>
        {children}
        {showPatch && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
            <div className="bg-zinc-900 border border-white/10 rounded-[3rem] p-8 max-w-sm w-full space-y-6">
              <h2 className="text-3xl font-black italic">Update v0.47.0</h2>
              <ul className="text-sm space-y-2 text-zinc-400">
                {VERSION_LOGS[0].added.map(a => <li key={a} className="flex gap-2"><span>•</span> {a}</li>)}
              </ul>
              <button onClick={() => setShowPatch(false)} className="w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest" style={{ backgroundColor: themeColor, color: 'black' }}>Vamos a isto</button>
            </div>
          </div>
        )}
      </div>
    </XalanifyContext.Provider>
  );
}

export const useXalanify = () => {
  const context = useContext(XalanifyContext);
  if (!context) throw new Error("Context error");
  return context;
};