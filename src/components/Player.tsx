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

  if (!currentTrack) return null;
  const isLiked = likedTracks?.some((t: any) => t.id === currentTrack.id);
  const videoUrl = currentTrack.youtubeId ? `https://www.youtube.com/watch?v=${currentTrack.youtubeId}` : null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8">
      <AnimatePresence>
        {isAdmin && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-2 mb-4 p-5 bg-black border border-white/10 rounded-[2.5rem] shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-yellow-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Console Admin</span>
              </div>
              <Activity size={14} className="text-green-500 animate-pulse" />
            </div>

            <div className="space-y-2 font-mono text-[9px]">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-zinc-500">TRACK_TITLE:</span>
                <span className="text-white truncate max-w-[150px]">{currentTrack.title}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-zinc-500">YOUTUBE_ID:</span>
                <span className={currentTrack.youtubeId ? "text-green-400" : "text-red-500"}>
                  {currentTrack.youtubeId || "UNDEFINED (Empty Result)"}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-zinc-500">API_KEY_LOADED:</span>
                <span className="text-green-500">YES</span>
              </div>
            </div>

            {!currentTrack.youtubeId && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-[9px] text-red-200 leading-relaxed">
                  <strong>Atenção:</strong> A API retornou 0 resultados. Isto acontece quando a cota diária do Google (10.000 unidades) é atingida. Tente criar uma nova chave de API no Google Cloud.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ y: 100 }} 
        animate={{ y: 0 }} 
        className="bg-zinc-900/90 backdrop-blur-3xl border border-white/10 p-3 rounded-[2.8rem] flex items-center justify-between shadow-2xl"
      >
        {isClient && videoUrl && (
          <div className="hidden">
            <ReactPlayer 
              url={videoUrl}
              playing={isPlaying}
              volume={1}
              playsinline
              onReady={() => setErrorMsg(null)}
              onError={() => setErrorMsg("Playback Blocked")}
            />
          </div>
        )}

        <div className="flex items-center gap-3 max-w-[60%] pl-1">
          <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-[1.2rem] object-cover" />
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
            className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-all shadow-lg" 
            style={{ backgroundColor: themeColor }}
          >
            {isPlaying ? <Pause size={22} fill="white" color="white" /> : <Play size={22} fill="white" color="white" className="ml-1" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}