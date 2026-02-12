"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  youtubeId?: string;
}

interface XalanifyContextType {
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  user: string | null;
  isAdmin: boolean; // ADICIONADO
  login: (name: string) => void;
  themeColor: string;
  setThemeColor: (color: string) => void;
  likedTracks: Track[];
  toggleLike: (track: Track) => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false); // ADICIONADO
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("xalanify_user");
    const savedTheme = localStorage.getItem("xalanify_theme");
    const savedLikes = localStorage.getItem("xalanify_likes");
    
    if (savedUser) {
      setUser(savedUser);
      setIsAdmin(savedUser === "@admin1");
    }
    if (savedTheme) setThemeColor(savedTheme);
    if (savedLikes) setLikedTracks(JSON.parse(savedLikes));
  }, []);

  const login = (name: string) => {
    setUser(name);
    setIsAdmin(name === "@admin1");
    localStorage.setItem("xalanify_user", name);
  };

  const toggleLike = (track: Track) => {
    const newLikes = likedTracks.some(t => t.id === track.id)
      ? likedTracks.filter(t => t.id !== track.id)
      : [...likedTracks, track];
    setLikedTracks(newLikes);
    localStorage.setItem("xalanify_likes", JSON.stringify(newLikes));
  };

  return (
    <XalanifyContext.Provider value={{ 
      currentTrack, setCurrentTrack, isPlaying, setIsPlaying, 
      user, isAdmin, login, themeColor, setThemeColor, 
      likedTracks, toggleLike 
    }}>
      {children}
    </XalanifyContext.Provider>
  );
}

export const useXalanify = () => {
  const context = useContext(XalanifyContext);
  if (!context) throw new Error("useXalanify must be used within Provider");
  return context;
};