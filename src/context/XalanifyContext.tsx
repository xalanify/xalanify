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
  user: string | null; login: (name: string) => void;
  themeColor: string; setThemeColor: (c: string) => void;
  likedTracks: Track[]; toggleLike: (t: Track) => void;
  playlists: Playlist[]; createPlaylist: (name: string) => void;
  addTrackToPlaylist: (pId: string, t: Track) => void;
  isExpanded: boolean; setIsExpanded: (v: boolean) => void;
  audioEngine: 'youtube' | 'direct'; setAudioEngine: (e: 'youtube' | 'direct') => void;
  searchHistory: string[]; addSearchTerm: (term: string) => void;
  isAdmin: boolean;
  progress: number; setProgress: (v: number) => void;
  duration: number; setDuration: (v: number) => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export const VERSION = "0.48.0";
export const VERSION_LOGS = [
  { v: "0.48.0", date: "2026-02-12", added: ["Painel Admin (@admin1)", "Seletor de Cores", "Scroll Corrigido", "Debug Menu"], updated: ["Lógica de Áudio na Biblioteca"], removed: [] },
  { v: "0.47.0", date: "2026-02-12", added: ["Barra de Progresso", "Playlists"], updated: [], removed: [] }
];

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [audioEngine, setAudioEngine] = useState<'youtube' | 'direct'>('youtube');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPatch, setShowPatch] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("xalanify_v48");
    const lastV = localStorage.getItem("xalanify_v_seen");
    if (data) {
      const p = JSON.parse(data);
      setUser(p.user); setThemeColor(p.themeColor || "#a855f7");
      setLikedTracks(p.likedTracks || []); setPlaylists(p.playlists || []);
      setAudioEngine(p.audioEngine || 'youtube'); setSearchHistory(p.searchHistory || []);
    }
    if (lastV !== VERSION) setShowPatch(true);
  }, []);

  const save = (update: any) => {
    const current = JSON.parse(localStorage.getItem("xalanify_v48") || "{}");
    localStorage.setItem("xalanify_v48", JSON.stringify({ ...current, ...update }));
  };

  return (
    <XalanifyContext.Provider value={{ 
      currentTrack, setCurrentTrack, isPlaying, setIsPlaying, user, 
      login: (n) => { setUser(n); save({ user: n }); },
      themeColor, setThemeColor: (c) => { setThemeColor(c); save({ themeColor: c }); },
      likedTracks, toggleLike: (t) => { /* logic */ }, 
      playlists, createPlaylist: (n) => { /* logic */ }, addTrackToPlaylist: (id, t) => { /* logic */ },
      isExpanded, setIsExpanded, audioEngine, setAudioEngine: (e) => { setAudioEngine(e); save({ audioEngine: e }); },
      searchHistory, addSearchTerm: (t) => { /* logic */ },
      isAdmin: user === "@admin1", progress, setProgress, duration, setDuration
    }}>
      <div className="h-screen w-full bg-black text-white overflow-hidden flex flex-col">
        {/* Scroll principal aqui */}
        <div className="flex-1 overflow-y-auto pb-40 no-scrollbar">
          {children}
        </div>

        {showPatch && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 p-6 backdrop-blur-md">
            <div className="bg-zinc-900 border border-white/10 rounded-[3rem] p-8 max-w-sm w-full space-y-6">
              <h2 className="text-3xl font-black italic">v{VERSION}</h2>
              <div className="space-y-2 text-xs text-zinc-400">
                {VERSION_LOGS[0].added.map(a => <p key={a}>• {a}</p>)}
              </div>
              <button onClick={() => { setShowPatch(false); localStorage.setItem("xalanify_v_seen", VERSION); }} className="w-full py-4 rounded-2xl font-black" style={{ backgroundColor: themeColor, color: 'black' }}>Entrar</button>
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