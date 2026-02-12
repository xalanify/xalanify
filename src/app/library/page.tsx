"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, FlaskConical } from "lucide-react";

export default function Library() {
  const { likedTracks, isAdmin, setCurrentTrack, setIsPlaying, themeColor } = useXalanify();

  const playTestAudio = () => {
    setCurrentTrack({
      id: "admin-test",
      title: "Audio Test (Local)",
      artist: "Admin Lab",
      thumbnail: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300",
      isLocalTest: true
    });
    setIsPlaying(true);
  };

  return (
    <div className="p-6 space-y-8 pb-40">
      <h1 className="text-4xl font-black italic">A Tua Biblioteca</h1>

      {isAdmin && (
        <section className="space-y-4">
          <h2 className="text-[10px] font-black uppercase text-yellow-500 tracking-widest flex items-center gap-2">
            <FlaskConical size={14}/> Admin Labs
          </h2>
          <div 
            onClick={playTestAudio}
            className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-[2.2rem] flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-yellow-500 rounded-2xl flex items-center justify-center text-black">
                <Play fill="currentColor"/>
              </div>
              <div>
                <p className="font-bold">Testar Som Direto</p>
                <p className="text-[10px] opacity-60 uppercase font-black">Validar se o browser emite áudio</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Músicas Favoritas</h2>
        {likedTracks.length === 0 ? (
          <div className="p-10 border border-white/5 rounded-[2.5rem] text-center">
            <p className="text-zinc-500 text-sm">Ainda não tens favoritos.</p>
          </div>
        ) : (
          likedTracks.map(track => (
            <div key={track.id} className="flex items-center gap-4 p-2 bg-zinc-900/40 rounded-2xl">
              <img src={track.thumbnail} className="w-12 h-12 rounded-xl" />
              <p className="font-bold flex-1">{track.title}</p>
            </div>
          ))
        )}
      </section>
    </div>
  );
}