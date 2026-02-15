"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, ChevronDown, Heart, ListPlus, Shuffle, Repeat, SkipBack, SkipForward, Loader2 } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import TrackOptions from "./TrackOptions";
import { getYoutubeId, getDirectAudio } from "@/lib/musicApi";

const ReactPlayer = dynamic(() => import("react-player").then(m => m.default), { ssr: false }) as any;

export default function Player() {
  const { 
    currentTrack, setCurrentTrack, isPlaying, setIsPlaying, themeColor, 
    isExpanded, setIsExpanded, progress, setProgress, 
    duration, setDuration, playNext, playPrevious, audioEngine 
  } = useXalanify();
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<any>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lógica para carregar áudio automaticamente ao trocar via setas
  useEffect(() => {
    if (currentTrack && !currentTrack.audioUrl && !currentTrack.youtubeId) {
      loadTrackData();
    } else if (currentTrack) {
      setIsPlaying(true);
    }
  }, [currentTrack?.id]);

  const loadTrackData = async () => {
    if (!currentTrack) return;
    setLoading(true);
    try {
      let url, ytId;
      if (audioEngine === 'direct') {
        url = await getDirectAudio(currentTrack.title, currentTrack.artist);
      }
      if (!url) {
        ytId = await getYoutubeId(currentTrack.title, currentTrack.artist);
      }
      setCurrentTrack({ ...currentTrack, audioUrl: url || undefined, youtubeId: ytId || undefined });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setProgress(time);
    if (audioRef.current) audioRef.current.currentTime = time;
    if (playerRef.current) playerRef.current.seekTo(time);
  };

  if (!currentTrack) return null;

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <>
      {!isExpanded && (
        <div onClick={() => setIsExpanded(true)} className="fixed bottom-[85px] left-4 right-4 z-50 bg-zinc-900/95 border border-white/10 p-2 rounded-[2rem] flex items-center justify-between backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3 pl-1 truncate">
            <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-2xl object-cover" />
            <div className="truncate text-left">
              <p className="text-sm font-bold truncate">{currentTrack.title}</p>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter">{currentTrack.artist}</p>
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} className="w-12 h-12 rounded-full flex items-center justify-center text-black" style={{ backgroundColor: themeColor }}>
            {loading ? <Loader2 className="animate-spin" size={20}/> : (isPlaying ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor" className="ml-1"/>)}
          </button>
        </div>
      )}

      {isExpanded && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col p-8 animate-in slide-in-from-bottom duration-500">
          <div className="absolute inset-0 opacity-40 blur-[100px]" style={{ background: `radial-gradient(circle, ${themeColor} 0%, transparent 70%)` }} />
          <button onClick={() => setIsExpanded(false)} className="relative z-10 w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-8"><ChevronDown size={28} /></button>

          <div className="relative z-10 flex-1 flex flex-col justify-center space-y-8">
            <img src={currentTrack.thumbnail} className="w-full aspect-square object-cover rounded-[3rem] shadow-2xl" />
            <div className="flex items-center justify-between">
              <div className="max-w-[80%] text-left">
                <h2 className="text-3xl font-black tracking-tighter">{currentTrack.title}</h2>
                <p className="text-zinc-500 font-bold uppercase text-sm">{currentTrack.artist}</p>
              </div>
              <TrackOptions track={currentTrack} />
            </div>

            {/* BARRA DE PROGRESSO ARRASTÁVEL */}
            <div className="space-y-2 group">
              <div className="relative h-1.5 w-full bg-white/10 rounded-full">
                <div className="absolute h-full rounded-full" style={{ backgroundColor: themeColor, width: `${(progress / duration) * 100}%` }} />
                <input 
                  type="range" min={0} max={duration || 0} step="0.1" value={progress}
                  onChange={handleSeek} onMouseDown={() => setIsSeeking(true)} onMouseUp={() => setIsSeeking(false)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-[10px] font-black text-zinc-500">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between px-4">
              <Shuffle size={20} className="text-zinc-600" />
              <div className="flex items-center gap-8">
                <button onClick={playPrevious} className="active:scale-90 transition-all"><SkipBack size={32} fill="white" /></button>
                <button onClick={() => setIsPlaying(!isPlaying)} className="w-20 h-20 rounded-full flex items-center justify-center text-black shadow-2xl" style={{ backgroundColor: themeColor }}>
                  {loading ? <Loader2 className="animate-spin" size={36}/> : (isPlaying ? <Pause size={36} fill="currentColor"/> : <Play size={36} fill="currentColor" className="ml-1"/>)}
                </button>
                <button onClick={playNext} className="active:scale-90 transition-all"><SkipForward size={32} fill="white" /></button>
              </div>
              <Repeat size={20} className="text-zinc-600" />
            </div>
          </div>
        </div>
      )}

      <div className="hidden">
        {currentTrack.youtubeId && !currentTrack.audioUrl && (
          <ReactPlayer 
            ref={playerRef} url={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`} 
            playing={isPlaying} onProgress={(s: any) => !isSeeking && setProgress(s.playedSeconds)} 
            onDuration={setDuration} onEnded={playNext}
          />
        )}
        {(currentTrack.audioUrl || currentTrack.isLocal) && (
          <audio 
            ref={audioRef} src={currentTrack.isLocal ? "/test.mp3" : currentTrack.audioUrl} 
            onTimeUpdate={(e: any) => !isSeeking && setProgress(e.target.currentTime)} 
            onLoadedMetadata={(e: any) => setDuration(e.target.duration)} onEnded={playNext}
            autoPlay={isPlaying}
          />
        )}
      </div>
    </>
  );
}