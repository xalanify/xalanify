"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, toggleLike, likedTracks, themeColor } = useXalanify();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);
  if (!currentTrack) return null;

  const isLiked = likedTracks?.some((t: any) => t.id === currentTrack.id);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-[80px] left-0 right-0 bg-[#09080b]/95 backdrop-blur-xl border-t border-white/5 p-3 flex items-center justify-between z-40"
      >
        {isClient && (
          <div className="hidden"><ReactPlayer url={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`} playing={isPlaying} /></div>
        )}

        <div className="flex items-center gap-3 max-w-[70%]">
          <img src={currentTrack.thumbnail} className="w-11 h-11 rounded-md object-cover shadow-lg" alt="" />
          <div className="truncate">
            <p className="text-sm font-bold truncate text-white">{currentTrack.title}</p>
            <p className="text-[10px] text-gray-400 truncate uppercase tracking-wider">{currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-5 pr-2">
          <button onClick={() => toggleLike(currentTrack)} className="active:scale-125 transition-all">
            <Heart size={22} className={isLiked ? "" : "text-gray-400"} fill={isLiked ? themeColor : "none"} color={isLiked ? themeColor : "currentColor"} />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-pink-500/10"
            style={{ backgroundColor: themeColor }}
          >
            {isPlaying ? <Pause size={22} fill="white" color="white" /> : <Play size={22} fill="white" color="white" className="ml-1" />}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}