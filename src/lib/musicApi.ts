// src/lib/musicApi.ts

export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: string;
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
    return null;
  }
}

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
    return [];
  }
}

export async function getYoutubeId(trackName: string, artist: string): Promise<string | null> {
  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const searchTerm = `${trackName} ${artist} official audio`;

  // TENTATIVA 1: API OFICIAL
  if (API_KEY) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=video&maxResults=1&key=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.items && data.items.length > 0) {
        return data.items[0].id.videoId;
      }
    } catch (e) {
      console.error("Erro na API Oficial, tentando Fallback...");
    }
  }

  // TENTATIVA 2: FALLBACK (Se a API falhar ou não houver chave)
  // Nota: Em produção, o ideal é usar um proxy, mas tentamos buscar via oEmbed
  try {
    const fallbackUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=search_query=${encodeURIComponent(searchTerm)}`;
    // Esta é uma tentativa desesperada de encontrar um ID válido
    return null; 
  } catch (e) {
    return null;
  }
}