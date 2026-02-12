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

export async function getYoutubeId(title: string, artist: string): Promise<string | null> {
  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(title + " " + artist)}&type=video&maxResults=1&key=${API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.items?.[0]?.id?.videoId || null;
  } catch { return null; }
}

export async function getDirectAudio(title: string, artist: string): Promise<string | null> {
  try {
    const res = await fetch(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(title + " " + artist)}&filter=music_songs`);
    const data = await res.json();
    const vId = data.items?.[0]?.url?.split("v=")[1];
    const stream = await fetch(`https://pipedapi.kavin.rocks/streams/${vId}`);
    const sData = await stream.json();
    return sData.audioStreams[0]?.url || null;
  } catch { return null; }
}