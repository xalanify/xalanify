"use client";
import { MoreVertical, Heart, ListPlus, Share, Trash2 } from "lucide-react";
import { useXalanify, Track } from "@/context/XalanifyContext";
import { useState } from "react";

// Interface corrigida: track agora é opcional (?) para permitir o uso em Cards de Playlist
interface TrackOptionsProps {
  track?: Track; 
  playlistId?: string;
  isFavoriteView?: boolean;
  isPlaylistCard?: boolean;
}

export default function TrackOptions({ track, playlistId, isPlaylistCard }: TrackOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const { toggleLike, likedTracks, themeColor, playlists, addTrackToPlaylist, removeTrackFromPlaylist, deletePlaylist } = useXalanify();
  
  // Caso seja apenas o botão de apagar a playlist (isPlaylistCard)
  if (isPlaylistCard && playlistId) {
    return (
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          if(confirm("Desejas eliminar esta playlist?")) deletePlaylist(playlistId); 
        }} 
        className="p-3 opacity-20 hover:opacity-100 text-red-500 transition-all active:scale-90"
      >
        <Trash2 size={20} />
      </button>
    );
  }

  // Se não houver música e não for card de playlist, não renderiza nada
  if (!track) return null;

  const isLiked = likedTracks.some(t => t.id === track.id);

  return (
    <div className="relative">
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          setIsOpen(!isOpen); 
        }} 
        className="p-3 opacity-40 hover:opacity-100 transition-all"
      >
        <MoreVertical size={20}/>
      </button>

      {isOpen && (
        <>
          {/* Backdrop para fechar ao clicar fora */}
          <div className="fixed inset-0 z-[150]" onClick={() => { setIsOpen(false); setShowPlaylists(false); }} />
          
          <div 
            className="absolute right-0 bottom-12 w-64 rounded-[2.5rem] p-1 z-[151] shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95"
            style={{ 
              background: `linear-gradient(135deg, ${themeColor}66 0%, #111 100%)`, 
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)'
            }}
          >
            <div className="bg-black/60 rounded-[2.4rem] overflow-hidden border border-white/5">
              
              {/* Botão Gostar (Estilo iOS) */}
              <button 
                onClick={() => { toggleLike(track); setIsOpen(false); }} 
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 border-b border-white/5 transition-colors"
              >
                <span className="text-xs font-bold italic tracking-tight">Gostar</span>
                <Heart size={18} fill={isLiked ? themeColor : "none"} color={isLiked ? themeColor : "white"} />
              </button>

              {/* Adicionar à Playlist */}
              {!showPlaylists ? (
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowPlaylists(true); }} 
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 border-b border-white/5 transition-colors"
                >
                  <span className="text-xs font-bold italic">Adicionar à Playlist</span>
                  <ListPlus size={18}/>
                </button>
              ) : (
                <div className="max-h-32 overflow-y-auto p-2 bg-black/40 custom-scroll">
                  {playlists.map(p => (
                    <button 
                      key={p.id} 
                      onClick={() => { addTrackToPlaylist(p.id, track); setIsOpen(false); }} 
                      className="w-full text-left p-2 hover:bg-white/10 rounded-xl text-[10px] font-bold truncate transition-colors"
                    >
                      + {p.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Remover da Playlist específica */}
              {playlistId && (
                <button 
                  onClick={() => { removeTrackFromPlaylist(playlistId, track.id); setIsOpen(false); }} 
                  className="w-full flex items-center justify-between p-4 hover:bg-red-500/20 text-red-500 border-b border-white/5 transition-colors"
                >
                  <span className="text-xs font-bold italic">Remover desta Lista</span>
                  <Trash2 size={18}/>
                </button>
              )}

              {/* Partilhar */}
              <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
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