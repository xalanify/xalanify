"use client";
import { MoreVertical, Heart, ListPlus, Share, Trash2, ShieldCheck } from "lucide-react";
import { useXalanify, Track } from "@/context/XalanifyContext";
import { useState } from "react";

export default function TrackOptions({ track, playlistId }: { track: Track, playlistId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toggleLike, likedTracks, themeColor, playlists, addTrackToPlaylist, removeTrackFromPlaylist } = useXalanify();
  
  const isLiked = likedTracks.some(t => t.id === track.id);

  return (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="p-3 opacity-40 hover:opacity-100 transition-all">
        <MoreVertical size={20}/>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[150]" onClick={() => setIsOpen(false)} />
          <div 
            className="absolute right-0 bottom-12 w-64 rounded-[2.5rem] p-1 z-[151] shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95"
            style={{ background: `linear-gradient(135deg, ${themeColor}44 0%, #111 100%)`, backdropFilter: 'blur(30px)' }}
          >
            <div className="bg-black/40 rounded-[2.4rem] overflow-hidden border border-white/5">
              <button onClick={() => { toggleLike(track); setIsOpen(false); }} className="w-full flex items-center justify-between p-4 hover:bg-white/5 border-b border-white/5">
                <span className="text-xs font-bold italic">Gostar</span>
                <Heart size={18} fill={isLiked ? themeColor : "none"} color={isLiked ? themeColor : "white"} />
              </button>

              <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 border-b border-white/5">
                <span className="text-xs font-bold italic">Playlist</span>
                <ListPlus size={18}/>
              </button>

              {playlistId && (
                <button onClick={() => { removeTrackFromPlaylist(playlistId, track.id); setIsOpen(false); }} className="w-full flex items-center justify-between p-4 hover:bg-red-500/20 text-red-500">
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