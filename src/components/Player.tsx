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
  // Usa o youtubeId se existir, senão tenta o ID normal
  const videoUrl = currentTrack.youtubeId ? `https://www.youtube.com/watch?v=${currentTrack.youtubeId}` : null;

  return (
    // FIX: bottom-[70px] para ficar ACIMA da barra de navegação
    <div className="fixed bottom-[70px] left-0 right-0 z-50 px-2 pointer-events-none">
      <div className="pointer-events-auto">
        
        {/* Painel Debug (Admin Only) */}
        <AnimatePresence>
        {isAdmin && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mx-1 mb-2 p-3 bg-black/90 border border-yellow-500/30 rounded-2xl backdrop-blur-md shadow-2xl"
          >
             <div className="flex justify-between items-center text-[9px] text-zinc-400 font-mono">
                <span>YT_ID: {currentTrack.youtubeId || "WAITING"}</span>
                {currentTrack.youtubeId ? <Activity size={10} className="text-green-500" /> : <Activity size={10} className="text-red-500 animate-pulse" />}
             </div>
          </motion.div>
        )}
        </AnimatePresence>

        <motion.div 
          initial={{ y: 50, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="bg-[#18181b] border border-white/10 p-2 rounded-[1.5rem] flex items-center justify-between shadow-2xl overflow-hidden relative"
        >
           {/* Player Invisível */}
           {isClient && videoUrl && (
            <div className="hidden">
              <ReactPlayer 
                url={videoUrl}
                playing={isPlaying}
                volume={1}
                playsinline
                width="0" height="0"
                config={{ youtube: { playerVars: { playsinline: 1 } } }}
              />
            </div>
          )}

          <div className="flex items-center gap-3 pl-1 max-w-[65%]">
            <img 
              src={currentTrack.thumbnail} 
              className={`w-10 h-10 rounded-xl object-cover border border-white/5 ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`} 
              alt="" 
            />
            <div className="truncate">
              <p className="text-[13px] font-bold text-white truncate">{currentTrack.title}</p>
              <p className="text-[10px] text-zinc-400 truncate uppercase font-bold">{currentTrack.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pr-1">
            <button onClick={() => toggleLike(currentTrack)} className="active:scale-90">
              <Heart size={20} style={{ color: isLiked ? themeColor : '#52525b' }} fill={isLiked ? themeColor : "none"} />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              className="w-10 h-10 rounded-full flex items-center justify-center text-black active:scale-90 transition-all shadow-lg shadow-white/5"
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