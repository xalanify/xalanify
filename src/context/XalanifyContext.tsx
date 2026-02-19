"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  audioUrl?: string;
  duration: number;
  youtubeId?: string; // Adicionado para suporte ao ReactPlayer
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
  likedTracks: Track[];
  toggleLike: (t: Track) => Promise<void>;
  playlists: Playlist[];
  createPlaylist: (name: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  searchResults: Track[];
  setSearchResults: (t: Track[]) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchSpotify: (query: string) => Promise<void>;
  isSearching: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  activeQueue: Track[];
  setActiveQueue: (t: Track[]) => void;
  playNext: () => void;
  playPrevious: () => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [user] = useState<any>({ id: "user_123", email: "user@example.com" });
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [isOLED, setIsOLED] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([{ id: "favorites", name: "Favoritos", tracks: [], user_id: "user_123" }]);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeQueue, setActiveQueue] = useState<Track[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const searchSpotify = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      // CORREÇÃO: Endpoint ajustado para bater com a rota da API
      const response = await fetch(`/api/spotify?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      const tracks: Track[] = (data.tracks?.items || []).map((item: any) => ({
        id: item.id,
        title: item.name,
        artist: item.artists[0]?.name || "Artista Desconhecido",
        thumbnail: item.album?.images[0]?.url || "",
        audioUrl: item.preview_url || undefined,
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

  const toggleLike = async (track: Track) => {
    const isLiked = likedTracks.some(t => t.id === track.id);
    setLikedTracks(prev => isLiked ? prev.filter(t => t.id !== track.id) : [...prev, track]);
  };

  const playNext = () => {
    const currentIndex = activeQueue.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex < activeQueue.length - 1) setCurrentTrack(activeQueue[currentIndex + 1]);
  };

  const playPrevious = () => {
    const currentIndex = activeQueue.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex > 0) setCurrentTrack(activeQueue[currentIndex - 1]);
  };

  return (
    <XalanifyContext.Provider value={{
      user, themeColor, setThemeColor, isOLED, setIsOLED, currentTrack, setCurrentTrack,
      isPlaying, setIsPlaying, currentTime, setCurrentTime, duration, setDuration,
      progress, setProgress, isExpanded, setIsExpanded, likedTracks, toggleLike,
      playlists, createPlaylist: async () => {}, addTrackToPlaylist: async () => {},
      removeTrackFromPlaylist: async () => {}, searchResults, setSearchResults,
      searchQuery, setSearchQuery, searchSpotify, isSearching, audioRef,
      activeQueue, setActiveQueue, playNext, playPrevious
    }}>
      <div className={`h-screen w-full ${isOLED ? "bg-black" : "bg-[#1a1a1a]"}`}>
        {children}
      </div>
    </XalanifyContext.Provider>
  );
}

export const useXalanify = () => {
  const context = useContext(XalanifyContext);
  if (!context) throw new Error("useXalanify must be used within XalanifyProvider");
  return context;
};