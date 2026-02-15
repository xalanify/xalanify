"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, ChevronDown, SkipBack, SkipForward } from "lucide-react";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import TrackOptions from "./TrackOptions";

const ReactPlayer = dynamic(() => import("react-player").then(m => m.default), { ssr: false }) as any;

export default function Player() {
  const { 
    currentTrack, isPlaying, setIsPlaying, themeColor, 
    isExpanded, setIsExpanded, progress, setProgress, 
    duration, setDuration, playNext, playPrevious, addLog
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
        className={`fixed left-4 right-4 z-[90] bg-zinc-900/90 border border-white/10 p-2 rounded-[2rem] flex items-center justify-between backdrop-blur-xl transition-all ${isExpanded ? 'opacity-0 pointer-events-none' : 'bottom-[85px]'}`}
      >
        <div className="flex items-center gap-3 overflow-hidden px-2">
          <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-2xl object-cover shadow-lg" />
          <div className="truncate">
            <p className="text-xs font-bold truncate">{currentTrack.title}</p>
            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter">{currentTrack.artist}</p>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} className="p-3">
          {isPlaying ? <Pause size={22} fill="white"/> : <Play size={22} fill="white"/>}
        </button>
      </div>

      {/* EXPANDIDO */}
      {isExpanded && (
        <div className="fixed inset-0 z-[200] bg-black p-8 flex flex-col animate-in slide-in-from-bottom duration-500">
          <div className="flex justify-between items-center mb-10">
            <button onClick={() => setIsExpanded(false)} className="opacity-50"><ChevronDown size={32} /></button>
            <TrackOptions track={currentTrack} />
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-center">
             <img src={currentTrack.thumbnail} className="w-full max-w-[300px] aspect-square rounded-[3rem] object-cover shadow-2xl" />
             <div className="w-full px-4">
                <h2 className="text-2xl font-black italic truncate">{currentTrack.title}</h2>
                <p className="text-sm font-bold opacity-40 mt-2 uppercase tracking-widest" style={{ color: themeColor }}>{currentTrack.artist}</p>
             </div>
          </div>

          <div className="w-full space-y-8 pb-12 px-2">
            <div className="space-y-2">
              <input 
                type="range" min={0} max={duration || 100} step="any"
                value={progress}
                onChange={handleSeek}
                onMouseDown={() => setIsSeeking(true)}
                onMouseUp={() => setIsSeeking(false)}
                className="w-full h-1.5 rounded-full appearance-none bg-zinc-800 cursor-pointer"
                style={{ background: `linear-gradient(to right, ${themeColor} ${(progress/(duration || 1))*100}%, #333 0%)` }}
              />
              <div className="flex justify-between text-[10px] font-black opacity-30">
                <span>{new Date(progress * 1000).toISOString().substr(14, 5)}</span>
                <span>{new Date(duration * 1000).toISOString().substr(14, 5)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-10">
              <button onClick={playPrevious} className="active:scale-90 transition-transform"><SkipBack size={32} fill="white"/></button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-20 h-20 rounded-full flex items-center justify-center text-black shadow-2xl active:scale-95 transition-all"
                style={{ backgroundColor: themeColor }}
              >
                {isPlaying ? <Pause size={36} fill="currentColor"/> : <Play size={36} fill="currentColor" className="ml-1"/>}
              </button>
              <button onClick={playNext} className="active:scale-90 transition-transform"><SkipForward size={32} fill="white"/></button>
            </div>
          </div>
        </div>
      )}

      <div className="hidden">
        <ReactPlayer 
          ref={playerRef}
          url={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`} 
          playing={isPlaying}
          onProgress={(s: any) => !isSeeking && setProgress(s.playedSeconds)}
          onDuration={setDuration}
          onEnded={() => { addLog("Música terminou"); playNext(); }}
        />
      </div>
    </>
  );
}