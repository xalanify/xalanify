// src/components/ExpandedPlayer.tsx

"use client";
import { Play, Pause, SkipForward, SkipBack, Heart, X } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function ExpandedPlayer() {
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
    toggleLike,
    isExpanded,
    setIsExpanded,
    playNext,
    playPrevious
  } = useXalanify();

  if (!isExpanded || !currentTrack) return null;

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

  const isLiked = likedTracks.some(t => t.id === currentTrack.id);

  return (
    <div className="fixed inset-0 z-[200] bg-gradient-to-b from-[#3a2a3a] to-[#1a0f1a] flex flex-col p-8">
      {/* Close Button */}
      <button
        onClick={() => setIsExpanded(false)}
        className="self-start mb-8 p-2 hover:bg-white/10 rounded-lg transition"
      >
        <X size={24} className="text-white/60" />
      </button>

      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Album Art */}
        <div className="w-72 h-72 rounded-3xl overflow-hidden shadow-2xl mb-12 border border-white/10">
          <img
            src={currentTrack.thumbnail}
            className="w-full h-full object-cover"
            alt="Album"
          />
        </div>

        {/* Track Info */}
        <h2 className="text-4xl font-black text-center mb-2 leading-tight">
          {currentTrack.title}
        </h2>
        <p className="text-white/60 text-sm font-bold uppercase tracking-wide mb-10">
          {currentTrack.artist}
        </p>

        {/* Progress Bar */}
        <div className="w-full max-w-sm mb-8">
          <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
            <div
              className="h-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: themeColor }}
            />
            <input
              type="range"
              value={progress || 0}
              onChange={handleProgressChange}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-xs text-white/40 font-bold">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-8 mb-12">
          <button onClick={playPrevious} className="text-white hover:scale-110 transition">
            <SkipBack size={40} fill="currentColor" />
          </button>
          <button
            onClick={handlePlayPause}
            className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition"
          >
            {isPlaying ? (
              <Pause size={32} fill="black" color="black" />
            ) : (
              <Play size={32} fill="black" color="black" className="ml-1" />
            )}
          </button>
          <button onClick={playNext} className="text-white hover:scale-110 transition">
            <SkipForward size={40} fill="currentColor" />
          </button>
        </div>

        {/* Like Button */}
        <button
          onClick={() => toggleLike(currentTrack)}
          className="hover:scale-110 transition"
        >
          <Heart
            size={40}
            fill={isLiked ? themeColor : "none"}
            color={isLiked ? themeColor : "white"}
          />
        </button>
      </div>
    </div>
  );
}