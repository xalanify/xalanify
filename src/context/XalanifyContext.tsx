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
  duration: number;
  setDuration: (v: number) => void;
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
  createPlaylist: (n: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  searchResults: Track[]; 
  setSearchResults: (t: Track[]) => void;
  playNext: () => void; 
  playPrevious: () => void;
  logout: () => void;
  perfMetrics: any; 
  setPerfMetrics: (m: any) => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>(["Sistemas Inicializados"]);
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
  const [perfMetrics, setPerfMetricsState] = useState({ loadTime: 0, memory: "128MB", latency: 0 });

  const isAdmin = user?.email === "adminx@adminx.com";
  const addLog = (m: string) => setLogs(p => [`[${new Date().toLocaleTimeString()}] ${m}`, ...p].slice(0, 50));

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null));
  }, []);

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    try {
      const { data: likes, error: e1 } = await supabase.from('liked_tracks').select('track_data').eq('user_id', user?.id);
      if (e1) throw e1;
      if (likes) setLikedTracks(likes.map(l => l.track_data));

      const { data: pList, error: e2 } = await supabase.from('playlists').select('*').eq('user_id', user?.id);
      if (e2) throw e2;
      if (pList) setPlaylists(pList.map(p => ({ id: p.id, name: p.name, tracks: p.tracks_json || [] })));
    } catch (err: any) {
      addLog("Erro Supabase: Verifique as tabelas/RLS");
      console.error("Erro ao carregar dados:", err.message);
    }
  };

  const createPlaylist = async (name: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('playlists').insert({ user_id: user.id, name, tracks_json: [] }).select().single();
      if (error) throw error;
      if (data) {
        setPlaylists(p => [{ id: data.id, name: data.name, tracks: [] }, ...p]);
        addLog(`Playlist ${name} criada.`);
      }
    } catch (err) { addLog("Falha ao criar playlist."); }
  };

  const addTrackToPlaylist = async (playlistId: string, track: Track) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;
    const updatedTracks = [...playlist.tracks, track];
    try {
      const { error } = await supabase.from('playlists').update({ tracks_json: updatedTracks }).eq('id', playlistId);
      if (error) throw error;
      setPlaylists(p => p.map(pl => pl.id === playlistId ? { ...pl, tracks: updatedTracks } : pl));
      addLog("Música adicionada!");
    } catch (err) { addLog("Erro ao salvar música na playlist."); }
  };

  // Funções de auxílio
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
      likedTracks, toggleLike, playlists, createPlaylist, addTrackToPlaylist, searchResults, setSearchResults, 
      playNext, playPrevious, perfMetrics, setPerfMetrics: (m:any) => setPerfMetricsState(p => ({...p, ...m})),
      logout: () => supabase.auth.signOut()
    }}>
      {authLoading ? (
        <div className="h-screen bg-black flex items-center justify-center">
            <Loader2 className="animate-spin text-purple-500" />
        </div>
      ) : !user ? <Auth /> : (
        <div className={`h-screen w-full text-white flex flex-col overflow-hidden transition-all duration-1000 ${bgMode === 'pure' ? 'bg-black' : 'bg-zinc-950'}`}>
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
      <button onClick={() => setShow(!show)} className="w-10 h-10 glass rounded-full flex items-center justify-center border border-white/10 shadow-2xl">
        <Activity size={16} style={{color: themeColor}} />
      </button>
      {show && (
        <div className="absolute top-12 right-0 w-64 glass p-4 rounded-[2rem] animate-in zoom-in-95 border border-white/10">
          <p className="text-[10px] font-bold mb-2 opacity-50 uppercase">Logs de Sistema</p>
          <div className="max-h-40 overflow-y-auto text-[8px] font-mono space-y-1">
            {logs.map((l, i) => <div key={i} className="border-l border-white/10 pl-2">{l}</div>)}
          </div>
        </div>
      )}
    </div>
  );
}

export const useXalanify = () => useContext(XalanifyContext)!;