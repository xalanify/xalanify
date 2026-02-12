// src/lib/musicApi.ts

export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  youtubeId?: string;
}

export async function searchMusic(query: string): Promise<Track[]> {
  try {
    // Chamamos a nossa própria API interna que criámos acima
    const res = await fetch(`/api/spotify?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    
    return data.tracks.items.map((t: any) => ({
      id: t.id,
      title: t.name,
      artist: t.artists[0].name,
      thumbnail: t.album.images[0]?.url || "",
    }));
  } catch (error) {
    console.error("Erro na busca:", error);
    return [];
  }
}

export async function getYoutubeId(trackName: string, artist: string): Promise<string | null> {
  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const searchTerm = `${trackName} ${artist} official audio`;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=video&maxResults=1&key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.items?.[0]?.id?.videoId || null;
  } catch (error) {
    return null;
  }
}