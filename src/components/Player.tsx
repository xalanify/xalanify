"use client";
import React, { useEffect, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function Player() {
  const { 
    currentTrack, isPlaying, setIsPlaying, 
    progress, setProgress, duration, setDuration,
    themeColor, playNext, playPrevious
  } = useXalanify();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
    else audioRef.current.pause();
  }, [isPlaying, currentTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const pos = (clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pos * audioRef.current.duration;
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[90] animate-in slide-in-from-bottom-5">
      <audio 
        ref={audioRef}
        src={currentTrack.audioUrl || `https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={playNext}
      />
      
      <div className="glass rounded-[2.5rem] p-4 flex items-center gap-4 border border-white/5 shadow-2xl overflow-hidden">
        <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-2xl object-cover shadow-lg" alt="" />
        
        <div className="flex-1 overflow-hidden">
          <h4 className="font-bold text-sm truncate italic">{currentTrack.title}</h4>
          <p className="text-[10px] font-black opacity-30 uppercase truncate">{currentTrack.artist}</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={playPrevious} className="p-2 opacity-40"><SkipBack size={20} fill="white" /></button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-transform active:scale-90"
            style={{ backgroundColor: themeColor }}
          >
            {isPlaying ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" className="ml-1" />}
          </button>
          <button onClick={playNext} className="p-2 opacity-40"><SkipForward size={20} fill="white" /></button>
        </div>

        {/* Barra de Progresso Funcional */}
        <div 
          onClick={handleSeek}
          className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 cursor-pointer group"
        >
          <div 
            className="h-full transition-all duration-100 relative"
            style={{ width: `${progress}%`, backgroundColor: themeColor }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 shadow-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}