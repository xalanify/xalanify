"use client";
import React, { useState } from "react";
import ReactPlayer from "react-player/youtube";
import { Play, Pause, SkipForward, SkipBack, Heart, Shuffle, Repeat, ChevronDown, MoreHorizontal } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, progress, setProgress, themeColor, isExpanded, setIsExpanded, playNext, playPrevious } = useXalanify();
  const [duration, setDuration] = useState(0);

  if (!currentTrack) return null;

  const url = currentTrack.audioUrl || `https://www.youtube.com/watch?v=${currentTrack.youtubeId}`;

  // VIEW EXPANDIDA (IMAGEM 4)
  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col p-8 animate-in slide-in-from-bottom duration-500" 
           style={{ background: `linear-gradient(to bottom, ${themeColor}cc, #050a18)` }}>
        <div className="flex justify-between items-center mb-10">
          <button onClick={() => setIsExpanded(false)} className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center"><ChevronDown size={24}/></button>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-white">Tocando de</p>
            <p className="font-bold text-sm italic">Sua Biblioteca</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center"><MoreHorizontal size={20}/></button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center space-y-12">
          <img src={currentTrack.thumbnail} className="w-full aspect-square rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.6)] object-cover border-white/5 border" />
          
          <div className="w-full flex items-center justify-between">
            <div className="max-w-[80%]">
              <h2 className="text-3xl font-black tracking-tight truncate text-white">{currentTrack.title}</h2>
              <p className="text-xl opacity-60 font-bold uppercase tracking-tighter text-white">{currentTrack.artist}</p>
            </div>
            <Heart size={32} fill={themeColor} color={themeColor} />
          </div>

          <div className="w-full space-y-2">
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white transition-all shadow-[0_0_15px_white]" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between text-[11px] font-black opacity-40">
              <span>{Math.floor((progress * duration) / 100 / 60)}:{(Math.floor((progress * duration) / 100) % 60).toString().padStart(2, '0')}</span>
              <span>{Math.floor(duration/60)}:{(Math.floor(duration%60)).toString().padStart(2, '0')}</span>
            </div>
          </div>

          <div className="flex items-center justify-between w-full px-4">
            <Shuffle size={22} className="opacity-40" />
            <SkipBack size={38} onClick={playPrevious} fill="white" />
            <button onClick={() => setIsPlaying(!isPlaying)} className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl active:scale-90 transition-all">
              {isPlaying ? <Pause size={38} color="black" fill="black" /> : <Play size={38} color="black" fill="black" className="ml-1.5" />}
            </button>
            <SkipForward size={38} onClick={playNext} fill="white" />
            <Repeat size={22} className="opacity-40" />
          </div>
        </div>
        
        {/* PLAYER INVISÍVEL PARA SOM */}
        <div className="hidden">
          <ReactPlayer 
            url={url} 
            playing={isPlaying} 
            onProgress={(p) => setProgress(p.played * 100)} 
            onDuration={setDuration}
            onEnded={playNext}
            config={{ youtube: { playerVars: { autoplay: 1 } } }}
          />
        </div>
      </div>
    );
  }

  // MINI PLAYER
  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] glass rounded-[2.2rem] p-3 flex items-center gap-4 border border-white/10 shadow-2xl" onClick={() => setIsExpanded(true)}>
      <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-2xl object-cover shadow-lg" />
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-black truncate text-white italic">{currentTrack.title}</h4>
        <p className="text-[10px] opacity-40 uppercase font-black tracking-tighter text-white">{currentTrack.artist}</p>
      </div>
      <button onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: themeColor }}>
        {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-1" />}
      </button>
      <div className="hidden"><ReactPlayer url={url} playing={isPlaying} onProgress={(p) => setProgress(p.played * 100)} onDuration={setDuration} onEnded={playNext} /></div>
    </div>
  );
}