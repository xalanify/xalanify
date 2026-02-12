"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, AlertCircle, Activity, Info } from "lucide-react";
import { useState, useRef } from "react";
import dynamic from "next/dynamic";

// Voltamos ao import padrão para evitar erro de módulo não encontrado
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, themeColor, isAdmin } = useXalanify();
  const [playerStatus, setPlayerStatus] = useState("IDLE");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const playerRef = useRef(null);

  if (!currentTrack) return null;

  const videoUrl = currentTrack.youtubeId ? `https://www.youtube.com/watch?v=${currentTrack.youtubeId}` : null;

  return (
    <div className="fixed bottom-[85px] left-0 right-0 z-50 px-4 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        
        {/* DEBUG PANEL PARA ADMIN */}
        {isAdmin && (
          <div className="mb-2 p-3 bg-black/95 border border-white/10 rounded-2xl font-mono text-[10px] shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
              <span className="text-yellow-500 font-bold uppercase flex items-center gap-1">
                <Activity size={12} /> Admin Debug
              </span>
              <span className={`${errorMessage ? "text-red-500" : "text-green-500"} font-black uppercase`}>
                {playerStatus}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-zinc-400">YT_ID: <span className="text-white">{currentTrack.youtubeId || "Nulo"}</span></p>
              <p className="text-zinc-400">Stream: <span className="text-white truncate block">{videoUrl || "Sem URL"}</span></p>
              {errorMessage && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-2">
                  <AlertCircle size={12} className="text-red-500 shrink-0" />
                  <p className="text-red-400">Erro: {errorMessage}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MOTOR DO PLAYER (Escondido) */}
        <div className="hidden">
          {videoUrl && (
            <ReactPlayer
              ref={playerRef}
              key={currentTrack.youtubeId}
              url={videoUrl}
              playing={isPlaying}
              volume={1}
              playsinline
              onReady={() => { setPlayerStatus("PRONTO"); setErrorMessage(null); }}
              onStart={() => setPlayerStatus("A TOCAR")}
              onBuffer={() => setPlayerStatus("BUFFERING")}
              onEnded={() => setIsPlaying(false)}
              onError={(e: any) => {
                setPlayerStatus("ERRO");
                setErrorMessage("Vídeo indisponível ou proibido para embed.");
                console.error("Player Error:", e);
              }}
              config={{
                youtube: {
                  playerVars: { 
                    autoplay: 1, 
                    controls: 0, 
                    modestbranding: 1,
                    rel: 0,
                    origin: typeof window !== 'undefined' ? window.location.origin : ''
                  }
                }
              }}
            />
          )}
        </div>

        {/* UI DO PLAYER */}
        <div className="bg-zinc-900/95 border border-white/10 p-2.5 rounded-[2.2rem] flex items-center justify-between shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center gap-3 pl-1 truncate max-w-[70%]">
            <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-2xl object-cover shadow-lg" alt="" />
            <div className="truncate">
              <p className="text-[14px] font-bold text-white truncate leading-tight">{currentTrack.title}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">{currentTrack.artist}</p>
              </div>
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