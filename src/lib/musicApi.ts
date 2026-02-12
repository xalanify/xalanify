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
    // Nota: Verifique se o endpoint abaixo está correto no seu ambiente (ex: api.spotify.com)
    const spotRes = await fetch(`https://api.spotify.com/v1/search?q=$$${encodeURIComponent(query)}&type=track&limit=15`, {
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
  if (!API_KEY) {
    console.error("DEBUG: Falta NEXT_PUBLIC_YOUTUBE_API_KEY nas variáveis de ambiente.");
    return null;
  }

  const searchTerm = `${trackName} ${artist} official audio`;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=video&maxResults=1&key=${API_KEY}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    
    if (data.error) {
      console.error("DEBUG API YOUTUBE ERRO:", data.error.message);
      return null;
    }

    const videoId = data.items?.[0]?.id?.videoId;
    
    if (videoId) {
      console.log("DEBUG: ID extraído com sucesso ->", videoId);
      return videoId;
    }

    console.warn("DEBUG: Nenhum vídeo encontrado para:", searchTerm);
    return null;
  } catch (error) {
    console.error("ERRO FETCH YOUTUBE:", error);
    return null;
  }
}