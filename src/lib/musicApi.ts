export async function getYoutubeId(trackName: string, artist: string): Promise<string | null> {
  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  // A técnica "topic" ou "lyrics" é a que as apps open-source usam para evitar vlogs ou vídeos bloqueados
  const searchTerm = `${trackName} ${artist} audio topic`; 
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=video&maxResults=1&key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const videoId = data.items?.[0]?.id?.videoId;
    return videoId || null;
  } catch (error) {
    console.error("Erro YouTube API:", error);
    return null;
  }
}

export async function searchMusic(query: string) {
  const res = await fetch(`/api/spotify?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  return data.tracks.items.map((t: any) => ({
    id: t.id,
    title: t.name,
    artist: t.artists[0].name,
    thumbnail: t.album.images[0]?.url || "",
  }));
}