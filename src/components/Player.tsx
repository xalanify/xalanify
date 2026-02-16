"use client";
import React, { useRef } from "react";
import ReactPlayer from "react-player/youtube";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function Player() {
  const { 
    currentTrack, isPlaying, setIsPlaying, 
    progress, setProgress, setDuration,
    themeColor, playNext, playPrevious, setIsExpanded 
  } = useXalanify();

  // Definimos o tipo do Ref para evitar o erro de "Property does not exist"
  const playerRef = useRef<ReactPlayer>(null);

  if (!currentTrack) return null;

  const videoUrl = `https://www.youtube.com/watch?v=${currentTrack.youtubeId}`;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[90] animate-in slide-in-from-bottom-10 duration-500">
      {/* O motor do som (Invisível) */}
      <div className="hidden">
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          playing={isPlaying}
          controls={false}
          width="0"
          height="0"
          // O onProgress atualiza o estado global 'progress' (0 a 100)
          onProgress={(state) => setProgress(state.played * 100)}
          onDuration={(d) => setDuration(d)}
          onEnded={playNext}
          config={{
            youtube: {
              playerVars: { 
                autoplay: 1,
                controls: 0,
                modestbranding: 1,
                iv_load_policy: 3
              }
            }
          }}
        />
      </div>

      <div className="glass rounded-[2.5rem] p-4 flex items-center gap-4 shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute inset-0 opacity-10 blur-3xl -z-10" style={{ backgroundColor: themeColor }} />

        {/* Capa e Info */}
        <div onClick={() => setIsExpanded(true)} className="flex items-center gap-4 flex-1 cursor-pointer overflow-hidden">
          <img 
            src={currentTrack.thumbnail || "/api/placeholder/100/100"} 
            className="w-12 h-12 rounded-2xl object-cover shadow-lg" 
            alt={currentTrack.title} 
          />
          <div className="flex-1 overflow-hidden">
            <h4 className="text-sm font-bold truncate italic tracking-tighter">{currentTrack.title}</h4>
            <p className="text-[10px] font-bold opacity-40 uppercase truncate tracking-widest">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Controlos */}
        <div className="flex items-center gap-2 pr-2">
          <button onClick={playPrevious} className="p-2 opacity-40 hover:opacity-100 active:scale-90 transition-opacity">
            <SkipBack size={20} fill="white" />
          </button>

          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-xl hover:brightness-110"
            style={{ backgroundColor: themeColor }}
          >
            {isPlaying ? (
              <Pause size={22} fill="white" />
            ) : (
              <Play size={22} fill="white" className="ml-1" />
            )}
          </button>

          <button onClick={playNext} className="p-2 opacity-40 hover:opacity-100 active:scale-90 transition-opacity">
            <SkipForward size={20} fill="white" />
          </button>
        </div>

        {/* Barra de Progresso Corrigida (Usa o estado do contexto) */}
        <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-300"
            style={{ 
              width: `${progress}%`, 
              backgroundColor: themeColor 
            }}
          />
        </div>
      </div>
    </div>
  );
}