"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, ChevronDown, Heart, ListPlus, Shuffle, Repeat, SkipBack, SkipForward } from "lucide-react";
import { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import TrackOptions from "./TrackOptions";

const ReactPlayer = dynamic(() => import("react-player").then(m => m.default), { ssr: false }) as any;

export default function Player() {
  const { 
    currentTrack, isPlaying, setIsPlaying, themeColor, 
    isExpanded, setIsExpanded, progress, setProgress, 
    duration, setDuration, playNext, playPrevious 
  } = useXalanify();
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current && (currentTrack?.audioUrl || currentTrack?.isLocal)) {
      if (isPlaying) audioRef.current.play().catch(() => {});
      else audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  if (!currentTrack) return null;

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <>
      {/* MINI PLAYER */}
      {!isExpanded && (
        <div onClick={() => setIsExpanded(true)} className="fixed bottom-[85px] left-4 right-4 z-50 bg-zinc-900/95 border border-white/10 p-2 rounded-[2rem] flex items-center justify-between backdrop-blur-xl animate-in slide-in-from-bottom-4 shadow-2xl">
          <div className="flex items-center gap-3 pl-1 truncate">
            <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-2xl object-cover shadow-lg" alt="" />
            <div className="truncate text-left">
              <p className="text-sm font-bold truncate">{currentTrack.title}</p>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter">{currentTrack.artist}</p>
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} className="w-12 h-12 rounded-full flex items-center justify-center text-black" style={{ backgroundColor: themeColor }}>
            {isPlaying ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor" className="ml-1"/>}
          </button>
        </div>
      )}

      {/* PLAYER FULL SCREEN */}
      {isExpanded && (
        <div className="fixed inset-0 z-[100] bg-black animate-in slide-in-from-bottom duration-500 overflow-hidden flex flex-col p-8">
          <div className="absolute inset-0 opacity-40 blur-[100px]" style={{ background: `radial-gradient(circle, ${themeColor} 0%, transparent 70%)` }} />
          
          <button onClick={() => setIsExpanded(false)} className="relative z-10 w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-8">
            <ChevronDown size={28} />
          </button>

          <div className="relative z-10 flex-1 flex flex-col justify-center space-y-8">
            <img src={currentTrack.thumbnail} className="w-full aspect-square object-cover rounded-[3rem] shadow-2xl" alt="" />
            
            <div className="flex items-center justify-between text-left">
              <div className="max-w-[80%]">
                <h2 className="text-3xl font-black tracking-tighter leading-tight">{currentTrack.title}</h2>
                <p className="text-zinc-500 font-bold uppercase text-sm mt-1">{currentTrack.artist}</p>
              </div>
              <TrackOptions track={currentTrack} />
            </div>

            {/* BARRA DE PROGRESSO */}
            <div className="space-y-2">
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-300 ease-linear" 
                  style={{ backgroundColor: themeColor, width: `${progressPercent}%` }} 
                />
              </div>
              <div className="flex justify-between text-[10px] font-black text-zinc-500">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between px-4">
              <Shuffle size={20} className="text-zinc-600" />
              <div className="flex items-center gap-8">
                <button onClick={playPrevious} className="active:scale-90 transition-transform">
                  <SkipBack size={32} fill="white" />
                </button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-20 h-20 rounded-full flex items-center justify-center text-black shadow-2xl active:scale-95 transition-transform"
                  style={{ backgroundColor: themeColor }}
                >
                  {isPlaying ? <Pause size={36} fill="currentColor"/> : <Play size={36} fill="currentColor" className="ml-1"/>}
                </button>
                <button onClick={playNext} className="active:scale-90 transition-transform">
                  <SkipForward size={32} fill="white" />
                </button>
              </div>
              <Repeat size={20} className="text-zinc-600" />
            </div>
          </div>
        </div>
      )}

      {/* MOTORES DE REPRODUÇÃO */}
      <div className="hidden">
        {currentTrack.youtubeId && !currentTrack.audioUrl && (
          <ReactPlayer 
            url={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`} 
            playing={isPlaying} 
            onProgress={(state: any) => setProgress(state.playedSeconds)}
            onDuration={(d: number) => setDuration(d)}
            onEnded={playNext}
            config={{ youtube: { playerVars: { autoplay: 1 } } }}
          />
        )}
        {(currentTrack.audioUrl || currentTrack.isLocal) && (
          <audio 
            ref={audioRef} 
            src={currentTrack.isLocal ? "/test.mp3" : currentTrack.audioUrl} 
            onTimeUpdate={(e: any) => setProgress(e.target.currentTime)}
            onLoadedMetadata={(e: any) => setDuration(e.target.duration)}
            onEnded={playNext}
          />
        )}
      </div>
    </>
  );
}