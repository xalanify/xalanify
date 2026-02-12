"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, Heart, Terminal, Activity, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, toggleLike, likedTracks, themeColor, isAdmin } = useXalanify();
  const [isClient, setIsClient] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);

  useEffect(() => { setIsClient(true); }, []);

  if (!currentTrack) return null;
  const isLiked = likedTracks?.some((t: any) => t.id === currentTrack.id);
  const videoUrl = currentTrack.youtubeId ? `https://www.youtube.com/watch?v=${currentTrack.youtubeId}` : null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8">
      <AnimatePresence>
        {isAdmin && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-2 mb-3 p-4 bg-zinc-950/95 border border-white/10 rounded-[2rem] font-mono text-[10px] shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
              <div className="flex items-center gap-2 text-green-400 font-black">
                <Terminal size={14} /> <span>DEBUG CENTER</span>
              </div>
              <Activity size={14} className="text-green-500 animate-pulse" />
            </div>
            <div className="space-y-1 text-zinc-400">
              <p className="flex justify-between"><span>YT_ID:</span> <span className="text-white">{currentTrack.youtubeId || "UNDEFINED"}</span></p>
              <p className="flex justify-between"><span>STATUS:</span> <span className={playerError ? "text-red-500" : "text-green-500"}>{playerError || "CONNECTED"}</span></p>
              <p className="flex justify-between"><span>ENV:</span> <span>{process.env.NEXT_PUBLIC_YOUTUBE_API_KEY ? "LOADED ✅" : "MISSING ❌"}</span></p>
            </div>
            {!currentTrack.youtubeId && (
              <div className="mt-3 flex items-center gap-2 text-red-400 bg-red-400/10 p-2 rounded-lg">
                <AlertCircle size={12} />
                <span>API YouTube não retornou vídeo. Verifique as cotas.</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ y: 100 }} 
        animate={{ y: 0 }} 
        className="bg-[#121212]/95 backdrop-blur-2xl border border-white/10 p-3 rounded-[2.5rem] flex items-center justify-between shadow-2xl"
      >
        {isClient && videoUrl && (
          <div className="hidden">
            <ReactPlayer 
              url={videoUrl}
              playing={isPlaying}
              volume={1}
              playsinline
              onError={(e: any) => setPlayerError("Stream Error")}
              onReady={() => setPlayerError(null)}
            />
          </div>
        )}

        <div className="flex items-center gap-3 max-w-[60%]">
          <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-2xl object-cover shadow-md" alt="" />
          <div className="truncate">
            <p className="text-[14px] font-bold text-white truncate leading-tight">{currentTrack.title}</p>
            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-0.5">{currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 pr-1">
          <button onClick={() => toggleLike(currentTrack)} className="active:scale-125 transition-all">
            <Heart size={22} style={{ color: isLiked ? themeColor : '#3f3f46' }} fill={isLiked ? themeColor : "none"} />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all" 
            style={{ backgroundColor: themeColor }}
          >
            {isPlaying ? <Pause size={22} fill="white" color="white" /> : <Play size={22} fill="white" color="white" className="ml-1" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}