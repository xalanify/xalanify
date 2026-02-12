"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface XalanifyContextType {
  user: string | null;
  login: (username: string) => void;
  currentTrack: any;
  setCurrentTrack: (track: any) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

const XalanifyContext = createContext<XalanifyContextType | undefined>(undefined);

export function XalanifyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("xalanify_user");
    if (savedUser) setUser(savedUser);
  }, []);

  const login = (username: string) => {
    localStorage.setItem("xalanify_user", username);
    setUser(username);
  };

  return (
    <XalanifyContext.Provider value={{ user, login, currentTrack, setCurrentTrack, isPlaying, setIsPlaying }}>
      {children}
    </XalanifyContext.Provider>
  );
}

export const useXalanify = () => {
  const context = useContext(XalanifyContext);
  if (!context) throw new Error("useXalanify must be used within Provider");
  return context;
};