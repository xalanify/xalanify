"use client";
import React from "react";
import { ChevronDown, MoreHorizontal, Heart, Repeat, Shuffle, Share2, Volume2, SkipBack, SkipForward, Play, Pause } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function ExpandedPlayer() {
  const { 
    currentTrack, isPlaying, setIsPlaying, 
    progress, setProgress, duration,
    themeColor, playNext, playPrevious, 
    isExpanded, setIsExpanded, likedTracks, toggleLike 
  } = useXalanify();

  if (!isExpanded || !currentTrack) return null;

  const isLiked = likedTracks.some(t => t.id === currentTrack.id);

  return (
    <div className="fixed inset-0 z-[200] bg-black overflow-hidden animate-in slide-in-from-bottom duration-500">
      
      {/* BACKGROUND ANIMADO (MESH GRADIENT) */}
      <div className="absolute inset-0 -z-10">
        <div 
          className="absolute inset-0 opacity-40 animate-pulse duration-[10s]"
          style={{ 
            background: `radial-gradient(circle at 20% 30%, ${themeColor} 0%, transparent 50%),
                         radial-gradient(circle at 80% 70%, ${themeColor} 0%, transparent 50%)` 
          }}
        />
        <div className="absolute inset-0 backdrop-blur-[120px] bg-black/40" />
      </div>

      <div className="flex flex-col h-full max-w-md mx-auto px-8 pt-6 pb-12">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <button onClick={() => setIsExpanded(false)} className="p-2 glass rounded-full">
            <ChevronDown size={24} />
          </button>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">A Tocar de</p>
            <p className="text-[11px] font-bold italic">Sua Biblioteca</p>
          </div>
          <button className="p-2">
            <MoreHorizontal size={24} />
          </button>
        </div>

        {/* ARTWORK (CAPA) */}
        <div className="flex-1 flex items-center justify-center py-6">
          <div className="relative group w-full aspect-square max-w-[320px]">
            <img 
              src={currentTrack.thumbnail} 
              alt={currentTrack.title}
              className={`w-full h-full object-cover rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] transition-transform duration-700 ${isPlaying ? 'scale-100' : 'scale-90'}`}
            />
            {/* Glow reflexivo na capa */}
            <div 
              className="absolute -inset-4 opacity-30 blur-3xl -z-10 rounded-full animate-pulse"
              style={{ backgroundColor: themeColor }}
            />
          </div>
        </div>

        {/* INFO DA MÚSICA */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex-1 overflow-hidden pr-4">
            <h2 className="text-3xl font-black tracking-tighter italic truncate mb-1">{currentTrack.title}</h2>
            <p className="text-xl font-medium opacity-50 truncate" style={{ color: themeColor }}>{currentTrack.artist}</p>
          </div>
          <button onClick={() => toggleLike(currentTrack)} className="p-3 transition-transform active:scale-75">
            <Heart size={28} fill={isLiked ? themeColor : "transparent"} style={{ color: isLiked ? themeColor : "white" }} />
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="mt-10">
          <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: themeColor }}
            />
          </div>
          <div className="flex justify-between mt-3">
            <span className="text-[10px] font-mono opacity-40">0:00</span>
            <span className="text-[10px] font-mono opacity-40">3:45</span>
          </div>
        </div>

        {/* CONTROLOS PRINCIPAIS */}
        <div className="flex items-center justify-between mt-8">
          <Shuffle size={20} className="opacity-30" />
          <div className="flex items-center gap-8">
            <button onClick={playPrevious} className="active:scale-90 transition-transform">
              <SkipBack size={42} fill="white" />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-20 h-20 rounded-full flex items-center justify-center bg-white shadow-2xl transition-transform active:scale-90"
            >
              {isPlaying ? <Pause size={38} className="text-black" fill="black" /> : <Play size={38} className="text-black ml-1" fill="black" />}
            </button>
            <button onClick={playNext} className="active:scale-90 transition-transform">
              <SkipForward size={42} fill="white" />
            </button>
          </div>
          <Repeat size={20} className="opacity-30" />
        </div>

        {/* FOOTER CONTROLOS */}
        <div className="flex justify-between items-center mt-12 px-4 opacity-40">
          <Volume2 size={18} />
          <div className="h-[3px] flex-1 mx-6 bg-white/10 rounded-full">
            <div className="h-full w-3/4 bg-white/40 rounded-full" />
          </div>
          <Share2 size={18} />
        </div>
      </div>
    </div>
  );
}