"use client";
import { MoreVertical, Heart, ListPlus, ShieldAlert, Code, Share, Trash2 } from "lucide-react";
import { useXalanify, Track } from "@/context/XalanifyContext";
import { useState } from "react";

// Adicionadas as props que a Library utiliza
interface TrackOptionsProps {
  track?: Track; 
  playlistId?: string;
  isFavoriteView?: boolean;
  isPlaylistCard?: boolean;
}

export default function TrackOptions({ track, playlistId, isFavoriteView, isPlaylistCard }: TrackOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const { toggleLike, likedTracks, themeColor, isAdmin, playlists, addTrackToPlaylist, removeTrackFromPlaylist, deletePlaylist } = useXalanify();
  
  // Se for apenas o card da playlist (sem música específica)
  if (isPlaylistCard && playlistId) {
    return (
      <button 
        onClick={(e) => { e.stopPropagation(); if(confirm("Eliminar playlist?")) deletePlaylist(playlistId); }}
        className="p-3 opacity-20 hover:opacity-100 text-red-500 transition-all"
      >
        <Trash2 size={20} />
      </button>
    );
  }

  if (!track) return null;

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
          <div className="fixed inset-0 z-[150]" onClick={() => { setIsOpen(false); setShowPlaylists(false); }} />
          <div className="absolute right-0 top-12 w-64 glass rounded-[2.5rem] p-2 z-[151] shadow-2xl animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => { toggleLike(track); setIsOpen(false); }} 
              className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-[1.8rem] transition-colors"
            >
              <Heart size={18} fill={isLiked ? themeColor : "none"} style={{ color: isLiked ? themeColor : "white" }}/>
              <span className="text-xs font-bold italic">{isLiked ? 'Remover Favorito' : 'Gostar'}</span>
            </button>
            
            {!showPlaylists ? (
              <button 
                onClick={(e) => { e.stopPropagation(); setShowPlaylists(true); }}
                className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-[1.8rem] transition-colors"
              >
                <ListPlus size={18}/>
                <span className="text-xs font-bold italic">Adicionar à Playlist</span>
              </button>
            ) : (
              <div className="max-h-40 overflow-y-auto p-2 space-y-1 custom-scroll">
                {playlists.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => { addTrackToPlaylist?.(p.id, track); setIsOpen(false); }}
                    className="w-full text-left p-3 hover:bg-white/5 rounded-xl text-[10px] font-bold truncate"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}

            {playlistId && (
              <button 
                onClick={() => { removeTrackFromPlaylist?.(playlistId, track.id); setIsOpen(false); }}
                className="w-full flex items-center gap-3 p-4 hover:bg-red-500/10 text-red-500 rounded-[1.8rem] transition-colors"
              >
                <Trash2 size={18}/>
                <span className="text-xs font-bold italic">Remover desta Playlist</span>
              </button>
            )}

            <button className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-[1.8rem] transition-colors">
              <Share size={18}/>
              <span className="text-xs font-bold italic">Partilhar</span>
            </button>

            {isAdmin && (
              <div className="m-2 p-4 bg-red-500/10 rounded-[1.8rem] border border-red-500/20">
                <div className="flex items-center gap-2 text-red-500 mb-3 text-[9px] font-black uppercase tracking-widest">
                  <ShieldAlert size={12}/> Admin Inspector
                </div>
                <p className="text-[8px] font-mono text-zinc-500 truncate">ID: {track.id}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}