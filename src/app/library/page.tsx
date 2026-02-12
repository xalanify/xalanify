"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, FlaskConical } from "lucide-react";

export default function Library() {
  const { isAdmin, setCurrentTrack, setIsPlaying } = useXalanify();

  const playLocalFile = () => {
    setCurrentTrack({
      id: "local-test",
      title: "Teste Ficheiro Local",
      artist: "Sistema Xalanify",
      thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300",
      isLocal: true // Ativa a busca em /public/test.mp3
    });
    setIsPlaying(true);
  };

  return (
    <div className="p-6 space-y-8 pb-40">
      <h1 className="text-4xl font-black italic">A Tua Biblioteca</h1>

      {isAdmin && (
        <section className="space-y-4">
          <h2 className="text-[10px] font-black uppercase text-yellow-500 tracking-widest flex items-center gap-2">
            <FlaskConical size={14}/> Laboratório
          </h2>
          <div 
            onClick={playLocalFile}
            className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-[2.5rem] flex items-center justify-between cursor-pointer active:scale-95 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center text-black shadow-lg">
                <Play fill="currentColor" size={20}/>
              </div>
              <div>
                <p className="font-bold">Tocar /public/test.mp3</p>
                <p className="text-[10px] opacity-60 uppercase font-black">Teste de áudio direto</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}