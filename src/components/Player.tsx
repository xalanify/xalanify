"use client";
import React from "react";
import { Play, Pause, SkipForward, SkipBack, Heart, Shuffle, Repeat, ChevronDown, MoreHorizontal } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import TrackOptions from "./TrackOptions";

export default function Player() {
  const { 
    currentTrack, isPlaying, setIsPlaying, progress, themeColor, 
    isExpanded, setIsExpanded, playNext, playPrevious, audioRef, 
    currentTime, duration, toggleLike, likedTracks
  } = useXalanify();

  if (!currentTrack) return null;

  const isLiked = likedTracks.some(t => t.id === currentTrack.id);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) audioRef.current?.pause();
    else audioRef.current?.play();
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (Number(e.target.value) / 100) * duration;
    if (audioRef.current) audioRef.current.currentTime = newTime;
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- VISUAL: PLAYER EXPANDIDO (SCREEN 4) ---
  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-[200] bg-black animate-in slide-in-from-bottom duration-700 p-8 flex flex-col">
        {/* Glow de Fundo */}
        <div className="absolute inset-0 opacity-40 blur-[120px]" 
             style={{ background: `radial-gradient(circle at 50% 30%, ${themeColor}, transparent)` }} />
        
        <div className="flex justify-between items-center relative z-10">
          <button onClick={() => setIsExpanded(false)} className="w-12 h-12 glass rounded-full flex items-center justify-center active:scale-90">
            <ChevronDown size={28} />
          </button>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">A tocar de</p>
            <p className="text-xs font-bold italic border-b border-blue-500 inline-block">A tua Biblioteca</p>
          </div>
          <TrackOptions track={currentTrack} />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
          <div className="w-full aspect-square max-w-[340px] rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-white/10 mb-14">
            <img src={currentTrack.thumbnail} className="w-full h-full object-cover scale-105" />
          </div>

          <div className="w-full text-left px-4 mb-10">
            <h2 className="text-4xl font-black italic tracking-tighter mb-2 leading-tight">{currentTrack.title}</h2>
            <p className="text-blue-500 font-bold uppercase tracking-widest text-[11px]">{currentTrack.artist}</p>
          </div>

          {/* Barra de Progresso Customizada */}
          <div className="w-full px-4 mb-10 group">
            <div className="relative w-full h-1.5 bg-white/10 rounded-full">
               <div className="absolute top-0 left-0 h-full bg-white rounded-full" style={{ width: `${progress}%` }} />
               <input 
                type="range" value={progress || 0} onChange={handleSeek} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
               />
            </div>
            <div className="flex justify-between mt-3 text-[10px] font-black opacity-30 tracking-widest">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between w-full px-6 mb-12">
            <Shuffle size={22} className="opacity-20" />
            <div className="flex items-center gap-10">
              <SkipBack size={40} onClick={playPrevious} fill="white" className="active:scale-75 transition-transform" />
              <button onClick={togglePlay} className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all">
                {isPlaying ? <Pause size={42} fill="black" color="black" /> : <Play size={42} fill="black" color="black" className="ml-2" />}
              </button>
              <SkipForward size={40} onClick={playNext} fill="white" className="active:scale-75 transition-transform" />
            </div>
            <Repeat size={22} className="opacity-20" />
          </div>

          <button onClick={() => toggleLike(currentTrack)} className="active:scale-125 transition-transform">
            <Heart size={32} fill={isLiked ? themeColor : "none"} style={{ color: isLiked ? themeColor : "white" }} />
          </button>
        </div>
      </div>
    );
  }

  // --- VISUAL: MINI PLAYER (SCREEN 1) ---
  return (
    <div 
      className="fixed bottom-28 left-4 right-4 z-[100] glass rounded-[2.5rem] p-2 pr-5 flex items-center gap-4 border border-white/10 shadow-2xl active:scale-[0.98] transition-all cursor-pointer"
      onClick={() => setIsExpanded(true)}
    >
      <div className="relative h-14 w-14">
        <img src={currentTrack.thumbnail} className="w-full h-full rounded-[1.5rem] object-cover shadow-lg" />
        {isPlaying && <div className="absolute inset-0 bg-blue-500/10 animate-pulse rounded-[1.5rem]" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-black truncate italic text-white leading-tight">{currentTrack.title}</h4>
        <p className="text-[10px] opacity-40 uppercase font-black tracking-tighter text-blue-400">{currentTrack.artist}</p>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={togglePlay} className="w-10 h-10 bg-white rounded-full flex items-center justify-center active:scale-75 transition-all">
          {isPlaying ? <Pause size={18} fill="black" color="black" /> : <Play size={18} fill="black" color="black" className="ml-0.5" />}
        </button>
        <button onClick={(e) => { e.stopPropagation(); playNext(); }} className="p-2 opacity-30 hover:opacity-100">
          <SkipForward size={22} fill="white" />
        </button>
      </div>
      
      {/* Barra de Progresso Subtil */}
      <div className="absolute bottom-0 left-10 right-10 h-[2px] bg-white/5 overflow-hidden rounded-full">
        <div className="h-full bg-white/30 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}