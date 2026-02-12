"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  youtubeId?: string;
  audioUrl?: string;
  isLocal?: boolean;
}

interface XalanifyContextType {
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  user: string | null;
  isAdmin: boolean;
  login: (name: string) => void;
  updateUserName: (name: string) => void;
  themeColor: string;
  audioEngine: 'youtube' | 'direct';
  setAudioEngine: (engine: 'youtube' | 'direct') => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [audioEngine, setAudioEngine] = useState<'youtube' | 'direct'>('youtube');

  useEffect(() => {
    const saved = localStorage.getItem("xalanify_user");
    if (saved) { setUser(saved); setIsAdmin(saved === "@admin1"); }
    const savedEngine = localStorage.getItem("xalanify_engine");
    if (savedEngine) setAudioEngine(savedEngine as any);
  }, []);

  const login = (name: string) => {
    setUser(name); setIsAdmin(name === "@admin1");
    localStorage.setItem("xalanify_user", name);
  };

  const updateUserName = (name: string) => {
    setUser(name); setIsAdmin(name === "@admin1");
    localStorage.setItem("xalanify_user", name);
  };

  const changeEngine = (engine: 'youtube' | 'direct') => {
    setAudioEngine(engine);
    localStorage.setItem("xalanify_engine", engine);
  };

  return (
    <XalanifyContext.Provider value={{ 
      currentTrack, setCurrentTrack, isPlaying, setIsPlaying, 
      user, isAdmin, login, updateUserName, themeColor, 
      audioEngine, setAudioEngine: changeEngine 
    }}>
      {children}
    </XalanifyContext.Provider>
  );
}

export const useXalanify = () => {
  const context = useContext(XalanifyContext);
  if (!context) throw new Error("useXalanify error");
  return context;
};