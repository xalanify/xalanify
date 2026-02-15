"use client";
import { MoreVertical, Heart, ListPlus, ShieldAlert, Code } from "lucide-react";
import { useXalanify, Track } from "@/context/XalanifyContext";
import { useState } from "react";

export default function TrackOptions({ track }: { track: Track }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toggleLike, likedTracks, themeColor, isAdmin } = useXalanify();
  const isLiked = likedTracks.some(t => t.id === track.id);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 opacity-40 hover:opacity-100 transition-opacity">
        <MoreVertical size={20}/>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[150]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-10 w-64 bg-zinc-900 border border-white/10 rounded-[2rem] p-2 backdrop-blur-2xl z-[151] shadow-2xl">
            <button onClick={() => { toggleLike(track); setIsOpen(false); }} className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-2xl">
              <Heart size={18} fill={isLiked ? themeColor : "none"} style={{ color: isLiked ? themeColor : "white" }}/>
              <span className="text-xs font-bold">Gostar</span>
            </button>
            <button className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-2xl">
              <ListPlus size={18}/>
              <span className="text-xs font-bold">Playlist</span>
            </button>

            {isAdmin && (
              <div className="m-2 p-4 bg-black/40 rounded-2xl border border-red-500/10">
                <div className="flex items-center gap-2 text-red-500 mb-3 uppercase text-[9px] font-black tracking-widest">
                  <ShieldAlert size={12}/> Admin Inspector
                </div>
                <div className="space-y-2">
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[7px] text-zinc-500 font-bold uppercase">ID</span>
                    <span className="text-[9px] font-mono text-zinc-300 truncate">{track.id}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] text-zinc-500 font-bold uppercase">YT ID</span>
                    <span className="text-[9px] font-mono text-zinc-300">{track.youtubeId || "N/A"}</span>
                  </div>
                  <button onClick={() => console.log(track)} className="w-full flex items-center justify-center gap-2 mt-2 p-2 bg-white/5 rounded-lg">
                    <Code size={10}/><span className="text-[8px] font-bold uppercase">Console Log</span>
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