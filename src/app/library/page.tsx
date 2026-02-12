"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play } from "lucide-react";

export default function Library() {
  const { likedTracks, setCurrentTrack, setIsPlaying } = useXalanify();

  // Garantimos que tratamos o caso de likedTracks ainda não existir ou estar vazio
  const hasLikes = likedTracks && likedTracks.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold">A tua Biblioteca</h1>
      
      <div className="grid grid-cols-1 gap-3">
        {!hasLikes ? (
          <div className="p-8 text-center bg-surface rounded-3xl border border-white/5">
            <p className="text-gray-500 text-sm">Ainda não tens músicas favoritas.</p>
          </div>
        ) : (
          likedTracks.map((track) => (
            <div 
              key={track.id}
              onClick={() => { setCurrentTrack(track); setIsPlaying(true); }}
              className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-primary/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <img src={track.thumbnail} className="w-12 h-12 rounded-lg object-cover" alt="" />
                <div>
                  <p className="text-sm font-medium">{track.title}</p>
                  <p className="text-xs text-gray-500">{track.artist}</p>
                </div>
              </div>
              <div className="bg-primary/20 p-2 rounded-full">
                <Play size={14} className="text-primary" fill="currentColor" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}