"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, Heart, Terminal, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, toggleLike, likedTracks, themeColor, isAdmin } = useXalanify();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => { setIsClient(true); }, []);

  if (!currentTrack) return null;

  const isLiked = likedTracks?.some((t: any) => t.id === currentTrack.id);
  const videoUrl = currentTrack.youtubeId ? `https://www.youtube.com/watch?v=${currentTrack.youtubeId}` : null;

  return (
    <div className="fixed bottom-[80px] left-0 right-0 z-50 px-3 pointer-events-none">
      <div className="pointer-events-auto max-w-md mx-auto">
        
        <AnimatePresence>
        {isAdmin && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-2 p-3 bg-black/90 border border-yellow-500/30 rounded-2xl backdrop-blur-md shadow-2xl font-mono text-[9px]"
          >
             <div className="flex justify-between items-center text-zinc-400">
                <span className="flex items-center gap-2">
                  <Terminal size={10} className="text-yellow-500" /> 
                  ID: <span className="text-white">{currentTrack.youtubeId || "WAITING..."}</span>
                </span>
                <Activity size={10} className={currentTrack.youtubeId ? "text-green-500" : "text-red-500 animate-pulse"} />
             </div>
          </motion.div>
        )}
        </AnimatePresence>

        <motion.div 
          initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="bg-[#18181b]/95 border border-white/10 p-2 rounded-[1.8rem] flex items-center justify-between shadow-2xl backdrop-blur-xl"
        >
           {isClient && videoUrl && (
            <div className="hidden">
              <ReactPlayer 
                key={currentTrack.youtubeId} // FORÇA O RELOAD QUANDO O ID MUDA
                url={videoUrl}
                playing={isPlaying}
                volume={1}
                playsinline
                width="0" height="0"
                config={{ youtube: { playerVars: { autoplay: 1, controls: 0 } } }}
              />
            </div>
          )}

          <div className="flex items-center gap-3 pl-1 max-w-[65%]">
            <img src={currentTrack.thumbnail} className="w-11 h-11 rounded-xl object-cover shadow-lg" alt="" />
            <div className="truncate">
              <p className="text-[13px] font-bold text-white truncate">{currentTrack.title}</p>
              <p className="text-[10px] text-zinc-500 truncate uppercase font-bold tracking-tight">{currentTrack.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pr-1">
            <button onClick={() => toggleLike(currentTrack)} className="active:scale-90 transition-transform">
              <Heart size={20} style={{ color: isLiked ? themeColor : '#3f3f46' }} fill={isLiked ? themeColor : "none"} />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              className="w-11 h-11 rounded-full flex items-center justify-center text-black active:scale-90 transition-all shadow-lg"
              style={{ backgroundColor: themeColor }}
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}