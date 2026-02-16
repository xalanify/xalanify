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
    <div className="fixed inset-0 z-[200] bg-black animate-in slide-in-from-bottom duration-500 overflow-hidden flex flex-col">
      <div className="absolute inset-0 opacity-30 blur-[150px]" style={{ background: `radial-gradient(circle at 50% 30%, ${themeColor}, transparent)` }} />
      
      <div className="p-8 flex items-center justify-between relative z-10">
        <button onClick={() => setIsExpanded(false)} className="w-12 h-12 glass rounded-full flex items-center justify-center">
          <ChevronDown size={24} />
        </button>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 text-center flex-1">A tocar de Pesquisa</p>
        <div className="w-12 h-12" /> 
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-12 relative z-10">
        <img src={currentTrack.thumbnail} className="w-full max-w-[350px] aspect-square rounded-[3rem] object-cover shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/5" alt="" />
        
        <div className="w-full max-w-[350px]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">{currentTrack.title}</h2>
              <p className="text-lg font-bold opacity-40">{currentTrack.artist}</p>
            </div>
            <button onClick={() => toggleLike(currentTrack)}>
              <Heart size={28} style={{ color: isLiked ? themeColor : 'white' }} fill={isLiked ? themeColor : 'none'} className="transition-all active:scale-75" />
            </button>
          </div>

          <div className="mt-10 space-y-4">
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full transition-all" style={{ width: `${progress}%`, backgroundColor: themeColor }} />
            </div>
            <div className="flex justify-between text-[10px] font-black opacity-20 uppercase tracking-widest">
              <span>0:00</span><span>Live Stream</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-12">
            <Shuffle size={20} className="opacity-20" />
            <div className="flex items-center gap-8">
              <button onClick={playPrevious} className="active:scale-75 transition-transform"><SkipBack size={32} fill="white" /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all" style={{ backgroundColor: themeColor }}>
                {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" className="ml-1" />}
              </button>
              <button onClick={playNext} className="active:scale-75 transition-transform"><SkipForward size={32} fill="white" /></button>
            </div>
            <Repeat size={20} className="opacity-20" />
          </div>
        </div>
      </div>
    </div>
  );
}