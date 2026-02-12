"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, themeColor, isAdmin } = useXalanify();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  if (!currentTrack || !isClient) return null;

  const videoUrl = currentTrack.youtubeId ? `https://www.youtube.com/watch?v=${currentTrack.youtubeId}` : null;

  return (
    <div className="fixed bottom-[85px] left-0 right-0 z-50 px-4">
      <div className="max-w-md mx-auto">
        
        {/* MOTOR DE ÁUDIO INVISÍVEL */}
        {videoUrl && (
          <div className="hidden">
            <ReactPlayer 
              key={currentTrack.youtubeId} // RESET TOTAL AO MUDAR DE MÚSICA
              url={videoUrl}
              playing={isPlaying}
              controls={false}
              width="0"
              height="0"
              config={{
                youtube: {
                  playerVars: { 
                    autoplay: 1, 
                    modestbranding: 1, 
                    rel: 0 
                  }
                }
              }}
              onError={(e: any) => console.error("Erro no Player:", e)}
            />
          </div>
        )}

        <motion.div 
          initial={{ y: 50, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="bg-[#18181b]/95 border border-white/10 p-2 rounded-[2rem] flex items-center justify-between shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 pl-1 truncate">
            <img src={currentTrack.thumbnail} className="w-11 h-11 rounded-xl object-cover shadow-md" alt="" />
            <div className="truncate">
              <p className="text-[13px] font-bold text-white truncate leading-tight">{currentTrack.title}</p>
              <p className="text-[9px] text-zinc-500 uppercase font-black tracking-tighter">{currentTrack.artist}</p>
            </div>
          </div>

          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="w-11 h-11 rounded-full flex items-center justify-center text-black active:scale-90 transition-all shadow-lg"
            style={{ backgroundColor: themeColor }}
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </button>
        </motion.div>
      </div>
    </div>
  );
}