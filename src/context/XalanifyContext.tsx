"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  youtubeId?: string;
  audioUrl?: string;
  isLocal?: boolean;
}

interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}

interface XalanifyContextType {
  currentTrack: Track | null;
  setCurrentTrack: (t: Track | null) => void;
  isPlaying: boolean;
  setIsPlaying: (p: boolean) => void;
  user: string;
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
  audioEngine: 'youtube' | 'direct';
  setAudioEngine: (e: 'youtube' | 'direct') => void;
  searchHistory: string[];
  addSearchTerm: (term: string) => void;
  isAdmin: boolean;
  progress: number;
  setProgress: (v: number) => void;
  duration: number;
  setDuration: (v: number) => void;
  searchResults: Track[];
  setSearchResults: (t: Track[]) => void;
  playNext: () => void;
  playPrevious: () => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export const XalanifyProvider = ({ children }: { children: React.ReactNode }) => {
  const VERSION = "1.5.2";
  
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [user, setUser] = useState("Utilizador");
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [audioEngine, setAudioEngine] = useState<'youtube' | 'direct'>('direct');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [showPatch, setShowPatch] = useState(false);

  useEffect(() => {
    const savedColor = localStorage.getItem("xalanify_theme");
    if (savedColor) setThemeColor(savedColor);
    
    const lastV = localStorage.getItem("xalanify_last_version");
    if (lastV !== VERSION) {
      setShowPatch(true);
    }
  }, []);

  const login = (name: string) => setUser(name);

  const toggleLike = (t: Track) => {
    setLikedTracks(prev => 
      prev.some(i => i.id === t.id) 
        ? prev.filter(i => i.id !== t.id) 
        : [...prev, t]
    );
  };

  const createPlaylist = (name: string) => {
    setPlaylists([...playlists, { id: Date.now().toString(), name, tracks: [] }]);
  };

  const addTrackToPlaylist = (pId: string, t: Track) => {
    setPlaylists(prev => prev.map(p => 
      p.id === pId ? { ...p, tracks: [...p.tracks, t] } : p
    ));
  };

  const addSearchTerm = (term: string) => {
    setSearchHistory(prev => [term, ...prev.filter(t => t !== term)].slice(0, 10));
  };

  // Funções de Navegação para as Setas
  const playNext = () => {
    if (searchResults.length === 0) return;
    const currentIndex = searchResults.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex !== -1 && currentIndex < searchResults.length - 1) {
      setCurrentTrack(searchResults[currentIndex + 1]);
    }
  };

  const playPrevious = () => {
    if (searchResults.length === 0) return;
    const currentIndex = searchResults.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex > 0) {
      setCurrentTrack(searchResults[currentIndex - 1]);
    }
  };

  return (
    <XalanifyContext.Provider value={{
      currentTrack, setCurrentTrack,
      isPlaying, setIsPlaying,
      user, login,
      themeColor, setThemeColor,
      likedTracks, toggleLike,
      playlists, createPlaylist, addTrackToPlaylist,
      isExpanded, setIsExpanded,
      audioEngine, setAudioEngine,
      searchHistory, addSearchTerm,
      isAdmin: true,
      progress, setProgress,
      duration, setDuration,
      searchResults, setSearchResults,
      playNext, playPrevious
    }}>
      <div 
        className="min-h-screen w-full bg-black text-white overflow-hidden flex flex-col transition-all duration-700"
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
                <p>• Barra de progresso sincronizada</p>
                <p>• Setas de navegação ativadas</p>
                <p>• Correção de reprodução YouTube/Direto</p>
                <p>• Melhoria na estabilidade do estado</p>
              </div>
              <button 
                onClick={() => { 
                  setShowPatch(false); 
                  localStorage.setItem("xalanify_last_version", VERSION); 
                }} 
                className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]" 
                style={{ backgroundColor: themeColor, color: 'black' }}
              >
                Continuar
              </button>
            </div>
          </div>
        )}
      </div>
    </XalanifyContext.Provider>
  );
};

export const useXalanify = () => {
  const context = useContext(XalanifyContext);
  if (!context) throw new Error("useXalanify must be used within a Provider");
  return context;
};