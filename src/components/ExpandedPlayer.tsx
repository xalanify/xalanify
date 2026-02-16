"use client";
import React, { useState } from "react";
import { ChevronDown, Heart, SkipBack, SkipForward, Play, Pause, ListMusic } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function ExpandedPlayer() {
  const { 
    currentTrack, isPlaying, setIsPlaying, progress, themeColor, 
    playNext, playPrevious, isExpanded, setIsExpanded, likedTracks, toggleLike 
  } = useXalanify();

  const [view, setView] = useState<'cover' | 'lyrics'>('cover');

  if (!isExpanded || !currentTrack) return null;

  // Simulação de Letras (Lyrics Engine)
  const lyrics = [
    { time: 0, text: "Xalanify Premium Experience" },
    { time: 10, text: "Sinta a batida no modo vidro" },
    { time: 20, text: "A carregar os teus hits favoritos..." },
    { time: 30, text: currentTrack.title + " - Tocando Agora" },
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-3xl animate-in slide-in-from-bottom duration-500 overflow-hidden">
      {/* Fundo Vivid Dinâmico */}
      <div className="absolute inset-0 -z-10 opacity-40">
        <div className="absolute top-0 w-full h-full animate-pulse" style={{ background: `radial-gradient(circle at center, ${themeColor}22 0%, transparent 70%)` }} />
      </div>

      <div className="h-full max-w-md mx-auto flex flex-col px-8 pt-6 pb-12">
        <div className="flex justify-between items-center mb-10">
          <button onClick={() => setIsExpanded(false)} className="p-3 glass rounded-full active:scale-90 transition-transform">
            <ChevronDown size={24} />
          </button>
          <button onClick={() => setView(view === 'cover' ? 'lyrics' : 'cover')} className="p-3 glass rounded-full active:scale-90 transition-transform">
            <ListMusic size={20} style={{ color: view === 'lyrics' ? themeColor : 'white' }} />
          </button>
        </div>

        {view === 'cover' ? (
          <div className="flex-1 flex flex-col justify-center items-center gap-12">
            <div className="relative w-full aspect-square group">
                <img src={currentTrack.thumbnail} className="w-full h-full object-cover rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.6)] group-hover:scale-[1.02] transition-transform duration-700" />
                <div className="absolute -inset-4 blur-3xl opacity-20 -z-10 rounded-full" style={{backgroundColor: themeColor}} />
            </div>
            <div className="w-full text-left">
                <h2 className="text-4xl font-black italic tracking-tighter truncate">{currentTrack.title}</h2>
                <p className="text-xl font-bold opacity-40 uppercase tracking-widest" style={{color: themeColor}}>{currentTrack.artist}</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scroll flex flex-col gap-8 py-10">
            {lyrics.map((line, i) => {
                const isActive = progress > line.time && progress < (lyrics[i+1]?.time || 100);
                return (
                  <p key={i} className={`text-3xl font-black italic transition-all duration-500 ${isActive ? 'opacity-100 scale-105' : 'opacity-20 scale-100 blur-[1px]'}`}
                     style={{ color: isActive ? themeColor : 'white' }}>
                    {line.text}
                  </p>
                );
            })}
          </div>
        )}

        {/* Controlos Finais */}
        <div className="mt-auto space-y-10">
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full shadow-[0_0_20px_var(--theme-color)] transition-all duration-300" 
                 style={{ width: `${progress}%`, backgroundColor: themeColor }} />
          </div>
          <div className="flex items-center justify-between px-4">
            <button onClick={playPrevious}><SkipBack size={40} fill="white" /></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="w-20 h-20 bg-white rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-2xl">
              {isPlaying ? <Pause size={35} fill="black" className="text-black" /> : <Play size={35} fill="black" className="text-black ml-1" />}
            </button>
            <button onClick={playNext}><SkipForward size={40} fill="white" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}