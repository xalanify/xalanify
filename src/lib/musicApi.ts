import { Track } from "@/context/XalanifyContext";

// Lista de instâncias públicas para backup
const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.drgns.space",
  "https://api.piped.victr.me"
];

export async function searchMusic(query: string): Promise<Track[]> {
  try {
    const res = await fetch(`/api/spotify?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.tracks.items.map((t: any) => ({
      id: t.id,
      title: t.name,
      artist: t.artists[0].name,
      thumbnail: t.album.images[0]?.url || "",
    }));
  } catch (error) {
    return [];
  }
}

export async function getDirectAudio(trackName: string, artist: string): Promise<string | null> {
  const searchTerm = `${trackName} ${artist}`;
  
  for (const instance of PIPED_INSTANCES) {
    try {
      // 1. Pesquisa o vídeo
      const searchRes = await fetch(`${instance}/search?q=${encodeURIComponent(searchTerm)}&filter=music_songs`);
      const searchData = await searchRes.json();
      
      const videoId = searchData.items?.[0]?.url?.split("v=")[1];
      if (!videoId) continue;

      // 2. Obtém os streams
      const streamRes = await fetch(`${instance}/streams/${videoId}`);
      const streamData = await streamRes.json();
      
      // Filtra o áudio com melhor qualidade (m4a costuma ser o mais compatível)
      const audioStream = streamData.audioStreams
        .filter((s: any) => s.format === "M4A" || s.extension === "m4a")
        .sort((a: any, b: any) => b.bitrate - a.bitrate)[0] || streamData.audioStreams[0];

      if (audioStream?.url) return audioStream.url;
    } catch (e) {
      console.warn(`Instância ${instance} falhou, a tentar próxima...`);
      continue;
    }
  }
  return null;
}