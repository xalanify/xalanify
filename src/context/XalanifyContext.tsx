"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface XalanifyContextType {
  user: string | null;
  login: (username: string) => void;
  currentTrack: any;
  setCurrentTrack: (track: any) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  likedTracks: any[];
  toggleLike: (track: any) => void;
  playlists: any[];
  createPlaylist: (name: string) => void;
  themeColor: string;
  setThemeColor: (color: string) => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likedTracks, setLikedTracks] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [themeColor, setThemeColor] = useState("#a855f7");

  useEffect(() => {
    const savedUser = localStorage.getItem("xalanify_user");
    if (savedUser) setUser(savedUser);
    
    const savedLikes = localStorage.getItem("xalanify_likes");
    if (savedLikes) setLikedTracks(JSON.parse(savedLikes));

    const savedPlaylists = localStorage.getItem("xalanify_playlists");
    if (savedPlaylists) setPlaylists(JSON.parse(savedPlaylists));

    const savedColor = localStorage.getItem("xalanify_theme");
    if (savedColor) setThemeColor(savedColor);
  }, []);

  const login = (username: string) => {
    localStorage.setItem("xalanify_user", username);
    setUser(username);
  };

  const toggleLike = (track: any) => {
    const exists = likedTracks.find(t => t.id === track.id);
    const newLikes = exists ? likedTracks.filter(t => t.id !== track.id) : [...likedTracks, track];
    setLikedTracks(newLikes);
    localStorage.setItem("xalanify_likes", JSON.stringify(newLikes));
  };

  const createPlaylist = (name: string) => {
    const newPlaylists = [...playlists, { id: Date.now(), name, tracks: [] }];
    setPlaylists(newPlaylists);
    localStorage.setItem("xalanify_playlists", JSON.stringify(newPlaylists));
  };

  return (
    <XalanifyContext.Provider value={{ 
      user, login, currentTrack, setCurrentTrack, isPlaying, setIsPlaying, 
      likedTracks, toggleLike, playlists, createPlaylist, themeColor, setThemeColor 
    }}>
      <div style={{ "--primary": themeColor } as React.CSSProperties} className="min-h-screen bg-black text-white">
        {children}
      </div>
    </XalanifyContext.Provider>
  );
}

export const useXalanify = () => {
  const context = useContext(XalanifyContext);
  if (!context) throw new Error("useXalanify must be used within Provider");
  return context;
};