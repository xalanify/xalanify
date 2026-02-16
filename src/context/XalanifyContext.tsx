"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Loader2, ShieldCheck, Users, Activity, Trash2, Cpu, Zap, Gauge, ChevronRight, Globe, Plus } from "lucide-react";
import Auth from "@/components/Auth";

export interface Track {
  id: string; title: string; artist: string; thumbnail: string;
  youtubeId?: string; audioUrl?: string; isLocal?: boolean;
}

export interface Playlist { id: string; name: string; tracks: Track[]; image?: string; isSystem?: boolean; }

interface PerfMetrics { loadTime: number; memory: string; latency: number; }

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
  playNext: () => void; playPrevious: () => void;
  perfMetrics: PerfMetrics; setPerfMetrics: (m: Partial<PerfMetrics>) => void;
  logout: () => void;
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
  const [perfMetrics, setPerfMetricsState] = useState<PerfMetrics>({ loadTime: 0, memory: "0MB", latency: 0 });

  const isAdmin = user?.email === "adminx@adminx.com";
  const addLog = (m: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${m}`, ...prev].slice(0, 50));
  const setPerfMetrics = (m: Partial<PerfMetrics>) => setPerfMetricsState(prev => ({ ...prev, ...m }));

  // Aplicar cor do tema ao CSS
  useEffect(() => {
    document.documentElement.style.setProperty('--theme-color', themeColor);
  }, [themeColor]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if(u) syncUserProfile(u);
    });

    // Monitor de Memória
    const memInterval = setInterval(() => {
      const mem = (performance as any).memory;
      if (mem) setPerfMetrics({ memory: Math.round(mem.usedJSHeapSize / 1048576) + "MB" });
    }, 5000);
    return () => clearInterval(memInterval);
  }, []);

  useEffect(() => { if (user) loadUserData(); }, [user]);

  const syncUserProfile = async (u: User) => {
    await supabase.from('profiles').upsert({ id: u.id, email: u.email, last_seen: new Date() });
  };

  const loadUserData = async () => {
    const { data: likes } = await supabase.from('liked_tracks').select('track_data').eq('user_id', user?.id);
    if (likes) setLikedTracks(likes.map(l => l.track_data));
    const { data: pList } = await supabase.from('playlists').select('*').eq('user_id', user?.id);
    if (pList) setPlaylists(pList.map(p => ({ id: p.id, name: p.name, tracks: p.tracks_json || [], image: p.image_url })));
  };

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

  const createPlaylist = async (name: string) => {
    const { data } = await supabase.from('playlists').insert({ user_id: user?.id, name, tracks_json: [] }).select().single();
    if (data) setPlaylists([{ id: data.id, name: data.name, tracks: [], image: data.image_url }, ...playlists]);
  };

  const addTrackToPlaylist = async (pId: string, track: Track) => {
    const playlist = playlists.find(p => p.id === pId);
    if (!playlist) return;
    const newTracks = [...playlist.tracks, track];
    await supabase.from('playlists').update({ tracks_json: newTracks }).eq('id', pId);
    setPlaylists(playlists.map(p => p.id === pId ? { ...p, tracks: newTracks } : p));
  };

  const playNext = () => {
    const idx = searchResults.findIndex(t => t.id === currentTrack?.id);
    if (idx !== -1 && idx < searchResults.length - 1) {
        setCurrentTrack(searchResults[idx + 1]);
        setIsPlaying(true);
        addLog(`Autoplay: ${searchResults[idx + 1].title}`);
    }
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
        <div className="h-screen w-full bg-black text-white flex flex-col overflow-hidden font-sans">
          <div className="flex-1 custom-scroll relative pb-40">
            {children}
            {isAdmin && <AdminDebugMenu />}
          </div>
        </div>
      )}
    </XalanifyContext.Provider>
  );
}

function AdminDebugMenu() {
    const { logs, themeColor, perfMetrics, addLog } = useXalanify();
    const [show, setShow] = useState(false);
    const [view, setView] = useState<'main' | 'users'>('main');
    const [dbUsers, setDbUsers] = useState<any[]>([]);
  
    const fetchUsers = async () => {
      setView('users');
      const { data } = await supabase.from('profiles').select('*');
      if (data) setDbUsers(data);
    };
  
    return (
      <div className="fixed top-8 right-8 z-[1000]">
        <button onClick={() => setShow(!show)} className="w-12 h-12 glass rounded-full flex items-center justify-center border-2 transition-transform active:scale-90 shadow-2xl" style={{borderColor: themeColor}}>
          <Activity size={20} style={{color: themeColor}} />
        </button>
        {show && (
          <div className="absolute top-16 right-0 w-80 glass rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 text-red-500">
              <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={16}/> Admin Panel</span>
              {view === 'users' && <button onClick={() => setView('main')} className="text-[8px] font-bold bg-white/10 px-3 py-1 rounded-full text-white">VOLTAR</button>}
            </div>
  
            {view === 'main' ? (
              <div className="space-y-4">
                 <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/5 p-3 rounded-2xl text-center"><Cpu size={14} className="mx-auto mb-1 text-blue-400"/><span className="text-[10px] font-mono">{perfMetrics.memory}</span></div>
                    <div className="bg-white/5 p-3 rounded-2xl text-center"><Zap size={14} className="mx-auto mb-1 text-yellow-400"/><span className="text-[10px] font-mono">{perfMetrics.loadTime}s</span></div>
                    <div className="bg-white/5 p-3 rounded-2xl text-center"><Gauge size={14} className="mx-auto mb-1 text-purple-400"/><span className="text-[10px] font-mono">{perfMetrics.latency}ms</span></div>
                 </div>
                 <div className="bg-black/40 rounded-2xl p-4 border border-white/5 max-h-32 overflow-y-auto text-[9px] font-mono text-zinc-500 custom-scroll">
                    {logs.map((l, i) => <div key={i} className="mb-1 border-b border-white/5 pb-1">{l}</div>)}
                 </div>
                 <button onClick={fetchUsers} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl text-[10px] font-bold hover:bg-white/10 transition-all">
                    DATABASE USERS <Users size={16}/>
                 </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scroll pr-2">
                 {dbUsers.map((u, i) => (
                   <div key={i} className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-bold truncate">{u.email}</p>
                        <p className="text-[7px] opacity-40 uppercase">Visto: {new Date(u.last_seen).toLocaleTimeString()}</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_green]"/>
                   </div>
                 ))}
              </div>
            )}
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