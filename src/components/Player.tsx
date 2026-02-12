"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, Loader2, Activity } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, themeColor, isAdmin } = useXalanify();
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (currentTrack?.audioUrl && audioRef.current) {
      audioRef.current.load();
      if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrack, setIsPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      isPlaying ? audioRef.current.play() : audioRef.current.pause();
    }
  }, [isPlaying]);

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-[85px] left-0 right-0 z-50 px-4 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        
        {isAdmin && (
          <div className="mb-2 p-2 bg-black/90 border border-white/10 rounded-xl font-mono text-[9px] text-zinc-400">
            <span className="text-green-500 flex items-center gap-1"><Activity size={10}/> STREAM ACTIVE</span>
            <p className="truncate opacity-50">{currentTrack.audioUrl}</p>
          </div>
        )}

        <audio 
          ref={audioRef} 
          src={currentTrack.isLocal ? "/test.mp3" : currentTrack.audioUrl} 
          onLoadStart={() => setLoading(true)}
          onCanPlay={() => setLoading(false)}
          onEnded={() => setIsPlaying(false)}
        />

        <div className="bg-zinc-900/95 border border-white/10 p-2.5 rounded-[2.2rem] flex items-center justify-between shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center gap-3 pl-1 truncate max-w-[70%]">
            <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-2xl object-cover" alt="" />
            <div className="truncate text-left">
              <p className="text-[14px] font-bold text-white truncate leading-tight">{currentTrack.title}</p>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{currentTrack.artist}</p>
            </div>
          </div>

          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="w-12 h-12 rounded-full flex items-center justify-center text-black active:scale-90 transition-all shadow-lg"
            style={{ backgroundColor: themeColor }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 
             isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}