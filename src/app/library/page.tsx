"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, FlaskConical } from "lucide-react";

export default function Library() {
  const { isAdmin, setCurrentTrack, setIsPlaying } = useXalanify();

  const playLocal = () => {
    setCurrentTrack({
      id: "test-audio",
      title: "Teste Áudio Local",
      artist: "Xalanify Engine",
      thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300",
      isLocal: true // Procura em /public/test.mp3
    });
    setIsPlaying(true);
  };

  return (
    <div className="p-6 space-y-8 pb-40 text-left">
      <h1 className="text-4xl font-black italic">Biblioteca</h1>

      {isAdmin && (
        <section className="space-y-4">
          <h2 className="text-[10px] font-black uppercase text-yellow-500 tracking-widest flex items-center gap-2">
            <FlaskConical size={14}/> Modo Engenheiro
          </h2>
          <div 
            onClick={playLocal}
            className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-[2.5rem] flex items-center justify-between cursor-pointer active:scale-95 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center text-black shadow-lg">
                <Play fill="currentColor" size={20}/>
              </div>
              <div>
                <p className="font-bold">Tocar /public/test.mp3</p>
                <p className="text-[10px] opacity-60 font-black uppercase">Validar Som do Browser</p>
              </div>
            </div>
          </div>
        </section>
      )}
      
      <p className="text-zinc-500 text-sm italic">As tuas músicas favoritas aparecerão aqui.</p>
    </div>
  );
}