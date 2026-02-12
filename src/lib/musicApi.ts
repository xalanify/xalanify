export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  youtubeId?: string;
}

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
  try {
    const token = await getSpotifyToken();
    const spotRes = await fetch(`https://api.spotify.com/v1/search?q=$${encodeURIComponent(query)}&type=track&limit=15`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const spotData = await spotRes.json();
    return spotData.tracks.items.map((t: any) => ({
      id: t.id,
      title: t.name,
      artist: t.artists[0].name,
      thumbnail: t.album.images[0].url,
    }));
  } catch (e) { return []; }
}

export async function getYoutubeId(trackName: string, artistName: string): Promise<string> {
  try {
    const q = encodeURIComponent(`${trackName} ${artistName} official audio`);
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&maxResults=1&type=video&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`);
    const data = await res.json();
    return data.items[0]?.id?.videoId || "";
  } catch (e) { return ""; }
}