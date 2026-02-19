"use client";
import ReactPlayer from "react-player/youtube";
import { Play, Pause, SkipForward, SkipBack, Heart, Volume2 } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function Player() {
  const {
    currentTrack, isPlaying, setIsPlaying, progress, setProgress,
    currentTime, setCurrentTime, duration, setDuration, themeColor,
    likedTracks, toggleLike, playNext, playPrevious
  } = useXalanify();

  if (!currentTrack) return <div className="h-24 bg-black border-t border-white/10" />;

  const formatTime = (s: number) => `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,"0")}`;

  return (
    <div className="h-24 bg-black/95 backdrop-blur-md border-t border-white/10 px-6 flex items-center gap-6">
      <div className="hidden">
        <ReactPlayer
          url={currentTrack.audioUrl || `https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
          playing={isPlaying}
          onProgress={(e) => { setProgress(e.played * 100); setCurrentTime(e.playedSeconds); }}
          onDuration={(d) => setDuration(d)}
          onEnded={playNext}
        />
      </div>

      <div className="w-64 flex items-center gap-4">
        <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-md object-cover" alt="" />
        <div className="truncate">
          <p className="text-sm font-bold truncate">{currentTrack.title}</p>
          <p className="text-xs text-white/50 truncate">{currentTrack.artist}</p>
        </div>
      </div>

      <div className="flex-1 max-w-2xl flex flex-col items-center gap-2">
        <div className="flex items-center gap-6">
          <SkipBack size={20} className="cursor-pointer" onClick={playPrevious} />
          <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black">
            {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-1" />}
          </button>
          <SkipForward size={20} className="cursor-pointer" onClick={playNext} />
        </div>
        <div className="w-full flex items-center gap-3">
          <span className="text-[10px] text-white/40">{formatTime(currentTime)}</span>
          <div className="flex-1 h-1 bg-white/10 rounded-full">
            <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: themeColor }} />
          </div>
          <span className="text-[10px] text-white/40">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="w-64 flex justify-end gap-4">
        <button onClick={() => toggleLike(currentTrack)}>
          <Heart size={20} fill={likedTracks.find(t=>t.id===currentTrack.id) ? themeColor : "none"} />
        </button>
        <Volume2 size={20} className="text-white/40" />
      </div>
    </div>
  );
}