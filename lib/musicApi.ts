const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET

export interface PlaylistTrackPreview {
  id: string
  title: string
  artist: string
  thumbnail: string
  duration: number
  youtubeId: string | null
  previewUrl?: string | null
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

async function searchMusicFromITunes(query: string) {
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=50`
    )
    const data = await res.json()

    return (data.results || []).map((item: any) => ({
      id: `itunes-${item.trackId}`,
      title: item.trackName || "Faixa",
      artist: item.artistName || "Desconhecido",
      thumbnail: item.artworkUrl100 || item.artworkUrl60 || "",
      duration: Math.floor((item.trackTimeMillis || 0) / 1000),
      youtubeId: null,
      previewUrl: item.previewUrl || null,
    }))
  } catch {
    return []
  }
}

export async function searchMusic(query: string) {
  try {
    const token = await getSpotifyToken()
    if (!token) {
      return searchMusicFromITunes(query)
    }

    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=50`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    const data = await res.json()
    const tracks = data.tracks?.items.map((item: any) => ({
      id: item.id,
      title: item.name,
      artist: item.artists[0].name,
      thumbnail: item.album.images[0]?.url || "",
      duration: item.duration_ms / 1000,
      youtubeId: null,
      previewUrl: item.preview_url || null,
    })) || []

    const hasPreview = tracks.some((track: any) => !!track.previewUrl)
    if (!hasPreview) {
      const fallback = await searchMusicFromITunes(query)
      if (fallback.length > 0) return fallback
    }

    return tracks
  } catch {
    return searchMusicFromITunes(query)
  }
}

export async function searchPlaylistSuggestions(query: string): Promise<PlaylistSuggestion[]> {
  const [spotifyPlaylists, youtubePlaylists] = await Promise.all([
    getSpotifyPlaylists(query),
    getYoutubePlaylists(query),
  ])

  return [...spotifyPlaylists, ...youtubePlaylists]
}

async function getAllSpotifyPlaylistTracks(playlistId: string, token: string) {
  const collected: any[] = []
  let offset = 0
  const limit = 100

  while (true) {
    const tracksRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const tracksData = await tracksRes.json()
    const items = tracksData.items || []

    collected.push(...items)

    if (!tracksData.next || items.length === 0) break
    offset += limit
  }

  return collected
}

async function getSpotifyPlaylists(query: string): Promise<PlaylistSuggestion[]> {
  try {
    const token = await getSpotifyToken()
    if (!token) return []

    const playlistRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=12`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const playlistData = await playlistRes.json()
    const items = playlistData.playlists?.items || []

    const playlists = await Promise.all(
      items.map(async (item: any) => {
        const allTrackRows = await getAllSpotifyPlaylistTracks(item.id, token)

        const previewTracks: PlaylistTrackPreview[] = allTrackRows
          .map((entry: any) => entry.track)
          .filter(Boolean)
          .map((track: any) => ({
            id: track.id,
            title: track.name,
            artist: track.artists?.[0]?.name || "Desconhecido",
            thumbnail: track.album?.images?.[0]?.url || item.images?.[0]?.url || "",
            duration: (track.duration_ms || 0) / 1000,
            youtubeId: null,
            previewUrl: track.preview_url || null,
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

async function getAllYoutubePlaylistItems(playlistId: string, apiKey: string) {
  const collected: any[] = []
  let pageToken = ""

  while (true) {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems")
    url.searchParams.set("part", "snippet,contentDetails")
    url.searchParams.set("playlistId", playlistId)
    url.searchParams.set("maxResults", "50")
    url.searchParams.set("key", apiKey)
    if (pageToken) url.searchParams.set("pageToken", pageToken)

    const itemsRes = await fetch(url.toString())
    const itemsData = await itemsRes.json()
    const items = itemsData.items || []

    collected.push(...items)

    if (!itemsData.nextPageToken || items.length === 0) break
    pageToken = itemsData.nextPageToken
  }

  return collected
}

async function getYoutubePlaylists(query: string): Promise<PlaylistSuggestion[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
    if (!apiKey) return []

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=playlist&q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=12`
    )
    const data = await res.json()

    const playlists = await Promise.all(
      (data.items || []).map(async (item: any) => {
        const playlistId = item.id.playlistId
        const allItems = await getAllYoutubePlaylistItems(playlistId, apiKey)

        const previewTracks: PlaylistTrackPreview[] = allItems.map((entry: any) => ({
          id: entry.contentDetails?.videoId || `${playlistId}-${entry.etag}`,
          title: entry.snippet?.title || "Faixa YouTube",
          artist: entry.snippet?.videoOwnerChannelTitle || entry.snippet?.channelTitle || "YouTube",
          thumbnail: entry.snippet?.thumbnails?.medium?.url || entry.snippet?.thumbnails?.default?.url || "",
          duration: 0,
          youtubeId: entry.contentDetails?.videoId || null,
          previewUrl: null,
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
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
    if (!apiKey) return null

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${apiKey}&type=video&maxResults=1`
    )
    const data = await res.json()
    return data.items?.[0]?.id?.videoId || null
  } catch {
    return null
  }
}
