"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  audioUrl?: string;
  duration: number;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  user_id?: string;
}

interface XalanifyContextType {
  user: any;
  themeColor: string;
  setThemeColor: (c: string) => void;
  isOLED: boolean;
  setIsOLED: (v: boolean) => void;
  
  // Player
  currentTrack: Track | null;
  setCurrentTrack: (t: Track | null) => void;
  isPlaying: boolean;
  setIsPlaying: (p: boolean) => void;
  currentTime: number;
  setCurrentTime: (t: number) => void;
  duration: number;
  setDuration: (d: number) => void;
  progress: number;
  setProgress: (p: number) => void;
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  
  // Library
  likedTracks: Track[];
  toggleLike: (t: Track) => Promise<void>;
  playlists: Playlist[];
  createPlaylist: (name: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  
  // Search
  searchResults: Track[];
  setSearchResults: (t: Track[]) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchSpotify: (query: string) => Promise<void>;
  isSearching: boolean;
  
  // Audio
  audioRef: React.RefObject<HTMLAudioElement | null>;
  
  // UI
  activeQueue: Track[];
  setActiveQueue: (t: Track[]) => void;
  playNext: () => void;
  playPrevious: () => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  // Auth & User
  const [user] = useState<any>({
    id: "user_123",
    email: "user@example.com"
  });

  // Theme
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [isOLED, setIsOLED] = useState(false);

  // Player
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Library
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([
    {
      id: "favorites",
      name: "Favoritos",
      tracks: [],
      user_id: user.id
    }
  ]);

  // Search
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Queue
  const [activeQueue, setActiveQueue] = useState<Track[]>([]);

  // Audio ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load data from Supabase (simulated)
  useEffect(() => {
    loadUserData();
  }, []);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const updateDuration = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      playNext();
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [activeQueue, currentTrack]);

  const loadUserData = async () => {
    try {
      // Simulando carregamento do Supabase
      const savedData = localStorage.getItem("xalanify_user_data");
      if (savedData) {
        const data = JSON.parse(savedData);
        setLikedTracks(data.likedTracks || []);
        setPlaylists(data.playlists || playlists);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const toggleLike = async (track: Track) => {
    try {
      const isLiked = likedTracks.some(t => t.id === track.id);
      if (isLiked) {
        setLikedTracks(prev => prev.filter(t => t.id !== track.id));
      } else {
        setLikedTracks(prev => [...prev, track]);
      }
      
      // Salvar no localStorage (simular Supabase)
      const data = { likedTracks, playlists };
      localStorage.setItem("xalanify_user_data", JSON.stringify(data));
    } catch (error) {
      console.error("Erro ao atualizar favoritos:", error);
    }
  };

  const createPlaylist = async (name: string) => {
    try {
      const newPlaylist: Playlist = {
        id: `playlist_${Date.now()}`,
        name,
        tracks: [],
        user_id: user.id
      };
      setPlaylists(prev => [...prev, newPlaylist]);
      
      const data = { likedTracks, playlists: [...playlists, newPlaylist] };
      localStorage.setItem("xalanify_user_data", JSON.stringify(data));
    } catch (error) {
      console.error("Erro ao criar playlist:", error);
    }
  };

  const addTrackToPlaylist = async (playlistId: string, track: Track) => {
    try {
      setPlaylists(prev =>
        prev.map(p =>
          p.id === playlistId
            ? {
                ...p,
                tracks: p.tracks.find(t => t.id === track.id)
                  ? p.tracks
                  : [...p.tracks, track]
              }
            : p
        )
      );
      
      const updatedPlaylists = playlists.map(p =>
        p.id === playlistId
          ? {
              ...p,
              tracks: p.tracks.find(t => t.id === track.id)
                ? p.tracks
                : [...p.tracks, track]
            }
          : p
      );
      const data = { likedTracks, playlists: updatedPlaylists };
      localStorage.setItem("xalanify_user_data", JSON.stringify(data));
    } catch (error) {
      console.error("Erro ao adicionar à playlist:", error);
    }
  };

  const removeTrackFromPlaylist = async (playlistId: string, trackId: string) => {
    try {
      setPlaylists(prev =>
        prev.map(p =>
          p.id === playlistId
            ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId) }
            : p
        )
      );
      
      const updatedPlaylists = playlists.map(p =>
        p.id === playlistId
          ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId) }
          : p
      );
      const data = { likedTracks, playlists: updatedPlaylists };
      localStorage.setItem("xalanify_user_data", JSON.stringify(data));
    } catch (error) {
      console.error("Erro ao remover da playlist:", error);
    }
  };

  const searchSpotify = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Chamada à API Spotify
      const response = await fetch("/api/spotify/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });

      const data = await response.json();
      
      // Processar resposta do Spotify
      const tracks: Track[] = (data.tracks?.items || []).map((item: any) => ({
        id: item.id,
        title: item.name,
        artist: item.artists[0]?.name || "Artista Desconhecido",
        thumbnail: item.album?.images[0]?.url || "",
        audioUrl: item.preview_url,
        duration: item.duration_ms / 1000
      }));

      setSearchResults(tracks);
    } catch (error) {
      console.error("Erro ao pesquisar Spotify:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const playNext = () => {
    if (!activeQueue.length || !currentTrack) return;
    const currentIndex = activeQueue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex < activeQueue.length - 1) {
      setCurrentTrack(activeQueue[currentIndex + 1]);
      setIsPlaying(true);
    }
  };

  const playPrevious = () => {
    if (!activeQueue.length || !currentTrack) return;
    const currentIndex = activeQueue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex > 0) {
      setCurrentTrack(activeQueue[currentIndex - 1]);
      setIsPlaying(true);
    }
  };

  return (
    <XalanifyContext.Provider
      value={{
        user,
        themeColor,
        setThemeColor,
        isOLED,
        setIsOLED,
        currentTrack,
        setCurrentTrack,
        isPlaying,
        setIsPlaying,
        currentTime,
        setCurrentTime,
        duration,
        setDuration,
        progress,
        setProgress,
        isExpanded,
        setIsExpanded,
        likedTracks,
        toggleLike,
        playlists,
        createPlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        searchResults,
        setSearchResults,
        searchQuery,
        setSearchQuery,
        searchSpotify,
        isSearching,
        audioRef,
        activeQueue,
        setActiveQueue,
        playNext,
        playPrevious
      }}
    >
      <div className={`h-screen w-full ${isOLED ? "bg-black" : "bg-[#1a1a1a]"}`}>
        {children}
        <audio
          ref={audioRef}
          crossOrigin="anonymous"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>
    </XalanifyContext.Provider>
  );
}

export const useXalanify = () => {
  const context = useContext(XalanifyContext);
  if (!context) {
    throw new Error("useXalanify must be used within XalanifyProvider");
  }
  return context;
};