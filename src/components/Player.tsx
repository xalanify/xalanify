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

  const playerRef = useRef<ReactPlayer>(null);

  if (!currentTrack) return null;

  // A barra de progresso só anda se o onProgress for disparado
  const handleProgress = (state: { played: number, playedSeconds: number }) => {
    setProgress(state.played * 100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    playerRef.current?.seekTo(percent, 'fraction');
  };

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[90] animate-in slide-in-from-bottom-10 duration-500">
      {/* Motor de Áudio (Invisível) */}
      <div className="hidden">
        <ReactPlayer
          ref={playerRef}
          url={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
          playing={isPlaying}
          onProgress={handleProgress}
          onDuration={(d) => setDuration(d)}
          onEnded={() => playNext()}
          config={{
            youtube: {
              playerVars: { autoplay: 1, controls: 0 }
            }
          }}
        />
      </div>

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
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-xl"
            style={{ backgroundColor: themeColor }}
          >
            {isPlaying ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" className="ml-1" />}
          </button>
          <button onClick={playNext} className="p-2 opacity-40 hover:opacity-100 transition-all"><SkipForward size={20} fill="white" /></button>
        </div>

        {/* Barra de Progresso Interativa */}
        <div 
          onClick={handleSeek}
          className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 cursor-pointer group"
        >
          <div 
            className="h-full transition-all duration-150" 
            style={{ width: `${progress}%`, backgroundColor: themeColor }} 
          />
        </div>
      </div>
    </div>
  );
}