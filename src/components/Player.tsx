"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, Activity, AlertCircle, Volume2 } from "lucide-react";
import { useState, useRef } from "react";
import dynamic from "next/dynamic";

// Importação dinâmica do pacote principal para evitar erro de modulo 'react-player/youtube'
const ReactPlayer = dynamic(() => import("react-player"), { 
  ssr: false,
  loading: () => <div className="hidden" /> 
}) as any;

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, themeColor, isAdmin } = useXalanify();
  const [isReady, setIsReady] = useState(false);
  const [errorLog, setErrorLog] = useState<string | null>(null);

  if (!currentTrack) return null;

  // Se for track local (Admin), usa o ficheiro da pasta public. Caso contrário, YouTube.
  const audioSource = currentTrack.isLocal 
    ? "/test.mp3" 
    : `https://www.youtube.com/watch?v=${currentTrack.youtubeId}`;

  return (
    <div className="fixed bottom-[85px] left-0 right-0 z-50 px-4 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        
        {/* DEBUG PANEL - ADMIN ONLY */}
        {isAdmin && (
          <div className="mb-2 p-3 bg-black/95 border border-white/10 rounded-2xl font-mono text-[10px] shadow-2xl">
            <div className="flex justify-between items-center mb-1 border-b border-white/5 pb-1 text-yellow-500 font-bold">
              <span className="flex items-center gap-1"><Activity size={12}/> ENGINE</span>
              <span>{isReady ? "READY" : "LOADING"}</span>
            </div>
            <p className="truncate opacity-50">Src: {audioSource}</p>
            {errorLog && <p className="text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10}/> {errorLog}</p>}
          </div>
        )}

        <div className="hidden">
          <ReactPlayer
            url={audioSource}
            playing={isPlaying}
            volume={1}
            playsinline
            onReady={() => setIsReady(true)}
            onStart={() => setErrorLog(null)}
            onError={(e: any) => {
              console.error("Playback Error:", e);
              setErrorLog(currentTrack.isLocal ? "test.mp3 não encontrado na pasta /public" : "Vídeo bloqueado pelo YouTube (Embed restricted)");
            }}
            config={{
              youtube: { playerVars: { autoplay: 1, modestbranding: 1 } }
            }}
          />
        </div>

        <div className="bg-zinc-900/95 border border-white/10 p-2.5 rounded-[2.2rem] flex items-center justify-between shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center gap-3 pl-1 truncate max-w-[70%] text-left">
            <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-2xl object-cover" alt="" />
            <div className="truncate">
              <p className="text-[14px] font-bold text-white truncate leading-tight">{currentTrack.title}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{currentTrack.artist}</p>
                {isReady && isPlaying && <Volume2 size={10} className="text-green-500 animate-pulse" />}
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