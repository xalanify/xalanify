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
  isLocal?: boolean;
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
  audioEngine: 'youtube' | 'direct';
  setAudioEngine: (e: 'youtube' | 'direct') => void;
  themeColor: string; 
  setThemeColor: (c: string) => void;
  likedTracks: Track[]; 
  toggleLike: (t: Track) => void;
  playlists: Playlist[]; 
  createPlaylist: (name: string, tracks?: Track[], image?: string) => void;
  addTrackToPlaylist: (pId: string, t: Track) => void;
  searchResults: Track[];
  setSearchResults: (t: Track[]) => void;
  persistentQuery: string;
  setPersistentQuery: (q: string) => void;
  playNext: () => void;
  playPrevious: () => void;
  logout: () => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>(["Xalanify Core Inicializado"]);
  
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [audioEngine, setAudioEngine] = useState<'youtube' | 'direct'>('youtube');

  const [themeColor, setThemeColor] = useState("#a855f7");
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [persistentQuery, setPersistentQuery] = useState("");

  const isAdmin = user?.email === "adminx@adminx.com";

  const addLog = (m: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${m}`, ...prev].slice(0, 50));
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) addLog(`Utilizador: ${session.user.email}`);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (user) loadUserData(); }, [user]);

  const loadUserData = async () => {
    try {
      const { data: likes } = await supabase.from('liked_tracks').select('track_data').eq('user_id', user?.id);
      if (likes) setLikedTracks(likes.map(l => l.track_data));

      const { data: pList } = await supabase.from('playlists').select('*').eq('user_id', user?.id);
      if (pList) setPlaylists(pList.map(p => ({ 
        id: p.id, name: p.name, tracks: p.tracks_json || [], image: p.image_url 
      })));
    } catch (e) { addLog("Erro ao carregar DB"); }
  };

  const toggleLike = async (track: Track) => {
    if (!user) return;
    const isLiked = likedTracks.some(t => t.id === track.id);
    if (isLiked) {
      setLikedTracks(prev => prev.filter(t => t.id !== track.id));
      await supabase.from('liked_tracks').delete().eq('track_id', track.id).eq('user_id', user.id);
      addLog(`Favorito removido: ${track.title}`);
    } else {
      setLikedTracks(prev => [track, ...prev]);
      await supabase.from('liked_tracks').insert({ user_id: user.id, track_id: track.id, track_data: track });
      addLog(`Favorito adicionado: ${track.title}`);
    }
  };

  const createPlaylist = async (name: string, tracks: Track[] = [], image?: string) => {
    if (!user) return;
    const { data } = await supabase.from('playlists').insert({ user_id: user.id, name, tracks_json: tracks, image_url: image }).select().single();
    if (data) {
      setPlaylists(prev => [...prev, { id: data.id, name, tracks, image }]);
      addLog(`Playlist criada: ${name}`);
    }
  };

  const addTrackToPlaylist = async (pId: string, track: Track) => {
    if (!user) return;
    const playlist = playlists.find(p => p.id === pId);
    if (playlist) {
      const updatedTracks = [...playlist.tracks, track];
      await supabase.from('playlists').update({ tracks_json: updatedTracks }).eq('id', pId);
      setPlaylists(playlists.map(p => p.id === pId ? { ...p, tracks: updatedTracks } : p));
      addLog(`Música adicionada a ${playlist.name}`);
    }
  };

  const playNext = () => {
    const idx = searchResults.findIndex(t => t.id === currentTrack?.id);
    if (idx !== -1 && idx < searchResults.length - 1) {
      setCurrentTrack(searchResults[idx + 1]);
      addLog(`Seguinte: ${searchResults[idx + 1].title}`);
    }
  };

  const playPrevious = () => {
    const idx = searchResults.findIndex(t => t.id === currentTrack?.id);
    if (idx > 0) {
      setCurrentTrack(searchResults[idx - 1]);
      addLog(`Anterior: ${searchResults[idx - 1].title}`);
    }
  };

  return (
    <XalanifyContext.Provider value={{
      user, isAdmin, logs, addLog, currentTrack, setCurrentTrack, isPlaying, setIsPlaying,
      progress, setProgress, duration, setDuration, isExpanded, setIsExpanded,
      audioEngine, setAudioEngine, themeColor, setThemeColor, likedTracks, toggleLike,
      playlists, createPlaylist, addTrackToPlaylist, searchResults, setSearchResults,
      persistentQuery, setPersistentQuery, playNext, playPrevious, 
      logout: () => supabase.auth.signOut()
    }}>
      {authLoading ? (
        <div className="fixed inset-0 bg-black flex items-center justify-center">
          <Loader2 className="animate-spin text-purple-500" size={32} />
        </div>
      ) : !user ? (
        <Auth />
      ) : (
        <div className="h-screen w-full bg-black text-white flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scroll relative pb-40">
            {children}
            
            {isAdmin && (
              <div className="fixed bottom-24 right-4 z-[999] group">
                <div className="bg-red-600 w-10 h-10 rounded-full cursor-pointer shadow-lg flex items-center justify-center border-2 border-white/20">
                  <span className="text-[8px] font-black">DEBUG</span>
                </div>
                <div className="absolute bottom-full right-0 mb-2 w-72 bg-zinc-950 border border-white/10 rounded-2xl p-4 opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto max-h-80 overflow-y-auto text-[10px] font-mono shadow-2xl">
                  <p className="text-red-500 mb-2 font-bold uppercase border-b border-white/5 pb-1">Admin Logs</p>
                  {logs.map((log, i) => <div key={i} className="border-b border-white/5 py-1 text-zinc-500">{log}</div>)}
                </div>
              </div>
            )}
          </div>
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