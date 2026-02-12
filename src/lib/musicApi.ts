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
    // ALTERADO PARA HTTPS
    const res = await fetch("https://googleusercontent.com/spotify.com/0", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID + ":" + process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET),
      },
      body: "grant_type=client_credentials",
      cache: 'no-store'
    });
    const data = await res.json();
    return data.access_token;
  } catch (error) {
    console.error("Erro ao obter token Spotify:", error);
    return null;
  }
}

export async function searchMusic(query: string): Promise<Track[]> {
  const token = await getSpotifyToken();
  if (!token) return [];
  
  try {
    // ALTERADO PARA HTTPS E CORRIGIDA A SINTAXE DA URL
    const spotRes = await fetch(`https://googleusercontent.com/spotify.com/spotify?q=${encodeURIComponent(query)}&type=track&limit=15`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });
    const spotData = await spotRes.json();
    
    return spotData.tracks.items.map((t: any) => ({
      id: t.id,
      title: t.name,
      artist: t.artists[0].name,
      thumbnail: t.album.images[0]?.url || "",
    }));
  } catch (error) {
    console.error("Erro ao pesquisar música:", error);
    return [];
  }
}

export async function getYoutubeId(trackName: string, artist: string): Promise<string | null> {
  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  if (!API_KEY) return null;

  const searchTerm = `${trackName} ${artist} official audio`;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=video&maxResults=1&key=${API_KEY}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    
    if (data.items && data.items.length > 0) {
      return data.items[0].id.videoId;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar no YouTube:", error);
    return null;
  }
}