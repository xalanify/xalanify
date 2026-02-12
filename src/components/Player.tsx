"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
// @ts-ignore
import ReactPlayer from "react-player/lazy";
// Import dinâmico para evitar o erro "Module not found" no servidor
const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, setCurrentTrack, toggleLike, likedTracks } = useXalanify();
  const [hasWindow, setHasWindow] = useState(false);

  // Garante que o player só renderiza no cliente (browser)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasWindow(true);
    }
  }, []);

  if (!currentTrack) return null;

  const isLiked = likedTracks?.some((t) => t.id === currentTrack.id) || false;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
        className="fixed bottom-20 left-4 right-4 bg-secondary/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex items-center justify-between z-50 shadow-2xl"
      >
        {/* Player de Áudio Real */}
        {hasWindow && (
          <div className="hidden">
            <ReactPlayer
              url={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
              playing={isPlaying}
              controls={false}
              width="0"
              height="0"
              config={{
                youtube: {
                  playerVars: { autoplay: 1, controls: 0 }
                }
              }}
            />
          </div>
        )}

        <div className="flex items-center gap-3 overflow-hidden">
          <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-lg object-cover shadow-lg" alt="" />
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate">{currentTrack.title}</p>
            <p className="text-[11px] text-gray-400 truncate">{currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => toggleLike(currentTrack)} 
            className={`${isLiked ? "text-primary" : "text-gray-400"} transition-colors`}
          >
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="bg-primary p-2 rounded-full text-white active:scale-90 transition-transform"
          >
            {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
          </button>
          
          <button onClick={() => setCurrentTrack(null)} className="text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}