"use client";
import React, { useRef, useEffect } from "react";
import ReactPlayer from "react-player/youtube";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function Player() {
  const { 
    currentTrack, isPlaying, setIsPlaying, 
    progress, setProgress, setDuration, lastSeek,
    themeColor, playNext, playPrevious, setIsExpanded 
  } = useXalanify();

  const playerRef = useRef<ReactPlayer>(null);

  // Sincroniza o tempo quando o contexto pede um seek (ex: início da música)
  useEffect(() => {
    if (lastSeek !== undefined && playerRef.current) {
      playerRef.current.seekTo(lastSeek, 'seconds');
    }
  }, [lastSeek]);

  if (!currentTrack) return null;

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const totalDuration = playerRef.current.getDuration();
    
    if (totalDuration) {
      playerRef.current.seekTo(percentage * totalDuration, 'seconds');
    }
  };

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[90] animate-in slide-in-from-bottom-10">
      <div className="hidden">
        <ReactPlayer
          ref={playerRef}
          url={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
          playing={isPlaying}
          onProgress={(state) => setProgress(state.played * 100)}
          onDuration={(d) => setDuration(d)}
          onEnded={playNext}
          config={{ youtube: { playerVars: { autoplay: 1, controls: 0, modestbranding: 1 } } }}
        />
      </div>

      <div className="glass rounded-[2rem] p-4 flex items-center gap-4 shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute inset-0 opacity-10 blur-3xl -z-10" style={{ backgroundColor: themeColor }} />

        <div onClick={() => setIsExpanded(true)} className="flex items-center gap-4 flex-1 cursor-pointer overflow-hidden">
          <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-xl object-cover shadow-lg" alt="" />
          <div className="flex-1 overflow-hidden">
            <h4 className="text-sm font-extrabold truncate tracking-tight text-white">{currentTrack.title}</h4>
            <p className="text-[10px] font-bold opacity-40 uppercase truncate tracking-widest">{currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 pr-2">
          <button onClick={playPrevious} className="p-2 opacity-40 hover:opacity-100 transition-all active:scale-75">
            <SkipBack size={20} fill="white" />
          </button>

          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-xl"
            style={{ backgroundColor: themeColor }}
          >
            {isPlaying ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" className="ml-1" />}
          </button>

          <button onClick={playNext} className="p-2 opacity-40 hover:opacity-100 transition-all active:scale-75">
            <SkipForward size={20} fill="white" />
          </button>
        </div>

        {/* SeekBar funcional ao clicar/arrastar */}
        <div 
          onClick={handleProgressBarClick}
          className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/5 cursor-pointer group"
        >
          <div 
            className="h-full transition-all duration-100 relative"
            style={{ width: `${progress}%`, backgroundColor: themeColor }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full scale-0 group-hover:scale-100 transition-transform shadow-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}