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
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [audioEngine, setAudioEngine] = useState<'youtube' | 'direct'>('youtube');
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("xalanify_v1");
    if (data) {
      const p = JSON.parse(data);
      setUser(p.user); setThemeColor(p.themeColor || "#a855f7");
      setAudioEngine(p.audioEngine || 'youtube');
      setLikedTracks(p.likedTracks || []);
      setPlaylists(p.playlists || []);
      setSearchHistory(p.searchHistory || []);
    }
    setMounted(true);
  }, []);

  const save = (update: any) => {
    const current = JSON.parse(localStorage.getItem("xalanify_v1") || "{}");
    localStorage.setItem("xalanify_v1", JSON.stringify({ ...current, ...update }));
  };

  const login = (name: string) => { setUser(name); save({ user: name }); };
  const toggleLike = (t: Track) => {
    const newLikes = likedTracks.some(x => x.id === t.id) ? likedTracks.filter(x => x.id !== t.id) : [t, ...likedTracks];
    setLikedTracks(newLikes); save({ likedTracks: newLikes });
  };
  const createPlaylist = (name: string) => {
    const newP = [...playlists, { id: Date.now().toString(), name, tracks: [] }];
    setPlaylists(newP); save({ playlists: newP });
  };
  const addTrackToPlaylist = (pId: string, t: Track) => {
    const newP = playlists.map(p => p.id === pId ? { ...p, tracks: [...p.tracks, t] } : p);
    setPlaylists(newP); save({ playlists: newP });
  };

  if (!mounted) return null;

  // ECRÃ DE LOGIN CASO NÃO EXISTA USER
  if (!user) return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-8 z-[999]">
      <div className="w-full max-w-xs space-y-6 text-center">
        <h1 className="text-4xl font-black italic tracking-tighter">Xalanify</h1>
        <p className="text-zinc-500 text-xs uppercase tracking-widest">Insira o seu nome para começar</p>
        <input 
          autoFocus
          onKeyDown={(e) => { if(e.key === 'Enter') login(e.currentTarget.value) }}
          className="w-full bg-zinc-900 border border-white/10 p-4 rounded-2xl outline-none focus:border-purple-500 transition-all text-center font-bold"
          placeholder="@seu_nome"
        />
        <p className="text-[10px] text-zinc-600 uppercase">Beta Version 0.95.0</p>
      </div>
    </div>
  );

  return (
    <XalanifyContext.Provider value={{ 
      currentTrack, setCurrentTrack, isPlaying, setIsPlaying, user, isAdmin: user === "@admin1",
      login, themeColor, setThemeColor: (c) => { setThemeColor(c); save({ themeColor: c }); },
      audioEngine, setAudioEngine: (e) => { setAudioEngine(e); save({ audioEngine: e }); },
      likedTracks, toggleLike, playlists, createPlaylist, addTrackToPlaylist,
      searchHistory, addSearchTerm: (t) => { const n = [t, ...searchHistory.filter(x => x !== t)].slice(0,5); setSearchHistory(n); save({ searchHistory: n }); }
    }}>
      <div className="min-h-screen transition-colors duration-700" style={{ background: `linear-gradient(to bottom, black 60%, ${themeColor}25 100%)` }}>
        {children}
      </div>
    </XalanifyContext.Provider>
  );
}

export const useXalanify = () => {
  const context = useContext(XalanifyContext);
  if (!context) throw new Error("Context error");
  return context;
};