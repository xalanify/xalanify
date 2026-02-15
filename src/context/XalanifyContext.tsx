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
  // Autenticação e Admin
  user: User | null;
  isAdmin: boolean;
  logout: () => void;
  
  // Player
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
  playNext: () => void;
  playPrevious: () => void;

  // Personalização e Dados
  themeColor: string; 
  setThemeColor: (c: string) => void;
  likedTracks: Track[]; 
  toggleLike: (t: Track) => void;
  playlists: Playlist[]; 
  createPlaylist: (name: string, tracks?: Track[], image?: string) => void;
  addTrackToPlaylist: (pId: string, t: Track) => void;
  
  // Pesquisa Persistente
  searchResults: Track[];
  setSearchResults: (t: Track[]) => void;
  persistentQuery: string;
  setPersistentQuery: (q: string) => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  // ESTADOS DE AUTH
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ESTADOS DO PLAYER
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // ESTADOS DE PERSONALIZAÇÃO E DADOS
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  
  // ESTADOS DE PESQUISA
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [persistentQuery, setPersistentQuery] = useState("");

  // Lógica de Admin: adminx@adminx.com com pass adminx
  const isAdmin = user?.email === "adminx@adminx.com";

  useEffect(() => {
    // Subscrever ao estado de autenticação do Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Carregar dados do Supabase quando o user loga
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const { data: likes } = await supabase.from('liked_tracks').select('track_data').eq('user_id', user?.id);
      if (likes) setLikedTracks(likes.map(l => l.track_data));

      const { data: pList } = await supabase.from('playlists').select('*').eq('user_id', user?.id);
      if (pList) setPlaylists(pList.map(p => ({ 
        id: p.id, 
        name: p.name, 
        tracks: p.tracks_json || [], 
        image: p.image_url 
      })));
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  };

  const toggleLike = async (track: Track) => {
    if (!user) return;
    const isLiked = likedTracks.some(t => t.id === track.id);
    if (isLiked) {
      setLikedTracks(prev => prev.filter(t => t.id !== track.id));
      await supabase.from('liked_tracks').delete().eq('track_id', track.id).eq('user_id', user.id);
    } else {
      setLikedTracks(prev => [track, ...prev]);
      await supabase.from('liked_tracks').insert({ 
        user_id: user.id, 
        track_id: track.id, 
        track_data: track 
      });
    }
  };

  const createPlaylist = async (name: string, tracks: Track[] = [], image?: string) => {
    if (!user) return;
    const { data, error } = await supabase.from('playlists').insert({
      user_id: user.id,
      name,
      tracks_json: tracks,
      image_url: image
    }).select().single();

    if (data) {
      setPlaylists(prev => [...prev, { id: data.id, name, tracks, image }]);
    }
  };

  const addTrackToPlaylist = async (pId: string, track: Track) => {
    if (!user) return;
    const playlist = playlists.find(p => p.id === pId);
    if (playlist) {
      const updatedTracks = [...playlist.tracks, track];
      const { error } = await supabase.from('playlists').update({ 
        tracks_json: updatedTracks 
      }).eq('id', pId);
      
      if (!error) {
        setPlaylists(playlists.map(p => p.id === pId ? { ...p, tracks: updatedTracks } : p));
      }
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
      user, isAdmin, logout: () => supabase.auth.signOut(),
      currentTrack, setCurrentTrack, isPlaying, setIsPlaying,
      progress, setProgress, duration, setDuration, isExpanded, setIsExpanded,
      playNext, playPrevious, themeColor, setThemeColor,
      likedTracks, toggleLike, playlists, createPlaylist, addTrackToPlaylist,
      searchResults, setSearchResults, persistentQuery, setPersistentQuery
    }}>
      {authLoading ? (
        <div className="fixed inset-0 bg-black flex items-center justify-center">
          <Loader2 className="animate-spin text-purple-500" size={32} />
        </div>
      ) : !user ? (
        <Auth />
      ) : (
        /* ESTRUTURA COM SCROLL CORRIGIDO */
        <div 
          className="h-screen w-full bg-black text-white flex flex-col overflow-hidden transition-all duration-700"
          style={{ background: `linear-gradient(to bottom, black 75%, ${themeColor}20 100%)` }}
        >
          {/* O children (as páginas) agora ficam dentro deste container que permite scroll */}
          <div className="flex-1 overflow-y-auto custom-scroll pb-40">
            {children}
          </div>
        </div>
      )}
    </XalanifyContext.Provider>
  );
}

export const useXalanify = () => {
  const context = useContext(XalanifyContext);
  if (!context) throw new Error("useXalanify deve ser usado dentro de um Provider");
  return context;
};