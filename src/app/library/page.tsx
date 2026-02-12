"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play } from "lucide-react";

export default function Library() {
  const { likedTracks, setCurrentTrack, setIsPlaying } = useXalanify();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">A tua Biblioteca</h1>
      
      <div className="grid grid-cols-1 gap-3">
        {likedTracks.length === 0 ? (
          <p className="text-gray-500 text-sm">Ainda não tens músicas favoritas.</p>
        ) : (
          likedTracks.map((track) => (
            <div 
              key={track.id}
              onClick={() => { setCurrentTrack(track); setIsPlaying(true); }}
              className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5"
            >
              <div className="flex items-center gap-3">
                <img src={track.thumbnail} className="w-10 h-10 rounded-md" alt="" />
                <div>
                  <p className="text-sm font-medium">{track.title}</p>
                  <p className="text-xs text-gray-500">{track.artist}</p>
                </div>
              </div>
              <Play size={16} className="text-primary" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}