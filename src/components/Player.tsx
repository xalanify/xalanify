"use client";
import React, { useRef, useEffect, useState } from "react";
import ReactPlayer from "react-player/youtube";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function Player() {
  const { 
    currentTrack, isPlaying, setIsPlaying, 
    progress, setProgress, setDuration,
    themeColor, playNext, playPrevious, setIsExpanded 
  } = useXalanify();

  const playerRef = useRef<ReactPlayer>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handleGlobalSeek = (e: any) => {
      if (e.detail?.percent !== undefined) {
        playerRef.current?.seekTo(e.detail.percent / 100, 'fraction');
      }
    };
    window.addEventListener('playerSeek', handleGlobalSeek);
    return () => window.removeEventListener('playerSeek', handleGlobalSeek);
  }, []);

  useEffect(() => {
    setIsReady(false);
  }, [currentTrack?.id]);

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[90] animate-in slide-in-from-bottom-10 duration-500 font-jakarta">
      <div className="hidden">
        <ReactPlayer
          key={currentTrack.id} 
          ref={playerRef}
          url={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
          playing={isPlaying}
          onReady={() => {
            setIsReady(true);
            if (isPlaying) {
               const internal = playerRef.current?.getInternalPlayer();
               if (internal?.playVideo) internal.playVideo();
            }
          }}
          onProgress={(s) => setProgress(s.played * 100)}
          onDuration={(d) => setDuration(d)}
          onEnded={playNext}
          config={{ youtube: { playerVars: { autoplay: 1, controls: 0, rel: 0, modestbranding: 1 } } }}
        />
      </div>

      <div 
        className="rounded-[2.5rem] p-4 flex items-center gap-4 shadow-2xl relative overflow-hidden border border-white/10"
        style={{ background: `linear-gradient(135deg, ${themeColor} 0%, #0a0a0a 100%)` }}
      >
        <div onClick={() => setIsExpanded(true)} className="flex items-center gap-4 flex-1 cursor-pointer">
          <div className="relative">
             <img src={currentTrack.thumbnail} className={`w-12 h-12 rounded-2xl object-cover transition-all duration-500 ${isPlaying ? 'scale-105 shadow-xl' : 'scale-95 opacity-50'}`} alt="" />
             {!isReady && isPlaying && <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl"><div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" /></div>}
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-sm truncate text-white">{currentTrack.title}</h4>
            <p className="text-[10px] font-black opacity-60 uppercase tracking-widest truncate text-white">{currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); playPrevious(); }} className="p-2 text-white active:scale-90"><SkipBack size={20} fill="white" /></button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-xl active:scale-90 transition-all"
          >
            {isPlaying ? <Pause size={22} className="text-black" fill="black" /> : <Play size={22} className="text-black ml-1" fill="black" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); playNext(); }} className="p-2 text-white active:scale-90"><SkipForward size={20} fill="white" /></button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <div className="h-full bg-white/40" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}