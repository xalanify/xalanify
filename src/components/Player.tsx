"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, toggleLike, likedTracks, themeColor } = useXalanify();
  const [isClient, setIsClient] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => { setIsClient(true); }, []);
  
  // Reset do Play ao trocar de música
  useEffect(() => {
    if (currentTrack) setIsPlaying(true);
  }, [currentTrack?.id]);

  if (!currentTrack) return null;

  const isLiked = likedTracks?.some((t: any) => t.id === currentTrack.id);
  const videoId = currentTrack.youtubeId || currentTrack.id;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="mx-2 mb-2 bg-[#121212]/95 backdrop-blur-2xl border border-white/10 p-3 rounded-[2rem] flex items-center justify-between z-50 shadow-2xl"
      >
        {isClient && (
          <div className="hidden">
            <ReactPlayer 
              ref={playerRef}
              url={`https://www.youtube.com/watch?v=${videoId}`}
              playing={isPlaying}
              volume={1}
              playsinline
              config={{
                youtube: {
                  playerVars: { autoplay: 1, controls: 0, origin: window.location.origin }
                }
              }}
              onError={(e: any) => console.log("Erro no Player:", e)}
            />
          </div>
        )}

        <div className="flex items-center gap-3 max-w-[65%]">
          <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-2xl object-cover" alt="" />
          <div className="truncate">
            <p className="text-[14px] font-bold truncate text-white leading-tight">{currentTrack.title}</p>
            <p className="text-[10px] text-zinc-500 truncate uppercase tracking-widest mt-0.5 font-black">{currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 pr-2">
          <button onClick={() => toggleLike(currentTrack)} className="active:scale-125 transition-all">
            <Heart size={22} style={{ color: isLiked ? themeColor : '#3f3f46' }} fill={isLiked ? themeColor : "none"} />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-all shadow-lg"
            style={{ backgroundColor: themeColor }}
          >
            {isPlaying ? <Pause size={20} color="white" fill="white" /> : <Play size={20} color="white" fill="white" className="ml-1" />}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}