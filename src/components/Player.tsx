"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, Activity, AlertTriangle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, themeColor, isAdmin } = useXalanify();
  const [status, setStatus] = useState("IDLE");
  const [log, setLog] = useState<string | null>(null);

  if (!currentTrack) return null;

  // Decide a origem do som
  const audioSource = currentTrack.isLocal 
    ? "/test.mp3" 
    : `https://www.youtube.com/watch?v=${currentTrack.youtubeId}`;

  return (
    <div className="fixed bottom-[85px] left-0 right-0 z-50 px-4 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        
        {/* DEBUG MENU (ADMIN ONLY) */}
        {isAdmin && (
          <div className="mb-2 p-3 bg-black/95 border border-white/10 rounded-2xl font-mono text-[10px] shadow-2xl">
            <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-1">
              <span className="text-yellow-500 font-black flex items-center gap-1"><Activity size={10}/> DEBUG MODE</span>
              <span className="text-zinc-500">{status}</span>
            </div>
            <p className="truncate text-zinc-400">Source: <span className="text-white">{audioSource}</span></p>
            {log && <p className="text-red-400 mt-1 flex items-center gap-1"><AlertTriangle size={10}/> {log}</p>}
          </div>
        )}

        <div className="hidden">
          <ReactPlayer
            url={audioSource}
            playing={isPlaying}
            volume={1}
            onReady={() => setStatus("READY")}
            onStart={() => { setStatus("PLAYING"); setLog(null); }}
            onError={(e: any) => {
              setStatus("ERROR");
              setLog(currentTrack.isLocal ? "Ficheiro test.mp3 não encontrado em /public" : "YouTube Embed Bloqueado");
            }}
          />
        </div>

        <div className="bg-zinc-900/95 border border-white/10 p-2.5 rounded-[2.2rem] flex items-center justify-between shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center gap-3 pl-1 truncate max-w-[70%]">
            <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-2xl object-cover" />
            <div className="truncate">
              <p className="text-[14px] font-bold text-white truncate leading-tight">{currentTrack.title}</p>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-0.5">{currentTrack.artist}</p>
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