"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { ChevronDown, Play, Pause, SkipForward, SkipBack, Heart, Shuffle, Repeat } from "lucide-react";

export default function ExpandedPlayer() {
  const { 
    currentTrack, isPlaying, setIsPlaying, progress, 
    themeColor, setIsExpanded, isExpanded, toggleLike, likedTracks,
    playNext, playPrevious
  } = useXalanify();

  if (!isExpanded || !currentTrack) return null;
  const isLiked = likedTracks.some(t => t.id === currentTrack.id);

  return (
    <div className="fixed inset-0 z-[200] bg-black animate-in slide-in-from-bottom duration-500 overflow-hidden flex flex-col font-jakarta">
      <div className="absolute inset-0 opacity-40 blur-[120px]" style={{ background: `radial-gradient(circle at 50% 30%, ${themeColor}, transparent)` }} />
      
      <div className="p-8 flex items-center justify-between relative z-10">
        <button onClick={() => setIsExpanded(false)} className="w-12 h-12 glass rounded-full flex items-center justify-center">
          <ChevronDown size={24} />
        </button>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">A Reproduzir</p>
        <div className="w-12 h-12" /> 
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-12 relative z-10">
        <img src={currentTrack.thumbnail} className="w-full max-w-[340px] aspect-square rounded-[3rem] object-cover shadow-2xl border border-white/10" alt="" />
        
        <div className="w-full max-w-[340px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1 mr-4 overflow-hidden text-center">
              <h2 className="text-3xl font-extrabold tracking-tight truncate">{currentTrack.title}</h2>
              <p className="text-lg font-bold opacity-40 truncate">{currentTrack.artist}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div 
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    window.dispatchEvent(new CustomEvent('playerSeek', { detail: { percent: (x/rect.width)*100 } }));
                }}
                className="h-2 w-full bg-white/10 rounded-full cursor-pointer relative"
            >
              <div className="h-full transition-all" style={{ width: `${progress}%`, backgroundColor: themeColor }} />
            </div>
          </div>

          <div className="flex items-center justify-between mt-12">
            <button onClick={() => toggleLike(currentTrack)} className="active:scale-75 transition-all">
              <Heart size={24} style={{ color: isLiked ? themeColor : 'white' }} fill={isLiked ? themeColor : 'none'} />
            </button>
            <div className="flex items-center gap-6">
              <button onClick={playPrevious} className="active:scale-75 transition-transform"><SkipBack size={32} fill="white" /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all bg-white">
                {isPlaying ? <Pause size={32} className="text-black" fill="black" /> : <Play size={32} className="text-black ml-1" fill="black" />}
              </button>
              <button onClick={playNext} className="active:scale-75 transition-transform"><SkipForward size={32} fill="white" /></button>
            </div>
            <Shuffle size={20} className="opacity-20" />
          </div>
        </div>
      </div>
    </div>
  );
}