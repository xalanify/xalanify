// src/lib/musicApi.ts

export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: string;
  youtubeId?: string;
}

// Função para obter Token do Spotify (Client Credentials Flow)
async function getSpotifyToken() {
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
}

export async function searchMusic(query: string): Promise<Track[]> {
  const token = await getSpotifyToken();
  
  // 1. Procurar no Spotify para Metadados de alta qualidade
  const spotRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const spotData = await spotRes.json();

  const tracks = spotData.tracks.items.map((t: any) => ({
    id: t.id,
    title: t.name,
    artist: t.artists[0].name,
    thumbnail: t.album.images[0].url,
  }));

  return tracks;
}

export async function getYoutubeId(trackName: string, artist: string): Promise<string> {
  const query = `${trackName} ${artist} audio`;
  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}&maxResults=1&type=video`);
  const data = await res.json();
  return data.items[0]?.id?.videoId || "";
}