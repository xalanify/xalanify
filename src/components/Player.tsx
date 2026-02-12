"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, SkipForward, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, setCurrentTrack } = useXalanify();

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
        className="fixed bottom-20 left-4 right-4 bg-secondary/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex items-center justify-between z-50 shadow-2xl"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-lg object-cover shadow-lg" alt="" />
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate">{currentTrack.title}</p>
            <p className="text-[11px] text-gray-400 truncate">{currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setIsPlaying(!isPlaying)} className="bg-primary p-2 rounded-full text-white">
            {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
          </button>
          <button onClick={() => setCurrentTrack(null)} className="text-gray-400">
            <X size={18} />
          </button>
        </div>
        
        {/* Progresso Simulado */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-primary w-1/3 rounded-full" />
      </motion.div>
    </AnimatePresence>
  );
}