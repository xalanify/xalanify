"use client";
import { MoreVertical, Heart, ListPlus, Share, Trash2 } from "lucide-react";
import { useXalanify, Track } from "@/context/XalanifyContext";
import { useState } from "react";

interface TrackOptionsProps {
  track: Track;
  playlistId?: string;
  isFavoriteView?: boolean;
  isPlaylistCard?: boolean;
}

export default function TrackOptions({ track, playlistId, isPlaylistCard }: TrackOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const { toggleLike, likedTracks, themeColor, playlists, addTrackToPlaylist, removeTrackFromPlaylist, deletePlaylist } = useXalanify();
  
  if (isPlaylistCard && playlistId) {
    return (
      <button onClick={(e) => { e.stopPropagation(); if(confirm("Apagar playlist?")) deletePlaylist(playlistId); }} className="p-3 opacity-20 hover:opacity-100 text-red-500 transition-all">
        <Trash2 size={20} />
      </button>
    );
  }

  const isLiked = likedTracks.some(t => t.id === track.id);

  return (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="p-3 opacity-40 hover:opacity-100 transition-all">
        <MoreVertical size={20}/>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[150]" onClick={() => { setIsOpen(false); setShowPlaylists(false); }} />
          <div 
            className="absolute right-0 bottom-12 w-64 rounded-[2.5rem] p-1 z-[151] shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95"
            style={{ background: `linear-gradient(135deg, ${themeColor}66 0%, #111 100%)`, backdropFilter: 'blur(30px)' }}
          >
            <div className="bg-black/60 rounded-[2.4rem] overflow-hidden border border-white/5">
              <button onClick={() => { toggleLike(track); setIsOpen(false); }} className="w-full flex items-center justify-between p-4 hover:bg-white/5 border-b border-white/5">
                <span className="text-xs font-bold italic">Gostar</span>
                <Heart size={18} fill={isLiked ? themeColor : "none"} color={isLiked ? themeColor : "white"} />
              </button>

              {!showPlaylists ? (
                <button onClick={(e) => { e.stopPropagation(); setShowPlaylists(true); }} className="w-full flex items-center justify-between p-4 hover:bg-white/5 border-b border-white/5">
                  <span className="text-xs font-bold italic">Adicionar à Playlist</span>
                  <ListPlus size={18}/>
                </button>
              ) : (
                <div className="max-h-32 overflow-y-auto p-2 bg-black/40">
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
            </div>
          </div>
        </>
      )}
    </div>
  );
}