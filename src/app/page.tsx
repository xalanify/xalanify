"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { useEffect, useState } from "react";
import { searchMusic } from "@/lib/musicApi";
import { Sparkles, Play } from "lucide-react";

export default function Home() {
  const { searchHistory, themeColor, setCurrentTrack, setIsPlaying } = useXalanify();
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecs = async () => {
      const term = searchHistory[0] || "Top Hits 2026";
      const tracks = await searchMusic(term);
      setRecommendations(tracks.slice(0, 6));
    };
    fetchRecs();
  }, [searchHistory]);

  return (
    <div className="p-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex justify-center">
        <span className="bg-red-600/20 text-red-500 text-[10px] font-black px-4 py-1.5 rounded-full tracking-[0.3em] uppercase border border-red-500/30">
          Beta Version
        </span>
      </div>

      <header>
        <h1 className="text-4xl font-black tracking-tighter italic">Para Ti</h1>
        <p className="text-zinc-500 text-xs font-medium mt-1 uppercase tracking-widest">Baseado no teu gosto</p>
      </header>

      <section className="grid grid-cols-2 gap-4">
        {recommendations.map((track) => (
          <div 
            key={track.id}
            onClick={() => { setCurrentTrack(track); setIsPlaying(true); }}
            className="group relative overflow-hidden rounded-[2rem] bg-zinc-900/50 border border-white/5 p-4 active:scale-95 transition-all"
          >
            <img src={track.thumbnail} className="w-full aspect-square object-cover rounded-[1.2rem] mb-3 shadow-xl" />
            <p className="text-xs font-bold truncate">{track.title}</p>
            <p className="text-[10px] text-zinc-500 truncate">{track.artist}</p>
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="p-2 rounded-full shadow-lg" style={{ backgroundColor: themeColor }}>
                <Play size={12} fill="black" />
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}