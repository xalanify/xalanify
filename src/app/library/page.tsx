"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Heart, Music, ListMusic, Play, Plus } from "lucide-react"; // CORREÇÃO: Importado o Plus

export default function Library() {
  // CORREÇÃO: Extrair createPlaylist do useXalanify
  const { likedTracks, playlists, setCurrentTrack, setIsPlaying, themeColor, createPlaylist } = useXalanify();

  return (
    <div className="p-6 space-y-8 pb-40">
      <h1 className="text-4xl font-black italic">Biblioteca</h1>

      {/* Secção de Gostos ... (mesmo código anterior) */}

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-zinc-500 uppercase text-[10px] font-black tracking-widest px-1">
          <ListMusic size={12}/> As Tuas Playlists
        </div>
        <div className="grid grid-cols-2 gap-4">
          {playlists.map(p => (
            <div key={p.id} className="aspect-square bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-6 flex flex-col justify-end">
              <p className="font-black text-lg truncate">{p.name}</p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase">{p.tracks.length} Músicas</p>
            </div>
          ))}
          
          <button 
            onClick={() => { const n = prompt("Nome da Playlist:"); if(n) createPlaylist(n); }} 
            className="aspect-square border border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-white transition-all"
          >
            <Plus size={30}/>
            <span className="text-[10px] font-black uppercase">Criar Playlist</span>
          </button>
        </div>
      </section>
    </div>
  );
}