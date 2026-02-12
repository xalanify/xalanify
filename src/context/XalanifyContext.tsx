"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  youtubeId?: string;
  isLocal?: boolean; // Define se é um ficheiro na pasta public
}

interface XalanifyContextType {
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  user: string | null;
  isAdmin: boolean;
  login: (name: string) => void;
  updateUserName: (newName: string) => void;
  themeColor: string;
  setThemeColor: (color: string) => void;
  likedTracks: Track[];
  toggleLike: (track: Track) => void;
  clearAdminCache: () => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("xalanify_user");
    if (savedUser) {
      setUser(savedUser);
      setIsAdmin(savedUser === "@admin1");
    }
  }, []);

  const login = (name: string) => {
    setUser(name);
    setIsAdmin(name === "@admin1");
    localStorage.setItem("xalanify_user", name);
  };

  const updateUserName = (newName: string) => {
    setUser(newName);
    setIsAdmin(newName === "@admin1");
    localStorage.setItem("xalanify_user", newName);
  };

  const clearAdminCache = () => {
    localStorage.clear();
    window.location.reload();
  };

  const toggleLike = (track: Track) => {
    setLikedTracks(prev => 
      prev.some(t => t.id === track.id) ? prev.filter(t => t.id !== track.id) : [...prev, track]
    );
  };

  return (
    <XalanifyContext.Provider value={{ 
      currentTrack, setCurrentTrack, isPlaying, setIsPlaying, 
      user, isAdmin, login, updateUserName, themeColor, setThemeColor, 
      likedTracks, toggleLike, clearAdminCache 
    }}>
      {children}
    </XalanifyContext.Provider>
  );
}

export const useXalanify = () => {
  const context = useContext(XalanifyContext);
  if (!context) throw new Error("useXalanify context missing");
  return context;
};