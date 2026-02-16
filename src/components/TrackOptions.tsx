"use client";
import { MoreVertical, Heart, ListPlus, ShieldAlert, Code, Share, ChevronRight } from "lucide-react";
import { useXalanify, Track } from "@/context/XalanifyContext";
import { useState } from "react";

export default function TrackOptions({ track }: { track: Track }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const { toggleLike, likedTracks, themeColor, isAdmin, playlists, addTrackToPlaylist } = useXalanify();
  const isLiked = likedTracks.some(t => t.id === track.id);

  return (
    <div className="relative">
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); setShowPlaylists(false); }} 
        className="p-3 opacity-40 hover:opacity-100 transition-opacity active:scale-90"
      >
        <MoreVertical size={20}/>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[150]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-12 w-64 glass rounded-[2.5rem] p-2 z-[151] shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10">
            {!showPlaylists ? (
              <>
                <button 
                  onClick={() => { toggleLike(track); setIsOpen(false); }} 
                  className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-[1.8rem] transition-colors"
                >
                  <Heart size={18} fill={isLiked ? themeColor : "none"} style={{ color: isLiked ? themeColor : "white" }}/>
                  <span className="text-xs font-bold italic">Gostar</span>
                </button>
                
                <button 
                  onClick={() => setShowPlaylists(true)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-[1.8rem] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ListPlus size={18}/>
                    <span className="text-xs font-bold italic">Adicionar à Playlist</span>
                  </div>
                  <ChevronRight size={14} className="opacity-20" />
                </button>

                <button className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-[1.8rem] transition-colors">
                  <Share size={18}/>
                  <span className="text-xs font-bold italic">Partilhar</span>
                </button>

                {isAdmin && (
                  <div className="m-2 p-4 bg-red-500/10 rounded-[1.8rem] border border-red-500/20 text-[9px]">
                    <p className="font-mono truncate opacity-40">ID: {track.id}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="p-2">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-20 mb-2 ml-2">As Tuas Playlists</p>
                <div className="max-h-48 overflow-y-auto space-y-1 custom-scroll">
                  {playlists.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => { addTrackToPlaylist(p.id, track); setIsOpen(false); }}
                      className="w-full text-left p-3 hover:bg-white/10 rounded-xl text-xs font-bold truncate"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowPlaylists(false)} className="w-full mt-2 p-2 text-[9px] font-black uppercase opacity-20">Voltar</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}