"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, AlertCircle, Activity } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, themeColor, isAdmin } = useXalanify();
  const [playerStatus, setPlayerStatus] = useState("IDLE");
  const [hasError, setHasError] = useState(false);
  const playerRef = useRef(null);

  if (!currentTrack) return null;

  const videoUrl = currentTrack.youtubeId ? `https://www.youtube.com/watch?v=${currentTrack.youtubeId}` : null;

  return (
    <div className="fixed bottom-[85px] left-0 right-0 z-50 px-4 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        
        {/* DEBUG PANEL PARA ADMIN */}
        {isAdmin && (
          <div className="mb-2 p-2 bg-black/90 border border-white/10 rounded-xl font-mono text-[8px] text-zinc-400">
            <div className="flex justify-between border-b border-white/5 pb-1 mb-1">
              <span className="text-yellow-500 uppercase">Internal Debug</span>
              <span className={hasError ? "text-red-500" : "text-green-500"}>{playerStatus}</span>
            </div>
            <p>URL: {videoUrl || "NULL"}</p>
            <p>TRACK_ID: {currentTrack.id}</p>
          </div>
        )}

        // Dentro do return do Player.tsx, altera a div do ReactPlayer:

<div className="opacity-0 pointer-events-none absolute w-1 h-1">
  {videoUrl && (
    <ReactPlayer
      ref={playerRef}
      key={currentTrack.youtubeId} // Importante para resetar o player a cada música
      url={videoUrl}
      playing={isPlaying}
      volume={1}
      playsinline={true} // Adicionado para melhor suporte mobile
      onStart={() => {
        setPlayerStatus("PLAYING_STARTED");
        setHasError(false);
      }}
      onBuffer={() => setPlayerStatus("BUFFERING")}
      onReady={() => setPlayerStatus("READY_TO_PLAY")}
      onError={(e: any) => {
        setPlayerStatus("ERROR_REPRODUCAO");
        setHasError(true);
        console.log("Erro Detalhado Player:", e);
      }}
      config={{
        youtube: {
          playerVars: { 
            autoplay: 1, 
            controls: 0, 
            modestbranding: 1,
            origin: window.location.origin 
          }
        }
      }}
    />
  )}
</div>

        <div className="bg-[#18181b]/95 border border-white/10 p-2 rounded-[2rem] flex items-center justify-between shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3 pl-1 truncate">
            <img src={currentTrack.thumbnail} className="w-11 h-11 rounded-xl object-cover shadow-md" alt="" />
            <div className="truncate">
              <p className="text-[13px] font-bold text-white truncate leading-tight">{currentTrack.title}</p>
              <div className="flex items-center gap-1">
                <p className="text-[9px] text-zinc-500 uppercase font-black">{currentTrack.artist}</p>
                {hasError && <AlertCircle size={10} className="text-red-500" />}
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="w-11 h-11 rounded-full flex items-center justify-center text-black active:scale-90 transition-all"
            style={{ backgroundColor: themeColor }}
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}