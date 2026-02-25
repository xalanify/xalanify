// src/lib/supabase.ts

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn("Supabase credentials not found")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

function usernameFromEmail(email?: string | null) {
  if (!email) return "user"
  return email.split("@")[0] || "user"
}

async function getSessionUser() {
  const { data: sessionData } = await supabase.auth.getSession()
  if (sessionData.session?.user) return sessionData.session.user

  const { data: userData } = await supabase.auth.getUser()
  return userData.user ?? null
}

async function getCurrentUserForId(userId: string) {
  const user = await getSessionUser()
  if (user?.id === userId) return user
  return null
}

async function getUserEmail(userId: string) {
  const user = await getCurrentUserForId(userId)
  return user?.email ?? null
}

export interface ShareTarget {
  user_id: string
  username: string
  email?: string | null
}

export interface UserProfile {
  user_id: string
  username: string
  email: string | null
  avatar_url?: string | null
  is_admin?: boolean
}

export interface ShareRequest {
  id: string
  from_user_id: string
  to_user_id: string
  from_username: string
  item_type: "track" | "playlist"
  item_title: string
  item_payload: any
  status: "pending" | "accepted" | "rejected"
  created_at: string
}

// User Functions
export async function getCurrentUser() {
  return getSessionUser()
}

export async function getMyProfile(userId: string): Promise<UserProfile | null> {
  const authUser = await getCurrentUserForId(userId)
  if (!authUser) return null

  const username = usernameFromEmail(authUser.email)
  const metadataIsAdmin =
    (authUser.app_metadata as any)?.is_admin === true ||
    (authUser.user_metadata as any)?.is_admin === true

  return {
    user_id: userId,
    username,
    email: authUser.email ?? null,
    avatar_url: null,
    is_admin: metadataIsAdmin || authUser.email === "adminx@adminx.com",
  }
}

export async function updateMyUsername(_userId: string, _username: string) {
  return { ok: false as const, reason: "Username personalizado foi desativado nesta versao." }
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut({ scope: "global" })
  if (!error) return null

  console.warn("Global signOut failed, falling back to local signOut:", error.message)
  const { error: localError } = await supabase.auth.signOut({ scope: "local" })
  return localError || null
}

// Liked Tracks
export async function getLikedTracks(userId: string) {
  const { data, error } = await supabase
    .from("liked_tracks")
    .select("track_id, track_data")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao carregar favoritos:", error)
    return []
  }

  return (data || [])
    .map((item: any) => {
      if (!item?.track_data) return null
      const trackId = item.track_data?.id || item.track_id
      if (!trackId) return null
      return {
        ...item.track_data,
        id: String(trackId),
      }
    })
    .filter(Boolean)
}

export async function isTrackLiked(userId: string, trackId: string) {
  const { data, error } = await supabase
    .from("liked_tracks")
    .select("id")
    .eq("user_id", userId)
    .eq("track_id", trackId)
    .maybeSingle()

  if (error) {
    console.error("Erro ao verificar favorito:", error)
    return false
  }

  return !!data
}

export async function addLikedTrack(userId: string, track: any) {
  const trackId = track?.id ? String(track.id) : ""
  if (!trackId) {
    console.error("Erro ao adicionar favorito: track.id invalido", track)
    return false
  }

  const nowIso = new Date().toISOString()
  const row = {
    user_id: userId,
    track_id: trackId,
    track_data: {
      ...track,
      id: trackId,
    },
    updated_at: nowIso,
    created_at: nowIso,
  }

  const { error: upsertError } = await supabase
    .from("liked_tracks")
    .upsert(row, { onConflict: "user_id,track_id" })

  if (!upsertError) return true

  if (upsertError.code === "42P10") {
    const { error: insertError } = await supabase.from("liked_tracks").insert(row)
    if (insertError) {
      console.error("Erro ao adicionar favorito:", insertError)
      return false
    }
    return true
  }

  console.error("Erro ao adicionar favorito (upsert):", upsertError)
  return false
}

export async function removeLikedTrack(userId: string, trackId: string) {
  const { error } = await supabase
    .from("liked_tracks")
    .delete()
    .eq("user_id", userId)
    .eq("track_id", trackId)

  if (error) console.error("Erro ao remover favorito:", error)
  return !error
}

// Sharing disabled for now (UUID-only mode)
export async function listShareTargets(_currentUserId: string, _isAdmin = false) {
  return [] as ShareTarget[]
}

export async function searchShareTargets(_currentUserId: string, _query: string) {
  return [] as ShareTarget[]
}

// Playlists
export async function getPlaylists(userId: string) {
  const { data: playlists, error } = await supabase
    .from("playlists")
    .select("id, name, user_id, created_at, tracks_json, image_url")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao carregar playlists:", error)
    return []
  }

  return (playlists || []).map((playlist: any) => ({
    ...playlist,
    tracks: Array.isArray(playlist.tracks_json) ? playlist.tracks_json : [],
  }))
}
function normalizePlaylistTracks(input: any) {
  if (!Array.isArray(input)) return []

  return input
    .map((track: any) => {
      if (!track) return null
      const trackId = track.id ? String(track.id) : ""
      if (!trackId) return null

      return {
        ...track,
        id: trackId,
      }
    })
    .filter(Boolean)
}
function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}
export async function createPlaylist(userId: string, name: string, imageUrl?: string) {
  const normalized = name.trim()
  if (!normalized) return null

  const { data: existing, error: existingError } = await supabase
    .from("playlists")
    .select("id, name, user_id, created_at, tracks_json, image_url")
    .eq("user_id", userId)
    .ilike("name", normalized)
    .maybeSingle()

  if (!existingError && existing) {
    return { ...existing, existed: true, tracks: Array.isArray(existing.tracks_json) ? existing.tracks_json : [] }
  }

  const { data, error } = await supabase
    .from("playlists")
    .insert({
      user_id: userId,
      name: normalized,
      tracks_json: [],
      image_url: imageUrl || null,
    })
    .select("id, name, user_id, created_at, tracks_json, image_url")
    .single()

  if (error) {
    console.error("Erro ao criar playlist:", error)
    return null
  }

  return { ...data, existed: false, tracks: Array.isArray(data.tracks_json) ? data.tracks_json : [] }
}

export async function createPlaylistFromShare(userId: string, name: string, imageUrl?: string) {
  const baseName = name.trim() || "Playlist Partilhada"
  const existing = await getPlaylists(userId)
  const names = new Set(existing.map((playlist: any) => (playlist.name || "").toLowerCase()))

  if (!names.has(baseName.toLowerCase())) {
    return createPlaylist(userId, baseName, imageUrl)
  }

  let idx = 2
  let candidate = `${baseName} (${idx})`
  while (names.has(candidate.toLowerCase())) {
    idx += 1
    candidate = `${baseName} (${idx})`
  }

  return createPlaylist(userId, candidate, imageUrl)
}

export async function deletePlaylist(playlistId: string) {
  const { error } = await supabase.from("playlists").delete().eq("id", playlistId)

  if (error) console.error("Erro ao deletar playlist:", error)
  return !error
}

export async function addTrackToPlaylist(playlistId: string, track: any) {
  const { data: playlist, error: fetchError } = await supabase
    .from("playlists")
    .select("tracks_json")
    .eq("id", playlistId)
    .maybeSingle()

  if (fetchError || !playlist) {
    console.error("Erro ao buscar playlist:", fetchError)
    return false
  }

  const tracks = Array.isArray(playlist.tracks_json) ? playlist.tracks_json : []
  const exists = tracks.some((t: any) => t?.id === track.id)
  const updatedTracks = exists ? tracks : [...tracks, track]

  const { error } = await supabase
    .from("playlists")
    .update({ tracks_json: updatedTracks })
    .eq("id", playlistId)

  if (error) console.error("Erro ao adicionar a playlist:", error)
  return !error
}

export async function removeTrackFromPlaylist(playlistId: string, trackId: string) {
  const { data: playlist, error: fetchError } = await supabase
    .from("playlists")
    .select("tracks_json")
    .eq("id", playlistId)
    .maybeSingle()

  if (fetchError || !playlist) {
    console.error("Erro ao buscar playlist:", fetchError)
    return false
  }

  const tracks = Array.isArray(playlist.tracks_json) ? playlist.tracks_json : []
  const updatedTracks = tracks.filter((t: any) => t?.id !== trackId)

  const { error } = await supabase
    .from("playlists")
    .update({ tracks_json: updatedTracks })
    .eq("id", playlistId)

  if (error) console.error("Erro ao remover da playlist:", error)
  return !error
}

export async function createShareRequest(_params: {
  fromUserId: string
  toUserId: string
  fromUsername: string
  itemType: "track" | "playlist"
  itemTitle: string
  itemPayload: any
}) {
  return { ok: false as const, reason: "Partilha desativada nesta versao UUID-only." }
}

export async function getIncomingShareRequests(_userId: string): Promise<ShareRequest[]> {
  return []
}

export async function getSentShareRequests(_userId: string): Promise<ShareRequest[]> {
  return []
}

export async function getReceivedShareHistory(_userId: string): Promise<ShareRequest[]> {
  return []
}

export async function acceptShareRequest(_userId: string, _request: ShareRequest) {
  return false
}

export async function rejectShareRequest(_userId: string, _requestId: string) {
  return false
}

// Import playlist by ID
export async function importPlaylistById(userId: string, playlistId: string) {
  const { data, error } = await supabase.rpc("import_playlist_by_id", {
    p_requester_id: userId,
    p_playlist_id: playlistId,
  })

  if (error) {
    console.error("Erro ao importar playlist:", error)
    return { success: false as const, error: error.message }
  }

  return data
}
