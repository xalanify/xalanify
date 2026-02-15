"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export interface Track {
  id: string; title: string; artist: string; thumbnail: string;
  youtubeId?: string; audioUrl?: string; isLocal?: boolean;
}

export interface Playlist { id: string; name: string; tracks: Track[]; image?: string; isExternal?: boolean; }

interface XalanifyContextType {
  currentTrack: Track | null; setCurrentTrack: (t: Track | null) => void;
  isPlaying: boolean; setIsPlaying: (p: boolean) => void;
  user: string; login: (name: string) => void;
  themeColor: string; setThemeColor: (c: string) => void;
  likedTracks: Track[]; toggleLike: (t: Track) => void;
  playlists: Playlist[]; 
  createPlaylist: (name: string, tracks?: Track[], image?: string) => void;
  addTrackToPlaylist: (pId: string, t: Track) => void;
  isExpanded: boolean; setIsExpanded: (v: boolean) => void;
  audioEngine: 'youtube' | 'direct'; setAudioEngine: (e: 'youtube' | 'direct') => void;
  // Persistência da Pesquisa
  searchHistory: string[]; addSearchTerm: (term: string) => void;
  persistentResults: any[]; setPersistentResults: (r: any[]) => void;
  persistentQuery: string; setPersistentQuery: (q: string) => void;
  
  isAdmin: boolean;
  progress: number; setProgress: (v: number) => void;
  duration: number; setDuration: (v: number) => void;
  playNext: () => void;
  playPrevious: () => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export const VERSION = "0.7.0";

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Estados Persistentes da Pesquisa
  const [persistentResults, setPersistentResults] = useState<any[]>([]);
  const [persistentQuery, setPersistentQuery] = useState("");

  const [user, setUser] = useState("Utilizador");
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [audioEngine, setAudioEngine] = useState<'youtube' | 'direct'>('direct');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showPatch, setShowPatch] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("xalanify_user");
    const savedColor = localStorage.getItem("xalanify_theme");
    const savedPlaylists = localStorage.getItem("xalanify_playlists");
    const lastV = localStorage.getItem("xalanify_version");

    if (savedUser) setUser(savedUser);
    if (savedColor) setThemeColor(savedColor);
    if (savedPlaylists) setPlaylists(JSON.parse(savedPlaylists));
    if (lastV !== VERSION) setShowPatch(true);
  }, []);

  const savePlaylists = (newP: Playlist[]) => {
    setPlaylists(newP);
    localStorage.setItem("xalanify_playlists", JSON.stringify(newP));
  };

  const playNext = () => {
    const idx = persistentResults.findIndex(t => t.id === currentTrack?.id);
    if (idx !== -1 && idx < persistentResults.length - 1) {
      setProgress(0);
      setCurrentTrack(persistentResults[idx + 1]);
    }
  };

  const playPrevious = () => {
    const idx = persistentResults.findIndex(t => t.id === currentTrack?.id);
    if (idx > 0) {
      setProgress(0);
      setCurrentTrack(persistentResults[idx - 1]);
    }
  };

  return (
    <XalanifyContext.Provider value={{
      currentTrack, setCurrentTrack, isPlaying, setIsPlaying,
      user, login: (n) => { setUser(n); localStorage.setItem("xalanify_user", n); },
      themeColor, setThemeColor: (c) => { setThemeColor(c); localStorage.setItem("xalanify_theme", c); },
      likedTracks, toggleLike: (t) => setLikedTracks(prev => prev.some(i => i.id === t.id) ? prev.filter(i => i.id !== t.id) : [t, ...prev]),
      playlists, 
      createPlaylist: (name, tracks = [], image) => {
        const newP = [...playlists, { id: Date.now().toString(), name, tracks, image }];
        savePlaylists(newP);
      },
      addTrackToPlaylist: (pId, t) => {
        const newP = playlists.map(p => p.id === pId ? { ...p, tracks: [...p.tracks, t] } : p);
        savePlaylists(newP);
      },
      isExpanded, setIsExpanded, audioEngine, setAudioEngine, 
      searchHistory, addSearchTerm: (t) => setSearchHistory([t, ...searchHistory.filter(x => x !== t)].slice(0, 10)),
      persistentResults, setPersistentResults, persistentQuery, setPersistentQuery,
      isAdmin: user.startsWith("@admin"), progress, setProgress, duration, setDuration,
      playNext, playPrevious
    }}>
      <div className="min-h-screen w-full bg-black text-white flex flex-col transition-all duration-700" style={{ background: `linear-gradient(to bottom, black 60%, ${themeColor}25 100%)` }}>
        <div className="flex-1 overflow-y-auto no-scrollbar pb-32">{children}</div>
        {showPatch && (
           <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-xl p-8">
            <div className="bg-zinc-900 border border-white/10 rounded-[3rem] p-8 max-w-sm w-full text-center space-y-6">
              <h2 className="text-4xl font-black italic" style={{ color: themeColor }}>v{VERSION}</h2>
              <p className="text-zinc-400 text-xs font-bold">Pesquisa persistente e Playlists de artistas agora ativos.</p>
              <button onClick={() => { setShowPatch(false); localStorage.setItem("xalanify_version", VERSION); }} className="w-full py-4 rounded-2xl font-black" style={{ backgroundColor: themeColor, color: 'black' }}>Entrar</button>
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