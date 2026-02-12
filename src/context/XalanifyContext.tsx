"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export interface Track {
  id: string; title: string; artist: string; thumbnail: string;
  youtubeId?: string; audioUrl?: string; isLocal?: boolean;
}

interface Playlist { id: string; name: string; tracks: Track[]; }

// INTERFACE COMPLETA - Não remover nada daqui
interface XalanifyContextType {
  currentTrack: Track | null; setCurrentTrack: (t: Track | null) => void;
  isPlaying: boolean; setIsPlaying: (p: boolean) => void;
  user: string; login: (name: string) => void;
  themeColor: string; setThemeColor: (c: string) => void;
  likedTracks: Track[]; toggleLike: (t: Track) => void;
  playlists: Playlist[]; createPlaylist: (name: string) => void;
  addTrackToPlaylist: (pId: string, t: Track) => void;
  isExpanded: boolean; setIsExpanded: (v: boolean) => void;
  audioEngine: 'youtube' | 'direct'; setAudioEngine: (e: 'youtube' | 'direct') => void;
  searchHistory: string[]; addSearchTerm: (term: string) => void; // CORRIGIDO: Adicionado aqui
  isAdmin: boolean;
  progress: number; setProgress: (v: number) => void;
  duration: number; setDuration: (v: number) => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export const VERSION = "0.49.1";

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const [user, setUser] = useState("Utilizador");
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [audioEngine, setAudioEngine] = useState<'youtube' | 'direct'>('youtube');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showPatch, setShowPatch] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem("xalanify_master_v49");
    const lastVersion = localStorage.getItem("xalanify_last_version");

    if (savedData) {
      const p = JSON.parse(savedData);
      if (p.user) setUser(p.user);
      if (p.themeColor) setThemeColor(p.themeColor);
      if (p.likedTracks) setLikedTracks(p.likedTracks);
      if (p.playlists) setPlaylists(p.playlists);
      if (p.audioEngine) setAudioEngine(p.audioEngine);
      if (p.searchHistory) setSearchHistory(p.searchHistory);
    }
    if (lastVersion !== VERSION) setShowPatch(true);
  }, []);

  const saveData = (key: string, value: any) => {
    const currentData = JSON.parse(localStorage.getItem("xalanify_master_v49") || "{}");
    localStorage.setItem("xalanify_master_v49", JSON.stringify({ ...currentData, [key]: value }));
  };

  const addSearchTerm = (term: string) => {
    const newHistory = [term, ...searchHistory.filter(t => t !== term)].slice(0, 10);
    setSearchHistory(newHistory);
    saveData("searchHistory", newHistory);
  };

  return (
    <XalanifyContext.Provider value={{ 
      currentTrack, setCurrentTrack, isPlaying, setIsPlaying, 
      user, login: (n) => { setUser(n); saveData("user", n); }, 
      themeColor, setThemeColor: (c) => { setThemeColor(c); saveData("themeColor", c); },
      likedTracks, toggleLike: (track) => {
        const exists = likedTracks.find(t => t.id === track.id);
        const newLikes = exists ? likedTracks.filter(t => t.id !== track.id) : [track, ...likedTracks];
        setLikedTracks(newLikes); saveData("likedTracks", newLikes);
      },
      playlists, 
      createPlaylist: (name) => {
        const newP = [...playlists, { id: Date.now().toString(), name, tracks: [] }];
        setPlaylists(newP); saveData("playlists", newP);
      },
      addTrackToPlaylist: (pId, track) => {
        const newP = playlists.map(p => p.id === pId ? { ...p, tracks: [...p.tracks, track] } : p);
        setPlaylists(newP); saveData("playlists", newP);
      },
      isExpanded, setIsExpanded, 
      audioEngine, setAudioEngine: (e) => { setAudioEngine(e); saveData("audioEngine", e); },
      searchHistory, addSearchTerm,
      isAdmin: user === "@admin1", progress, setProgress, duration, setDuration
    }}>
      {/* SCROLL E COR DO TEMA APLICADOS AQUI */}
      <div 
        className="h-screen w-full bg-black text-white overflow-hidden flex flex-col transition-all duration-700"
        style={{ background: `linear-gradient(to bottom, black 60%, ${themeColor}25 100%)` }}
      >
        <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
          {children}
        </div>

        {showPatch && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-xl p-8">
            <div className="bg-zinc-900 border border-white/10 rounded-[3rem] p-8 max-w-sm w-full text-center space-y-6 shadow-2xl">
              <h2 className="text-4xl font-black italic" style={{ color: themeColor }}>v{VERSION}</h2>
              <div className="text-left space-y-2 text-xs text-zinc-400 font-bold">
                <p>• Erros de TypeScript corrigidos</p>
                <p>• Scroll mobile ativado</p>
                <p>• Perfil e Cores persistentes</p>
              </div>
              <button onClick={() => { setShowPatch(false); localStorage.setItem("xalanify_last_version", VERSION); }} className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]" style={{ backgroundColor: themeColor, color: 'black' }}>Começar</button>
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