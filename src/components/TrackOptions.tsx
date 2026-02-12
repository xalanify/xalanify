"use client";
import { MoreVertical, Heart, ListPlus, Plus } from "lucide-react";
import { useXalanify, Track } from "@/context/XalanifyContext";
import { useState } from "react";

export default function TrackOptions({ track }: { track: Track }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const { toggleLike, likedTracks, themeColor, playlists, createPlaylist, addTrackToPlaylist } = useXalanify();
  
  const isLiked = likedTracks.some(t => t.id === track.id);

  return (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="p-2 text-zinc-500"><MoreVertical size={20}/></button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => { setIsOpen(false); setShowPlaylists(false); }} />
          <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-white/10 rounded-[2rem] shadow-2xl z-[70] overflow-hidden p-2">
            {!showPlaylists ? (
              <>
                <button onClick={() => { toggleLike(track); setIsOpen(false); }} className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-2xl transition-all">
                  <Heart size={18} fill={isLiked ? themeColor : "none"} style={{ color: isLiked ? themeColor : "inherit" }}/>
                  <span className="text-sm font-bold">Gostar</span>
                </button>
                <button onClick={() => setShowPlaylists(true)} className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-2xl transition-all">
                  <ListPlus size={18} />
                  <span className="text-sm font-bold">Adicionar à Playlist</span>
                </button>
              </>
            ) : (
              <div className="p-2 space-y-2">
                <p className="text-[10px] font-black uppercase text-zinc-500 px-2 mb-2">As Tuas Playlists</p>
                {playlists.map(p => (
                  <button key={p.id} onClick={() => { addTrackToPlaylist(p.id, track); setIsOpen(false); }} className="w-full p-3 bg-white/5 rounded-xl text-xs font-bold text-left">{p.name}</button>
                ))}
                <button 
                  onClick={() => { const n = prompt("Nome da Playlist:"); if(n) createPlaylist(n); }}
                  className="w-full p-3 border border-dashed border-white/20 rounded-xl text-xs flex items-center gap-2 justify-center"
                >
                  <Plus size={14}/> Nova Playlist
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}