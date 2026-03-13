const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET

// Cache para evitar chamadas repetidas
const searchCache = new Map<string, { data: any[]; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export interface PlaylistTrackPreview {
  id: string
  title: string
  artist: string
  thumbnail: string
  duration: number
  youtubeId: string | null
  previewUrl?: string | null
  source?: "spotify" | "youtube" | "itunes" | "soundcloud"
  isTestContent?: boolean
  testLabel?: string
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

async function getSpotifyToken(): Promise<{token: string | null, error: string | null}> {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error("[MusicAPI] ❌ Spotify: CLIENT_ID/SECRET em falta")
      return { token: null, error: "SPOTIFY_CREDENTIALS_MISSING" }
    }
    
    const auth = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    })
    
    if (!res.ok) {
      console.error(`[MusicAPI] ❌ Spotify token erro ${res.status}:`, await res.text())
      return { token: null, error: `SPOTIFY_TOKEN_ERROR_${res.status}` }
    }
    
    const data = await res.json()
    if (!data.access_token) {
      console.error("[MusicAPI] ❌ Spotify: token inválido:", data)
      return { token: null, error: "SPOTIFY_INVALID_TOKEN" }
    }
    
    return { token: data.access_token, error: null as string | null }
  } catch (e) {
    console.error("[MusicAPI] ❌ Spotify token exception:", e)
    return { token: null, error: "SPOTIFY_NETWORK_ERROR" }
  }
}

// Search tracks from Spotify
async function searchSpotifyTracks(query: string): Promise<{tracks: PlaylistTrackPreview[], error: string | null}> {
  try {
    const { token, error } = await getSpotifyToken()
    if (error) {
      return { tracks: [], error }
    }

    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=15`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`[MusicAPI] ❌ Spotify search erro ${res.status}:`, errorText)
      return { tracks: [], error: `SPOTIFY_SEARCH_ERROR_${res.status}` }
    }

    const data = await res.json()
    const tracks = data.tracks?.items || []

    console.log("[MusicAPI] ✅ Spotify:", tracks.length, "tracks")

    return {
      tracks: tracks.map((track: any) => ({
        id: `spotify-${track.id}`,
        title: track.name,
        artist: track.artists?.map((a: any) => a.name).join(", ") || "Desconhecido",
        thumbnail: track.album?.images?.[0]?.url || "",
        duration: (track.duration_ms || 0) / 1000,
        youtubeId: null,
        previewUrl: track.preview_url || null,
        source: "spotify" as const,
      })),
      error: null
    }
  } catch (e) {
    console.error("[MusicAPI] ❌ Spotify search exception:", e)
    return { tracks: [], error: "SPOTIFY_SEARCH_EXCEPTION" }
  }
}

// YouTube search - USA A API KEY DIRETAMENTE
async function searchMusicFromYouTube(query: string): Promise<{tracks: PlaylistTrackPreview[], error: string | null}> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
    if (!apiKey) {
      console.error("[MusicAPI] ❌ YouTube: API_KEY em falta")
      return { tracks: [], error: "YOUTUBE_API_KEY_MISSING" }
    }

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${apiKey}&maxResults=10`
    )
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error(`[MusicAPI] ❌ YouTube erro ${res.status}:`, errorText)
      if (res.status === 403) {
        return { tracks: [], error: "YOUTUBE_QUOTA_EXCEEDED" }
      }
      return { tracks: [], error: `YOUTUBE_ERROR_${res.status}` }
    }

    const data = await res.json()
    if (data.error) {
      console.error("[MusicAPI] ❌ YouTube API error:", data.error)
      return { tracks: [], error: `YOUTUBE_API_ERROR_${data.error.code}` }
    }

    const tracks = (data.items || []).map((item: any) => ({
      id: `youtube-${item.id.videoId}`,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
      duration: 0,
      youtubeId: item.id.videoId,
      previewUrl: null,
      source: "youtube" as const,
    }))

    console.log("[MusicAPI] ✅ YouTube:", tracks.length, "tracks")
    return { tracks, error: null }
  } catch (e) {
    console.error("[MusicAPI] ❌ YouTube exception:", e)
    return { tracks: [], error: "YOUTUBE_NETWORK_ERROR" }
  }
}

// Normalizar texto
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
}

function artistMatches(resultArtist: string, targetArtist: string): boolean {
  const normalizedResult = normalizeText(resultArtist)
  const normalizedTarget = normalizeText(targetArtist)
  
  if (normalizedResult.includes(normalizedTarget) || normalizedTarget.includes(normalizedResult)) {
    return true
  }
  
  const resultWords = normalizedResult.split(" ").slice(0, 2).join(" ")
  const targetWords = normalizedTarget.split(" ").slice(0, 2).join(" ")
  
  return resultWords === targetWords || normalizedResult.includes(targetWords.split(" ")[0])
}

function titleMatches(resultTitle: string, targetTitle: string): boolean {
  const normalizedResult = normalizeText(resultTitle)
  const normalizedTarget = normalizeText(targetTitle)
  
  if (normalizedResult.includes(normalizedTarget) || normalizedTarget.includes(normalizedResult)) {
    return true
  }
  
  const resultWords = normalizedResult.split(" ").slice(0, 4).join(" ")
  const targetWords = normalizedTarget.split(" ").slice(0, 4).join(" ")
  
  return resultWords.includes(targetWords) || targetWords.includes(resultWords)
}

// Buscar YouTube ID - simples e direto
export async function getYoutubeId(title: string, artist: string): Promise<string | null> {
  console.log("[MusicAPI] 🔍 A procurar YouTube para:", title, "-", artist)
  
  // Fase 1: Pesquisar apenas pelo título
  const titleResultsRaw = await searchMusicFromYouTube(title)
  const titleResults = titleResultsRaw.tracks || []
  
  if (titleResults.length > 0) {
    const matchingResult = titleResults.find((r: PlaylistTrackPreview) => {
      if (r.title.toLowerCase().includes('live') || 
          r.title.toLowerCase().includes('stream') ||
          r.title.toLowerCase().includes('full album') ||
          r.title.toLowerCase().includes('playlist')) {
        return false
      }
      return titleMatches(r.title, title) && artistMatches(r.artist, artist)
    })
    
    if (matchingResult) {
      console.log("[MusicAPI] ✅ YouTube ID encontrado:", matchingResult.youtubeId)
      return matchingResult.youtubeId
    }
    
    const validResult = titleResults.find(r => 
      !r.title.toLowerCase().includes('live') && 
      !r.title.toLowerCase().includes('stream') &&
      !r.title.toLowerCase().includes('full album') &&
      !r.title.toLowerCase().includes('playlist') &&
      titleMatches(r.title, title)
    )
    
    if (validResult) {
      console.log("[MusicAPI] ✅ YouTube ID encontrado:", validResult.youtubeId)
      return validResult.youtubeId
    }
  }
  
  // Fase 2: Pesquisar com título + artista
  const fullResultsRaw = await searchMusicFromYouTube(`${title} ${artist}`)
  const fullResults = fullResultsRaw.tracks || []
  
  if (fullResults.length > 0) {
    const validResult = fullResults.find(r => 
      !r.title.toLowerCase().includes('live') && 
      !r.title.toLowerCase().includes('stream') &&
      !r.title.toLowerCase().includes('full album') &&
      !r.title.toLowerCase().includes('playlist')
    )
    
    if (validResult) {
      console.log("[MusicAPI] ✅ YouTube ID encontrado:", validResult.youtubeId)
      return validResult.youtubeId
    }
  }
  
  // Fase 3: Variações
  const variations = [
    `${title} ${artist} audio`,
    `${title} ${artist} lyrics`,
    `${title} ${artist} music`,
  ]
  
  for (const query of variations) {
    const resultsRaw = await searchMusicFromYouTube(query)
    const results = resultsRaw.tracks || []
    if (results.length > 0) {
      const validResult = results.find(r => 
        !r.title.toLowerCase().includes('live') && 
        !r.title.toLowerCase().includes('stream')
      )
      if (validResult) {
        console.log("[MusicAPI] ✅ YouTube ID encontrado:", validResult.youtubeId)
        return validResult.youtubeId
      }
    }
  }
  
  console.log("[MusicAPI] ❌ YouTube ID não encontrado")
  return null
}

export type SearchSource = "all" | "spotify" | "youtube"

export async function searchMusic(query: string, source: SearchSource = "all"): Promise<PlaylistTrackPreview[]> {
  const cacheKey = `${source}:${query.toLowerCase().trim()}`
  const cached = searchCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log("[MusicAPI] 📦 Usando cache para:", query)
  return cached.data
  }

  console.log("[MusicAPI] 🔍 A pesquisar música:", query, "source:", source)
  
  let results: PlaylistTrackPreview[] = []
  let spotifyError: string | null = null
  let youtubeError: string | null = null
  
  if (source === "all" || source === "spotify") {
    const spotifyRes = await searchSpotifyTracks(query)
    if (spotifyRes.error) spotifyError = spotifyRes.error
    else results = [...results, ...spotifyRes.tracks]
  }
  
  if (source === "all" || source === "youtube") {
    const youtubeRes = await searchMusicFromYouTube(query)
    if (youtubeRes.error) youtubeError = youtubeRes.error
    else results = [...results, ...youtubeRes.tracks]
  }

  if (results.length > 0) {
    console.log("[MusicAPI] ✅ Encontradas", results.length, "músicas")
    searchCache.set(cacheKey, { data: results, timestamp: Date.now() })
  } else {
    console.log("[MusicAPI] ❌ Nenhuma música encontrada", { spotifyError, youtubeError })
  }

  return results
}

export async function searchSpotify(query: string): Promise<PlaylistTrackPreview[]> {
  return searchMusic(query, "spotify")
}

export async function searchYouTube(query: string): Promise<PlaylistTrackPreview[]> {
  return searchMusic(query, "youtube")
}

export async function searchPlaylistSuggestions(query: string): Promise<{playlists: PlaylistSuggestion[], spotifyError: string | null, youtubeError: string | null}> {
  console.log("[MusicAPI] 🔍 Playlist suggestions for:", query)
  
  let spotifyError: string | null = null
  let youtubeError: string | null = null
  let spotifyPlaylists: PlaylistSuggestion[] = []
  let youtubePlaylists: PlaylistSuggestion[] = []

  // Parallel but safe
  try {
    spotifyPlaylists = await getSpotifyPlaylists(query)
  } catch (e) {
    spotifyError = "SPOTIFY_FETCH_ERROR"
    console.error("[MusicAPI] Spotify playlists fail:", e)
  }

  try {
    youtubePlaylists = await getYoutubePlaylists(query)
  } catch (e) {
    youtubeError = "YOUTUBE_FETCH_ERROR"
    console.error("[MusicAPI] YouTube playlists fail:", e)
  }

  const playlists = [...spotifyPlaylists, ...youtubePlaylists]
  
  console.log("[MusicAPI] Playlist suggestions:", {
    total: playlists.length,
    spotify: spotifyPlaylists.length,
    youtube: youtubePlaylists.length,
    spotifyError,
    youtubeError
  })

  return { playlists, spotifyError, youtubeError }
}

// REMOVED: getAllSpotifyPlaylistTracks - now using preview-only fetch

async function getSpotifyPlaylists(query: string): Promise<PlaylistSuggestion[]> {
  try {
    const { token, error } = await getSpotifyToken()
    if (error || !token) {
      console.error("[MusicAPI] Spotify playlists erro:", error)
      return []
    }

    const playlistRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=50`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!playlistRes.ok) {
      console.error("[MusicAPI] Spotify playlists search erro", playlistRes.status)
      return []
    }
    const playlistData = await playlistRes.json()
    const items = playlistData.playlists?.items || []

    const playlists = await Promise.all(
      items.slice(0, 20).map(async (item: any) => {
        // Fetch ALL tracks - no limit for full playlists
        const allTracks: PlaylistTrackPreview[] = []
        let offset = 0
        const limit = 100
        
        while (true) {
          const tracksRes = await fetch(
            `https://api.spotify.com/v1/playlists/${item.id}/tracks?limit=${limit}&offset=${offset}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          if (!tracksRes.ok) break
          
          const tracksData = await tracksRes.json()
          const trackItems = tracksData.items || []
          
          if (trackItems.length === 0) break
          
          const tracks = trackItems
            .map((entry: any) => entry.track)
            .filter(Boolean)
            .map((track: any) => ({
              id: `spotify-track-${track.id}`,
              title: track.name,
              artist: track.artists?.[0]?.name || "Desconhecido",
              thumbnail: track.album?.images?.[0]?.url || item.images?.[0]?.url || "",
              duration: (track.duration_ms || 0) / 1000,
              youtubeId: null,
              previewUrl: track.preview_url || null,
              source: "spotify" as const,
            }))
          
          allTracks.push(...tracks)
          
          if (!tracksData.next) break
          offset += limit
        }

        const previewTracks: PlaylistTrackPreview[] = allTracks.slice(0, 100)
        return {
          id: item.id,
          source: "spotify" as const,
          title: item.name,
          description: item.owner?.display_name ? `por ${item.owner.display_name}` : "Spotify",
          thumbnail: item.images?.[0]?.url || "",
          trackCount: item.tracks?.total || allTracks.length,
          previewTracks,
        }
      })
    )

    return playlists.filter(Boolean)
  } catch (e) {
    console.error("[MusicAPI] getSpotifyPlaylists exception:", e)
    return []
  }
}

// REMOVED: getAllYoutubePlaylistItems - now using preview-only fetch

async function getYoutubePlaylists(query: string): Promise<PlaylistSuggestion[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
    if (!apiKey) {
      console.error("[MusicAPI] YouTube playlists: API_KEY missing")
      return []
    }

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=playlist&q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=50`
    )
    
    if (!res.ok) {
      console.error("[MusicAPI] YouTube playlists search fail:", res.status)
      if (res.status === 403) console.warn("[MusicAPI] YouTube quota exceeded")
      return []
    }
    
    const data = await res.json()
    if (data.error) {
      console.error("[MusicAPI] YouTube API error:", data.error)
      return []
    }

    const playlists = await Promise.all(
      (data.items || []).slice(0, 20).map(async (item: any) => {
        const playlistId = item.id.playlistId
        
        // Full pagination - get ALL items
        const allItems: any[] = []
        let pageToken = ""
        const maxResults = 50
        
        while (true) {
          const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems")
          url.searchParams.set("part", "snippet,contentDetails")
          url.searchParams.set("playlistId", playlistId)
          url.searchParams.set("maxResults", maxResults.toString())
          url.searchParams.set("key", apiKey)
          if (pageToken) url.searchParams.set("pageToken", pageToken)

          const itemsRes = await fetch(url.toString())
          if (!itemsRes.ok) break
          
          const itemsData = await itemsRes.json()
          allItems.push(...(itemsData.items || []))

          if (!itemsData.nextPageToken) break
          pageToken = itemsData.nextPageToken
        }

        const previewTracks: PlaylistTrackPreview[] = allItems.slice(0, 100).map((entry: any) => ({
          id: entry.contentDetails?.videoId || `${playlistId}-${entry.etag}`,
          title: entry.snippet?.title || "Faixa YouTube",
          artist: entry.snippet?.videoOwnerChannelTitle || entry.snippet?.channelTitle || "YouTube",
          thumbnail: entry.snippet?.thumbnails?.medium?.url || entry.snippet?.thumbnails?.default?.url || "",
          duration: 0,
          youtubeId: entry.contentDetails?.videoId || null,
          previewUrl: null,
          source: "youtube" as const,
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

    return playlists.filter(Boolean)
  } catch (e) {
    console.error("[MusicAPI] getYoutubePlaylists exception:", e)
    return []
  }
}

