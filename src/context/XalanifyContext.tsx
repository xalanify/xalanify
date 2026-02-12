"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export interface Track {
  id: string; title: string; artist: string; thumbnail: string;
  youtubeId?: string; audioUrl?: string; isLocal?: boolean;
}

interface Playlist { id: string; name: string; tracks: Track[]; }

// Adicionadas todas as propriedades que os outros ficheiros pedem
interface XalanifyContextType {
  currentTrack: Track | null; 
  setCurrentTrack: (t: Track | null) => void;
  isPlaying: boolean; 
  setIsPlaying: (p: boolean) => void;
  user: string | null; 
  login: (name: string) => void;
  themeColor: string; 
  setThemeColor: (c: string) => void;
  likedTracks: Track[]; 
  toggleLike: (t: Track) => void;
  playlists: Playlist[]; 
  createPlaylist: (name: string) => void;
  addTrackToPlaylist: (pId: string, t: Track) => void;
  isExpanded: boolean; 
  setIsExpanded: (v: boolean) => void;
  audioEngine: 'youtube' | 'direct'; // Erro corrigido aqui
  setAudioEngine: (e: 'youtube' | 'direct') => void;
  searchHistory: string[]; // Erro corrigido aqui
  isAdmin: boolean; // Erro corrigido aqui
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export const VERSION = "0.48.0";
export const VERSION_LOGS = [
  { v: "0.48.0", date: "2026-02-12", added: ["Edição de Perfil Local", "Navegação em Playlists", "Pop-up de Versão Persistente"], updated: ["Lógica de Gostos", "Correção de Tipagem TS"], removed: [] }
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
  const [showPatch, setShowPatch] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("xalanify_app_data");
    const lastV = localStorage.getItem("xalanify_v_seen");
    
    if (data) {
      const p = JSON.parse(data);
      setUser(p.user || "Utilizador");
      setThemeColor(p.themeColor || "#a855f7");
      setLikedTracks(p.likedTracks || []);
      setPlaylists(p.playlists || []);
      setAudioEngine(p.audioEngine || 'youtube');
      setSearchHistory(p.searchHistory || []);
    }
    if (lastV !== VERSION) setShowPatch(true);
  }, []);

  const save = (update: any) => {
    const current = JSON.parse(localStorage.getItem("xalanify_app_data") || "{}");
    localStorage.setItem("xalanify_app_data", JSON.stringify({ ...current, ...update }));
  };

  const login = (name: string) => { setUser(name); save({ user: name }); };
  
  const toggleLike = (track: Track) => {
    const exists = likedTracks.find(t => t.id === track.id);
    const newLikes = exists ? likedTracks.filter(t => t.id !== track.id) : [track, ...likedTracks];
    setLikedTracks(newLikes);
    save({ likedTracks: newLikes });
  };

  const createPlaylist = (name: string) => {
    const newList = [...playlists, { id: Date.now().toString(), name, tracks: [] }];
    setPlaylists(newList); save({ playlists: newList });
  };

  const addTrackToPlaylist = (pId: string, track: Track) => {
    const newList = playlists.map(p => p.id === pId ? { ...p, tracks: [...p.tracks, track] } : p);
    setPlaylists(newList); save({ playlists: newList });
  };

  return (
    <XalanifyContext.Provider value={{ 
      currentTrack, setCurrentTrack, isPlaying, setIsPlaying, user, login, 
      themeColor, setThemeColor: (c) => { setThemeColor(c); save({ themeColor: c }); },
      likedTracks, toggleLike, playlists, createPlaylist, addTrackToPlaylist,
      isExpanded, setIsExpanded, 
      audioEngine, setAudioEngine: (e) => { setAudioEngine(e); save({ audioEngine: e }); },
      searchHistory,
      isAdmin: user === "@admin1"
    }}>
      <div className="min-h-screen text-white bg-black">
        {children}
        {showPatch && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
            <div className="bg-zinc-900 border border-white/10 rounded-[3rem] p-8 max-w-sm w-full space-y-6 text-center">
              <h2 className="text-4xl font-black italic">v{VERSION}</h2>
              <div className="text-left space-y-2">
                {VERSION_LOGS[0].added.map(a => <p key={a} className="text-xs text-zinc-400">• {a}</p>)}
              </div>
              <button onClick={() => { setShowPatch(false); localStorage.setItem("xalanify_v_seen", VERSION); }} 
                className="w-full py-4 rounded-2xl font-black uppercase text-xs" style={{ backgroundColor: themeColor, color: 'black' }}>
                Entrar
              </button>
            </div>
          </div>
        )}
      </div>
    </XalanifyContext.Provider>
  );
}

export const useXalanify = () => {
  const context = useContext(XalanifyContext);
  if (!context) throw new Error("useXalanify error");
  return context;
};