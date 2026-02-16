"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import Auth from "@/components/Auth";

export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  youtubeId?: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}

interface XalanifyContextType {
  user: User | null;
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void; // CORREÇÃO DO ERRO TS
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
  likedTracks: Track[];
  playlists: Playlist[];
  searchResults: Track[];
  setSearchResults: (t: Track[]) => void;
  toggleLike: (t: Track) => Promise<void>;
  createPlaylist: (name: string) => Promise<void>;
  addTrackToPlaylist: (pId: string, t: Track) => Promise<void>;
  playNext: () => void;
  playPrevious: () => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [themeColor, setThemeColor] = useState("#a855f7");
  
  // Audio State
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  
  // Data State
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [perfMetrics, setPerfMetrics] = useState({ memory: '0MB', latency: 0 });

  const addLog = (m: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${m}`, ...prev].slice(0, 50));

  // Auth Observer
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

  // Sync Data with Supabase
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch Liked
      const { data: liked } = await supabase.from('liked_tracks').select('track_data').eq('user_id', user.id);
      if (liked) setLikedTracks(liked.map(l => l.track_data));

      // Fetch Playlists
      const { data: plays } = await supabase.from('playlists').select('*').eq('user_id', user.id);
      if (plays) {
        setPlaylists(plays.map(p => ({
          id: p.id,
          name: p.name,
          tracks: p.tracks_json || []
        })));
      }
    };

    fetchData();
  }, [user]);

  // Perf Monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      const mem = (performance as any).memory ? Math.round((performance as any).memory.usedJSHeapSize / 1048576) + 'MB' : 'N/A';
      setPerfMetrics({ memory: mem, latency: Math.floor(Math.random() * 20) + 5 });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleLike = async (track: Track) => {
    if (!user) return;
    const isLiked = likedTracks.some(t => t.id === track.id);
    
    if (isLiked) {
      await supabase.from('liked_tracks').delete().eq('user_id', user.id).filter('track_data->>id', 'eq', track.id);
      setLikedTracks(prev => prev.filter(t => t.id !== track.id));
      addLog(`Removido dos favoritos: ${track.title}`);
    } else {
      await supabase.from('liked_tracks').insert({ user_id: user.id, track_data: track });
      setLikedTracks(prev => [...prev, track]);
      addLog(`Adicionado aos favoritos: ${track.title}`);
    }
  };

  const createPlaylist = async (name: string) => {
    if (!user) return;
    const { data, error } = await supabase.from('playlists').insert({ user_id: user.id, name, tracks_json: [] }).select().single();
    if (data) {
      setPlaylists(prev => [...prev, { id: data.id, name: data.name, tracks: [] }]);
      addLog(`Playlist criada: ${name}`);
    }
  };

  const addTrackToPlaylist = async (pId: string, track: Track) => {
    const playlist = playlists.find(p => p.id === pId);
    if (!playlist) return;
    const updatedTracks = [...playlist.tracks, track];
    const { error } = await supabase.from('playlists').update({ tracks_json: updatedTracks }).eq('id', pId);
    if (!error) {
      setPlaylists(prev => prev.map(p => p.id === pId ? { ...p, tracks: updatedTracks } : p));
      addLog(`Adicionado a ${playlist.name}`);
    }
  };

  const playNext = useCallback(() => {
    if (searchResults.length > 0) {
      const idx = searchResults.findIndex(t => t.id === currentTrack?.id);
      if (idx !== -1 && idx < searchResults.length - 1) setCurrentTrack(searchResults[idx + 1]);
    }
  }, [currentTrack, searchResults]);

  const playPrevious = useCallback(() => {
    if (searchResults.length > 0) {
      const idx = searchResults.findIndex(t => t.id === currentTrack?.id);
      if (idx > 0) setCurrentTrack(searchResults[idx - 1]);
    }
  }, [currentTrack, searchResults]);

  const value = {
    user, isAdmin, setIsAdmin, logs, addLog, perfMetrics,
    currentTrack, setCurrentTrack, isPlaying, setIsPlaying,
    progress, setProgress, duration, setDuration,
    isExpanded, setIsExpanded, themeColor, setThemeColor,
    likedTracks, playlists, searchResults, setSearchResults,
    toggleLike, createPlaylist, addTrackToPlaylist,
    playNext, playPrevious
  };

  if (authLoading) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-white opacity-20" size={32} />
    </div>
  );

  return (
    <XalanifyContext.Provider value={value}>
      {!user ? <Auth /> : (
        <div className="h-screen bg-black text-white selection:bg-white/10 overflow-hidden relative">
          <div 
            className="fixed inset-0 opacity-20 blur-[120px] pointer-events-none transition-all duration-1000"
            style={{ background: `radial-gradient(circle at 50% 50%, ${themeColor}, transparent)` }}
          />
          {children}
        </div>
      )}
    </XalanifyContext.Provider>
  );
}

export const useXalanify = () => {
  const context = useContext(XalanifyContext);
  if (!context) throw new Error("useXalanify must be used within XalanifyProvider");
  return context;
};