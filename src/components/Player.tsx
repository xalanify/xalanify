"use client";
import React from "react";
import { Play, Pause, SkipForward, SkipBack, Heart, Shuffle, Repeat, ChevronDown, MoreHorizontal } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function Player() {
  const { 
    currentTrack, isPlaying, setIsPlaying, progress, themeColor, 
    isExpanded, setIsExpanded, playNext, playPrevious, audioRef, 
    currentTime, duration 
  } = useXalanify();

  if (!currentTrack) return null;

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
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

  // DESIGN EXPANDIDO (IMAGEM 4)
  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col p-8 animate-in slide-in-from-bottom duration-500" 
           style={{ background: `linear-gradient(to bottom, ${themeColor}aa, #050a18)` }}>
        
        <div className="flex justify-between items-center mb-10">
          <button onClick={() => setIsExpanded(false)} className="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-md active:scale-90 transition-all"><ChevronDown size={28}/></button>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Tocando de</p>
            <p className="font-bold text-sm italic">Sua Biblioteca</p>
          </div>
          <button className="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-md"><MoreHorizontal size={24}/></button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center space-y-10">
          <img src={currentTrack.thumbnail} className="w-full aspect-square rounded-[3.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.6)] object-cover border border-white/10" />
          
          <div className="w-full flex items-center justify-between px-2">
            <div className="max-w-[80%]">
              <h2 className="text-3xl font-black tracking-tighter truncate italic text-white">{currentTrack.title}</h2>
              <p className="text-xl opacity-50 font-bold uppercase tracking-widest text-white">{currentTrack.artist}</p>
            </div>
            <Heart size={32} className="text-white/20 hover:text-red-500 transition-colors" />
          </div>

          <div className="w-full space-y-4">
            <input 
              type="range" min="0" max="100" 
              value={progress || 0} 
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
              style={{ background: `linear-gradient(to right, white ${progress}%, rgba(255,255,255,0.1) ${progress}%)` }}
            />
            <div className="flex justify-between text-[12px] font-black opacity-40 px-1 text-white">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between w-full px-4">
            <Shuffle size={24} className="opacity-30" />
            <SkipBack size={45} onClick={playPrevious} fill="white" className="active:scale-90 transition-transform cursor-pointer" />
            <button onClick={togglePlay} className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-2xl active:scale-75 transition-all">
              {isPlaying ? <Pause size={45} color="black" fill="black" /> : <Play size={45} color="black" fill="black" className="ml-2" />}
            </button>
            <SkipForward size={45} onClick={playNext} fill="white" className="active:scale-90 transition-transform cursor-pointer" />
            <Repeat size={24} className="opacity-30" />
          </div>
        </div>
      </div>
    );
  }

  // DESIGN MINI PLAYER (IMAGEM 1)
  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] glass rounded-[2.5rem] p-2 pr-4 flex items-center gap-4 border border-white/10 shadow-2xl active:scale-[0.98] transition-all" onClick={() => setIsExpanded(true)}>
      <img src={currentTrack.thumbnail} className="w-14 h-14 rounded-[1.5rem] object-cover" />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-black truncate italic text-white">{currentTrack.title}</h4>
        <p className="text-[10px] opacity-40 uppercase font-black tracking-tighter text-white">{currentTrack.artist}</p>
      </div>
      <button onClick={togglePlay} className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all" style={{ backgroundColor: themeColor }}>
        {isPlaying ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" className="ml-1" />}
      </button>
    </div>
  );
}