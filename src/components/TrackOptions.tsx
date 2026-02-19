"use client";
import { MoreHorizontal, Heart, ListPlus, Share2, Trash2, X } from "lucide-react";
import { useXalanify, Track } from "@/context/XalanifyContext";
import { useState } from "react";

export default function TrackOptions({ track, playlistId }: { track?: Track, playlistId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toggleLike, likedTracks, themeColor, playlists, addTrackToPlaylist, removeTrackFromPlaylist } = useXalanify();
  
  if (!track) return null;
  const isLiked = likedTracks.some(t => t.id === track.id);

  return (
    <div className="relative">
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(true); }} 
        className="w-10 h-10 glass rounded-full flex items-center justify-center active:scale-90 transition-all border border-white/10"
      >
        <MoreHorizontal size={20} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="w-full max-w-sm glass border border-white/10 rounded-[2.5rem] overflow-hidden relative z-50 animate-in slide-in-from-bottom-10 shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={track.thumbnail} className="w-12 h-12 rounded-xl object-cover" alt="" />
                <div className="min-w-0">
                  <h4 className="font-bold text-sm truncate italic">{track.title}</h4>
                  <p className="text-[9px] opacity-40 font-black uppercase tracking-widest">{track.artist}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 opacity-20 hover:opacity-100 transition-opacity"><X size={20}/></button>
            </div>

            <div className="p-2 space-y-1">
              <button 
                onClick={() => { toggleLike(track); setIsOpen(false); }}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors group"
              >
                <span className="text-xs font-bold italic">{isLiked ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}</span>
                <Heart size={18} fill={isLiked ? themeColor : 'none'} color={isLiked ? themeColor : 'white'} className="group-active:scale-125 transition-transform" />
              </button>

              <div className="bg-white/[0.02] rounded-[2rem] p-4 mt-2 border border-white/5">
                <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-20 mb-3 ml-1">Guardar na Playlist</p>
                <div className="max-h-40 overflow-y-auto custom-scroll space-y-1 pr-2">
                  {playlists.length > 0 ? playlists.map(p => (
                    <button 
                      key={p.id} 
                      onClick={() => { addTrackToPlaylist(p.id, track); setIsOpen(false); }}
                      className="w-full text-left p-3 hover:bg-white/10 rounded-xl text-[10px] font-bold flex items-center gap-3 transition-colors"
                    >
                      <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-xs">+</div>
                      {p.name}
                    </button>
                  )) : (
                    <p className="p-3 text-[10px] opacity-20 italic text-center">Nenhuma playlist encontrada</p>
                  )}
                </div>
              </div>

              {playlistId && (
                <button 
                  onClick={() => { removeTrackFromPlaylist(playlistId, track.id); setIsOpen(false); }}
                  className="w-full flex items-center justify-between p-4 text-red-500 hover:bg-red-500/10 rounded-2xl transition-colors mt-2"
                >
                  <span className="text-xs font-bold italic">Remover desta Playlist</span>
                  <Trash2 size={18} />
                </button>
              )}
              
              <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors">
                <span className="text-xs font-bold italic">Partilhar Música</span>
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}