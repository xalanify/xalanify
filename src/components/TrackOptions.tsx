"use client";
import { MoreVertical, Heart, ListPlus, Plus } from "lucide-react";
import { useXalanify, Track } from "@/context/XalanifyContext";
import { useState } from "react";

export default function TrackOptions({ track }: { track: Track }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'main' | 'playlists'>('main');
  
  const { toggleLike, likedTracks, themeColor, playlists, createPlaylist, addTrackToPlaylist } = useXalanify();
  const isLiked = likedTracks.some(t => t.id === track.id);

  return (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="p-2 text-zinc-400 hover:text-white">
        <MoreVertical size={20}/>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-10 w-48 bg-black/90 border border-white/10 rounded-2xl backdrop-blur-xl z-[101] overflow-hidden p-1 shadow-2xl">
            
            {view === 'main' ? (
              <>
                <button onClick={() => { toggleLike(track); setIsOpen(false); }} className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl text-left">
                  <Heart size={16} fill={isLiked ? themeColor : "none"} style={{ color: isLiked ? themeColor : "white" }}/>
                  <span className="text-xs font-bold">{isLiked ? 'Desgostar' : 'Gostar'}</span>
                </button>
                <button onClick={() => setView('playlists')} className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl text-left">
                  <ListPlus size={16} />
                  <span className="text-xs font-bold">Add a Playlist</span>
                </button>
              </>
            ) : (
              <div className="space-y-1">
                <p className="text-[9px] uppercase font-black text-zinc-500 px-2 py-1">Escolhe a Playlist</p>
                <div className="max-h-32 overflow-y-auto">
                  {playlists.map(p => (
                    <button key={p.id} onClick={() => { addTrackToPlaylist(p.id, track); setIsOpen(false); }} className="w-full p-2 text-xs font-bold text-left hover:bg-white/10 truncate">
                      {p.name}
                    </button>
                  ))}
                </div>
                <button onClick={() => { const n = prompt("Nome:"); if(n) createPlaylist(n); }} className="w-full p-2 border-t border-white/10 text-[10px] font-black uppercase flex items-center gap-2 justify-center">
                  <Plus size={12}/> Nova
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}