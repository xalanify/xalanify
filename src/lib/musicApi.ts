// src/lib/musicApi.ts

export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  youtubeId?: string;
}

async function getSpotifyToken() {
  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID + ":" + process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET),
      },
      body: "grant_type=client_credentials",
    });
    const data = await res.json();
    return data.access_token;
  } catch (error) {
    console.error("Erro Token Spotify:", error);
    return null;
  }
}

// RESTAURADO: Exportação da função de pesquisa
export async function searchMusic(query: string): Promise<Track[]> {
  const token = await getSpotifyToken();
  if (!token) return [];

  try {
    const spotRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=15`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const spotData = await spotRes.json();

    return spotData.tracks.items.map((t: any) => ({
      id: t.id,
      title: t.name,
      artist: t.artists[0].name,
      thumbnail: t.album.images[0].url,
    }));
  } catch (error) {
    console.error("Erro Search Spotify:", error);
    return [];
  }
}

// RESTAURADO: Exportação da busca no YouTube
export async function getYoutubeId(trackName: string, artist: string): Promise<string | null> {
  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  if (!API_KEY) return null;

  const query = encodeURIComponent(`${trackName} ${artist} official audio`);
  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${API_KEY}`);
    const data = await res.json();
    return data.items?.[0]?.id?.videoId || null;
  } catch (error) {
    console.error("Erro YouTube API:", error);
    return null;
  }
}