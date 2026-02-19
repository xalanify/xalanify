"use client";
import React, { useEffect, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, progress, setProgress, themeColor } = useXalanify();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
    else audioRef.current.pause();
  }, [isPlaying, currentTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pos * audioRef.current.duration;
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[90]">
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} src={currentTrack.audioUrl} />
      <div className="glass rounded-[2.5rem] p-4 flex items-center gap-4 border border-white/5 shadow-2xl relative overflow-hidden">
        <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-2xl object-cover" alt="" />
        <div className="flex-1 overflow-hidden">
          <h4 className="font-bold text-sm truncate">{currentTrack.title}</h4>
          <p className="text-[10px] opacity-30 uppercase font-black">{currentTrack.artist}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 opacity-40"><SkipBack size={20} /></button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-12 rounded-full flex items-center justify-center transition-transform active:scale-90" style={{ backgroundColor: themeColor }}>
            {isPlaying ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" className="ml-1" />}
          </button>
          <button className="p-2 opacity-40"><SkipForward size={20} /></button>
        </div>
        <div onClick={handleSeek} className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 cursor-pointer">
          <div className="h-full transition-all duration-100" style={{ width: `${progress}%`, backgroundColor: themeColor }} />
        </div>
      </div>
    </div>
  );
}