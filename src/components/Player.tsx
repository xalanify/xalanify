"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, ChevronDown, Heart, SkipBack, SkipForward, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import TrackOptions from "./TrackOptions";
import { getYoutubeId } from "@/lib/musicApi";

const ReactPlayer = dynamic(() => import("react-player").then(m => m.default), { ssr: false }) as any;

export default function Player() {
  const { 
    currentTrack, isPlaying, setIsPlaying, themeColor, 
    isExpanded, setIsExpanded, progress, setProgress, 
    duration, setDuration, playNext, playPrevious
  } = useXalanify();
  
  const playerRef = useRef<any>(null);
  const [isSeeking, setIsSeeking] = useState(false);

  if (!currentTrack) return null;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    playerRef.current?.seekTo(val);
  };

  return (
    <>
      {/* MINI PLAYER */}
      <div 
        onClick={() => setIsExpanded(true)}
        className={`fixed left-4 right-4 z-50 bg-zinc-900/90 border border-white/10 p-2 rounded-[2rem] flex items-center justify-between backdrop-blur-xl transition-all ${isExpanded ? 'opacity-0 pointer-events-none' : 'bottom-[85px] opacity-100'}`}
      >
        <div className="flex items-center gap-3 overflow-hidden px-2">
          <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-2xl object-cover shadow-lg" />
          <div className="truncate">
            <p className="text-xs font-bold truncate">{currentTrack.title}</p>
            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter">{currentTrack.artist}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} className="p-3 hover:scale-110 transition-transform">
            {isPlaying ? <Pause size={20} fill="white"/> : <Play size={20} fill="white"/>}
          </button>
        </div>
      </div>

      {/* PLAYER EXPANDIDO */}
      {isExpanded && (
        <div className="fixed inset-0 z-[200] bg-black p-8 flex flex-col animate-in slide-in-from-bottom duration-500">
          <div className="flex justify-between items-center mb-10">
            <button onClick={() => setIsExpanded(false)} className="opacity-50 hover:opacity-100 transition-opacity">
              <ChevronDown size={32} />
            </button>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">A tocar agora</p>
            <TrackOptions track={currentTrack} />
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center space-y-8">
             <div className="relative group w-full max-w-[320px]">
                <img src={currentTrack.thumbnail} className="w-full aspect-square rounded-[3rem] object-cover shadow-2xl transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 rounded-[3rem] shadow-[inset_0_0_80px_rgba(0,0,0,0.6)]" />
             </div>
             <div className="text-center w-full px-4">
                <h2 className="text-2xl font-black italic truncate">{currentTrack.title}</h2>
                <p className="text-sm font-bold uppercase tracking-widest opacity-40 mt-2" style={{ color: themeColor }}>{currentTrack.artist}</p>
             </div>
          </div>

          <div className="w-full space-y-8 pb-12">
            <div className="space-y-2">
              <input 
                type="range" min={0} max={duration || 100} step="any"
                value={progress}
                onChange={handleSeek}
                onMouseDown={() => setIsSeeking(true)}
                onMouseUp={() => setIsSeeking(false)}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-white"
                style={{ background: `linear-gradient(to right, ${themeColor} ${(progress/(duration || 1))*100}%, #333 0%)` }}
              />
              <div className="flex justify-between text-[10px] font-black opacity-40 uppercase tracking-tighter">
                <span>{new Date(progress * 1000).toISOString().substr(14, 5)}</span>
                <span>{new Date(duration * 1000).toISOString().substr(14, 5)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-10">
              <button onClick={playPrevious} className="hover:scale-110 active:scale-90 transition-all"><SkipBack size={32} fill="white"/></button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-20 h-20 rounded-full flex items-center justify-center text-black shadow-2xl transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: themeColor }}
              >
                {isPlaying ? <Pause size={36} fill="currentColor"/> : <Play size={36} fill="currentColor" className="ml-1"/>}
              </button>
              <button onClick={playNext} className="hover:scale-110 active:scale-90 transition-all"><SkipForward size={32} fill="white"/></button>
            </div>
          </div>
        </div>
      )}

      {/* MOTOR YOUTUBE OCULTO */}
      <div className="hidden">
        <ReactPlayer 
          ref={playerRef}
          url={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`} 
          playing={isPlaying}
          onProgress={(s: any) => !isSeeking && setProgress(s.playedSeconds)}
          onDuration={setDuration}
          onEnded={playNext}
          config={{ youtube: { playerVars: { autoplay: 1 } } }}
        />
      </div>
    </>
  );
}