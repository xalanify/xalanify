"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Heart, ListMusic, Play, Music, Loader2 } from "lucide-react";
import { useState } from "react";
import { getYoutubeId, getDirectAudio } from "@/lib/musicApi";

export default function Library() {
  const { likedTracks, playlists, setCurrentTrack, setIsPlaying, themeColor, audioEngine } = useXalanify();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handlePlay = async (track: any) => {
    setLoadingId(track.id);
    setIsPlaying(false);
    try {
      let t = { ...track };
      if (audioEngine === 'direct') t.audioUrl = await getDirectAudio(track.title, track.artist);
      else t.youtubeId = await getYoutubeId(track.title, track.artist);
      setCurrentTrack(t);
      setTimeout(() => setIsPlaying(true), 400);
    } catch (e) { alert("Erro ao carregar"); }
    setLoadingId(null);
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-4xl font-black italic">Biblioteca</h1>
      
      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Os teus Gostos</p>
        <div className="space-y-2">
          {likedTracks.map(track => (
            <div key={track.id} onClick={() => handlePlay(track)} className="flex items-center justify-between p-4 bg-zinc-900/40 border border-white/5 rounded-[2rem] active:scale-95 transition-all">
              <div className="flex items-center gap-4 truncate">
                <div className="relative">
                  <img src={track.thumbnail} className="w-12 h-12 rounded-xl object-cover" />
                  {loadingId === track.id && <Loader2 size={16} className="absolute inset-0 m-auto animate-spin" />}
                </div>
                <div className="truncate"><p className="text-sm font-bold truncate">{track.title}</p></div>
              </div>
              <Play size={16} fill={themeColor} style={{ color: themeColor }} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}