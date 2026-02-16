"use client";
import React, { useEffect, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2, Maximize2 } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function Player() {
  const { 
    currentTrack, isPlaying, setIsPlaying, 
    progress, setProgress, duration, setDuration,
    themeColor, playNext, playPrevious, setIsExpanded 
  } = useXalanify();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Monitoriza o fim da música para Autoplay
  useEffect(() => {
    if (progress >= 99.8 && isPlaying) {
      playNext();
    }
  }, [progress, isPlaying, playNext]);

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[90] animate-in slide-in-from-bottom-10 duration-500">
      {/* Container Principal Estilo Vidro iOS */}
      <div className="glass rounded-[2.5rem] p-4 flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        
        {/* Glow de Fundo Dinâmico */}
        <div 
          className="absolute inset-0 opacity-10 blur-3xl -z-10"
          style={{ backgroundColor: themeColor }}
        />

        {/* Capa da Música com Mini-Glow */}
        <div 
          className="relative w-14 h-14 flex-shrink-0 cursor-pointer group"
          onClick={() => setIsExpanded(true)}
        >
          <img 
            src={currentTrack.thumbnail} 
            className="w-full h-full object-cover rounded-[1.2rem] shadow-lg group-hover:scale-105 transition-transform" 
          />
          <div 
            className="absolute inset-0 rounded-[1.2rem] opacity-40 blur-sm -z-10"
            style={{ backgroundColor: themeColor }}
          />
        </div>

        {/* Info da Música */}
        <div className="flex-1 overflow-hidden cursor-pointer" onClick={() => setIsExpanded(true)}>
          <h4 className="font-black text-sm truncate italic tracking-tighter">{currentTrack.title}</h4>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest truncate">{currentTrack.artist}</p>
        </div>

        {/* Controlos Médios */}
        <div className="flex items-center gap-2 pr-2">
          <button 
            onClick={playPrevious}
            className="p-2 opacity-40 hover:opacity-100 hover:scale-110 transition-all"
          >
            <SkipBack size={20} fill="white" />
          </button>

          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-xl"
            style={{ backgroundColor: themeColor }}
          >
            {isPlaying ? (
              <Pause size={22} fill="white" className="text-white" />
            ) : (
              <Play size={22} fill="white" className="ml-1 text-white" />
            )}
          </button>

          <button 
            onClick={playNext}
            className="p-2 opacity-40 hover:opacity-100 hover:scale-110 transition-all"
          >
            <SkipForward size={20} fill="white" />
          </button>
        </div>

        {/* Barra de Progresso Minimalista (Overlay no fundo do player) */}
        <div className="absolute bottom-0 left-6 right-6 h-[3px] bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-300 ease-linear shadow-[0_0_10px_var(--theme-color)]"
            style={{ 
              width: `${progress}%`, 
              backgroundColor: themeColor,
              boxShadow: `0 0 12px ${themeColor}`
            }}
          />
        </div>
      </div>
    </div>
  );
}