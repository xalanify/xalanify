"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

// Adicionamos as definições de LikedTracks e toggleLike aqui na Interface
interface XalanifyContextType {
  user: string | null;
  login: (username: string) => void;
  currentTrack: any;
  setCurrentTrack: (track: any) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  likedTracks: any[];
  toggleLike: (track: any) => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likedTracks, setLikedTracks] = useState<any[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("xalanify_user");
    if (savedUser) setUser(savedUser);
    
    const savedLikes = localStorage.getItem("xalanify_likes");
    if (savedLikes) setLikedTracks(JSON.parse(savedLikes));
  }, []);

  const login = (username: string) => {
    localStorage.setItem("xalanify_user", username);
    setUser(username);
  };

  const toggleLike = (track: any) => {
    const exists = likedTracks.find(t => t.id === track.id);
    let newLikes;
    if (exists) {
      newLikes = likedTracks.filter(t => t.id !== track.id);
    } else {
      newLikes = [...likedTracks, track];
    }
    setLikedTracks(newLikes);
    localStorage.setItem("xalanify_likes", JSON.stringify(newLikes));
  };

  return (
    <XalanifyContext.Provider 
      value={{ 
        user, login, currentTrack, setCurrentTrack, 
        isPlaying, setIsPlaying, likedTracks, toggleLike 
      }}
    >
      {children}
    </XalanifyContext.Provider>
  );
}

export const useXalanify = () => {
  const context = useContext(XalanifyContext);
  if (!context) throw new Error("useXalanify must be used within Provider");
  return context;
};