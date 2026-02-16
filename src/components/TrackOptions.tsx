"use client";
import { MoreVertical, Heart, ListPlus, ShieldAlert, Code, Share } from "lucide-react";
import { useXalanify, Track } from "@/context/XalanifyContext";
import { useState } from "react";

export default function TrackOptions({ track }: { track: Track }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toggleLike, likedTracks, themeColor, isAdmin } = useXalanify();
  const isLiked = likedTracks.some(t => t.id === track.id);

  return (
    <div className="relative">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }} 
        className="p-3 opacity-40 hover:opacity-100 transition-opacity active:scale-90"
      >
        <MoreVertical size={20}/>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[150]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-12 w-64 glass rounded-[2.5rem] p-2 z-[151] shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => { toggleLike(track); setIsOpen(false); }} 
              className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-[1.8rem] transition-colors"
            >
              <Heart size={18} fill={isLiked ? themeColor : "none"} style={{ color: isLiked ? themeColor : "white" }}/>
              <span className="text-xs font-bold italic">Gostar</span>
            </button>
            
            <button className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-[1.8rem] transition-colors">
              <ListPlus size={18}/>
              <span className="text-xs font-bold italic">Adicionar à Playlist</span>
            </button>

            <button className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-[1.8rem] transition-colors">
              <Share size={18}/>
              <span className="text-xs font-bold italic">Partilhar</span>
            </button>

            {isAdmin && (
              <div className="m-2 p-4 bg-red-500/10 rounded-[1.8rem] border border-red-500/20">
                <div className="flex items-center gap-2 text-red-500 mb-3 text-[9px] font-black uppercase tracking-widest">
                  <ShieldAlert size={12}/> Admin Inspector
                </div>
                <div className="space-y-2 text-[9px] font-mono text-zinc-500 overflow-hidden">
                  <p className="truncate">ID: {track.id}</p>
                  <p className="truncate">Source: {track.youtubeId ? 'YouTube' : 'Local'}</p>
                  <button 
                    onClick={() => console.log("Debug Track:", track)} 
                    className="mt-2 w-full p-2 bg-white/5 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10"
                  >
                    <Code size={10}/> DUMP DATA
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}