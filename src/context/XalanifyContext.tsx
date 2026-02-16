"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Loader2, Activity, ShieldAlert } from "lucide-react";
import Auth from "@/components/Auth";

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
  
  // Estados de Reprodução
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Estados de Personalização (Novos)
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [bgMode, setBgMode] = useState<'vivid' | 'pure' | 'gradient'>('vivid');
  const [glassIntensity, setGlassIntensity] = useState(30);
  
  // Dados
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchResults, setSearchResults] = useState<Track[]>([]);

  const addLog = (m: string) => setLogs(p => [`[${new Date().toLocaleTimeString()}] ${m}`, ...p].slice(0, 50));

  useEffect(() => {
    // Monitor de Performance (Original)
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
    try {
      const { data: likes } = await supabase.from('liked_tracks').select('track_data').eq('user_id', user?.id);
      if (likes) setLikedTracks(likes.map(l => l.track_data));
      
      const { data: pList } = await supabase.from('playlists').select('*').eq('user_id', user?.id);
      if (pList) setPlaylists(pList.map(p => ({ id: p.id, name: p.name, tracks: p.tracks_json || [] })));
      addLog("Sincronização com Supabase completa");
    } catch (e) {
      addLog("Erro ao carregar dados remotos");
    }
  };

 const createPlaylist = async (name: string) => {
  if (!user) return;
  const { data, error } = await supabase
    .from('playlists')
    .insert({ 
      user_id: user.id, 
      name: name, 
      tracks_json: [] // Garante que a coluna na DB é tracks_json
    })
    .select()
    .single();

  if (!error && data) {
    setPlaylists(prev => [...prev, { id: data.id, name: data.name, tracks: [] }]);
    addLog(`Playlist "${name}" criada!`);
  } else {
    addLog(`Erro ao criar playlist: ${error?.message || "Erro desconhecido"}`);
  }
};

const addTrackToPlaylist = async (playlistId: string, track: Track) => {
  const playlist = playlists.find(p => p.id === playlistId);
  if (!playlist) return;

  const updatedTracks = [...playlist.tracks, track];

  const { error } = await supabase
    .from('playlists')
    .update({ tracks_json: updatedTracks })
    .eq('id', playlistId);

  if (!error) {
    setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, tracks: updatedTracks } : p));
    addLog(`Adicionado a ${playlist.name}`);
  }
};

  // Dentro do XalanifyContext.tsx

const toggleLike = async (track: Track) => {
  if (!user) return;

  const isLiked = likedTracks.some((t) => t.id === track.id);

  if (isLiked) {
    const { error } = await supabase
      .from("liked_tracks")
      .delete()
      .eq("user_id", user.id)
      .eq("track_id", track.id); // Usando track_id como na tua DB

    if (!error) {
      setLikedTracks(prev => prev.filter(t => t.id !== track.id));
      addLog(`Removido: ${track.title}`);
    }
  } else {
    const { error } = await supabase
      .from("liked_tracks")
      .insert({ 
        user_id: user.id, 
        track_id: track.id, // ID do Spotify
        username: user.email?.split('@')[0], // Nome derivado do email
        track_data: track // O JSON completo
      });

    if (!error) {
      setLikedTracks(prev => [...prev, track]);
      addLog(`Adicionado aos favoritos: ${track.title}`);
    } else {
      console.error("Erro Supabase Like:", error.message);
    }
  }
};

  const playNext = () => {
    const idx = searchResults.findIndex(t => t.id === currentTrack?.id);
    if (idx !== -1 && idx < searchResults.length - 1) setCurrentTrack(searchResults[idx+1]);
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
          ${bgMode === 'pure' ? 'bg-black' : bgMode === 'gradient' ? 'bg-zinc-950' : 'bg-zinc-950'}`}>
          
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
      <button onClick={() => setShow(!show)} className="w-10 h-10 glass rounded-full flex items-center justify-center border border-white/10 shadow-2xl">
        <Activity size={16} style={{color: themeColor}} />
      </button>
      {show && (
        <div className="absolute top-12 right-0 w-64 glass p-4 rounded-[2rem] animate-in zoom-in-95">
          <div className="flex gap-2 mb-3">
            <div className="flex-1 bg-white/5 p-2 rounded-xl text-[8px] font-mono text-center text-zinc-400">RAM: {perfMetrics.memory}</div>
            <div className="flex-1 bg-white/5 p-2 rounded-xl text-[8px] font-mono text-center text-zinc-400">PING: {perfMetrics.latency}ms</div>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1 custom-scroll">
            {logs.map((l, i) => (
              <p key={i} className="text-[7px] font-mono opacity-40 leading-tight"> {l} </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const useXalanify = () => useContext(XalanifyContext)!;