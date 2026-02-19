"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import LoginPage from "@/app/login/page";

export interface Track {
  id: string; title: string; artist: string; thumbnail: string; youtubeId?: string | null; audioUrl?: string;
}

export interface Playlist {
  id: string; name: string; tracks: Track[];
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
  progress: number;
  setProgress: (v: number) => void;
  currentTime: number;
  duration: number;
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
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
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [activeQueue, setActiveQueue] = useState<Track[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [view, setView] = useState<{ type: 'main' | 'liked' | 'playlist' | 'account', data?: any }>({ type: 'main' });
  const [settingsView, setSettingsView] = useState<'menu' | 'appearance' | 'visuals' | 'account_details'>('menu');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const toggleLike = async (t: Track) => {};
  const createPlaylist = async (n: string) => {};
  const deletePlaylist = async (id: string) => {};
  const addTrackToPlaylist = async (pId: string, t: Track) => {};
  const removeTrackFromPlaylist = async (pId: string, tId: string) => {};
  const playNext = () => {};
  const playPrevious = () => {};

  if (loading) return (
    <div className="h-screen bg-[#050a18] flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );

  if (!user) return <LoginPage />;

  return (
    <XalanifyContext.Provider value={{
      user, isAdmin: user.email === "admin@admin.com", themeColor, setThemeColor, isOLED, setIsOLED,
      currentTrack, setCurrentTrack, isPlaying, setIsPlaying, progress, setProgress,
      currentTime, duration, isExpanded, setIsExpanded, likedTracks, toggleLike,
      playlists, createPlaylist, deletePlaylist, addTrackToPlaylist, removeTrackFromPlaylist,
      searchResults, setSearchResults, activeQueue, setActiveQueue, view, setView,
      settingsView, setSettingsView, playNext, playPrevious, audioRef, logout
    }}>
      <div className={`h-screen w-full text-white overflow-hidden relative ${isOLED ? 'bg-black' : 'bg-[#050a18]'}`}>
        {/* CSS Global para Fontes Idênticas */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,700;0,900;1,900&display=swap');
          body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
          .font-black-italic { font-weight: 900; font-style: italic; letter-spacing: -0.04em; }
          .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        `}</style>
        
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle at 50% -20%, ${themeColor}, transparent)` }} />
        <div className="flex-1 h-full overflow-y-auto relative z-10 pb-44">{children}</div>
        
        <audio 
          ref={audioRef} 
          src={currentTrack?.audioUrl}
          onTimeUpdate={() => audioRef.current && setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)}
        />
      </div>
    </XalanifyContext.Provider>
  );
}

export const useXalanify = () => useContext(XalanifyContext)!;