"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Loader2, ShieldCheck, Users, Activity, Trash2, Cpu, Zap, Gauge, Plus } from "lucide-react";
import Auth from "@/components/Auth";

export interface Track {
  id: string; title: string; artist: string; thumbnail: string;
  youtubeId?: string; audioUrl?: string; isLocal?: boolean;
}

export interface Playlist { id: string; name: string; tracks: Track[]; image?: string; isSystem?: boolean; }

interface XalanifyContextType {
  user: User | null; isAdmin: boolean; logs: string[]; addLog: (m: string) => void;
  currentTrack: Track | null; setCurrentTrack: (t: Track | null) => void;
  isPlaying: boolean; setIsPlaying: (p: boolean) => void;
  progress: number; setProgress: (v: number) => void;
  duration: number; setDuration: (v: number) => void;
  isExpanded: boolean; setIsExpanded: (v: boolean) => void;
  themeColor: string; setThemeColor: (c: string) => void;
  bgMode: 'gradient' | 'pure' | 'vivid'; setBgMode: (m: any) => void;
  glassIntensity: number; setGlassIntensity: (v: number) => void;
  likedTracks: Track[]; toggleLike: (t: Track) => void;
  playlists: Playlist[]; createPlaylist: (n: string) => void;
  searchResults: Track[]; setSearchResults: (t: Track[]) => void;
  playNext: () => void; playPrevious: () => void;
  perfMetrics: any; setPerfMetrics: (m: any) => void;
  logout: () => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>(["Xalanify: Engine v3 (Lyrics) Active"]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [bgMode, setBgMode] = useState<'gradient' | 'pure' | 'vivid'>('vivid');
  const [glassIntensity, setGlassIntensity] = useState(25);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [perfMetrics, setPerfMetricsState] = useState({ loadTime: 0, memory: "0MB", latency: 0 });

  const isAdmin = user?.email === "adminx@adminx.com";
  const addLog = (m: string) => setLogs(p => [`[${new Date().toLocaleTimeString()}] ${m}`, ...p].slice(0, 50));

  useEffect(() => {
    document.documentElement.style.setProperty('--theme-color', themeColor);
    document.documentElement.style.setProperty('--glass-blur', `${glassIntensity}px`);
  }, [themeColor, glassIntensity]);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
  }, []);

  const toggleLike = async (track: Track) => {
    const isLiked = likedTracks.some(t => t.id === track.id);
    if (isLiked) {
      setLikedTracks(prev => prev.filter(t => t.id !== track.id));
      await supabase.from('liked_tracks').delete().eq('user_id', user?.id).match({ 'track_data->id': track.id });
    } else {
      setLikedTracks(prev => [track, ...prev]);
      await supabase.from('liked_tracks').insert({ user_id: user?.id, track_data: track });
    }
  };

  const playNext = () => {
    const idx = searchResults.findIndex(t => t.id === currentTrack?.id);
    if (idx !== -1 && idx < searchResults.length - 1) {
        setCurrentTrack(searchResults[idx+1]);
        setIsPlaying(true);
    }
  };

  return (
    <XalanifyContext.Provider value={{
      user, isAdmin, logs, addLog, currentTrack, setCurrentTrack, isPlaying, setIsPlaying,
      progress, setProgress, duration, setDuration, isExpanded, setIsExpanded,
      themeColor, setThemeColor, bgMode, setBgMode, glassIntensity, setGlassIntensity,
      likedTracks, toggleLike, playlists, createPlaylist: async(n) => {},
      searchResults, setSearchResults, playNext, playPrevious: () => {},
      perfMetrics, setPerfMetrics: (m:any) => setPerfMetricsState(p => ({...p, ...m})),
      logout: () => supabase.auth.signOut()
    }}>
      {authLoading ? <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" /></div> : (
        <div className={`h-screen w-full text-white flex flex-col overflow-hidden transition-all duration-1000 ${bgMode === 'pure' ? 'bg-black' : 'bg-[#050505]'}`}>
          {bgMode !== 'pure' && (
            <div className="fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full opacity-30 blur-[120px] animate-pulse" style={{backgroundColor: themeColor}} />
              <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[100px]" style={{backgroundColor: themeColor}} />
            </div>
          )}
          <div className="flex-1 overflow-y-auto custom-scroll pb-40 relative z-10">
            {children}
            {isAdmin && <AdminDebug />}
          </div>
        </div>
      )}
    </XalanifyContext.Provider>
  );
}

function AdminDebug() {
    const { logs, themeColor, perfMetrics } = useXalanify();
    const [open, setOpen] = useState(false);
    return (
      <div className="fixed top-6 right-6 z-[1000]">
        <button onClick={() => setOpen(!open)} className="w-10 h-10 glass rounded-full flex items-center justify-center border border-white/10">
          <Activity size={16} style={{color: themeColor}} />
        </button>
        {open && (
          <div className="absolute top-12 right-0 w-64 glass p-4 rounded-[2rem] shadow-2xl animate-in zoom-in-95">
            <div className="flex gap-2 mb-3">
               <div className="flex-1 bg-white/5 p-2 rounded-xl text-[9px] text-center font-mono">CPU: {perfMetrics.memory}</div>
               <div className="flex-1 bg-white/5 p-2 rounded-xl text-[9px] text-center font-mono">LAT: {perfMetrics.latency}ms</div>
            </div>
            <div className="max-h-32 overflow-y-auto text-[8px] font-mono opacity-40">{logs.map((l, i) => <div key={i}>{l}</div>)}</div>
          </div>
        )}
      </div>
    );
}

export const useXalanify = () => {
    const context = useContext(XalanifyContext);
    if (!context) throw new Error("Context error");
    return context;
};