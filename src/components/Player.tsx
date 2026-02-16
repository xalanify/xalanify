"use client";
import React, { useEffect, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function Player() {
  const { 
    currentTrack, isPlaying, setIsPlaying, 
    progress, setProgress, duration, setDuration,
    themeColor, playNext, playPrevious, setIsExpanded 
  } = useXalanify();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Lógica de Autoplay e Progresso
  useEffect(() => {
    if (progress >= 99.9 && isPlaying) {
      playNext();
    }
  }, [progress, isPlaying, playNext]);

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[90] animate-in slide-in-from-bottom-10 duration-500">
      <div className="glass rounded-[2.5rem] p-4 flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden border border-white/5">
        
        {/* Glow de Fundo */}
        <div className="absolute inset-0 opacity-10 blur-3xl -z-10" style={{ backgroundColor: themeColor }} />

        {/* Capa */}
        <div className="relative w-14 h-14 flex-shrink-0 cursor-pointer" onClick={() => setIsExpanded(true)}>
          <img src={currentTrack.thumbnail} className="w-full h-full object-cover rounded-[1.2rem] shadow-lg" />
        </div>

        {/* Info */}
        <div className="flex-1 overflow-hidden cursor-pointer" onClick={() => setIsExpanded(true)}>
          <h4 className="font-black text-sm truncate italic tracking-tighter">{currentTrack.title}</h4>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest truncate">{currentTrack.artist}</p>
        </div>

        {/* Controlos */}
        <div className="flex items-center gap-2 pr-2">
          <button onClick={playPrevious} className="p-2 opacity-40 hover:opacity-100 transition-all active:scale-90">
            <SkipBack size={20} fill="white" />
          </button>

          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-xl"
            style={{ backgroundColor: themeColor }}
          >
            {isPlaying ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" className="ml-1" />}
          </button>

          <button onClick={playNext} className="p-2 opacity-40 hover:opacity-100 transition-all active:scale-90">
            <SkipForward size={20} fill="white" />
          </button>
        </div>

        {/* Barra de Progresso Minimalista no fundo */}
        <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-300 shadow-[0_0_10px_var(--theme-color)]"
            style={{ width: `${progress}%`, backgroundColor: themeColor }}
          />
        </div>
      </div>
    </div>
  );
}