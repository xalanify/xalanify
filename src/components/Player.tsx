"use client";
import { Play, Pause, SkipForward, SkipBack, Heart, Volume2 } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { useState, useEffect } from "react";

export default function Player() {
  const {
    currentTrack,
    isPlaying,
    setIsPlaying,
    progress,
    setProgress,
    currentTime,
    duration,
    audioRef,
    themeColor,
    likedTracks,
    toggleLike
  } = useXalanify();

  const [isDragging, setIsDragging] = useState(false);

  if (!currentTrack) {
    return (
      <div className="h-24 bg-gradient-to-t from-black to-black/50 border-t border-white/10 flex items-center justify-center">
        <p className="text-white/40 text-sm">Seleciona uma música para começar</p>
      </div>
    );
  }

  const isLiked = likedTracks.some(t => t.id === currentTrack.id);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setProgress(newProgress);
    if (audioRef.current) {
      audioRef.current.currentTime = (newProgress / 100) * duration;
    }
  };

  const handleProgressMouseDown = () => {
    setIsDragging(true);
  };

  const handleProgressMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="h-24 bg-gradient-to-t from-black to-black/50 border-t border-white/10 px-6 flex items-center gap-6">
      {/* Info */}
      <div className="w-56 flex items-center gap-4 flex-shrink-0">
        <img
          src={currentTrack.thumbnail}
          alt={currentTrack.title}
          className="w-16 h-16 rounded-lg object-cover"
        />
        <div className="min-w-0">
          <p className="text-sm font-bold truncate">{currentTrack.title}</p>
          <p className="text-xs text-white/60 truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-4">
          {/* Controles */}
          <button
            onClick={() => {}}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <SkipBack size={18} className="text-white/60" />
          </button>

          <button
            onClick={handlePlayPause}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black hover:scale-110 transition"
          >
            {isPlaying ? (
              <Pause size={18} fill="black" />
            ) : (
              <Play size={18} fill="black" className="ml-0.5" />
            )}
          </button>

          <button
            onClick={() => {}}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <SkipForward size={18} className="text-white/60" />
          </button>

          <button
            onClick={() => toggleLike(currentTrack)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <Heart
              size={18}
              fill={isLiked ? themeColor : "none"}
              color={isLiked ? themeColor : "white"}
              className="text-white/60"
            />
          </button>
        </div>

        {/* Progress Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/50 w-10">{formatTime(currentTime)}</span>
          <div className="flex-1 relative group">
            <div className="h-1 bg-white/10 rounded-full cursor-pointer">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: themeColor }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={isDragging ? progress : progress}
              onChange={handleProgressChange}
              onMouseDown={handleProgressMouseDown}
              onMouseUp={handleProgressMouseUp}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ left: `${progress}%`, transform: "translate(-50%, -50%)" }}
            />
          </div>
          <span className="text-xs text-white/50 w-10 text-right">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume & More */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <button className="p-2 hover:bg-white/10 rounded-lg transition">
          <Volume2 size={18} className="text-white/60" />
        </button>
      </div>
    </div>
  );
}