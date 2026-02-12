"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, AlertCircle, Activity, Info } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, themeColor, isAdmin } = useXalanify();
  const [playerStatus, setPlayerStatus] = useState("IDLE");
  const [errorLog, setErrorLog] = useState<string | null>(null);
  const playerRef = useRef(null);

  if (!currentTrack) return null;

  const videoUrl = currentTrack.isLocalTest 
    ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" // Música de teste para Admin
    : `https://www.youtube.com/watch?v=${currentTrack.youtubeId}`;

  return (
    <div className="fixed bottom-[85px] left-0 right-0 z-50 px-4 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        
        {/* PAINEL DE DEBUG PARA ADMIN */}
        {isAdmin && (
          <div className="mb-2 p-3 bg-black/95 border border-white/10 rounded-2xl font-mono text-[10px] shadow-2xl animate-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
              <span className="text-yellow-500 font-bold uppercase flex items-center gap-1">
                <Activity size={12} /> Debug Audio
              </span>
              <span className={`${errorLog ? "text-red-500" : "text-green-500"} font-black uppercase`}>
                {playerStatus}
              </span>
            </div>
            <p className="text-zinc-500">ID: <span className="text-white">{currentTrack.youtubeId || "Local"}</span></p>
            {errorLog && <p className="text-red-400 mt-1 flex items-center gap-1"><Info size={10}/> {errorLog}</p>}
          </div>
        )}

        <div className="hidden">
          <ReactPlayer
            ref={playerRef}
            url={videoUrl}
            playing={isPlaying}
            volume={1}
            playsinline
            onReady={() => { setPlayerStatus("READY"); setErrorLog(null); }}
            onStart={() => setPlayerStatus("PLAYING")}
            onBuffer={() => setPlayerStatus("BUFFERING")}
            onError={(e: any) => {
              setPlayerStatus("ERROR");
              setErrorLog("O vídeo não permite reprodução externa (Embed Bloqueado)");
            }}
            config={{
              youtube: { 
                playerVars: { autoplay: 1, controls: 0, origin: typeof window !== 'undefined' ? window.location.origin : '' },
                embedOptions: { host: "https://www.youtube-nocookie.com" }
              }
            }}
          />
        </div>

        <div className="bg-zinc-900/95 border border-white/10 p-2.5 rounded-[2.2rem] flex items-center justify-between shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center gap-3 pl-1 truncate max-w-[70%]">
            <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-2xl object-cover" alt="" />
            <div className="truncate text-left">
              <p className="text-[14px] font-bold text-white truncate leading-tight">{currentTrack.title}</p>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider mt-0.5">{currentTrack.artist}</p>
            </div>
          </div>

          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="w-12 h-12 rounded-full flex items-center justify-center text-black active:scale-90 transition-all shadow-lg"
            style={{ backgroundColor: themeColor }}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}