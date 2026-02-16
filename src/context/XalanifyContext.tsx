"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import Auth from "@/components/Auth";

export interface Track {
  id: string; title: string; artist: string; thumbnail: string; youtubeId?: string;
}
export interface Playlist { id: string; name: string; tracks: Track[]; }

interface XalanifyContextType {
  user: User | null;
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
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
  bgMode: 'vivid' | 'pure' | 'gradient' | 'animated';
  setBgMode: (m: 'vivid' | 'pure' | 'gradient' | 'animated') => void;
  likedTracks: Track[];
  playlists: Playlist[];
  searchResults: Track[];
  setSearchResults: (t: Track[]) => void;
  toggleLike: (t: Track) => Promise<void>;
  createPlaylist: (name: string) => Promise<void>;
  addTrackToPlaylist: (pId: string, track: Track) => Promise<void>;
  playNext: () => void;
  playPrevious: () => void;
  activeQueue: Track[];
  setActiveQueue: (t: Track[]) => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [bgMode, setBgMode] = useState<'vivid' | 'pure' | 'gradient' | 'animated'>('vivid');
  const [currentTrack, setCurrentTrackState] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activeQueue, setActiveQueue] = useState<Track[]>([]);
  const [perfMetrics, setPerfMetrics] = useState({ memory: '0MB', latency: 0 });

  const addLog = (m: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${m}`, ...prev].slice(0, 50));

  const setCurrentTrack = (track: Track | null) => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTrackState(track);
    if (track) {
        addLog(`A carregar: ${track.title}`);
        // Pequeno delay para garantir que o componente de áudio reinicie
        setTimeout(() => setIsPlaying(true), 300);
    }
  };

  // Carregar dados do Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: liked } = await supabase.from('liked_tracks').select('track_data').eq('user_id', user.id);
      if (liked) setLikedTracks(liked.map(l => l.track_data));
      const { data: plays } = await supabase.from('playlists').select('*').eq('user_id', user.id);
      if (plays) setPlaylists(plays.map(p => ({ id: p.id, name: p.name, tracks: p.tracks_json || [] })));
    };
    fetchData();
  }, [user]);

  // FUNÇÃO CRÍTICA: Próxima Música
  const playNext = useCallback(() => {
    if (activeQueue.length === 0) return;
    const currentIndex = activeQueue.findIndex(t => t.id === currentTrack?.id);
    
    if (currentIndex !== -1 && currentIndex < activeQueue.length - 1) {
      setCurrentTrack(activeQueue[currentIndex + 1]);
    } else {
      // Se for a última, para ou volta ao início
      setIsPlaying(false);
      setProgress(0);
    }
  }, [currentTrack, activeQueue]);

  const playPrevious = useCallback(() => {
    if (activeQueue.length === 0) return;
    const currentIndex = activeQueue.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex > 0) {
      setCurrentTrack(activeQueue[currentIndex - 1]);
    }
  }, [currentTrack, activeQueue]);

  const toggleLike = async (track: Track) => {
    if (!user) return;
    const isLiked = likedTracks.some(t => t.id === track.id);
    if (isLiked) {
      setLikedTracks(prev => prev.filter(t => t.id !== track.id));
      await supabase.from('liked_tracks').delete().eq('user_id', user.id).filter('track_data->>id', 'eq', track.id);
    } else {
      setLikedTracks(prev => [...prev, track]);
      await supabase.from('liked_tracks').insert({ user_id: user.id, track_data: track });
    }
  };

  const createPlaylist = async (name: string) => {
    if (!user) return;
    const { data, error } = await supabase.from('playlists').insert({ user_id: user.id, name, tracks_json: [] }).select().single();
    if (!error && data) setPlaylists(prev => [...prev, { id: data.id, name: data.name, tracks: [] }]);
  };

  const addTrackToPlaylist = async (pId: string, track: Track) => {
    const playlist = playlists.find(p => p.id === pId);
    if (!playlist) return;
    const updatedTracks = [...playlist.tracks, track];
    const { error } = await supabase.from('playlists').update({ tracks_json: updatedTracks }).eq('id', pId);
    if (!error) setPlaylists(prev => prev.map(p => p.id === pId ? { ...p, tracks: updatedTracks } : p));
  };

  const value = {
    user, isAdmin, setIsAdmin, logs, addLog, perfMetrics,
    currentTrack, setCurrentTrack, isPlaying, setIsPlaying,
    progress, setProgress, duration, setDuration,
    isExpanded, setIsExpanded, themeColor, setThemeColor,
    bgMode, setBgMode, likedTracks, playlists, searchResults, setSearchResults,
    toggleLike, createPlaylist, addTrackToPlaylist, playNext, playPrevious,
    activeQueue, setActiveQueue
  };

  if (authLoading) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-white opacity-20" size={32} /></div>;

  return (
    <XalanifyContext.Provider value={value}>
      {!user ? <Auth /> : (
        <div className={`h-screen text-white overflow-hidden relative transition-colors duration-1000 ${bgMode === 'pure' ? 'bg-black' : 'bg-[#050505]'}`}>
          <div className="relative z-10 h-full overflow-hidden flex flex-col">{children}</div>
        </div>
      )}
    </XalanifyContext.Provider>
  );
}

export const useXalanify = () => {
  const context = useContext(XalanifyContext);
  if (!context) throw new Error("useXalanify error");
  return context;
};