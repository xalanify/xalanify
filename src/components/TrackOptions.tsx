"use client";
import { MoreVertical, Heart, ListPlus, Share, Trash2, ShieldAlert } from "lucide-react";
import { useXalanify, Track } from "@/context/XalanifyContext";
import { useState } from "react";

interface TrackOptionsProps {
  track?: Track;
  playlistId?: string;
  isFavoriteView?: boolean;
  isPlaylistCard?: boolean;
}

export default function TrackOptions({ track, playlistId, isPlaylistCard }: TrackOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const { toggleLike, likedTracks, themeColor, playlists, addTrackToPlaylist, removeTrackFromPlaylist, deletePlaylist, isAdmin } = useXalanify();
  
  if (isPlaylistCard && playlistId) {
    return (
      <button onClick={(e) => { e.stopPropagation(); if(confirm("Eliminar playlist permanentemente?")) deletePlaylist(playlistId); }} 
              className="p-3 opacity-20 hover:opacity-100 text-red-500 transition-all active:scale-90">
        <Trash2 size={20} />
      </button>
    );
  }

  if (!track) return null;
  const isLiked = likedTracks.some(t => t.id === track.id);

  return (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="p-3 opacity-40 hover:opacity-100 transition-all active:scale-75">
        <MoreVertical size={20}/>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[150]" onClick={() => { setIsOpen(false); setShowPlaylists(false); }} />
          <div className="absolute right-0 bottom-12 w-64 rounded-[2.5rem] p-1 z-[151] shadow-[0_25px_60px_rgba(0,0,0,0.9)] animate-in zoom-in-95"
               style={{ background: `linear-gradient(145deg, ${themeColor}77 0%, #000 100%)`, backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}>
            <div className="bg-black/40 rounded-[2.4rem] overflow-hidden border border-white/10">
              
              <button onClick={() => { toggleLike(track); setIsOpen(false); }} className="w-full flex items-center justify-between p-4 hover:bg-white/5 border-b border-white/5">
                <span className="text-xs font-bold italic">Gostar</span>
                <Heart size={18} fill={isLiked ? themeColor : "none"} color={isLiked ? themeColor : "white"} />
              </button>

              {!showPlaylists ? (
                <button onClick={(e) => { e.stopPropagation(); setShowPlaylists(true); }} className="w-full flex items-center justify-between p-4 hover:bg-white/5 border-b border-white/5">
                  <span className="text-xs font-bold italic">Playlist</span>
                  <ListPlus size={18}/>
                </button>
              ) : (
                <div className="max-h-32 overflow-y-auto p-2 bg-black/40 border-b border-white/5 custom-scroll">
                  {playlists.map(p => (
                    <button key={p.id} onClick={() => { addTrackToPlaylist(p.id, track); setIsOpen(false); }} className="w-full text-left p-2 hover:bg-white/10 rounded-xl text-[10px] font-bold truncate">
                      + {p.name}
                    </button>
                  ))}
                </div>
              )}

              {playlistId && (
                <button onClick={() => { removeTrackFromPlaylist(playlistId, track.id); setIsOpen(false); }} className="w-full flex items-center justify-between p-4 hover:bg-red-500/20 text-red-500 border-b border-white/5">
                  <span className="text-xs font-bold italic">Remover</span>
                  <Trash2 size={18}/>
                </button>
              )}

              <button className="w-full flex items-center justify-between p-4 hover:bg-white/5">
                <span className="text-xs font-bold italic">Partilhar</span>
                <Share size={18}/>
              </button>

              {isAdmin && (
                <div className="p-3 bg-red-500/10 border-t border-white/5">
                  <p className="text-[7px] font-mono text-zinc-500 truncate uppercase tracking-widest">ID: {track.id}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}