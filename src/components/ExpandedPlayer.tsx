"use client";
import React, { useState } from "react";
import { ChevronDown, Heart, SkipBack, SkipForward, Play, Pause, ListMusic, Share2, MoreHorizontal } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function ExpandedPlayer() {
  const { 
    currentTrack, isPlaying, setIsPlaying, progress, themeColor, 
    playNext, playPrevious, isExpanded, setIsExpanded, likedTracks, toggleLike 
  } = useXalanify();

  const [view, setView] = useState<'cover' | 'lyrics'>('cover');
  const isLiked = likedTracks.some(t => t.id === currentTrack?.id);

  if (!isExpanded || !currentTrack) return null;

  // Motor de Letras Simulado (Integrado com Progresso)
  const lyrics = [
    { time: 0, text: "Xalanify Premium Experience" },
    { time: 10, text: "Design iOS Glass Ativado" },
    { time: 25, text: "A sentir a vibração da música..." },
    { time: 45, text: "Lyrics sincronizadas em tempo real" },
    { time: 70, text: "Obrigado por escolher Xalanify" }
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-black animate-in slide-in-from-bottom duration-700 overflow-hidden">
      
      {/* Fundo Vivid Animado */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 opacity-40 blur-[120px] animate-pulse" 
             style={{ background: `radial-gradient(circle at 50% 50%, ${themeColor} 0%, transparent 70%)` }} />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl" />
      </div>

      <div className="h-full max-w-md mx-auto flex flex-col px-8 pt-8 pb-12">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => setIsExpanded(false)} className="p-3 glass rounded-full active:scale-75 transition-all">
            <ChevronDown size={24} />
          </button>
          <div className="text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30">A tocar de</p>
            <p className="text-[11px] font-bold italic">Sua Biblioteca</p>
          </div>
          <button className="p-3 glass rounded-full" onClick={() => setView(view === 'cover' ? 'lyrics' : 'cover')}>
            <ListMusic size={20} style={{ color: view === 'lyrics' ? themeColor : 'white' }} />
          </button>
        </div>

        {/* Conteúdo Central: Capa ou Letras */}
        <div className="flex-1 flex flex-col justify-center">
          {view === 'cover' ? (
            <div className="space-y-12 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative aspect-square w-full">
                <img 
                  src={currentTrack.thumbnail} 
                  className={`w-full h-full object-cover rounded-[3rem] shadow-[0_60px_100px_rgba(0,0,0,0.7)] transition-transform duration-1000 ${isPlaying ? 'scale-100' : 'scale-90 opacity-60'}`} 
                />
                <div className="absolute -inset-6 opacity-20 blur-3xl -z-10 rounded-full" style={{ backgroundColor: themeColor }} />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1 overflow-hidden pr-6">
                  <h2 className="text-4xl font-black italic tracking-tighter truncate leading-tight">{currentTrack.title}</h2>
                  <p className="text-xl font-bold opacity-40 uppercase tracking-tighter" style={{ color: themeColor }}>{currentTrack.artist}</p>
                </div>
                <button onClick={() => toggleLike(currentTrack)} className="active:scale-75 transition-transform">
                  <Heart size={32} fill={isLiked ? themeColor : "transparent"} style={{ color: isLiked ? themeColor : "white" }} />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-[450px] overflow-y-auto custom-scroll flex flex-col gap-10 py-10 animate-in slide-in-from-right duration-500">
              {lyrics.map((line, i) => {
                const active = progress >= line.time && (lyrics[i+1] ? progress < lyrics[i+1].time : true);
                return (
                  <p key={i} className={`text-3xl font-black italic transition-all duration-700 ${active ? 'opacity-100 scale-105 blur-0' : 'opacity-10 scale-95 blur-[2px]'}`}
                     style={{ color: active ? themeColor : 'white' }}>
                    {line.text}
                  </p>
                );
              })}
            </div>
          )}
        </div>

        {/* Controlos de Reprodução */}
        <div className="mt-auto space-y-10">
          <div className="space-y-4">
            <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="absolute h-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: themeColor, boxShadow: `0 0 20px ${themeColor}` }} />
            </div>
            <div className="flex justify-between text-[10px] font-black opacity-30 tracking-widest">
              <span>0:00</span>
              <span>3:45</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <button className="opacity-30"><Share2 size={20} /></button>
            <div className="flex items-center gap-8">
              <button onClick={playPrevious} className="active:scale-75 transition-all"><SkipBack size={42} fill="white" /></button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center active:scale-90 transition-all shadow-2xl"
              >
                {isPlaying ? <Pause size={38} fill="black" className="text-black" /> : <Play size={38} fill="black" className="text-black ml-1" />}
              </button>
              <button onClick={playNext} className="active:scale-75 transition-all"><SkipForward size={42} fill="white" /></button>
            </div>
            <button className="opacity-30"><MoreHorizontal size={20} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}