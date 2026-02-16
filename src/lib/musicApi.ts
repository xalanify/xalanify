// src/lib/musicApi.ts

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

async function getSpotifyToken() {
  try {
    const auth = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const data = await res.json();
    return data.access_token;
  } catch (error) {
    console.error("Erro ao obter token Spotify:", error);
    return null;
  }
}

export async function searchMusic(query: string) {
  try {
    const token = await getSpotifyToken();
    if (!token) return [];

    // Pesquisa por faixas e playlists para capturar ambos os tipos
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,playlist&limit=20`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    const data = await res.json();
    const tracks = data.tracks?.items.map((item: any) => ({
      id: item.id,
      title: item.name,
      artist: item.artists[0].name,
      thumbnail: item.album.images[0]?.url || "",
      youtubeId: null,
    })) || [];

    const playlists = data.playlists?.items.map((item: any) => ({
      id: item.id,
      title: `Playlist: ${item.name}`,
      artist: item.owner.display_name,
      thumbnail: item.images[0]?.url || "",
      youtubeId: null, // O YouTube Search tratará de encontrar o vídeo/mix equivalente
    })) || [];

    return [...tracks, ...playlists];
  } catch (error) {
    console.error("Erro na busca híbrida:", error);
    return [];
  }
}

export async function getYoutubeId(title: string, artist: string) {
  const query = `${title} ${artist} audio`;
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}&type=video&maxResults=1`
    );
    const data = await res.json();
    return data.items?.[0]?.id?.videoId || null;
  } catch (error) {
    console.error("Erro ao buscar ID do YouTube:", error);
    return null;
  }
}