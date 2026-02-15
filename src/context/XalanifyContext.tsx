"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Loader2, ShieldCheck, Users, Activity, Trash2, Gauge, Cpu, Zap } from "lucide-react";
import Auth from "@/components/Auth";

export interface Track {
  id: string; title: string; artist: string; thumbnail: string;
  youtubeId?: string; audioUrl?: string; isLocal?: boolean;
}

export interface Playlist { id: string; name: string; tracks: Track[]; image?: string; }

interface PerfMetrics {
  loadTime: number;
  memory: string;
  latency: number;
}

interface XalanifyContextType {
  user: User | null; isAdmin: boolean; logs: string[]; addLog: (m: string) => void;
  currentTrack: Track | null; setCurrentTrack: (t: Track | null) => void;
  isPlaying: boolean; setIsPlaying: (p: boolean) => void;
  progress: number; setProgress: (v: number) => void;
  duration: number; setDuration: (v: number) => void;
  isExpanded: boolean; setIsExpanded: (v: boolean) => void;
  audioEngine: 'youtube' | 'direct'; setAudioEngine: (e: 'youtube' | 'direct') => void;
  themeColor: string; setThemeColor: (c: string) => void;
  likedTracks: Track[]; toggleLike: (t: Track) => void;
  playlists: Playlist[]; createPlaylist: (n: string) => void;
  addTrackToPlaylist: (pId: string, t: Track) => void;
  searchResults: Track[]; setSearchResults: (t: Track[]) => void;
  persistentQuery: string; setPersistentQuery: (q: string) => void;
  playNext: () => void;
  playPrevious: () => void;
  logout: () => void;
  perfMetrics: PerfMetrics;
  setPerfMetrics: (m: Partial<PerfMetrics>) => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>(["Xalanify: Sistema Iniciado"]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [audioEngine, setAudioEngine] = useState<'youtube' | 'direct'>('youtube');
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [persistentQuery, setPersistentQuery] = useState("");
  
  // Métricas para Admin
  const [perfMetrics, setPerfMetricsState] = useState<PerfMetrics>({ loadTime: 0, memory: "0MB", latency: 0 });

  const setPerfMetrics = (m: Partial<PerfMetrics>) => setPerfMetricsState(prev => ({ ...prev, ...m }));

  const isAdmin = user?.email === "adminx@adminx.com";

  const addLog = (m: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${m}`, ...prev].slice(0, 50));
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));

    // Monitorizar Memória se disponível (Chrome/Edge)
    const memInterval = setInterval(() => {
      const mem = (performance as any).memory;
      if (mem) {
        setPerfMetrics({ memory: Math.round(mem.usedJSHeapSize / 1048576) + "MB" });
      }
    }, 5000);
    return () => clearInterval(memInterval);
  }, []);

  const toggleLike = (track: Track) => {
    const isLiked = likedTracks.some(t => t.id === track.id);
    if (isLiked) setLikedTracks(prev => prev.filter(t => t.id !== track.id));
    else setLikedTracks(prev => [track, ...prev]);
  };

  const createPlaylist = (name: string) => {
    setPlaylists([...playlists, { id: Math.random().toString(), name, tracks: [] }]);
  };

  const addTrackToPlaylist = (pId: string, track: Track) => {
    setPlaylists(playlists.map(p => p.id === pId ? { ...p, tracks: [...p.tracks, track] } : p));
  };

  const playNext = () => {
    const idx = searchResults.findIndex(t => t.id === currentTrack?.id);
    if (idx !== -1 && idx < searchResults.length - 1) setCurrentTrack(searchResults[idx + 1]);
  };

  const playPrevious = () => {
    const idx = searchResults.findIndex(t => t.id === currentTrack?.id);
    if (idx > 0) setCurrentTrack(searchResults[idx - 1]);
  };

  return (
    <XalanifyContext.Provider value={{
      user, isAdmin, logs, addLog, currentTrack, setCurrentTrack, isPlaying, setIsPlaying,
      progress, setProgress, duration, setDuration, isExpanded, setIsExpanded,
      audioEngine, setAudioEngine, themeColor, setThemeColor, likedTracks, toggleLike,
      playlists, createPlaylist, addTrackToPlaylist, searchResults, setSearchResults,
      persistentQuery, setPersistentQuery, playNext, playPrevious, perfMetrics, setPerfMetrics,
      logout: () => supabase.auth.signOut()
    }}>
      {authLoading ? (
        <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" /></div>
      ) : !user ? (
        <Auth />
      ) : (
        <div className="h-screen w-full bg-black text-white flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scroll relative pb-40">
            {children}
            {isAdmin && <AdminDebugMenu />}
          </div>
        </div>
      )}
    </XalanifyContext.Provider>
  );
}

function AdminDebugMenu() {
  const { logs, themeColor, perfMetrics } = useXalanify();
  const [show, setShow] = useState(false);
  
  return (
    <div className="fixed top-6 right-6 z-[999]">
      <button onClick={() => setShow(!show)} className="w-12 h-12 rounded-full bg-black border-2 flex items-center justify-center shadow-2xl transition-transform active:scale-90" style={{ borderColor: themeColor }}>
        <span className="text-[8px] font-black italic">DEBUG</span>
      </button>

      {show && (
        <div className="absolute top-14 right-0 w-80 bg-zinc-950 border border-white/10 rounded-[2.5rem] p-6 backdrop-blur-3xl shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-red-500">
              <ShieldCheck size={18}/><span className="text-[10px] font-black uppercase tracking-widest">Admin Control</span>
            </div>
            <div className="flex gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-4">
            {/* MÉTRICAS DE PERFORMANCE */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/5 p-3 rounded-2xl flex flex-col items-center gap-1">
                <Cpu size={14} className="text-blue-400" />
                <span className="text-[8px] text-zinc-500 font-bold">MEM</span>
                <span className="text-[10px] font-mono">{perfMetrics.memory}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl flex flex-col items-center gap-1">
                <Zap size={14} className="text-yellow-400" />
                <span className="text-[8px] text-zinc-500 font-bold">LOAD</span>
                <span className="text-[10px] font-mono">{perfMetrics.loadTime}s</span>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl flex flex-col items-center gap-1">
                <Gauge size={14} className="text-purple-400" />
                <span className="text-[8px] text-zinc-500 font-bold">API</span>
                <span className="text-[10px] font-mono">{perfMetrics.latency}ms</span>
              </div>
            </div>

            <div className="bg-black rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-3 opacity-50"><Activity size={12}/><span className="text-[9px] font-black uppercase">Live Logs</span></div>
              <div className="max-h-32 overflow-y-auto space-y-2 font-mono text-[9px] text-zinc-400 custom-scroll pr-2">
                {logs.map((l, i) => <div key={i} className="border-l border-white/10 pl-2 py-0.5">{l}</div>)}
              </div>
            </div>
            
            <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-[1.2rem] hover:bg-white/10 transition-all group">
              <div className="flex items-center gap-3"><Users size={16} className="group-hover:text-purple-500"/><span className="text-[10px] font-black uppercase tracking-widest">Database Users</span></div>
              <span className="bg-purple-500 text-white px-2 py-0.5 rounded-full text-[8px] font-bold">LIST</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const useXalanify = () => {
  const context = useContext(XalanifyContext);
  if (!context) throw new Error("useXalanify error");
  return context;
};