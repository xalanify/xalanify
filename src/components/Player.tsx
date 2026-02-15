"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, ChevronDown, Heart, ListPlus, Shuffle, Repeat } from "lucide-react";
import { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import TrackOptions from "./TrackOptions";

// Carregamento dinâmico para evitar erros de SSR no Next.js
const ReactPlayer = dynamic(() => import("react-player").then(m => m.default), { ssr: false }) as any;

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, themeColor, isExpanded, setIsExpanded } = useXalanify();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Monitoriza o estado de reprodução para o motor de áudio padrão (HTML5)
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => console.log("Aguardando interação para áudio..."));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  if (!currentTrack) return null;

  return (
    <>
      {/* MINI PLAYER FLUTUANTE */}
      {!isExpanded && (
        <div 
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-[85px] left-4 right-4 z-50 bg-zinc-900/90 border border-white/10 p-2 rounded-[2rem] flex items-center justify-between backdrop-blur-xl animate-in slide-in-from-bottom-4 shadow-2xl"
        >
          <div className="flex items-center gap-3 pl-1 truncate text-left">
            <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-2xl object-cover shadow-lg" alt="" />
            <div className="truncate">
              <p className="text-sm font-bold truncate">{currentTrack.title}</p>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter">{currentTrack.artist}</p>
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
            className="w-12 h-12 rounded-full flex items-center justify-center text-black"
            style={{ backgroundColor: themeColor }}
          >
            {isPlaying ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor" className="ml-1"/>}
          </button>
        </div>
      )}

      {/* PLAYER FULL SCREEN */}
      {isExpanded && (
        <div className="fixed inset-0 z-[100] bg-black animate-in slide-in-from-bottom duration-500 overflow-hidden">
          <div className="absolute inset-0 opacity-40 blur-[100px]" style={{ background: `radial-gradient(circle, ${themeColor} 0%, transparent 70%)` }} />
          
          <div className="relative h-full flex flex-col p-8 justify-between">
            <button onClick={() => setIsExpanded(false)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
              <ChevronDown size={28} />
            </button>

            <div className="space-y-8 text-left">
              <img src={currentTrack.thumbnail} className="w-full aspect-square object-cover rounded-[3rem] shadow-2xl scale-105" alt="" />
              
              <div className="flex items-center justify-between">
                <div className="max-w-[80%]">
                  <h2 className="text-3xl font-black tracking-tighter leading-tight">{currentTrack.title}</h2>
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm mt-1">{currentTrack.artist}</p>
                </div>
                <TrackOptions track={currentTrack} />
              </div>

              {/* Barra de Progresso Visual */}
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full transition-all duration-300" style={{ backgroundColor: themeColor, width: isPlaying ? '100%' : '2%' }} />
                </div>
              </div>

              {/* Controlos Principais */}
              <div className="flex items-center justify-between px-4">
                <Shuffle size={20} className="text-zinc-600" />
                <div className="flex items-center gap-8">
                  <button className="rotate-180 opacity-50"><Play size={32} fill="white" /></button>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-20 h-20 rounded-full flex items-center justify-center text-black shadow-2xl transition-transform active:scale-90"
                    style={{ backgroundColor: themeColor }}
                  >
                    {isPlaying ? <Pause size={36} fill="currentColor"/> : <Play size={36} fill="currentColor" className="ml-1"/>}
                  </button>
                  <button className="opacity-50"><Play size={32} fill="white" /></button>
                </div>
                <Repeat size={20} className="text-zinc-600" />
              </div>
            </div>

            <div className="flex justify-center gap-10 pb-8 text-zinc-500">
              <Heart size={24} />
              <ListPlus size={24} />
            </div>
          </div>
        </div>
      )}

      {/* MOTORES DE REPRODUÇÃO (Invisíveis) */}
      <div className="hidden">
        {/* Motor YouTube: Só renderiza se houver ID e não houver URL direta de áudio */}
        {currentTrack.youtubeId && !currentTrack.audioUrl && (
          <ReactPlayer 
            url={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`} 
            playing={isPlaying} 
            controls={false}
            width="0"
            height="0"
            config={{ youtube: { playerVars: { autoplay: 1, controls: 0 } } }}
            onEnded={() => setIsPlaying(false)}
            onError={() => console.error("Erro ao carregar vídeo do YouTube")}
          />
        )}
        
        {/* Motor Áudio Direto ou Local */}
        {(currentTrack.audioUrl || currentTrack.isLocal) && (
          <audio 
            ref={audioRef} 
            src={currentTrack.isLocal ? "/test.mp3" : currentTrack.audioUrl} 
            onEnded={() => setIsPlaying(false)} 
            autoPlay={isPlaying}
          />
        )}
      </div>
    </>
  );
}