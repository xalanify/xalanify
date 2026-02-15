"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Loader2, ShieldCheck, Users, Activity, Trash2, Cpu, Zap, Gauge, ChevronRight, Globe } from "lucide-react";
import Auth from "@/components/Auth";

export interface Track {
  id: string; title: string; artist: string; thumbnail: string;
  youtubeId?: string; audioUrl?: string; isLocal?: boolean;
}

export interface Playlist { id: string; name: string; tracks: Track[]; image?: string; }

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
  logout: () => void;
  perfMetrics: PerfMetrics; setPerfMetrics: (m: Partial<PerfMetrics>) => void;
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));

    const memInterval = setInterval(() => {
      const mem = (performance as any).memory;
      if (mem) setPerfMetrics({ memory: Math.round(mem.usedJSHeapSize / 1048576) + "MB" });
    }, 5000);
    return () => clearInterval(memInterval);
  }, []);

  useEffect(() => { if (user) loadUserData(); }, [user]);

  const loadUserData = async () => {
    const { data: likes } = await supabase.from('liked_tracks').select('track_data').eq('user_id', user?.id);
    if (likes) setLikedTracks(likes.map(l => l.track_data));
    const { data: pList } = await supabase.from('playlists').select('*').eq('user_id', user?.id);
    if (pList) setPlaylists(pList.map(p => ({ id: p.id, name: p.name, tracks: p.tracks_json || [], image: p.image_url })));
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
      audioEngine, setAudioEngine, themeColor, setThemeColor, likedTracks, toggleLike: (t) => {},
      playlists, createPlaylist: () => {}, addTrackToPlaylist: () => {}, 
      searchResults, setSearchResults, persistentQuery, setPersistentQuery,
      playNext, playPrevious, perfMetrics, setPerfMetrics, logout: () => supabase.auth.signOut()
    }}>
      {authLoading ? (
        <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" /></div>
      ) : !user ? (
        <Auth />
      ) : (
        <div className="h-screen w-full bg-black text-white flex flex-col overflow-hidden">
          <div className="flex-1 custom-scroll relative pb-32">
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
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setView('users');
    addLog("Consultando base de dados de utilizadores...");
    // Nota: Requer que tenhas uma tabela 'profiles' ou similar exposta
    const { data, error } = await supabase.from('profiles').select('*').limit(20);
    if (data) setDbUsers(data);
    else addLog("Erro: Tabela 'profiles' não encontrada.");
    setLoadingUsers(false);
  };

  return (
    <div className="fixed top-6 right-6 z-[999]">
      <button onClick={() => setShow(!show)} className="w-12 h-12 rounded-full bg-black border-2 flex items-center justify-center shadow-2xl active:scale-90 transition-all" style={{ borderColor: themeColor }}>
        <span className="text-[8px] font-black italic">DEBUG</span>
      </button>

      {show && (
        <div className="absolute top-14 right-0 w-85 glass-panel rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200 min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-red-500">
              <ShieldCheck size={18}/><span className="text-[10px] font-black uppercase tracking-widest">Admin Panel</span>
            </div>
            {view === 'users' && (
              <button onClick={() => setView('main')} className="text-[8px] font-bold bg-white/10 px-3 py-1 rounded-full">VOLTAR</button>
            )}
          </div>

          {view === 'main' ? (
            <div className="space-y-5 flex-1">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/5 p-3 rounded-2xl flex flex-col items-center"><Cpu size={14} className="text-blue-400"/><span className="text-[9px] font-mono mt-1">{perfMetrics.memory}</span></div>
                <div className="bg-white/5 p-3 rounded-2xl flex flex-col items-center"><Zap size={14} className="text-yellow-400"/><span className="text-[9px] font-mono mt-1">{perfMetrics.loadTime}s</span></div>
                <div className="bg-white/5 p-3 rounded-2xl flex flex-col items-center"><Gauge size={14} className="text-purple-400"/><span className="text-[9px] font-mono mt-1">{perfMetrics.latency}ms</span></div>
              </div>

              <div className="bg-black/50 rounded-2xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-3 opacity-40"><Activity size={12}/><span className="text-[8px] font-bold uppercase">System Logs</span></div>
                <div className="max-h-24 overflow-y-auto space-y-1 font-mono text-[9px] text-zinc-500 custom-scroll pr-2">
                  {logs.map((l, i) => <div key={i} className="border-b border-white/5 pb-1">{l}</div>)}
                </div>
              </div>

              <button onClick={fetchUsers} className="w-full p-4 bg-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-3"><Users size={16} className="text-purple-500"/><span className="text-[10px] font-black uppercase">Database Users</span></div>
                <ChevronRight size={14} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all"/>
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 mb-4 px-2 opacity-50"><Globe size={12}/><span className="text-[8px] font-black uppercase">Registered Members</span></div>
              <div className="flex-1 overflow-y-auto custom-scroll space-y-2 pr-2">
                {loadingUsers ? (
                  <div className="flex justify-center py-10"><Loader2 className="animate-spin opacity-20"/></div>
                ) : dbUsers.length > 0 ? dbUsers.map((u, i) => (
                  <div key={i} className="p-3 bg-white/5 rounded-xl flex items-center justify-between group">
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-bold truncate">{u.email || 'Anónimo'}</p>
                      <p className="text-[7px] font-mono text-zinc-600 truncate">{u.id}</p>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"/>
                  </div>
                )) : (
                  <p className="text-[9px] text-center opacity-30 py-10 font-bold italic underline">Sem dados na tabela 'profiles'</p>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-white/5">
            <button className="w-full flex items-center justify-center gap-2 p-3 text-red-500/50 hover:text-red-500 transition-colors">
              <Trash2 size={12}/><span className="text-[8px] font-black uppercase tracking-tighter">Clear All System Logs</span>
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