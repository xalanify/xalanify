"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Loader2, Activity } from "lucide-react";
import Auth from "@/components/Auth";

export interface Track {
  id: string; title: string; artist: string; thumbnail: string;
  youtubeId?: string; audioUrl?: string;
}

export interface Playlist { id: string; name: string; tracks: Track[]; image?: string; }

// Interface COMPLETA para evitar erros de TS
interface XalanifyContextType {
  user: User | null; 
  isAdmin: boolean; 
  logs: string[]; 
  addLog: (m: string) => void;
  currentTrack: Track | null; 
  setCurrentTrack: (t: Track | null) => void;
  isPlaying: boolean; 
  setIsPlaying: (p: boolean) => void;
  progress: number; 
  setProgress: (v: number) => void;
  duration: number; // Adicionado
  setDuration: (v: number) => void; // Adicionado
  isExpanded: boolean; 
  setIsExpanded: (v: boolean) => void;
  themeColor: string; 
  setThemeColor: (c: string) => void;
  bgMode: 'vivid' | 'pure' | 'gradient'; 
  setBgMode: (m: any) => void;
  glassIntensity: number; 
  setGlassIntensity: (v: number) => void;
  likedTracks: Track[]; 
  toggleLike: (t: Track) => void;
  playlists: Playlist[]; 
  createPlaylist: (n: string) => void;
  searchResults: Track[]; 
  setSearchResults: (t: Track[]) => void;
  playNext: () => void; 
  playPrevious: () => void; // Adicionado
  logout: () => void;
  perfMetrics: any; 
  setPerfMetrics: (m: any) => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>(["System v4.1 Ready"]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0); // Estado real
  const [isExpanded, setIsExpanded] = useState(false);
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [bgMode, setBgMode] = useState<'vivid' | 'pure' | 'gradient'>('vivid');
  const [glassIntensity, setGlassIntensity] = useState(30);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [perfMetrics, setPerfMetricsState] = useState({ loadTime: 0, memory: "0MB", latency: 0 });

  const isAdmin = user?.email === "adminx@adminx.com";
  const addLog = (m: string) => setLogs(p => [`[${new Date().toLocaleTimeString()}] ${m}`, ...p].slice(0, 50));

  useEffect(() => {
    document.documentElement.style.setProperty('--theme-color', themeColor);
    document.documentElement.style.setProperty('--glass-blur', `${glassIntensity}px`);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null));
  }, [themeColor, glassIntensity]);

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    const { data: likes } = await supabase.from('liked_tracks').select('track_data').eq('user_id', user?.id);
    if (likes) setLikedTracks(likes.map(l => l.track_data));
    const { data: pList } = await supabase.from('playlists').select('*').eq('user_id', user?.id);
    if (pList) setPlaylists(pList.map(p => ({ id: p.id, name: p.name, tracks: p.tracks_json || [] })));
  };

  const toggleLike = async (track: Track) => {
    const isLiked = likedTracks.some(t => t.id === track.id);
    if (isLiked) {
      setLikedTracks(p => p.filter(t => t.id !== track.id));
      await supabase.from('liked_tracks').delete().match({ user_id: user?.id, 'track_data->id': track.id });
    } else {
      setLikedTracks(p => [track, ...p]);
      await supabase.from('liked_tracks').insert({ user_id: user?.id, track_data: track });
    }
  };

  const createPlaylist = async (name: string) => {
    const { data } = await supabase.from('playlists').insert({ user_id: user?.id, name, tracks_json: [] }).select().single();
    if (data) setPlaylists(p => [{ id: data.id, name: data.name, tracks: [] }, ...p]);
  };

  const playNext = () => {
    const idx = searchResults.findIndex(t => t.id === currentTrack?.id);
    if (idx !== -1 && idx < searchResults.length - 1) setCurrentTrack(searchResults[idx+1]);
  };

  const playPrevious = () => {
    const idx = searchResults.findIndex(t => t.id === currentTrack?.id);
    if (idx > 0) setCurrentTrack(searchResults[idx-1]);
  };

  return (
    <XalanifyContext.Provider value={{
      user, isAdmin, logs, addLog, currentTrack, setCurrentTrack, isPlaying, setIsPlaying,
      progress, setProgress, duration, setDuration, isExpanded, setIsExpanded, 
      themeColor, setThemeColor, bgMode, setBgMode, glassIntensity, setGlassIntensity, 
      likedTracks, toggleLike, playlists, createPlaylist, searchResults, setSearchResults, 
      playNext, playPrevious, perfMetrics, setPerfMetrics: (m:any) => setPerfMetricsState(p => ({...p, ...m})),
      logout: () => supabase.auth.signOut()
    }}>
      {authLoading ? <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin" /></div> : !user ? <Auth /> : (
        <div className={`h-screen w-full text-white flex flex-col overflow-hidden transition-all duration-1000 ${bgMode === 'pure' ? 'bg-black' : 'bg-zinc-950'}`}>
          {bgMode !== 'pure' && (
            <div className="fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[120px] animate-pulse" style={{backgroundColor: themeColor}} />
            </div>
          )}
          <div className="flex-1 overflow-y-auto relative z-10 custom-scroll pb-40">{children}</div>
          {isAdmin && <AdminHUD />}
        </div>
      )}
    </XalanifyContext.Provider>
  );
}

function AdminHUD() {
  const { logs, perfMetrics, themeColor } = useXalanify();
  const [show, setShow] = React.useState(false);
  return (
    <div className="fixed top-6 right-6 z-[1000]">
      <button onClick={() => setShow(!show)} className="w-10 h-10 glass rounded-full flex items-center justify-center border border-white/10 shadow-2xl"><Activity size={16} style={{color: themeColor}} /></button>
      {show && (
        <div className="absolute top-12 right-0 w-64 glass p-4 rounded-[2rem] animate-in zoom-in-95">
          <div className="flex gap-2 mb-3">
            <div className="flex-1 bg-white/5 p-2 rounded-xl text-[8px] font-mono text-center">RAM: {perfMetrics.memory}</div>
            <div className="flex-1 bg-white/5 p-2 rounded-xl text-[8px] font-mono text-center">PING: {perfMetrics.latency}ms</div>
          </div>
          <div className="max-h-24 overflow-y-auto text-[7px] font-mono opacity-40">{logs.map((l, i) => <div key={i}>{l}</div>)}</div>
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