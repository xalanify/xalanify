"use client";
import { MoreVertical, Heart, ListPlus, Plus } from "lucide-react";
import { useXalanify, Track } from "@/context/XalanifyContext";
import { useState } from "react";

export default function TrackOptions({ track }: { track: Track }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'main' | 'playlists'>('main');
  
  const { toggleLike, likedTracks, themeColor, playlists, createPlaylist, addTrackToPlaylist, user } = useXalanify();
  const isLiked = likedTracks.some(t => t.id === track.id);

  return (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="p-2 text-zinc-400 hover:text-white transition-colors">
        <MoreVertical size={20}/>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => { setIsOpen(false); setView('main'); }} />
          <div className="absolute right-0 top-10 w-48 bg-zinc-900 border border-white/10 rounded-2xl backdrop-blur-xl z-[101] overflow-hidden p-1 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            {view === 'main' ? (
              <>
                <button 
                  onClick={() => { if(!user) return alert("Faz login!"); toggleLike(track); setIsOpen(false); }} 
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl text-left transition-colors"
                >
                  <Heart size={16} fill={isLiked ? themeColor : "none"} style={{ color: isLiked ? themeColor : "white" }}/>
                  <span className="text-xs font-bold">{isLiked ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}</span>
                </button>
                <button onClick={() => setView('playlists')} className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl text-left transition-colors">
                  <ListPlus size={16} />
                  <span className="text-xs font-bold">Adicionar à Playlist</span>
                </button>
              </>
            ) : (
              <div className="space-y-1">
                <p className="text-[9px] uppercase font-black text-zinc-500 px-3 py-2 tracking-widest">Minhas Playlists</p>
                <div className="max-h-40 overflow-y-auto no-scrollbar">
                  {playlists.length === 0 && <p className="p-3 text-[10px] text-zinc-600 font-bold">Nenhuma playlist</p>}
                  {playlists.map(p => (
                    <button 
                      key={p.id} 
                      onClick={() => { addTrackToPlaylist(p.id, track); setIsOpen(false); setView('main'); }} 
                      className="w-full p-3 text-xs font-bold text-left hover:bg-white/10 truncate transition-colors"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => { const n = prompt("Nome da nova playlist:"); if(n) createPlaylist(n, [track]); setIsOpen(false); }} 
                  className="w-full p-3 border-t border-white/5 text-[10px] font-black uppercase flex items-center gap-2 justify-center hover:bg-white/5 transition-colors"
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