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

// Search tracks from Spotify
async function searchSpotifyTracks(query: string): Promise<PlaylistTrackPreview[]> {
  try {
    const token = await getSpotifyToken()
    if (!token) {
      console.log("[MusicAPI] ⚠️ Sem token Spotify")
      return []
    }

    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=15`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!res.ok) {
      console.log(`[MusicAPI] ❌ Spotify erro ${res.status}`)
      return []
    }

    const data = await res.json()
    const tracks = data.tracks?.items || []

    console.log("[MusicAPI] ✅ Encontradas", tracks.length, "músicas no Spotify")

    return tracks.map((track: any) => ({
      id: `spotify-${track.id}`,
      title: track.name,
      artist: track.artists?.map((a: any) => a.name).join(", ") || "Desconhecido",
      thumbnail: track.album?.images?.[0]?.url || "",
      duration: (track.duration_ms || 0) / 1000,
      youtubeId: null,
      previewUrl: track.preview_url || null,
      source: "spotify" as const,
    }))
  } catch (e) {
    console.log("[MusicAPI] ❌ Spotify exception:", e)
    return []
  }
}

// Instâncias Invidious para obter streams diretos (mais instâncias para backup)
const INVIDIOUS_API = [
  "https://invidious.snopyta.org",
  "https://invidious.kavin.rocks",
  "https://invidious.namazso.eu",
  "https://yewtu.be",
  "https://invidious.projectsegfau.lt",
  "https://iv.ggtyler.dev",
  "https://invidious.moomoo.io",
  "https://invidious.tube",
]

let invidiousIndex = 0

// Obter stream de áudio direto do Invidious
async function getAudioStreamUrl(videoId: string): Promise<string | null> {
  for (let i = 0; i < INVIDIOUS_API.length; i++) {
    const instance = INVIDIOUS_API[invidiousIndex]
    invidiousIndex = (invidiousIndex + 1) % INVIDIOUS_API.length
    
    try {
      const response = await fetch(`${instance}/api/v1/videos/${videoId}`)
      if (!response.ok) continue
      
      const data = await response.json()
      const audioStreams = data.adaptiveFormats?.filter((f: any) => f.type?.includes("audio"))
      
      if (audioStreams && audioStreams.length > 0) {
        const bestAudio = audioStreams.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))[0]
        return bestAudio.url
      }
    } catch {
      // Continuar para próxima instância
    }
  }
  return null
}

// YouTube search RÁPIDO com múltiplas queries de fallback
async function searchMusicFromYouTube(query: string): Promise<PlaylistTrackPreview[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
    if (!apiKey) {
      console.log("[MusicAPI] ⚠️ Sem API Key do YouTube")
      return []
    }

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${apiKey}&maxResults=10`
    )
    
    if (!res.ok) {
      console.log(`[MusicAPI] ❌ YouTube erro ${res.status}`)
      return []
    }

    const data = await res.json()
    return (data.items || []).map((item: any) => ({
      id: `youtube-${item.id.videoId}`,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
      duration: 0,
      youtubeId: item.id.videoId,
      previewUrl: null,
      source: "youtube" as const,
    }))
  } catch (e) {
    console.log("[MusicAPI] ❌ YouTube exception:", e)
    return []
  }
}

// Normalizar texto para comparação (remover acentos, converter para minúsculas)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
}

// Verificar se o artista do resultado corresponde ao artista da música
function artistMatches(resultArtist: string, targetArtist: string): boolean {
  const normalizedResult = normalizeText(resultArtist)
  const normalizedTarget = normalizeText(targetArtist)
  
  // Verificação direta
  if (normalizedResult.includes(normalizedTarget) || normalizedTarget.includes(normalizedResult)) {
    return true
  }
  
  // Verificar primeiras palavras
  const resultWords = normalizedResult.split(" ").slice(0, 2).join(" ")
  const targetWords = normalizedTarget.split(" ").slice(0, 2).join(" ")
  
  return resultWords === targetWords || normalizedResult.includes(targetWords.split(" ")[0])
}

// Verificar se o título corresponde
function titleMatches(resultTitle: string, targetTitle: string): boolean {
  const normalizedResult = normalizeText(resultTitle)
  const normalizedTarget = normalizeText(targetTitle)
  
  // Verificação direta
  if (normalizedResult.includes(normalizedTarget) || normalizedTarget.includes(normalizedResult)) {
    return true
  }
  
  // Verificar primeiras palavras do título
  const resultWords = normalizedResult.split(" ").slice(0, 4).join(" ")
  const targetWords = normalizedTarget.split(" ").slice(0, 4).join(" ")
  
  return resultWords.includes(targetWords) || targetWords.includes(resultWords)
}

// Buscar YouTube ID - LÓGICA: primeiro título, verificar artista, depois título+artista
export async function getYoutubeId(title: string, artist: string): Promise<string | null> {
  console.log("[MusicAPI] 🔍 A procurar YouTube para:", title, "-", artist)
  
  const normalizedTitle = normalizeText(title)
  const normalizedArtist = normalizeText(artist)
  
  // ===== FASE 1: Pesquisar apenas pelo TÍTULO =====
  console.log(`[MusicAPI] 🔎 Fase 1: Pesquisar apenas por título: "${title}"`)
  const titleResults = await searchMusicFromYouTube(title)
  
  if (titleResults.length > 0) {
    console.log(`[MusicAPI] 📋 Encontrados ${titleResults.length} resultados para o título`)
    
    // Procurar resultado que tenha título E artista correspondentes
    const matchingResult = titleResults.find(r => {
      // Ignorar live streams e resultados inválidos
      if (r.title.toLowerCase().includes('live') || 
          r.title.toLowerCase().includes('stream') ||
          r.title.toLowerCase().includes('full album') ||
          r.title.toLowerCase().includes('playlist')) {
        return false
      }
      // Verificar se título corresponde E artista corresponde
      return titleMatches(r.title, title) && artistMatches(r.artist, artist)
    })
    
    if (matchingResult) {
      console.log("[MusicAPI] ✅ YouTube ID encontrado (título + artista corresponde):", matchingResult.youtubeId, "-", matchingResult.title)
      return matchingResult.youtubeId
    }
    
    // Se não encontrou com artista, usar primeiro resultado válido cujo título corresponda
    const validResult = titleResults.find(r => 
      !r.title.toLowerCase().includes('live') && 
      !r.title.toLowerCase().includes('stream') &&
      !r.title.toLowerCase().includes('full album') &&
      !r.title.toLowerCase().includes('playlist') &&
      titleMatches(r.title, title)
    )
    
    if (validResult) {
      console.log("[MusicAPI] ✅ YouTube ID encontrado (título corresponde):", validResult.youtubeId, "-", validResult.title)
      return validResult.youtubeId
    }
  }
  
  // ===== FASE 2: Pesquisar com TÍTULO + ARTISTA =====
  console.log(`[MusicAPI] 🔎 Fase 2: Pesquisar com título + artista: "${title} ${artist}"`)
  const fullResults = await searchMusicFromYouTube(`${title} ${artist}`)
  
  if (fullResults.length > 0) {
    const validResult = fullResults.find(r => 
      !r.title.toLowerCase().includes('live') && 
      !r.title.toLowerCase().includes('stream') &&
      !r.title.toLowerCase().includes('full album') &&
      !r.title.toLowerCase().includes('playlist')
    )
    
    if (validResult) {
      console.log("[MusicAPI] ✅ YouTube ID encontrado (título + artista):", validResult.youtubeId, "-", validResult.title)
      return validResult.youtubeId
    }
  }
  
  // ===== FASE 3: Retry com variações =====
  console.log("[MusicAPI] 🔎 Fase 3: Tentando variações...")
  const variations = [
    `${title} ${artist} audio`,
    `${title} ${artist} lyrics`,
    `${title} ${artist} music`,
    `${artist} ${title}`,
  ]
  
  for (const query of variations) {
    const results = await searchMusicFromYouTube(query)
    if (results.length > 0) {
      const validResult = results.find(r => 
        !r.title.toLowerCase().includes('live') && 
        !r.title.toLowerCase().includes('stream')
      )
      if (validResult) {
        console.log("[MusicAPI] ✅ YouTube ID encontrado (variação):", validResult.youtubeId, "-", validResult.title)
        return validResult.youtubeId
      }
    }
  }
  
  console.log("[MusicAPI] ❌ YouTube ID não encontrado")
  return null
}

// Buscar múltiplos YouTube IDs (para retry)
async function getMultipleYoutubeIds(title: string, artist: string, limit = 5): Promise<string[]> {
  const queries = [
    `${title} ${artist} official audio`,
    `${title} ${artist} audio`,
    `${title} ${artist} lyrics`,
    `${title} ${artist} music video`,
    `${title} ${artist}`,
  ]

  const allIds: string[] = []
  
  for (const query of queries) {
    const results = await searchMusicFromYouTube(query)
    for (const result of results) {
      if (result.youtubeId && !allIds.includes(result.youtubeId)) {
        allIds.push(result.youtubeId)
        if (allIds.length >= limit) break
      }
    }
    if (allIds.length >= limit) break
  }
  
  return allIds
}

export type SearchSource = "all" | "spotify" | "youtube"

export async function searchMusic(query: string, source: SearchSource = "all") {
  // Verificar cache
  const cacheKey = `${source}:${query.toLowerCase().trim()}`
  const cached = searchCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log("[MusicAPI] 📦 Usando cache para:", query, "source:", source)
    return cached.data
  }

  console.log("[MusicAPI] 🔍 A pesquisar música:", query, "source:", source)
  
  let results: PlaylistTrackPreview[] = []
  
  // Search from requested sources
  if (source === "all" || source === "spotify") {
    const spotifyTracks = await searchSpotifyTracks(query)
    results = [...results, ...spotifyTracks]
  }
  
  if (source === "all" || source === "youtube") {
    const youtubeTracks = await searchMusicFromYouTube(query)
    results = [...results, ...youtubeTracks]
  }

  if (results.length > 0) {
    console.log("[MusicAPI] ✅ Encontradas", results.length, "músicas (Spotify:", results.filter(r => r.source === "spotify").length, "YouTube:", results.filter(r => r.source === "youtube").length, ")")
    searchCache.set(cacheKey, { data: results, timestamp: Date.now() })
    return results
  }

  console.log("[MusicAPI] ❌ Nenhuma música encontrada")
  return []
}

// Função específica para buscar apenas do Spotify
export async function searchSpotify(query: string): Promise<PlaylistTrackPreview[]> {
  return searchMusic(query, "spotify")
}

// Função específica para buscar apenas do YouTube
export async function searchYouTube(query: string): Promise<PlaylistTrackPreview[]> {
  return searchMusic(query, "youtube")
}

// Função exportada para buscar retry com múltiplos IDs
export async function getYoutubeIdsForRetry(title: string, artist: string): Promise<string[]> {
  console.log("[MusicAPI] 🔍 A procurar IDs alternativos para retry:", title, "-", artist)
  const ids = await getMultipleYoutubeIds(title, artist, 5)
  console.log("[MusicAPI] ✅ Encontrados", ids.length, "IDs alternativos")
  return ids
}

// Exportar função para obter stream direto (para uso no player)
export { getAudioStreamUrl }

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
    
    if (res.status === 403) {
      console.log("[MusicAPI] YouTube playlists - quota excedida")
      return []
    }
    
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
