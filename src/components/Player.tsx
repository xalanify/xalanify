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

  // EFREITO CRÍTICO: Forçar play quando a música muda
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.load(); 
      setIsPlaying(true);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          console.log("Autoplay bloqueado, aguardando interação do utilizador.");
        });
      }
    }
  }, [currentTrack?.id]);

  // Sincronização do estado isPlaying com o elemento <audio>
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[90] animate-in slide-in-from-bottom-10 duration-500">
      <div className="glass rounded-[2.5rem] p-4 flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden border border-white/5">
        
        <div className="absolute inset-0 opacity-10 blur-3xl -z-10" style={{ backgroundColor: themeColor }} />

        <audio
          ref={audioRef}
          src={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
          onTimeUpdate={(e) => {
            const cur = e.currentTarget.currentTime;
            const dur = e.currentTarget.duration;
            if (dur) setProgress((cur / dur) * 100);
          }}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={playNext}
          autoPlay
        />

        <div className="relative flex-shrink-0 cursor-pointer" onClick={() => setIsExpanded(true)}>
          <img src={currentTrack.thumbnail} className="w-14 h-14 rounded-2xl object-cover shadow-lg" alt="" />
          <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
             <Play size={20} fill="white" />
          </div>
        </div>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setIsExpanded(true)}>
          <h4 className="text-sm truncate italic tracking-tighter">{currentTrack.title}</h4>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest truncate">{currentTrack.artist}</p>
        </div>

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

        <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-300" 
            style={{ width: `${progress}%`, backgroundColor: themeColor }}
          />
        </div>
      </div>
    </div>
  );
}