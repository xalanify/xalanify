"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";

// Importação dinâmica corrigida para evitar erro de módulo não encontrado
const ReactPlayer = dynamic(() => import("react-player").then(mod => mod.default), { 
  ssr: false,
  loading: () => <div className="hidden" /> 
}) as any; 

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, themeColor } = useXalanify();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && (currentTrack?.audioUrl || currentTrack?.isLocal)) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack, setIsPlaying]);

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-[85px] left-0 right-0 z-50 px-4 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        
        {/* MOTOR YOUTUBE */}
        {currentTrack.youtubeId && !currentTrack.audioUrl && (
          <div className="hidden">
            <ReactPlayer
              url={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
              playing={isPlaying}
              onEnded={() => setIsPlaying(false)}
              config={{ youtube: { playerVars: { autoplay: 1, controls: 0 } } }}
            />
          </div>
        )}

        {/* MOTOR NATIVO (Local/Direct) */}
        {(currentTrack.audioUrl || currentTrack.isLocal) && (
          <audio 
            ref={audioRef} 
            src={currentTrack.isLocal ? "/test.mp3" : currentTrack.audioUrl} 
            onEnded={() => setIsPlaying(false)}
          />
        )}

        <div className="bg-zinc-900/95 border border-white/10 p-2.5 rounded-[2.2rem] flex items-center justify-between shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center gap-3 pl-1 truncate max-w-[70%]">
            <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-2xl object-cover" alt="" />
            <div className="truncate text-left">
              <p className="text-[14px] font-bold text-white truncate leading-tight">{currentTrack.title}</p>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{currentTrack.artist}</p>
            </div>
          </div>

          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="w-12 h-12 rounded-full flex items-center justify-center text-black active:scale-90 transition-all shadow-lg"
            style={{ backgroundColor: themeColor }}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}