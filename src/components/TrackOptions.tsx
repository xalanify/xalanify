"use client";
import { MoreHorizontal, Plus, Heart, Trash2 } from "lucide-react";
import { useState } from "react";
import { useXalanify, Track } from "@/context/XalanifyContext";

interface Props {
  track?: Track;
  playlistId?: string;
  isFavoriteView?: boolean;
  isPlaylistCard?: boolean;
}

export default function TrackOptions({ track, playlistId, isFavoriteView, isPlaylistCard }: Props) {
  const [open, setOpen] = useState(false);
  const { toggleLike, likedTracks, playlists, addTrackToPlaylist, removeTrackFromPlaylist, deletePlaylist } = useXalanify();
  
  const isLiked = track ? likedTracks.some(t => t.id === track.id) : false;

  return (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }} className="p-3 opacity-30 hover:opacity-100 transition-opacity">
        <MoreHorizontal size={20} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 bottom-full mb-2 w-56 glass rounded-[1.5rem] border border-white/10 shadow-2xl z-[101] p-2 animate-in zoom-in-95">
            {isPlaylistCard ? (
               <button 
               onClick={() => { if(confirm("Eliminar playlist?")) deletePlaylist(playlistId!); setOpen(false); }} 
               className="w-full p-3 flex items-center gap-3 hover:bg-red-500/10 text-red-500 rounded-xl transition-all"
             >
               <Trash2 size={16} />
               <span className="text-xs font-bold">Eliminar Playlist</span>
             </button>
            ) : track && (
              <>
                <button onClick={() => { toggleLike(track); setOpen(false); }} className="w-full p-3 flex items-center gap-3 hover:bg-white/5 rounded-xl">
                  <Heart size={16} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "text-red-500" : ""} />
                  <span className="text-xs font-bold">{isLiked ? "Remover Favoritas" : "Adicionar Favoritas"}</span>
                </button>
                <div className="h-px bg-white/5 my-1" />
                <p className="text-[8px] font-black uppercase opacity-20 p-2 tracking-widest">Add to Playlist</p>
                {playlists.map(p => (
                  <button key={p.id} onClick={() => { addTrackToPlaylist(p.id, track); setOpen(false); }} className="w-full p-2 flex items-center gap-3 hover:bg-white/5 rounded-xl text-xs font-bold truncate">
                    <Plus size={14} /> {p.name}
                  </button>
                ))}
                {(playlistId || isFavoriteView) && (
                  <>
                    <div className="h-px bg-white/5 my-1" />
                    <button onClick={() => { if(confirm("Remover faixa?")) { playlistId ? removeTrackFromPlaylist(playlistId, track.id) : toggleLike(track); } setOpen(false); }} className="w-full p-3 flex items-center gap-3 hover:bg-red-500/10 text-red-500 rounded-xl">
                      <Trash2 size={16} /> <span className="text-xs font-bold">Remover</span>
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}