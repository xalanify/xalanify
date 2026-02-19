"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { ChevronDown, Play, Pause, SkipForward, SkipBack, Heart, Shuffle, Repeat, MoreHorizontal } from "lucide-react";
import TrackOptions from "./TrackOptions";

export default function ExpandedPlayer() {
  const { 
    currentTrack, isPlaying, setIsPlaying, progress, 
    themeColor, setIsExpanded, isExpanded, toggleLike, likedTracks,
    playNext, playPrevious, currentTime, duration, audioRef
  } = useXalanify();

  if (!isExpanded || !currentTrack) return null;
  const isLiked = likedTracks.some(t => t.id === currentTrack.id);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (Number(e.target.value) / 100) * duration;
    if (audioRef.current) audioRef.current.currentTime = newTime;
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#050a18] animate-in slide-in-from-bottom duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden flex flex-col">
      {/* Background Glow Dinâmico */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[120%] h-[60%] opacity-40 blur-[120px] transition-colors duration-1000" 
        style={{ background: `radial-gradient(circle, ${themeColor} 0%, transparent 70%)` }} 
      />
      
      <div className="p-8 pt-12 flex items-center justify-between relative z-10">
        <button onClick={() => setIsExpanded(false)} className="w-12 h-12 glass rounded-full flex items-center justify-center active:scale-90 transition-all">
          <ChevronDown size={24} />
        </button>
        <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">A reproduzir</p>
            <p className="text-xs font-bold italic mt-1">Xalanify Music</p>
        </div>
        <TrackOptions track={currentTrack} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        <div className="relative w-full aspect-square max-w-[340px] group">
          <img 
            src={currentTrack.thumbnail} 
            className="w-full h-full rounded-[3rem] object-cover shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/10 group-hover:scale-[1.02] transition-transform duration-700" 
            alt="Album Cover"
          />
        </div>

        <div className="w-full mt-12 text-left">
          <h2 className="text-3xl font-black italic tracking-tighter text-white leading-tight">{currentTrack.title}</h2>
          <p className="text-lg opacity-40 font-bold uppercase tracking-tighter mt-2 text-blue-400">{currentTrack.artist}</p>
        </div>

        <div className="w-full mt-10 space-y-4">
          <div className="relative w-full h-2 group">
            <input 
              type="range" 
              value={progress || 0}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            <div className="h-full w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full transition-all duration-300 rounded-full" 
                  style={{ width: `${progress}%`, backgroundColor: themeColor, boxShadow: `0 0 15px ${themeColor}` }} 
                />
            </div>
          </div>
          <div className="flex justify-between text-[10px] font-black opacity-30 tracking-widest uppercase">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="w-full flex items-center justify-between mt-10">
            <button className="text-white/20 hover:text-white"><Shuffle size={20} /></button>
            <div className="flex items-center gap-8">
                <button onClick={playPrevious} className="text-white active:scale-75 transition-transform"><SkipBack size={32} fill="currentColor" /></button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)} 
                  className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-2xl active:scale-90 transition-all"
                >
                  {isPlaying ? <Pause size={38} fill="black" className="text-black" /> : <Play size={38} fill="black" className="text-black ml-2" />}
                </button>
                <button onClick={playNext} className="text-white active:scale-75 transition-transform"><SkipForward size={32} fill="currentColor" /></button>
            </div>
            <button className="text-white/20 hover:text-white"><Repeat size={20} /></button>
        </div>
      </div>
      
      <div className="p-10 flex justify-center relative z-10">
         <button onClick={() => toggleLike(currentTrack)} className="flex items-center gap-3 glass px-8 py-4 rounded-full border-white/10 active:scale-95 transition-all">
            <Heart size={20} fill={isLiked ? themeColor : 'none'} style={{ color: isLiked ? themeColor : 'white' }} />
            <span className="text-[10px] font-black uppercase tracking-widest">{isLiked ? 'Nos Favoritos' : 'Favoritar'}</span>
         </button>
      </div>
    </div>
  );
}