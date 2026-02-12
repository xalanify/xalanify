"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { useEffect, useState } from "react";
import { searchMusic, getYoutubeId, getDirectAudio } from "@/lib/musicApi";
import { Play, Sparkles, Loader2 } from "lucide-react";

export default function Home() {
  const { searchHistory, themeColor, setCurrentTrack, setIsPlaying, audioEngine } = useXalanify();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecs = async () => {
      const lastTerm = (searchHistory && searchHistory.length > 0) ? searchHistory[0] : "Top Hits 2026";
      const tracks = await searchMusic(lastTerm);
      setRecommendations(tracks.slice(0, 6));
    };
    fetchRecs();
  }, [searchHistory]);

  const handlePlay = async (track: any) => {
    if (loadingId) return;
    setLoadingId(track.id);
    setIsPlaying(false);
    try {
      let trackToPlay = { ...track };
      if (audioEngine === 'direct') {
        trackToPlay.audioUrl = await getDirectAudio(track.title, track.artist);
      } else {
        trackToPlay.youtubeId = await getYoutubeId(track.title, track.artist);
      }
      setCurrentTrack(trackToPlay);
      setTimeout(() => setIsPlaying(true), 400);
    } catch (e) { console.error(e); }
    setLoadingId(null);
  };

  return (
    <div className="p-6 space-y-10 pb-40">
      <div className="flex justify-center">
        <span className="bg-red-600/20 text-red-500 text-[10px] font-black px-4 py-1.5 rounded-full uppercase border border-red-500/30">
          Beta Version
        </span>
      </div>
      <header className="flex items-center justify-between">
        <h1 className="text-4xl font-black tracking-tighter italic">Para Ti</h1>
        <Sparkles style={{ color: themeColor }} />
      </header>
      <section className="grid grid-cols-2 gap-4">
        {recommendations.map((track) => (
          <div key={track.id} onClick={() => handlePlay(track)} className="group relative bg-zinc-900/40 border border-white/5 p-4 rounded-[2.2rem]">
            <img src={track.thumbnail} className="w-full aspect-square object-cover rounded-[1.4rem]" alt="" />
            <p className="text-[13px] font-bold truncate mt-3">{track.title}</p>
            <p className="text-[10px] text-zinc-500 font-black uppercase italic">{track.artist}</p>
            {loadingId === track.id && <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />}
          </div>
        ))}
      </section>
    </div>
  );
}