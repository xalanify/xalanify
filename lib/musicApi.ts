const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET

export interface PlaylistTrackPreview {
  id: string
  title: string
  artist: string
  thumbnail: string
  duration: number
  youtubeId: string | null
}

export interface PlaylistSuggestion {
  id: string
  source: "spotify" | "youtube"
  title: string
  description: string
  thumbnail: string
  trackCount: number
  previewTracks: PlaylistTrackPreview[]
}

async function getSpotifyToken() {
  try {
    const auth = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    })
    const data = await res.json()
    return data.access_token
  } catch {
    return null
  }
}

export async function searchMusic(query: string) {
  try {
    const token = await getSpotifyToken()
    if (!token) return []

    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=25`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    const data = await res.json()
    return data.tracks?.items.map((item: any) => ({
      id: item.id,
      title: item.name,
      artist: item.artists[0].name,
      thumbnail: item.album.images[0]?.url || "",
      duration: item.duration_ms / 1000,
      youtubeId: null,
    })) || []
  } catch {
    return []
  }
}

export async function searchPlaylistSuggestions(query: string): Promise<PlaylistSuggestion[]> {
  const [spotifyPlaylists, youtubePlaylists] = await Promise.all([
    getSpotifyPlaylists(query),
    getYoutubePlaylists(query),
  ])

  return [...spotifyPlaylists, ...youtubePlaylists]
}

async function getSpotifyPlaylists(query: string): Promise<PlaylistSuggestion[]> {
  try {
    const token = await getSpotifyToken()
    if (!token) return []

    const playlistRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=6`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const playlistData = await playlistRes.json()
    const items = playlistData.playlists?.items || []

    const playlists = await Promise.all(
      items.map(async (item: any) => {
        const tracksRes = await fetch(
          `https://api.spotify.com/v1/playlists/${item.id}/tracks?limit=5`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const tracksData = await tracksRes.json()
        const previewTracks: PlaylistTrackPreview[] = (tracksData.items || [])
          .map((entry: any) => entry.track)
          .filter(Boolean)
          .map((track: any) => ({
            id: track.id,
            title: track.name,
            artist: track.artists?.[0]?.name || "Desconhecido",
            thumbnail: track.album?.images?.[0]?.url || item.images?.[0]?.url || "",
            duration: (track.duration_ms || 0) / 1000,
            youtubeId: null,
          }))

        return {
          id: item.id,
          source: "spotify" as const,
          title: item.name,
          description: item.owner?.display_name ? `por ${item.owner.display_name}` : "Spotify",
          thumbnail: item.images?.[0]?.url || "",
          trackCount: item.tracks?.total || previewTracks.length,
          previewTracks,
        }
      })
    )

    return playlists
  } catch {
    return []
  }
}

async function getYoutubePlaylists(query: string): Promise<PlaylistSuggestion[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
    if (!apiKey) return []

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=playlist&q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=6`
    )
    const data = await res.json()

    const playlists = await Promise.all(
      (data.items || []).map(async (item: any) => {
        const playlistId = item.id.playlistId
        const itemsRes = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=5&key=${apiKey}`
        )
        const itemsData = await itemsRes.json()

        const previewTracks: PlaylistTrackPreview[] = (itemsData.items || []).map((entry: any) => ({
          id: entry.contentDetails?.videoId || `${playlistId}-${entry.etag}`,
          title: entry.snippet?.title || "Faixa YouTube",
          artist: entry.snippet?.videoOwnerChannelTitle || entry.snippet?.channelTitle || "YouTube",
          thumbnail: entry.snippet?.thumbnails?.medium?.url || entry.snippet?.thumbnails?.default?.url || "",
          duration: 0,
          youtubeId: entry.contentDetails?.videoId || null,
        }))

        return {
          id: playlistId,
          source: "youtube" as const,
          title: item.snippet?.title || "Playlist YouTube",
          description: item.snippet?.channelTitle ? `canal ${item.snippet.channelTitle}` : "YouTube",
          thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || "",
          trackCount: previewTracks.length,
          previewTracks,
        }
      })
    )

    return playlists
  } catch {
    return []
  }
}

export async function getYoutubeId(title: string, artist: string) {
  const query = `${title} ${artist} audio`
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}&type=video&maxResults=1`
    )
    const data = await res.json()
    return data.items?.[0]?.id?.videoId || null
  } catch {
    return null
  }
}
