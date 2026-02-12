"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, Heart, Terminal, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, toggleLike, likedTracks, themeColor, isAdmin } = useXalanify();
  const [isClient, setIsClient] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);

  useEffect(() => { setIsClient(true); }, []);

  if (!currentTrack) return null;
  const isLiked = likedTracks?.some((t: any) => t.id === currentTrack.id);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 pb-6">
      // Dentro do return do Player.tsx, abaixo do componente ReactPlayer
{isAdmin && (
  <div className="absolute -top-32 left-4 right-4 bg-black/90 border border-white/10 p-4 rounded-3xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
    <div className="flex justify-between items-center mb-2">
      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Admin Control Center</span>
      <div className="flex gap-2">
        <div className={`w-2 h-2 rounded-full ${currentTrack?.youtubeId ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
      </div>
    </div>
    
    <div className="space-y-1 text-[10px] font-mono">
      <p className="flex justify-between"><span className="text-zinc-500">YT_ID:</span> <span className="text-white">{currentTrack?.youtubeId || "NOT_FOUND"}</span></p>
      <p className="flex justify-between"><span className="text-zinc-500">SOURCE:</span> <span className="text-blue-400">Spotify + YT Search</span></p>
      <p className="flex justify-between"><span className="text-zinc-500">ENV_KEY:</span> <span>{process.env.NEXT_PUBLIC_YOUTUBE_API_KEY ? "✅ LOADED" : "❌ MISSING"}</span></p>
    </div>

    {!currentTrack?.youtubeId && (
      <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
        <p className="text-[9px] text-red-400 leading-tight">
          <strong>Erro:</strong> Se o YT_ID está undefined, verifica se ativaste a "YouTube Data API v3" no console.cloud.google.com e se a chave está no teu .env.local
        </p>
      </div>
    )}
  </div>
)}

      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 p-3 rounded-[2.5rem] flex items-center justify-between shadow-2xl">
        {isClient && currentTrack.youtubeId && (
          <div className="hidden">
            <ReactPlayer 
              url={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
              playing={isPlaying}
              volume={1}
              onReady={() => setPlayerError(null)}
              onError={(e: any) => setPlayerError("Stream Blocked/Invalid")}
            />
          </div>
        )}

        <div className="flex items-center gap-3 max-w-[60%]">
          <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-2xl object-cover" alt="" />
          <div className="truncate">
            <p className="text-[14px] font-bold text-white truncate leading-tight">{currentTrack.title}</p>
            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 pr-2">
          <button onClick={() => toggleLike(currentTrack)}><Heart size={22} style={{ color: isLiked ? themeColor : '#3f3f46' }} fill={isLiked ? themeColor : "none"} /></button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: themeColor }}>
            {isPlaying ? <Pause size={22} fill="white" color="white" /> : <Play size={22} fill="white" color="white" className="ml-1" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}