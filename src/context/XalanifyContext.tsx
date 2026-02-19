"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import Auth from "@/components/Auth";

export interface Track {
  id: string; title: string; artist: string; thumbnail: string;
  youtubeId?: string; audioUrl?: string;
}

export interface Playlist { id: string; name: string; tracks: Track[]; image?: string; }

interface XalanifyContextType {
  user: User | null;
  isAdmin: boolean;
  showDebug: boolean;
  setShowDebug: (v: boolean) => void;
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
  likedTracks: Track[];
  toggleLike: (t: Track) => void;
  playlists: Playlist[];
  createPlaylist: (n: string) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  searchResults: Track[];
  setSearchResults: (t: Track[]) => void;
  activeQueue: Track[];
  setActiveQueue: (tracks: Track[]) => void;
  playNext: () => void;
  playPrevious: () => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDebug, setShowDebug] = useState(false);
  const [logs, setLogs] = useState<string[]>(["Xalanify Engine Online"]);
  const [perfMetrics, setPerfMetrics] = useState({ memory: "0MB", latency: 0 });
  
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [bgMode, setBgMode] = useState<'vivid' | 'pure' | 'gradient'>('vivid');
  
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [activeQueue, setActiveQueue] = useState<Track[]>([]);

  const addLog = (m: string) => setLogs(p => [`[${new Date().toLocaleTimeString()}] ${m}`, ...p].slice(0, 50));

  useEffect(() => {
    const savedColor = localStorage.getItem("xalanify_theme");
    if (savedColor) setThemeColor(savedColor);

    const interval = setInterval(() => {
      const mem = (performance as any).memory ? Math.round((performance as any).memory.usedJSHeapSize / 1048576) + "MB" : "N/A";
      setPerfMetrics({ memory: mem, latency: Math.floor(Math.random() * 40) + 10 });
    }, 3000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { localStorage.setItem("xalanify_theme", themeColor); }, [themeColor]);
  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    if (!user) return;
    const { data: likes } = await supabase.from('liked_tracks').select('track_data').eq('user_id', user.id);
    if (likes) setLikedTracks(likes.map(l => l.track_data));
    const { data: pList } = await supabase.from('playlists').select('*').eq('user_id', user.id);
    if (pList) setPlaylists(pList.map(p => ({ id: p.id, name: p.name, tracks: p.tracks_json || [] })));
  };

  const createPlaylist = async (name: string) => {
    if (!user) return;
    const { data } = await supabase.from('playlists').insert({ user_id: user.id, name, tracks_json: [] }).select().single();
    if (data) {
      setPlaylists(p => [{ id: data.id, name: data.name, tracks: [] }, ...p]);
      addLog(`Playlist ${name} criada.`);
    }
  };

  const deletePlaylist = async (id: string) => {
    await supabase.from('playlists').delete().eq('id', id);
    setPlaylists(p => p.filter(x => x.id !== id));
    addLog("Playlist removida.");
  };

  const addTrackToPlaylist = async (playlistId: string, track: Track) => {
    const pl = playlists.find(p => p.id === playlistId);
    if (!pl) return;
    const updated = [...pl.tracks, track];
    await supabase.from('playlists').update({ tracks_json: updated }).eq('id', playlistId);
    setPlaylists(p => p.map(x => x.id === playlistId ? { ...x, tracks: updated } : x));
    addLog("Track adicionada à playlist.");
  };

  const removeTrackFromPlaylist = async (playlistId: string, trackId: string) => {
    const pl = playlists.find(p => p.id === playlistId);
    if (!pl) return;
    const updated = pl.tracks.filter(t => t.id !== trackId);
    await supabase.from('playlists').update({ tracks_json: updated }).eq('id', playlistId);
    setPlaylists(p => p.map(x => x.id === playlistId ? { ...x, tracks: updated } : x));
    addLog("Track removida da playlist.");
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

  return (
    <XalanifyContext.Provider value={{
      user, isAdmin: user?.email === "adminx@adminx.com", showDebug, setShowDebug, logs, addLog, perfMetrics,
      currentTrack, setCurrentTrack, isPlaying, setIsPlaying, progress, setProgress, duration, setDuration,
      isExpanded, setIsExpanded, themeColor, setThemeColor, bgMode, setBgMode,
      likedTracks, toggleLike, playlists, createPlaylist, deletePlaylist, addTrackToPlaylist,
      removeTrackFromPlaylist, searchResults, setSearchResults, activeQueue, setActiveQueue,
      playNext: () => {}, playPrevious: () => {}
    }}>
      {loading ? (
        <div className="h-screen bg-black flex items-center justify-center">
          <Loader2 className="animate-spin text-purple-500" />
        </div>
      ) : !user ? <Auth /> : (
        <div className={`h-screen w-full text-white flex flex-col overflow-hidden relative ${bgMode === 'pure' ? 'bg-black' : 'bg-[#050505]'}`}>
          {bgMode !== 'pure' && (
            <div className="absolute inset-0 opacity-20 blur-[120px] pointer-events-none"
              style={{ background: `radial-gradient(circle at 50% -20%, ${themeColor}, transparent)` }} />
          )}
          <div className="flex-1 overflow-y-auto relative z-10 custom-scroll pb-40">{children}</div>
          
          {showDebug && user?.email === "adminx@adminx.com" && (
            <div className="fixed top-4 left-4 z-[200] glass p-4 rounded-3xl text-[8px] font-mono w-48 pointer-events-none border border-white/10">
              <p className="text-red-500 font-bold mb-1">X-DEBUG ACTIVE</p>
              <p>RAM: {perfMetrics.memory}</p>
              <p>PING: {perfMetrics.latency}ms</p>
              <div className="mt-2 opacity-50 max-h-20 overflow-hidden">{logs[0]}</div>
            </div>
          )}
        </div>
      )}
    </XalanifyContext.Provider>
  );
}

export const useXalanify = () => useContext(XalanifyContext)!;