"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import LoginPage from "@/app/login/page";

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
  
  // ESTADOS ADICIONADOS PARA RESOLVER OS ERROS:
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  currentTime: number;
  setCurrentTime: (v: number) => void;
  duration: number;
  setDuration: (v: number) => void;
  progress: number;
  setProgress: (v: number) => void;

  likedTracks: Track[];
  toggleLike: (t: Track) => Promise<void>;
  playlists: Playlist[];
  createPlaylist: (n: string) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addTrackToPlaylist: (pId: string, t: Track) => Promise<void>;
  removeTrackFromPlaylist: (pId: string, tId: string) => Promise<void>;
  searchResults: Track[];
  setSearchResults: (t: Track[]) => void;
  activeQueue: Track[];
  setActiveQueue: (t: Track[]) => void;
  view: { type: 'main' | 'liked' | 'playlist' | 'account', data?: any };
  setView: (v: { type: 'main' | 'liked' | 'playlist' | 'account', data?: any }) => void;
  settingsView: 'menu' | 'appearance' | 'visuals' | 'account_details';
  setSettingsView: (v: 'menu' | 'appearance' | 'visuals' | 'account_details') => void;
  playNext: () => void;
  playPrevious: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
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
  
  // NOVOS ESTADOS INICIALIZADOS:
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [activeQueue, setActiveQueue] = useState<Track[]>([]);
  const [view, setView] = useState<{ type: 'main' | 'liked' | 'playlist' | 'account', data?: any }>({ type: 'main' });
  const [settingsView, setSettingsView] = useState<'menu' | 'appearance' | 'visuals' | 'account_details'>('menu');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) fetchRealData(user.id);
  }, [user?.id]);

  const fetchRealData = async (userId: string) => {
    try {
      const { data: plData } = await supabase.from('playlists').select('*').eq('user_id', userId);
      if (plData) setPlaylists(plData.map((p: any) => ({ id: p.id, name: p.name, tracks: p.tracks_json || [] })));

      const { data: likeData } = await supabase.from('liked_tracks').select('track_data').eq('user_id', userId);
      if (likeData) setLikedTracks(likeData.map((l: any) => l.track_data));
    } catch (e) { console.error(e); }
  };

  const createPlaylist = async (name: string) => {
    if (!user) return;
    const { data } = await supabase.from('playlists').insert([{ name, user_id: user.id, tracks_json: [] }]).select().single();
    if (data) setPlaylists(prev => [{ id: data.id, name: data.name, tracks: [] }, ...prev]);
  };

  const deletePlaylist = async (id: string) => {
    await supabase.from('playlists').delete().eq('id', id);
    setPlaylists(prev => prev.filter(p => p.id !== id));
    if (view.type === 'playlist' && view.data?.id === id) setView({ type: 'main' });
  };

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

  const logout = async () => { await supabase.auth.signOut(); };

  const playNext = () => {
    const idx = activeQueue.findIndex(t => t.id === currentTrack?.id);
    if (idx !== -1 && idx < activeQueue.length - 1) setCurrentTrack(activeQueue[idx + 1]);
  };

  const playPrevious = () => {
    const idx = activeQueue.findIndex(t => t.id === currentTrack?.id);
    if (idx > 0) setCurrentTrack(activeQueue[idx - 1]);
  };

  if (loading) return (
    <div className="h-screen bg-[#050a18] flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );

  return (
    <XalanifyContext.Provider value={{
      user, isAdmin: user?.email === "adminadmin@admin.com",
      themeColor, setThemeColor, isOLED, setIsOLED,
      currentTrack, setCurrentTrack, isPlaying, setIsPlaying, 
      isExpanded, setIsExpanded, currentTime, setCurrentTime, duration, setDuration, progress, setProgress,
      likedTracks, toggleLike, playlists, createPlaylist, deletePlaylist,
      addTrackToPlaylist, removeTrackFromPlaylist,
      searchResults, setSearchResults, activeQueue, setActiveQueue,
      view, setView, settingsView, setSettingsView,
      playNext, playPrevious, audioRef, logout
    }}>
      <div className={`h-screen w-full text-white overflow-hidden relative ${isOLED ? 'bg-black' : 'bg-[#050a18]'}`}>
        {user ? (
          <>
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle at 50% -20%, ${themeColor}, transparent)` }} />
            <div className="flex-1 h-full overflow-y-auto relative z-10 pb-44 custom-scroll">{children}</div>
            <audio 
              ref={audioRef} 
              src={currentTrack?.audioUrl} 
              onLoadedMetadata={() => { if(audioRef.current) setDuration(audioRef.current.duration); }}
              onTimeUpdate={() => { 
                if(audioRef.current) {
                  setCurrentTime(audioRef.current.currentTime);
                  setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
                }
              }}
              onEnded={playNext}
            />
          </>
        ) : (
          <LoginPage />
        )}
      </div>
    </XalanifyContext.Provider>
  );
}

export const useXalanify = () => useContext(XalanifyContext)!;