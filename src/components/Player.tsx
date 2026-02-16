"use client";
import React, { useEffect, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, Maximize2 } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function Player() {
  const { 
    currentTrack, isPlaying, setIsPlaying, 
    progress, setProgress, setDuration,
    themeColor, playNext, playPrevious, setIsExpanded 
  } = useXalanify();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sincronização do estado Play/Pause com o elemento HTML5
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  if (!currentTrack) return null;

  // URL de stream (usando o ID do YouTube que convertemos)
  const audioUrl = `https://www.youtube.com/watch?v=${currentTrack.youtubeId}`;
  // Nota: Para apps web reais, usamos proxys ou o link direto se disponível. 
  // Se estiveres a usar o Spotify Downloader API, o link vem de lá.

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[90] animate-in slide-in-from-bottom-10 duration-500">
      {/* Elemento de Áudio Oculto */}
      <audio 
        ref={audioRef}
        src={currentTrack.youtubeId ? `https://api.spotify-downloader.com/stream/${currentTrack.youtubeId}` : ''} 
        onTimeUpdate={(e) => {
          const target = e.currentTarget;
          setProgress((target.currentTime / target.duration) * 100);
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => playNext()} // AQUI É ONDE A MÁGICA ACONTECE
        autoPlay={isPlaying}
      />

      <div className="glass rounded-[2.5rem] p-4 flex items-center gap-4 shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute inset-0 opacity-10 blur-3xl -z-10" style={{ backgroundColor: themeColor }} />

        <div onClick={() => setIsExpanded(true)} className="flex items-center gap-4 flex-1 cursor-pointer">
          <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-2xl object-cover shadow-lg" alt="" />
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-sm truncate tracking-tight">{currentTrack.title}</h4>
            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest truncate">{currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={playPrevious} className="p-2 opacity-40 hover:opacity-100 transition-all"><SkipBack size={20} fill="white" /></button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ backgroundColor: themeColor }}
          >
            {isPlaying ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" className="ml-1" />}
          </button>
          <button onClick={playNext} className="p-2 opacity-40 hover:opacity-100 transition-all"><SkipForward size={20} fill="white" /></button>
        </div>

        {/* Barra de Progresso */}
        <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: themeColor }} />
        </div>
      </div>
    </div>
  );
}