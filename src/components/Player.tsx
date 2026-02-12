"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, setCurrentTrack, toggleLike, likedTracks } = useXalanify();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);
  if (!currentTrack) return null;

  const isLiked = likedTracks?.some((t: any) => t.id === currentTrack.id) || false;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100 }}
        className="fixed bottom-[74px] left-3 right-3 bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 flex items-center justify-between z-50 shadow-2xl shadow-black/50"
      >
        {isClient && (
          <div className="hidden">
            <ReactPlayer
              url={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
              playing={isPlaying}
              config={{ youtube: { playerVars: { autoplay: 1 } } }}
            />
          </div>
        )}

        <div className="flex items-center gap-3 overflow-hidden pr-4">
          <div className="relative group">
            <img src={currentTrack.thumbnail} className="w-11 h-11 rounded-lg object-cover shadow-md" alt="" />
            {isPlaying && <div className="absolute inset-0 bg-primary/20 flex items-center justify-center rounded-lg"><div className="w-1 h-3 bg-primary animate-bounce mx-0.5"/><div className="w-1 h-3 bg-primary animate-bounce delay-75 mx-0.5"/><div className="w-1 h-3 bg-primary animate-bounce delay-150 mx-0.5"/></div>}
          </div>
          <div className="overflow-hidden">
            <p className="text-[13px] font-bold truncate text-white leading-tight">{currentTrack.title}</p>
            <p className="text-[10px] text-gray-400 truncate uppercase tracking-tighter">{currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => toggleLike(currentTrack)} className={isLiked ? "text-primary" : "text-gray-500"}>
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="bg-white text-black p-2 rounded-full hover:scale-105 active:scale-90 transition-all">
            {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" />}
          </button>
          <button onClick={() => setCurrentTrack(null)} className="text-gray-600 pl-1"><X size={16} /></button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}