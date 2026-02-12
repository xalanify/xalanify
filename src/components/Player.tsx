"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, Heart, Terminal, Activity, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, toggleLike, likedTracks, themeColor, isAdmin } = useXalanify();
  const [isClient, setIsClient] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => { setIsClient(true); }, []);

  // Se não houver música, não mostra nada (mas não deve desaparecer SE houver música)
  if (!currentTrack) return null;
  
  const isLiked = likedTracks?.some((t: any) => t.id === currentTrack.id);
  // Usa o youtubeId se existir, senão tenta o ID normal (para casos de debug)
  const videoUrl = currentTrack.youtubeId ? `https://www.youtube.com/watch?v=${currentTrack.youtubeId}` : null;

  return (
    // Z-INDEX 100 para garantir que fica por cima de tudo
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 pb-8 pointer-events-none">
      <div className="pointer-events-auto">
      
      {/* PAINEL ADMIN FLUTUANTE (Só aparece se for admin e clicar na musica) */}
      <AnimatePresence>
        {isAdmin && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mx-2 mb-3 p-4 bg-black/90 border border-yellow-500/30 rounded-[2rem] backdrop-blur-md shadow-2xl"
          >
            <div className="flex items-center gap-2 text-[10px] font-mono text-yellow-500 mb-2 border-b border-white/10 pb-2">
              <Terminal size={12} /> <span>STATUS DE REPRODUÇÃO</span>
            </div>
            <div className="space-y-1 font-mono text-[9px] text-zinc-400">
               <p>Música: <span className="text-white">{currentTrack.title}</span></p>
               <p>ID YouTube: <span className={currentTrack.youtubeId ? "text-green-400" : "text-red-500"}>{currentTrack.youtubeId || "NÃO ENCONTRADO"}</span></p>
               <p>Stream: {videoUrl || "Sem URL"}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ y: 100 }} animate={{ y: 0 }}
        className="bg-[#101010] border border-white/10 p-3 rounded-[2.5rem] flex items-center justify-between shadow-2xl relative overflow-hidden"
      >
        {/* Background Blur Effect */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-md z-0" />

        {isClient && videoUrl && (
          <div className="hidden">
            <ReactPlayer 
              url={videoUrl}
              playing={isPlaying}
              volume={1}
              playsinline
              onError={(e: any) => setErrorMsg("Erro no Stream")}
              onReady={() => setErrorMsg(null)}
            />
          </div>
        )}

        <div className="flex items-center gap-3 max-w-[65%] z-10 relative pl-1">
          <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-[1.2rem] object-cover shadow-lg border border-white/5" alt="" />
          <div className="truncate">
            <p className="text-[14px] font-bold text-white truncate leading-tight">{currentTrack.title}</p>
            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-0.5">{currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 pr-1 z-10 relative">
          <button onClick={() => toggleLike(currentTrack)} className="active:scale-90 transition-transform">
            <Heart size={22} style={{ color: isLiked ? themeColor : '#52525b' }} fill={isLiked ? themeColor : "none"} />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all text-white"
            style={{ backgroundColor: themeColor }}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </button>
        </div>
      </motion.div>
      </div>
    </div>
  );
}