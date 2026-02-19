"use client";
import React, { useEffect, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, Maximize2 } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, progress, setProgress, themeColor, setIsExpanded } = useXalanify();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
    else audioRef.current.pause();
  }, [isPlaying, currentTrack]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pos * audioRef.current.duration;
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[90] animate-in slide-in-from-bottom-5">
      <audio 
        ref={audioRef} 
        onTimeUpdate={() => setProgress((audioRef.current!.currentTime / audioRef.current!.duration) * 100)} 
        src={currentTrack.audioUrl} 
      />
      
      <div className="glass rounded-[2.5rem] p-4 flex items-center gap-4 border border-white/10 shadow-2xl relative overflow-hidden cursor-pointer" onClick={() => setIsExpanded(true)}>
        <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-2xl object-cover shadow-lg" alt="" />
        
        <div className="flex-1 overflow-hidden">
          <h4 className="font-bold text-sm truncate italic">{currentTrack.title}</h4>
          <p className="text-[10px] opacity-30 uppercase font-black tracking-tighter">{currentTrack.artist}</p>
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-xl" style={{ backgroundColor: themeColor }}>
            {isPlaying ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" className="ml-1" />}
          </button>
        </div>

        {/* Barra de Progresso Interativa (Seek) */}
        <div onClick={(e) => { e.stopPropagation(); handleSeek(e); }} className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/5 cursor-pointer">
          <div className="h-full transition-all duration-100" style={{ width: `${progress}%`, backgroundColor: themeColor }} />
        </div>
      </div>
    </div>
  );
}