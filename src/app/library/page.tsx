"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Heart, ListMusic, Play, Music, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { getYoutubeId, getDirectAudio } from "@/lib/musicApi";

export default function Library() {
  const { likedTracks, playlists, setCurrentTrack, setIsPlaying, themeColor, audioEngine } = useXalanify();
  const [activePlaylist, setActivePlaylist] = useState<any | null>(null);

  // Função auxiliar para tocar (mesma lógica da pesquisa)
  const handlePlay = async (track: any) => {
    setIsPlaying(false);
    const t = { ...track };
    try {
      if (!t.audioUrl && !t.youtubeId) {
        if (audioEngine === 'direct') t.audioUrl = await getDirectAudio(t.title, t.artist);
        else t.youtubeId = await getYoutubeId(t.title, t.artist);
      }
      setCurrentTrack(t);
      setTimeout(() => setIsPlaying(true), 300);
    } catch (e) { console.error(e); }
  };

  // VISTA DA PLAYLIST ABERTA
  if (activePlaylist) {
    return (
      <div className="p-6 space-y-6">
        <button onClick={() => setActivePlaylist(null)} className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500"><ArrowLeft size={14}/> Voltar</button>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-zinc-900 rounded-3xl flex items-center justify-center border border-white/5"><Music size={32} className="text-zinc-600"/></div>
          <div>
            <h2 className="text-2xl font-black italic">{activePlaylist.name}</h2>
            <p className="text-xs text-zinc-500">{activePlaylist.tracks.length} faixas</p>
          </div>
        </div>
        <div className="space-y-2">
          {activePlaylist.tracks.map((t: any, i: number) => (
            <div key={i} onClick={() => handlePlay(t)} className="flex items-center gap-3 p-3 bg-zinc-900/40 rounded-2xl border border-white/5 active:scale-95 transition-transform">
              <img src={t.thumbnail} className="w-10 h-10 rounded-lg object-cover"/>
              <div className="truncate flex-1"><p className="text-sm font-bold truncate">{t.title}</p></div>
              <Play size={14} fill={themeColor} style={{color: themeColor}}/>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // VISTA PRINCIPAL
  return (
    <div className="p-6 space-y-8 pb-40">
      <h1 className="text-4xl font-black italic">Minha Biblioteca</h1>

      {/* SECÇÃO GOSTOS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">
          <Heart size={12} fill={themeColor} style={{color: themeColor}}/> Músicas Curtidas
        </div>
        <div className="space-y-2">
          {likedTracks.length === 0 ? (
            <p className="text-xs text-zinc-600 px-4">Nada aqui ainda. Dá Like numa música!</p>
          ) : (
            likedTracks.map((track) => (
              <div key={track.id} onClick={() => handlePlay(track)} className="flex items-center justify-between p-3 bg-zinc-900/40 border border-white/5 rounded-3xl hover:bg-zinc-900/60 transition-all cursor-pointer">
                <div className="flex items-center gap-4 truncate">
                  <img src={track.thumbnail} className="w-12 h-12 rounded-xl object-cover" alt="" />
                  <div className="truncate">
                    <p className="text-sm font-bold">{track.title}</p>
                    <p className="text-[10px] text-zinc-500 uppercase">{track.artist}</p>
                  </div>
                </div>
                <Play size={16} fill={themeColor} style={{ color: themeColor }}/>
              </div>
            ))
          )}
        </div>
      </section>

      {/* SECÇÃO PLAYLISTS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">
          <ListMusic size={12}/> Minhas Playlists
        </div>
        <div className="grid grid-cols-2 gap-4">
          {playlists.map(p => (
            <div key={p.id} onClick={() => setActivePlaylist(p)} className="aspect-square bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-5 flex flex-col justify-end gap-1 cursor-pointer hover:bg-zinc-900/60 transition-colors">
              <p className="font-black text-lg truncate">{p.name}</p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase">{p.tracks.length} tracks</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}