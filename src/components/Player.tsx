"use client";
import React, { useEffect, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function Player() {
  const { 
    currentTrack, isPlaying, setIsPlaying, 
    progress, setProgress, themeColor, playNext 
  } = useXalanify();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sincroniza o estado de play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  // Função para clicar/arrastar na barra (Seek)
  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clickPos = (clientX - rect.left) / rect.width;
    
    const newTime = clickPos * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setProgress(clickPos * 100);
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[90] animate-in slide-in-from-bottom-5">
      <audio 
        ref={audioRef} 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={playNext}
        src={currentTrack.audioUrl || `https://www.youtube.com/watch?v=${currentTrack.youtubeId}`} 
      />
      
      <div className="glass rounded-[2.5rem] p-4 flex items-center gap-4 border border-white/5 shadow-2xl relative overflow-hidden">
        <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-2xl object-cover shadow-lg" alt="" />
        
        <div className="flex-1 overflow-hidden">
          <h4 className="font-bold text-sm truncate italic">{currentTrack.title}</h4>
          <p className="text-[10px] opacity-30 uppercase font-black tracking-widest truncate">{currentTrack.artist}</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 opacity-40 hover:opacity-100 transition-opacity"><SkipBack size={20} fill="white"/></button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 hover:brightness-110" 
            style={{ backgroundColor: themeColor }}
          >
            {isPlaying ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" className="ml-1" />}
          </button>
          <button onClick={playNext} className="p-2 opacity-40 hover:opacity-100 transition-opacity"><SkipForward size={20} fill="white"/></button>
        </div>

        {/* Barra de Progresso Interativa (Seek bar) */}
        <div 
          onClick={handleSeek}
          className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/5 cursor-pointer group transition-all hover:h-2"
        >
          <div 
            className="h-full transition-all duration-100 relative" 
            style={{ width: `${progress}%`, backgroundColor: themeColor }}
          >
            {/* Knob estilo iOS que aparece no hover */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-xl transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  );
}