"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Resolvemos o erro definindo o componente como 'any' para o TypeScript ignorar a validação de propriedades
const ReactPlayer = dynamic(() => import("react-player"), { 
  ssr: false,
  loading: () => <div className="w-12 h-12 bg-white/5 animate-pulse rounded-lg" />
}) as any;

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, setCurrentTrack, toggleLike, likedTracks } = useXalanify();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!currentTrack) return null;

  // Proteção para evitar erro caso likedTracks ainda esteja a carregar
  const isLiked = likedTracks?.some((t: any) => t.id === currentTrack.id) || false;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
        className="fixed bottom-20 left-4 right-4 bg-secondary/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex items-center justify-between z-50 shadow-2xl"
      >
        {/* Motor de Áudio - Agora o TS aceita 'url' e 'playing' por causa do 'as any' acima */}
        {isClient && (
          <div className="hidden">
            <ReactPlayer
              url={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
              playing={isPlaying}
              width="0"
              height="0"
              config={{
                youtube: {
                  playerVars: { autoplay: 1, controls: 0, modestbranding: 1 }
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
            className="bg-primary p-2 rounded-full text-white active:scale-95 transition-transform"
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