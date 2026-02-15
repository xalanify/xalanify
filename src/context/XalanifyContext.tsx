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
  user: string; login: (name: string) => void;
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
  searchResults: Track[]; setSearchResults: (t: Track[]) => void;
  playNext: () => void;
  playPrevious: () => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export const VERSION = "0.6.0";

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [audioEngine, setAudioEngine] = useState<'youtube' | 'direct'>('direct');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showPatch, setShowPatch] = useState(false);

  // Estados persistentes
  const [user, setUser] = useState("Utilizador");
  const [themeColor, setThemeColor] = useState("#a855f7");

  useEffect(() => {
    const savedUser = localStorage.getItem("xalanify_user");
    const savedColor = localStorage.getItem("xalanify_theme");
    const lastV = localStorage.getItem("xalanify_version");

    if (savedUser) setUser(savedUser);
    if (savedColor) setThemeColor(savedColor);
    if (lastV !== VERSION) setShowPatch(true);
  }, []);

  const login = (name: string) => {
    setUser(name);
    localStorage.setItem("xalanify_user", name);
  };

  const updateTheme = (color: string) => {
    setThemeColor(color);
    localStorage.setItem("xalanify_theme", color);
  };

  const playNext = () => {
    const idx = searchResults.findIndex(t => t.id === currentTrack?.id);
    if (idx !== -1 && idx < searchResults.length - 1) {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTrack(searchResults[idx + 1]);
    }
  };

  const playPrevious = () => {
    const idx = searchResults.findIndex(t => t.id === currentTrack?.id);
    if (idx > 0) {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTrack(searchResults[idx - 1]);
    }
  };

  return (
    <XalanifyContext.Provider value={{
      currentTrack, setCurrentTrack, isPlaying, setIsPlaying,
      user, login, themeColor, setThemeColor: updateTheme,
      likedTracks, toggleLike: (t) => setLikedTracks(prev => prev.some(i => i.id === t.id) ? prev.filter(i => i.id !== t.id) : [t, ...prev]),
      playlists, createPlaylist: (n) => setPlaylists([...playlists, { id: Date.now().toString(), name: n, tracks: [] }]),
      addTrackToPlaylist: (pId, t) => setPlaylists(playlists.map(p => p.id === pId ? { ...p, tracks: [...p.tracks, t] } : p)),
      isExpanded, setIsExpanded, audioEngine, setAudioEngine, searchHistory, addSearchTerm: (t) => setSearchHistory([t, ...searchHistory.filter(x => x !== t)].slice(0, 10)),
      isAdmin: user.startsWith("@admin"), progress, setProgress, duration, setDuration,
      searchResults, setSearchResults, playNext, playPrevious
    }}>
      <div 
        className="min-h-screen w-full bg-black text-white overflow-hidden flex flex-col transition-all duration-700"
        style={{ background: `linear-gradient(to bottom, black 60%, ${themeColor}25 100%)` }}
      >
        <div className="flex-1 overflow-y-auto no-scrollbar pb-32">{children}</div>

        {showPatch && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-xl p-8">
            <div className="bg-zinc-900 border border-white/10 rounded-[3rem] p-8 max-w-sm w-full text-center space-y-6 shadow-2xl">
              <h2 className="text-4xl font-black italic" style={{ color: themeColor }}>v{VERSION}</h2>
              <div className="text-left space-y-2 text-xs text-zinc-400 font-bold">
                <p>• Troca de música instantânea</p>
                <p>• Barra de progresso arrastável</p>
                <p>• Memória de utilizador e tema</p>
              </div>
              <button onClick={() => { setShowPatch(false); localStorage.setItem("xalanify_version", VERSION); }} className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]" style={{ backgroundColor: themeColor, color: 'black' }}>Entrar</button>
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