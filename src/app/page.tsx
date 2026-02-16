"use client";
import { useEffect, useState } from "react";
import { useXalanify, Track } from "@/context/XalanifyContext";
import { searchMusic } from "@/lib/musicApi";
import { Sparkles, ListMusic } from "lucide-react";

export default function HomePage() {
  const { likedTracks, recentSearches, themeColor, setCurrentTrack, setActiveQueue } = useXalanify();
  const [recommendations, setRecommendations] = useState<Track[]>([]);

  useEffect(() => {
    const fetchRecs = async () => {
      // Prioridade: Artistas curtidos > Pesquisas recentes > Padrão
      const seed = likedTracks[0]?.artist || recentSearches[0] || "Pop Mix";
      const recs = await searchMusic(seed);
      setRecommendations(recs.slice(0, 6));
    };
    fetchRecs();
  }, [likedTracks, recentSearches]);

  return (
    <div className="p-8 pb-40 animate-app-entry font-jakarta overflow-y-auto">
      <header className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Para ti</p>
        <h1 className="text-5xl font-black tracking-tighter italic">Recomendado</h1>
      </header>

      <section className="grid grid-cols-2 gap-4 mb-12">
        {recommendations.map((track) => (
          <div 
            key={track.id}
            onClick={() => { setActiveQueue([track]); setCurrentTrack(track); }}
            className="glass p-4 rounded-[2.5rem] border border-white/5 relative group active:scale-95 transition-all"
          >
            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <Sparkles size={16} style={{ color: themeColor }} />
            </div>
            <img src={track.thumbnail} className="w-full aspect-square rounded-2xl object-cover mb-4 shadow-2xl" alt="" />
            <p className="font-bold text-sm truncate">{track.title}</p>
            <p className="text-[10px] font-black opacity-30 uppercase truncate">{track.artist}</p>
          </div>
        ))}
      </section>

      {/* Secção de Playlists Públicas baseadas no gosto */}
      <h2 className="text-2xl font-black mb-6 tracking-tight flex items-center gap-2">
        <ListMusic size={24} style={{ color: themeColor }} />
        Mixes para Explorar
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {recommendations.slice(0, 3).map((item) => (
              <div key={`mix-${item.id}`} className="shrink-0 w-64 glass p-4 rounded-[2rem] border border-white/5">
                  <img src={item.thumbnail} className="w-full h-32 rounded-xl object-cover mb-3" alt="" />
                  <p className="font-bold text-xs truncate">Mix: {item.artist}</p>
              </div>
          ))}
      </div>
    </div>
  );
}