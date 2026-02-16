"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { ChevronDown, Play, Pause, SkipForward, SkipBack, Heart, Shuffle, Repeat } from "lucide-react";
import TrackOptions from "./TrackOptions";

export default function ExpandedPlayer() {
  const { 
    currentTrack, isPlaying, setIsPlaying, progress, 
    themeColor, setIsExpanded, isExpanded, toggleLike, likedTracks,
    playNext, playPrevious
  } = useXalanify();

  if (!isExpanded || !currentTrack) return null;
  const isLiked = likedTracks.some(t => t.id === currentTrack.id);

  return (
    <div className="fixed inset-0 z-[200] bg-black animate-in slide-in-from-bottom duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden flex flex-col">
      {/* Glow de fundo animado */}
      <div className="absolute inset-0 opacity-40 blur-[120px] animate-pulse" 
           style={{ background: `radial-gradient(circle at 50% 30%, ${themeColor}, transparent)` }} />
      
      <div className="p-8 flex items-center justify-between relative z-10">
        <button onClick={() => setIsExpanded(false)} className="w-12 h-12 glass rounded-full flex items-center justify-center active:scale-75 transition-transform">
          <ChevronDown size={24} />
        </button>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Xalanify Player</p>
        <TrackOptions track={currentTrack} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-10 relative z-10">
        {/* Capa com animação de escala */}
        <div className={`w-full max-w-[340px] aspect-square transition-all duration-700 ${isPlaying ? 'scale-100' : 'scale-90 opacity-50'}`}>
          <img src={currentTrack.thumbnail} className="w-full h-full rounded-[3.5rem] object-cover shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10" alt="" />
        </div>
        
        <div className="w-full max-w-[340px] animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="flex flex-col items-center text-center mb-10">
              <h2 className="text-3xl font-extrabold tracking-tight mb-2 line-clamp-1">{currentTrack.title}</h2>
              <p className="text-lg font-bold opacity-40 tracking-tight">{currentTrack.artist}</p>
          </div>

          <div className="space-y-4">
            <div 
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    window.dispatchEvent(new CustomEvent('playerSeek', { detail: { percent: ((e.clientX - rect.left)/rect.width)*100 } }));
                }}
                className="h-2 w-full bg-white/10 rounded-full cursor-pointer relative group"
            >
              <div className="h-full transition-all duration-300 rounded-full" style={{ width: `${progress}%`, backgroundColor: themeColor }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full scale-0 group-hover:scale-100 transition-transform shadow-lg" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-12">
            <button onClick={() => toggleLike(currentTrack)} className="active:scale-75 transition-all">
              <Heart size={26} style={{ color: isLiked ? themeColor : 'white' }} fill={isLiked ? themeColor : 'none'} />
            </button>
            <div className="flex items-center gap-6">
              <button onClick={playPrevious} className="active:scale-75 transition-transform"><SkipBack size={34} fill="white" /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all bg-white">
                {isPlaying ? <Pause size={32} className="text-black" fill="black" /> : <Play size={32} className="text-black ml-1" fill="black" />}
              </button>
              <button onClick={playNext} className="active:scale-75 transition-transform"><SkipForward size={34} fill="white" /></button>
            </div>
            <Shuffle size={20} className="opacity-20" />
          </div>
        </div>
      </div>
    </div>
  );
}