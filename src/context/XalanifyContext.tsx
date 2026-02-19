"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  youtubeId?: string | null;
  audioUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}

interface XalanifyContextType {
  user: User | null;
  isAdmin: boolean;
  themeColor: string;
  setThemeColor: (c: string) => void;
  isOLED: boolean;
  setIsOLED: (v: boolean) => void;
  currentTrack: Track | null;
  setCurrentTrack: (t: Track | null) => void;
  isPlaying: boolean;
  setIsPlaying: (p: boolean) => void;
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  currentTime: number;
  duration: number;
  progress: number;
  likedTracks: Track[];
  toggleLike: (t: Track) => Promise<void>;
  playlists: Playlist[];
  createPlaylist: (n: string) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addTrackToPlaylist: (pId: string, t: Track) => Promise<void>;
  removeTrackFromPlaylist: (pId: string, tId: string) => Promise<void>;
  activeQueue: Track[];
  setActiveQueue: (t: Track[]) => void;
  view: { type: 'main' | 'liked' | 'playlist' | 'account', data?: any };
  setView: (v: { type: 'main' | 'liked' | 'playlist' | 'account', data?: any }) => void;
  // NOVOS ESTADOS ADICIONADOS PARA CORRIGIR OS ERROS
  searchResults: Track[];
  setSearchResults: (t: Track[]) => void;
  settingsView: 'menu' | 'appearance';
  setSettingsView: (v: 'menu' | 'appearance') => void;
  // --------------------------------------------------
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playNext: () => void;
  playPrevious: () => void;
  logout: () => Promise<void>;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [themeColor, setThemeColor] = useState("#3b82f6");
  const [isOLED, setIsOLED] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activeQueue, setActiveQueue] = useState<Track[]>([]);
  const [view, setView] = useState<{ type: 'main' | 'liked' | 'playlist' | 'account', data?: any }>({ type: 'main' });
  
  // ESTADOS PARA PESQUISA E DEFINIÇÕES
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [settingsView, setSettingsView] = useState<'menu' | 'appearance'>('menu');

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const { data: pl } = await supabase.from('playlists').select('*').eq('user_id', user.id);
        const { data: lk } = await supabase.from('liked_tracks').select('track_data').eq('user_id', user.id);
        if (pl) setPlaylists(pl.map(p => ({ id: p.id, name: p.name, tracks: p.tracks_json || [] })));
        if (lk) setLikedTracks(lk.map(l => l.track_data));
      };
      fetchData();
    }
  }, [user?.id]);

  const toggleLike = async (track: Track) => {
    if (!user) return;
    const isLiked = likedTracks.some(t => t.id === track.id);
    if (isLiked) {
      await supabase.from('liked_tracks').delete().match({ user_id: user.id }).filter('track_data->>id', 'eq', track.id);
      setLikedTracks(prev => prev.filter(t => t.id !== track.id));
    } else {
      await supabase.from('liked_tracks').insert({ user_id: user.id, track_data: track });
      setLikedTracks(prev => [track, ...prev]);
    }
  };

  const playNext = () => {
    const idx = activeQueue.findIndex(t => t.id === currentTrack?.id);
    if (idx !== -1 && idx < activeQueue.length - 1) setCurrentTrack(activeQueue[idx + 1]);
  };

  const playPrevious = () => {
    const idx = activeQueue.findIndex(t => t.id === currentTrack?.id);
    if (idx > 0) setCurrentTrack(activeQueue[idx - 1]);
  };

  const createPlaylist = async (name: string) => {
    if (!user) return;
    const { data } = await supabase.from('playlists').insert([{ name, user_id: user.id, tracks_json: [] }]).select().single();
    if (data) setPlaylists(prev => [{ id: data.id, name: data.name, tracks: [] }, ...prev]);
  };

  const addTrackToPlaylist = async (pId: string, track: Track) => {
    const pl = playlists.find(p => p.id === pId);
    if (!pl) return;
    const updated = [...pl.tracks, track];
    await supabase.from('playlists').update({ tracks_json: updated }).eq('id', pId);
    setPlaylists(prev => prev.map(p => p.id === pId ? { ...p, tracks: updated } : p));
  };

  const removeTrackFromPlaylist = async (pId: string, trackId: string) => {
    const pl = playlists.find(p => p.id === pId);
    if (!pl) return;
    const updated = pl.tracks.filter(t => t.id !== trackId);
    await supabase.from('playlists').update({ tracks_json: updated }).eq('id', pId);
    setPlaylists(prev => prev.map(p => p.id === pId ? { ...p, tracks: updated } : p));
  };

  const deletePlaylist = async (id: string) => {
    await supabase.from('playlists').delete().eq('id', id);
    setPlaylists(prev => prev.filter(p => p.id !== id));
  };

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );

  return (
    <XalanifyContext.Provider value={{
      user, isAdmin: user?.email === "adminadmin@admin.com",
      themeColor, setThemeColor, isOLED, setIsOLED,
      currentTrack, setCurrentTrack, isPlaying, setIsPlaying,
      isExpanded, setIsExpanded, currentTime, duration, progress,
      likedTracks, toggleLike, playlists, createPlaylist, deletePlaylist,
      addTrackToPlaylist, removeTrackFromPlaylist, activeQueue, setActiveQueue,
      view, setView, searchResults, setSearchResults, settingsView, setSettingsView,
      audioRef, playNext, playPrevious, logout: async () => { await supabase.auth.signOut(); }
    }}>
      <div className={`h-screen w-full text-white overflow-hidden relative transition-colors duration-700 ${isOLED ? 'bg-black' : 'bg-[#050a18]'}`}>
        {/* Camada de Gradiente de Fundo Dinâmico */}
        {!isOLED && (
          <div 
            className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
            style={{ 
              background: `radial-gradient(circle at top right, ${themeColor}, transparent), radial-gradient(circle at bottom left, #000, transparent)` 
            }}
          />
        )}
        
        <div className="flex-1 h-full overflow-y-auto relative z-10 pb-52 custom-scroll">{children}</div>
        
        <audio 
          ref={audioRef} 
          src={currentTrack?.audioUrl} 
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          onTimeUpdate={() => {
            const current = audioRef.current?.currentTime || 0;
            const dur = audioRef.current?.duration || 0;
            setCurrentTime(current);
            setProgress(dur > 0 ? (current / dur) * 100 : 0);
          }}
          onEnded={playNext}
        />
      </div>
    </XalanifyContext.Provider>
  );
}

export const useXalanify = () => {
  const context = useContext(XalanifyContext);
  if (!context) throw new Error("useXalanify deve ser usado dentro de um XalanifyProvider");
  return context;
};