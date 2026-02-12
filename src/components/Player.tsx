"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, setCurrentTrack, toggleLike, likedTracks, themeColor } = useXalanify();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);
  if (!currentTrack) return null;

  const isLiked = likedTracks?.some((t: any) => t.id === currentTrack.id);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-[72px] left-2 right-2 bg-[#121214]/95 backdrop-blur-md border border-white/5 rounded-xl p-2 flex items-center justify-between z-50 shadow-2xl"
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

        <div className="flex items-center gap-3 overflow-hidden">
          <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-lg object-cover" alt="" />
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate text-white">{currentTrack.title}</p>
            <p className="text-[11px] text-gray-400 truncate uppercase">{currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 pr-2">
          <button onClick={() => toggleLike(currentTrack)} className={isLiked ? "text-[var(--primary)]" : "text-gray-500"}>
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ backgroundColor: themeColor }}
          >
            {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-1" />}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}