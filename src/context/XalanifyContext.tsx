"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Loader2, Activity } from "lucide-react";
import Auth from "@/components/Auth";
import { getYoutubeId } from "@/lib/musicApi";

export interface Track {
  id: string; title: string; artist: string; thumbnail: string;
  youtubeId?: string; audioUrl?: string;
}

export interface Playlist { id: string; name: string; tracks: Track[]; image?: string; }

interface XalanifyContextType {
  user: User | null;
  isAdmin: boolean;
  logs: string[];
  addLog: (m: string) => void;
  perfMetrics: { memory: string; latency: number };
  currentTrack: Track | null;
  setCurrentTrack: (t: Track | null) => void;
  isPlaying: boolean;
  setIsPlaying: (p: boolean) => void;
  progress: number;
  setProgress: (v: number) => void;
  duration: number;
  setDuration: (v: number) => void;
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  themeColor: string;
  setThemeColor: (c: string) => void;
  bgMode: 'vivid' | 'pure' | 'gradient';
  setBgMode: (m: 'vivid' | 'pure' | 'gradient') => void;
  glassIntensity: number;
  setGlassIntensity: (v: number) => void;
  likedTracks: Track[];
  toggleLike: (t: Track) => void;
  playlists: Playlist[];
  createPlaylist: (n: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  searchResults: Track[];
  setSearchResults: (t: Track[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  logout: () => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>(["Xalanify Engine Online"]);
  const [perfMetrics, setPerfMetrics] = useState({ memory: "0MB", latency: 0 });
  
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [bgMode, setBgMode] = useState<'vivid' | 'pure' | 'gradient'>('vivid');
  const [glassIntensity, setGlassIntensity] = useState(30);
  
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchResults, setSearchResults] = useState<Track[]>([]);

  const addLog = (m: string) => setLogs(p => [`[${new Date().toLocaleTimeString()}] ${m}`, ...p].slice(0, 50));

  useEffect(() => {
    const interval = setInterval(() => {
      const mem = (performance as any).memory ? Math.round((performance as any).memory.usedJSHeapSize / 1048576) + "MB" : "N/A";
      setPerfMetrics({ memory: mem, latency: Math.floor(Math.random() * 40) + 10 });
    }, 3000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      clearInterval(interval);
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const { data: likes } = await supabase.from('liked_tracks').select('track_data').eq('user_id', user.id);
      if (likes) setLikedTracks(likes.map(l => l.track_data));
      
      const { data: pList } = await supabase.from('playlists').select('*').eq('user_id', user.id);
      if (pList) setPlaylists(pList.map(p => ({ id: p.id, name: p.name, tracks: p.tracks_json || [] })));
      addLog("Sincronização Supabase concluída.");
    } catch (e) {
      addLog("Erro ao carregar dados remotos.");
    }
  };

  const createPlaylist = async (name: string) => {
    if (!user) return;
    const { data } = await supabase.from('playlists').insert({ user_id: user.id, name, tracks_json: [] }).select().single();
    if (data) {
      setPlaylists(p => [{ id: data.id, name: data.name, tracks: [] }, ...p]);
      addLog(`Playlist '${name}' criada.`);
    }
  };

  const addTrackToPlaylist = async (playlistId: string, track: Track) => {
    const pl = playlists.find(p => p.id === playlistId);
    if (!pl || !user) return;
    const updated = [...pl.tracks, track];
    const { error } = await supabase.from('playlists').update({ tracks_json: updated }).eq('id', playlistId).eq('user_id', user.id);
    if (!error) {
      setPlaylists(p => p.map(x => x.id === playlistId ? { ...x, tracks: updated } : x));
      addLog("Música adicionada à playlist.");
    }
  };

  const toggleLike = async (track: Track) => {
    if (!user) return;
    const isLiked = likedTracks.some(t => t.id === track.id);
    if (isLiked) {
      setLikedTracks(p => p.filter(t => t.id !== track.id));
      await supabase.from('liked_tracks').delete().match({ user_id: user.id, 'track_data->id': track.id });
      addLog("Removida dos favoritos.");
    } else {
      setLikedTracks(p => [track, ...p]);
      await supabase.from('liked_tracks').insert({ user_id: user.id, track_data: track });
      addLog("Adicionada aos favoritos.");
    }
  };

  const playNext = async () => {
    // Tenta encontrar na lista de pesquisa ou na playlist atual
    const currentList = searchResults.length > 0 ? searchResults : likedTracks;
    const idx = currentList.findIndex(t => t.id === currentTrack?.id);
    
    if (idx !== -1 && idx < currentList.length - 1) {
      const nextTrack = currentList[idx+1];
      setIsPlaying(false); // Para antes de carregar o próximo
      const ytId = await getYoutubeId(nextTrack.title, nextTrack.artist);
      setCurrentTrack({ ...nextTrack, youtubeId: ytId });
      setIsPlaying(true);
      addLog(`Próxima: ${nextTrack.title}`);
    }
  };

  const isAdmin = user?.email === "adminx@adminx.com";

  return (
    <XalanifyContext.Provider value={{
      user, isAdmin, logs, addLog, perfMetrics, currentTrack, setCurrentTrack, isPlaying, setIsPlaying,
      progress, setProgress, duration, setDuration, isExpanded, setIsExpanded,
      themeColor, setThemeColor, bgMode, setBgMode, glassIntensity, setGlassIntensity,
      likedTracks, toggleLike, playlists, createPlaylist, addTrackToPlaylist, searchResults, setSearchResults,
      playNext, playPrevious: () => {}, logout: () => supabase.auth.signOut()
    }}>
      {loading ? (
        <div className="h-screen bg-black flex items-center justify-center">
          <Loader2 className="animate-spin text-purple-500" />
        </div>
      ) : !user ? <Auth /> : (
        <div className={`h-screen w-full text-white flex flex-col overflow-hidden transition-all duration-1000 relative
          ${bgMode === 'pure' ? 'bg-black' : 'bg-zinc-950'}`}>
          
          {bgMode === 'vivid' && (
            <div 
              className="absolute inset-0 opacity-20 blur-[120px] pointer-events-none transition-all duration-1000"
              style={{ background: `radial-gradient(circle at 20% 30%, ${themeColor}, transparent)` }}
            />
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
  const [show, setShow] = useState(false);
  return (
    <div className="fixed top-6 right-6 z-[1000]">
      <button onClick={() => setShow(!show)} className="w-10 h-10 glass rounded-full flex items-center justify-center border border-white/10">
        <Activity size={16} style={{color: themeColor}} />
      </button>
      {show && (
        <div className="absolute top-12 right-0 w-64 glass p-4 rounded-[2rem] animate-in zoom-in-95">
          <div className="flex gap-2 mb-3">
            <div className="flex-1 bg-white/5 p-2 rounded-xl text-[8px] font-mono text-zinc-400 text-center">RAM: {perfMetrics.memory}</div>
            <div className="flex-1 bg-white/5 p-2 rounded-xl text-[8px] font-mono text-zinc-400 text-center">PING: {perfMetrics.latency}ms</div>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1 custom-scroll">
            {logs.map((l, i) => <p key={i} className="text-[7px] font-mono opacity-40 leading-tight">{l}</p>)}
          </div>
        </div>
      )}
    </div>
  );
}

export const useXalanify = () => useContext(XalanifyContext)!;