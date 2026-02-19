"use client";
import { MoreVertical, Plus, Trash2, X } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { useState } from "react";

export default function TrackOptionsMenu({ track, playlistId }: { track: any; playlistId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { playlists, addTrackToPlaylist, removeTrackFromPlaylist } = useXalanify();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-white/10 rounded-lg transition"
      >
        <MoreVertical size={16} className="text-white/60" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 z-50 mt-2 bg-[#2a1a2a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden w-48 animate-in fade-in zoom-in-95">
            <div className="p-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <img src={track.thumbnail} className="w-8 h-8 rounded object-cover" alt="" />
                <p className="text-xs font-bold truncate">{track.title}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1">
                <X size={12} />
              </button>
            </div>

            <div className="p-2 space-y-1">
              <div className="bg-white/[0.02] rounded-lg p-2 border border-white/5">
                <p className="text-[10px] font-bold text-white/40 mb-2 px-2 uppercase">Adicionar a Playlist</p>
                <div className="max-h-32 overflow-y-auto custom-scroll space-y-1">
                  {playlists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => {
                        addTrackToPlaylist(playlist.id, track);
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 hover:bg-white/10 rounded text-[10px] font-bold flex items-center gap-2 transition"
                    >
                      <Plus size={12} />
                      {playlist.name}
                    </button>
                  ))}
                </div>
              </div>

              {playlistId && playlistId !== "favorites" && (
                <button
                  onClick={() => {
                    removeTrackFromPlaylist(playlistId, track.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-red-400 hover:bg-red-500/10 rounded text-[10px] font-bold transition"
                >
                  <span>Remover</span>
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}