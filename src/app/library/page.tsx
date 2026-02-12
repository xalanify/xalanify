"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Heart } from "lucide-react";

export default function Library() {
  const { likedTracks, setCurrentTrack, setIsPlaying } = useXalanify();

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex justify-between items-end">
        <h1 className="text-3xl font-bold tracking-tight">Biblioteca</h1>
        <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-1 rounded-full uppercase">
          {likedTracks?.length || 0} Faixas
        </span>
      </header>
      
      <div className="space-y-2">
        {!likedTracks || likedTracks.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Heart className="mx-auto text-white/10" size={48} />
            <p className="text-gray-500 text-sm">A tua coleção está vazia.</p>
          </div>
        ) : (
          likedTracks.map((track) => (
            <div 
              key={track.id}
              onClick={() => { setCurrentTrack(track); setIsPlaying(true); }}
              className="flex items-center gap-3 p-2 bg-white/[0.02] border border-white/5 rounded-xl active:bg-white/10 transition-all"
            >
              <img src={track.thumbnail} className="w-12 h-12 rounded-lg object-cover" alt="" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{track.title}</p>
                <p className="text-xs text-gray-500">{track.artist}</p>
              </div>
              <Play size={16} className="text-primary mr-2" fill="currentColor" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}