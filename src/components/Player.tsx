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
    duration, setDuration, playNext, playPrevious, audioEngine, toggleLike, likedTracks
  } = useXalanify();
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<any>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [loading, setLoading] = useState(false);

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
      const updated = { ...currentTrack };
      if (audioEngine === 'direct') {
        updated.audioUrl = await getDirectAudio(updated.title, updated.artist) || "";
      } else {
        updated.youtubeId = await getYoutubeId(updated.title, updated.artist) || "";
      }
      setCurrentTrack(updated);
      setIsPlaying(true);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (!currentTrack) return null;

  const isLiked = likedTracks.some(t => t.id === currentTrack.id);

  return (
    <>
      {!isExpanded && (
        <div onClick={() => setIsExpanded(true)} className="fixed bottom-[85px] left-4 right-4 z-50 bg-zinc-900/95 border border-white/10 p-2 rounded-[2rem] flex items-center justify-between backdrop-blur-xl animate-in slide-in-from-bottom-4 shadow-2xl">
          <div className="flex items-center gap-3 flex-1 truncate p-1">
            <img src={currentTrack.thumbnail} className="w-11 h-11 rounded-2xl object-cover shadow-lg" alt="" />
            <div className="truncate">
              <p className="text-[13px] font-bold truncate">{currentTrack.title}</p>
              <p className="text-[9px] text-zinc-500 font-black uppercase tracking-tighter">{currentTrack.artist}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pr-2">
            <button onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5">
              {loading ? <Loader2 size={18} className="animate-spin" /> : (isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-1" />)}
            </button>
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in slide-in-from-bottom duration-500">
          <div className="absolute inset-0 opacity-20 blur-[100px]" style={{ backgroundColor: themeColor }} />
          
          <div className="relative flex-1 flex flex-col p-8 pt-12">
            <button onClick={() => setIsExpanded(false)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-8"><ChevronDown size={28}/></button>
            
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full aspect-square max-w-[320px] rounded-[3rem] overflow-hidden shadow-2xl mb-10 border border-white/10">
                <img src={currentTrack.thumbnail} className="w-full h-full object-cover" alt="" />
              </div>
              
              <div className="w-full text-left space-y-1">
                <h2 className="text-3xl font-black italic truncate">{currentTrack.title}</h2>
                <p className="text-sm font-black text-zinc-500 uppercase tracking-widest italic">{currentTrack.artist}</p>
              </div>
            </div>

            <div className="w-full space-y-8 pb-12">
              <div className="space-y-2">
                <input 
                  type="range" min={0} max={duration || 100} value={progress}
                  onChange={(e) => { setIsSeeking(true); setProgress(Number(e.target.value)); }}
                  onMouseUp={() => { setIsSeeking(false); if(audioRef.current) audioRef.current.currentTime = progress; }}
                  className="w-full accent-white h-1 bg-white/10 rounded-full appearance-none"
                />
                <div className="flex justify-between text-[10px] font-black text-zinc-500">
                  <span>{new Date(progress * 1000).toISOString().substr(14, 5)}</span>
                  <span>{new Date(duration * 1000).toISOString().substr(14, 5)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Shuffle size={20} className="text-zinc-600" />
                <div className="flex items-center gap-8">
                  <button onClick={playPrevious} className="active:scale-75 transition-all"><SkipBack size={32} fill="white" /></button>
                  <button onClick={() => setIsPlaying(!isPlaying)} className="w-20 h-20 rounded-full flex items-center justify-center text-black shadow-2xl active:scale-90 transition-all" style={{ backgroundColor: themeColor }}>
                    {loading ? <Loader2 className="animate-spin" size={36}/> : (isPlaying ? <Pause size={36} fill="currentColor"/> : <Play size={36} fill="currentColor" className="ml-1"/>)}
                  </button>
                  <button onClick={playNext} className="active:scale-75 transition-all"><SkipForward size={32} fill="white" /></button>
                </div>
                <Repeat size={20} className="text-zinc-600" />
              </div>

              <div className="flex justify-center gap-12 pt-4">
                <button onClick={() => toggleLike(currentTrack)}><Heart size={24} fill={isLiked ? themeColor : "none"} style={{ color: isLiked ? themeColor : "zinc-500" }} /></button>
                <TrackOptions track={currentTrack} />
              </div>
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
            onTimeUpdate={(e: any) => !isSeeking && setProgress(e.currentTarget.currentTime)} 
            onLoadedMetadata={(e: any) => setDuration(e.currentTarget.duration)}
            onEnded={playNext}
          />
        )}
      </div>
    </>
  );
}