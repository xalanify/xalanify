"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { useEffect, useState } from "react";
import { searchMusic, getYoutubeId, getDirectAudio } from "@/lib/musicApi";
import { Play, Sparkles, Loader2 } from "lucide-react";

export default function Home() {
  const { searchHistory, themeColor, setCurrentTrack, setIsPlaying, audioEngine } = useXalanify();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Atualiza sempre que o histórico de pesquisa muda
  useEffect(() => {
    const fetchRecs = async () => {
      const lastTerm = searchHistory[0] || "Top Hits 2026";
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
      let trackToPlay = { ...track, isLocal: false };

      if (audioEngine === 'direct') {
        const audioUrl = await getDirectAudio(track.title, track.artist);
        if (audioUrl) {
          trackToPlay.audioUrl = audioUrl;
          trackToPlay.youtubeId = undefined;
        }
      } else {
        const ytId = await getYoutubeId(track.title, track.artist);
        if (ytId) {
          trackToPlay.youtubeId = ytId;
          trackToPlay.audioUrl = undefined;
        }
      }

      setCurrentTrack(trackToPlay);
      setTimeout(() => setIsPlaying(true), 400);
    } catch (error) {
      alert("Erro ao carregar recomendação. Tente novamente.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="p-6 space-y-10 pb-40 animate-in fade-in duration-700">
      {/* TEXTO BETA CENTRADO */}
      <div className="flex justify-center">
        <span className="bg-red-600/20 text-red-500 text-[10px] font-black px-4 py-1.5 rounded-full tracking-[0.3em] uppercase border border-red-500/30">
          Beta Version
        </span>
      </div>

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">Para Ti</h1>
          <p className="text-zinc-500 text-[10px] font-black mt-1 uppercase tracking-[0.2em]">Descobertas Diárias</p>
        </div>
        <Sparkles style={{ color: themeColor }} className="animate-pulse" />
      </header>

      <section className="grid grid-cols-2 gap-4">
        {recommendations.length > 0 ? (
          recommendations.map((track) => (
            <div 
              key={track.id}
              onClick={() => handlePlay(track)}
              className="group relative overflow-hidden rounded-[2.2rem] bg-zinc-900/40 border border-white/5 p-4 active:scale-95 transition-all"
            >
              <div className="relative aspect-square mb-3">
                <img src={track.thumbnail} className="w-full h-full object-cover rounded-[1.4rem] shadow-2xl" alt="" />
                {loadingId === track.id && (
                  <div className="absolute inset-0 bg-black/60 rounded-[1.4rem] flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" />
                  </div>
                )}
              </div>
              <p className="text-[13px] font-bold truncate leading-tight">{track.title}</p>
              <p className="text-[10px] text-zinc-500 truncate uppercase font-black mt-1 tracking-tighter italic">{track.artist}</p>
              
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                <div className="p-2.5 rounded-full shadow-xl" style={{ backgroundColor: themeColor }}>
                  <Play size={14} fill="black" />
                </div>
              </div>
            </div>
          ))
        ) : (
          // Skeleton Loader simples enquanto carrega
          [1,2,3,4].map(i => <div key={i} className="aspect-square bg-zinc-900/20 rounded-[2.2rem] animate-pulse" />)
        )}
      </section>
    </div>
  );
}