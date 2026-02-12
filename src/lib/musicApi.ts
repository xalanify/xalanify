import { Track } from "@/context/XalanifyContext";

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
  try {
    const searchUrl = `https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(trackName + " " + artist)}&filter=music_songs`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    
    const videoId = searchData.items?.[0]?.url?.split("v=")[1];
    if (!videoId) return null;

    const streamRes = await fetch(`https://pipedapi.kavin.rocks/streams/${videoId}`);
    const streamData = await streamRes.json();
    
    const audioStream = streamData.audioStreams.sort((a: any, b: any) => b.bitrate - a.bitrate)[0];
    return audioStream?.url || null;
  } catch (error) {
    return null;
  }
}