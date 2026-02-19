"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
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
  audioUrl?: string;
}

export interface Playlist { 
  id: string; 
  name: string; 
  tracks: Track[]; 
  image?: string; 
}

interface XalanifyContextType {
  user: User | null;
  isAdmin: boolean;
  showDebug: boolean;
  setShowDebug: (v: boolean) => void;
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
  setBgMode: (m: 'vivid' | 'pure' | 'gradient') => void;
  isOLED: boolean;
  setIsOLED: (v: boolean) => void;
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
  view: { type: 'main' | 'liked' | 'playlist', data?: any };
  setView: (v: { type: 'main' | 'liked' | 'playlist', data?: any }) => void;
  playNext: () => void;
  playPrevious: () => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDebug, setShowDebug] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [themeColor, setThemeColor] = useState("#3b82f6"); 
  const [bgMode, setBgMode] = useState<'vivid' | 'pure' | 'gradient'>('vivid');
  const [isOLED, setIsOLED] = useState(false);
  
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [activeQueue, setActiveQueue] = useState<Track[]>([]);
  const [view, setView] = useState<{ type: 'main' | 'liked' | 'playlist', data?: any }>({ type: 'main' });

  useEffect(() => {
    const savedColor = localStorage.getItem("xalanify_theme");
    const savedOLED = localStorage.getItem("xalanify_oled");
    if (savedColor) setThemeColor(savedColor);
    if (savedOLED) setIsOLED(savedOLED === "true");

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
  }, []);

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    if (!user) return;
    const { data: likes } = await supabase.from('liked_tracks').select('track_data').eq('user_id', user.id);
    if (likes) setLikedTracks(likes.map(l => l.track_data));
    const { data: pList } = await supabase.from('playlists').select('*').eq('user_id', user.id);
    if (pList) setPlaylists(pList.map(p => ({ id: p.id, name: p.name, tracks: p.tracks_json || [] })));
  };

  const playNext = () => {
    const idx = activeQueue.findIndex(t => t.id === currentTrack?.id);
    if (idx !== -1 && idx < activeQueue.length - 1) setCurrentTrack(activeQueue[idx + 1]);
  };

  const playPrevious = () => {
    const idx = activeQueue.findIndex(t => t.id === currentTrack?.id);
    if (idx > 0) setCurrentTrack(activeQueue[idx - 1]);
  };

  return (
    <XalanifyContext.Provider value={{
      user, isAdmin: user?.email === "adminx@adminx.com", showDebug, setShowDebug, logs, addLog: (m) => setLogs(p => [m, ...p]),
      currentTrack, setCurrentTrack, isPlaying, setIsPlaying, progress, setProgress, duration, setDuration,
      isExpanded, setIsExpanded, themeColor, setThemeColor, bgMode, setBgMode, isOLED, setIsOLED,
      likedTracks, toggleLike: async () => {}, 
      playlists, createPlaylist: async () => {}, deletePlaylist: async () => {},
      addTrackToPlaylist: async () => {}, removeTrackFromPlaylist: async () => {},
      searchResults, setSearchResults, activeQueue, setActiveQueue, view, setView, playNext, playPrevious
    }}>
      {loading ? (
        <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
      ) : !user ? <Auth /> : (
        <div className={`h-screen w-full text-white overflow-hidden relative ${isOLED ? 'bg-black' : 'bg-[#020617]'}`}>
          {!isOLED && (
            <div className="absolute inset-0 opacity-20 blur-[120px] pointer-events-none"
              style={{ background: `radial-gradient(circle at 50% -20%, ${themeColor}, transparent)` }} />
          )}
          <div className="flex-1 h-full overflow-y-auto relative z-10 pb-40">{children}</div>
        </div>
      )}
    </XalanifyContext.Provider>
  );
}

export const useXalanify = () => useContext(XalanifyContext)!;