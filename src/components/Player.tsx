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
      {isAdmin && (
        <div className="mx-2 mb-2 p-3 bg-black/90 border border-green-500/50 rounded-2xl font-mono text-[10px] text-green-400 shadow-2xl">
          <div className="flex items-center justify-between mb-1 border-b border-green-500/20 pb-1">
            <div className="flex items-center gap-2"><Terminal size={12}/> <span>DEBUG MODE</span></div>
            <Activity size={12} className="animate-pulse" />
          </div>
          <p>YT_ID: {currentTrack.youtubeId || "NOT_FOUND"}</p>
          <p>ERROR: {playerError || "NONE"}</p>
          <p>URL: {`youtube.com/watch?v=${currentTrack.youtubeId}`}</p>
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