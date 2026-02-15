"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

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
  currentTrack: Track | null; 
  setCurrentTrack: (t: Track | null) => void;
  isPlaying: boolean; 
  setIsPlaying: (p: boolean) => void;
  themeColor: string; 
  setThemeColor: (c: string) => void;
  likedTracks: Track[]; 
  toggleLike: (t: Track) => void;
  playlists: Playlist[]; 
  createPlaylist: (name: string, tracks?: Track[], image?: string) => void;
  addTrackToPlaylist: (pId: string, t: Track) => void;
  isExpanded: boolean; 
  setIsExpanded: (v: boolean) => void;
  audioEngine: 'youtube' | 'direct'; 
  setAudioEngine: (e: 'youtube' | 'direct') => void;
  progress: number; 
  setProgress: (v: number) => void;
  duration: number; 
  setDuration: (v: number) => void;
  persistentResults: Track[]; 
  setPersistentResults: (r: Track[]) => void;
  persistentQuery: string; 
  setPersistentQuery: (q: string) => void;
  searchResults: Track[];
  setSearchResults: (t: Track[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  logout: () => void;
  isAdmin: boolean;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [audioEngine, setAudioEngine] = useState<'youtube' | 'direct'>('direct');
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [persistentResults, setPersistentResults] = useState<Track[]>([]);
  const [persistentQuery, setPersistentQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);

  // Monitorar Sessão
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Sincronizar dados quando o User logar
  useEffect(() => {
    if (user) loadUserData();
  }, [user]);

  const loadUserData = async () => {
    const { data: likes } = await supabase.from('liked_tracks').select('track_data').eq('user_id', user?.id);
    if (likes) setLikedTracks(likes.map(l => l.track_data));

    const { data: pList } = await supabase.from('playlists').select('*').eq('user_id', user?.id);
    if (pList) setPlaylists(pList.map(p => ({ id: p.id, name: p.name, tracks: p.tracks_json, image: p.image_url })));
  };

  const toggleLike = async (track: Track) => {
    if (!user) return alert("Faz login para curtir músicas!");
    const isLiked = likedTracks.some(t => t.id === track.id);
    if (isLiked) {
      setLikedTracks(prev => prev.filter(t => t.id !== track.id));
      await supabase.from('liked_tracks').delete().eq('track_id', track.id).eq('user_id', user.id);
    } else {
      setLikedTracks(prev => [track, ...prev]);
      await supabase.from('liked_tracks').insert({ user_id: user.id, track_id: track.id, track_data: track });
    }
  };

  const createPlaylist = async (name: string, tracks: Track[] = [], image?: string) => {
    if (!user) return;
    const { data } = await supabase.from('playlists').insert({
      user_id: user.id, name, tracks_json: tracks, image_url: image
    }).select().single();
    if (data) setPlaylists(prev => [...prev, { id: data.id, name, tracks, image }]);
  };

  const addTrackToPlaylist = async (pId: string, track: Track) => {
    if (!user) return;
    const playlist = playlists.find(p => p.id === pId);
    if (playlist) {
      const updatedTracks = [...playlist.tracks, track];
      await supabase.from('playlists').update({ tracks_json: updatedTracks }).eq('id', pId);
      setPlaylists(playlists.map(p => p.id === pId ? { ...p, tracks: updatedTracks } : p));
    }
  };

  const playNext = () => {
    const idx = searchResults.findIndex(t => t.id === currentTrack?.id);
    if (idx !== -1 && idx < searchResults.length - 1) {
      setProgress(0);
      setCurrentTrack(searchResults[idx + 1]);
    }
  };

  const playPrevious = () => {
    const idx = searchResults.findIndex(t => t.id === currentTrack?.id);
    if (idx > 0) {
      setProgress(0);
      setCurrentTrack(searchResults[idx - 1]);
    }
  };

  return (
    <XalanifyContext.Provider value={{
      user, currentTrack, setCurrentTrack, isPlaying, setIsPlaying,
      themeColor, setThemeColor, likedTracks, toggleLike,
      playlists, createPlaylist, addTrackToPlaylist, isExpanded, setIsExpanded,
      audioEngine, setAudioEngine, progress, setProgress, duration, setDuration,
      persistentResults, setPersistentResults, persistentQuery, setPersistentQuery,
      searchResults, setSearchResults, playNext, playPrevious, logout: () => supabase.auth.signOut(),
      isAdmin: user?.email?.includes("admin") ?? false
    }}>
      <div className="min-h-screen w-full bg-black text-white flex flex-col transition-all duration-700" 
           style={{ background: `linear-gradient(to bottom, black 60%, ${themeColor}25 100%)` }}>
        <div className="flex-1 overflow-y-auto no-scrollbar pb-32">{children}</div>
      </div>
    </XalanifyContext.Provider>
  );
}

export const useXalanify = () => {
  const context = useContext(XalanifyContext);
  if (!context) throw new Error("useXalanify error");
  return context;
};