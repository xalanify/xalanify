"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import LoginPage from "@/app/login/page";

// Interfaces alinhadas com o que a App espera
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
  // Player
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
  // Dados Reais
  likedTracks: Track[];
  toggleLike: (t: Track) => Promise<void>;
  playlists: Playlist[];
  createPlaylist: (n: string) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addTrackToPlaylist: (pId: string, t: Track) => Promise<void>;
  removeTrackFromPlaylist: (pId: string, tId: string) => Promise<void>;
  // Pesquisa e Fila
  searchResults: Track[];
  setSearchResults: (t: Track[]) => void;
  activeQueue: Track[];
  setActiveQueue: (t: Track[]) => void;
  // Navegação
  view: { type: 'main' | 'liked' | 'playlist' | 'account', data?: any };
  setView: (v: { type: 'main' | 'liked' | 'playlist' | 'account', data?: any }) => void;
  settingsView: 'menu' | 'appearance' | 'visuals' | 'account_details';
  setSettingsView: (v: 'menu' | 'appearance' | 'visuals' | 'account_details') => void;
  // Controlos
  playNext: () => void;
  playPrevious: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  logout: () => Promise<void>;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  // Auth & Settings
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [themeColor, setThemeColor] = useState("#3b82f6");
  const [isOLED, setIsOLED] = useState(false);

  // Player State
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Data State
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [activeQueue, setActiveQueue] = useState<Track[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  
  // Navigation
  const [view, setView] = useState<{ type: 'main' | 'liked' | 'playlist' | 'account', data?: any }>({ type: 'main' });
  const [settingsView, setSettingsView] = useState<'menu' | 'appearance' | 'visuals' | 'account_details'>('menu');

  // 1. Verificar Sessão e Carregar Dados Reais
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchRealData(session.user.id);
      }
      setLoading(false);
    };
    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchRealData(session.user.id);
      } else {
        // Limpar dados ao sair
        setPlaylists([]);
        setLikedTracks([]);
        setCurrentTrack(null);
      }
    });

    return () => { authListener.subscription.unsubscribe(); };
  }, []);

  // 2. Função para buscar dados do Supabase
  const fetchRealData = async (userId: string) => {
    try {
      // Buscar Playlists
      const { data: plData, error: plError } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (plData) {
        // Mapear para o formato interno (assumindo que tracks_json guarda o array de músicas)
        const formattedPlaylists: Playlist[] = plData.map((p: any) => ({
          id: p.id,
          name: p.name,
          tracks: p.tracks_json || [] 
        }));
        setPlaylists(formattedPlaylists);
      }

      // Buscar Liked Tracks
      const { data: likeData, error: likeError } = await supabase
        .from('liked_tracks')
        .select('track_data') // Assumindo que guardas o objecto da música aqui
        .eq('user_id', userId);

      if (likeData) {
        const tracks = likeData.map((l: any) => l.track_data);
        setLikedTracks(tracks);
      }
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
    }
  };

  // 3. Funções de Manipulação de Dados (REAIS)
  const createPlaylist = async (name: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('playlists')
      .insert([{ name, user_id: user.id, tracks_json: [] }])
      .select()
      .single();
    
    if (data) {
      setPlaylists(prev => [{ id: data.id, name: data.name, tracks: [] }, ...prev]);
    }
  };

  const deletePlaylist = async (id: string) => {
    await supabase.from('playlists').delete().eq('id', id);
    setPlaylists(prev => prev.filter(p => p.id !== id));
  };

  const toggleLike = async (track: Track) => {
    if (!user) return;
    const isLiked = likedTracks.some(t => t.id === track.id);
    
    if (isLiked) {
      // Remover
      const { error } = await supabase
        .from('liked_tracks')
        .delete()
        .match({ user_id: user.id })
        .filter('track_data->>id', 'eq', track.id); // Filtro JSONB

      if (!error) setLikedTracks(prev => prev.filter(t => t.id !== track.id));
    } else {
      // Adicionar
      const { error } = await supabase
        .from('liked_tracks')
        .insert({ user_id: user.id, track_data: track });
      
      if (!error) setLikedTracks(prev => [track, ...prev]);
    }
  };

  const addTrackToPlaylist = async (playlistId: string, track: Track) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;
    
    const updatedTracks = [...playlist.tracks, track];
    const { error } = await supabase
      .from('playlists')
      .update({ tracks_json: updatedTracks })
      .eq('id', playlistId);

    if (!error) {
      setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, tracks: updatedTracks } : p));
    }
  };

  const removeTrackFromPlaylist = async (playlistId: string, trackId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    const updatedTracks = playlist.tracks.filter(t => t.id !== trackId);
    const { error } = await supabase
      .from('playlists')
      .update({ tracks_json: updatedTracks })
      .eq('id', playlistId);

    if (!error) {
      setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, tracks: updatedTracks } : p));
    }
  };

  // 4. Lógica de Áudio e Logout
  const playNext = () => {
    const idx = activeQueue.findIndex(t => t.id === currentTrack?.id);
    if (idx !== -1 && idx < activeQueue.length - 1) setCurrentTrack(activeQueue[idx + 1]);
  };

  const playPrevious = () => {
    const idx = activeQueue.findIndex(t => t.id === currentTrack?.id);
    if (idx > 0) setCurrentTrack(activeQueue[idx - 1]);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // Efeito para Play/Pause
  useEffect(() => {
    if (currentTrack && audioRef.current) {
        if (isPlaying) audioRef.current.play().catch(() => {});
        else audioRef.current.pause();
    }
  }, [currentTrack, isPlaying]);

  if (loading) return (
    <div className="h-screen bg-[#050a18] flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );

  if (!user) return <LoginPage />;

  return (
    <XalanifyContext.Provider value={{
      user, 
      isAdmin: user.email === "adminadmin@admin.com", // VERIFICAÇÃO DO ADMIN CORRETA
      themeColor, setThemeColor, isOLED, setIsOLED,
      currentTrack, setCurrentTrack, isPlaying, setIsPlaying, progress, setProgress,
      currentTime, duration, isExpanded, setIsExpanded,
      likedTracks, toggleLike, playlists, createPlaylist, deletePlaylist,
      addTrackToPlaylist, removeTrackFromPlaylist,
      searchResults, setSearchResults, activeQueue, setActiveQueue,
      view, setView, settingsView, setSettingsView,
      playNext, playPrevious, audioRef, logout
    }}>
      <div className={`h-screen w-full text-white overflow-hidden relative ${isOLED ? 'bg-black' : 'bg-[#050a18]'}`}>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,600;0,700;0,900;1,900&display=swap');
          body { font-family: 'Inter', sans-serif; }
          .font-black-italic { font-weight: 900; font-style: italic; letter-spacing: -0.04em; }
          .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.05); }
        `}</style>
        
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle at 50% -20%, ${themeColor}, transparent)` }} />
        <div className="flex-1 h-full overflow-y-auto relative z-10 pb-44 custom-scroll">{children}</div>
        
        <audio 
          ref={audioRef} 
          src={currentTrack?.audioUrl} 
          onTimeUpdate={() => {
             if(audioRef.current) setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
          }}
          onEnded={playNext}
        />
      </div>
    </XalanifyContext.Provider>
  );
}

export const useXalanify = () => useContext(XalanifyContext)!;