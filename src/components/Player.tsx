"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// CORREÇÃO DA TIPAGEM: Definimos o que o componente aceita para o TS não reclamar
const ReactPlayer = dynamic(() => import("react-player"), { 
  ssr: false,
  loading: () => <div className="hidden" /> 
}) as any; 

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, toggleLike, likedTracks, themeColor } = useXalanify();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { 
    setIsClient(true); 
  }, []);

  if (!currentTrack) return null;

  const isLiked = likedTracks?.some((t: any) => t.id === currentTrack.id);

  // Garantir que temos o ID correto do YouTube
  const videoId = currentTrack.youtubeId || currentTrack.id;
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="mx-2 mb-2 bg-[#121212]/95 backdrop-blur-2xl border border-white/10 p-3 rounded-[2rem] flex items-center justify-between z-50 shadow-2xl"
      >
        {/* O Player fica invisível mas funcional */}
        {isClient && (
          <div className="hidden">
            <ReactPlayer 
              url={videoUrl}
              playing={isPlaying}
              width="0"
              height="0"
              config={{
                youtube: {
                  playerVars: { autoplay: 1 }
                }
              }}
            />
          </div>
        )}

        <div className="flex items-center gap-3 max-w-[65%]">
          <img 
            src={currentTrack.thumbnail} 
            className="w-12 h-12 rounded-2xl object-cover shadow-md flex-shrink-0" 
            alt="" 
          />
          <div className="truncate">
            <p className="text-[14px] font-bold truncate text-white leading-tight">
              {currentTrack.title}
            </p>
            <p className="text-[10px] text-zinc-500 truncate uppercase tracking-widest mt-0.5 font-black">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 pr-2">
          <button 
            onClick={() => toggleLike(currentTrack)} 
            className="active:scale-125 transition-all p-1"
          >
            <Heart 
              size={22} 
              style={{ color: isLiked ? themeColor : '#3f3f46' }} 
              fill={isLiked ? themeColor : "none"} 
            />
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-all shadow-lg"
            style={{ backgroundColor: themeColor }}
          >
            {isPlaying ? (
              <Pause size={20} color="white" fill="white" />
            ) : (
              <Play size={20} color="white" fill="white" className="ml-1" />
            )}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}