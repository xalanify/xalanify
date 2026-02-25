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

/**
 * Add a track to the user's liked tracks
 * IMPORTANT: Requires RLS policies on liked_tracks table:
 * - liked_tracks_insert: allows INSERT for auth.uid() = user_id
 * - liked_tracks_update: allows UPDATE for auth.uid() = user_id
 * Apply RLS policies by running: supabase/sql/diagnose_liked_tracks.sql in Supabase SQL editor
 */
export async function addLikedTrack(userId: string, track: any) {
  console.log("[supabase] addLikedTrack called with:", { userId, trackId: track?.id, trackTitle: track?.title })
  
  const trackId = track?.id ? String(track.id) : ""
  if (!trackId) {
    console.error("[supabase] addLikedTrack: No track ID provided")
    return false
  }

  const row = {
    user_id: userId,
    track_id: trackId,
    track_data: track,
  }

  console.log("[supabase] addLikedTrack: Attempting to insert/upsert row:", row)

  try {
    // First, try a simple upsert without conflictConflict - let Supabase infer from unique constraints
    const { data: upsertData, error: upsertError } = await supabase
      .from("liked_tracks")
      .upsert([row])
      .select()

    console.log("[supabase] addLikedTrack upsert response:", { data: upsertData, error: upsertError })

    if (!upsertError) {
      console.log("[supabase] addLikedTrack success via upsert:", upsertData)
      return true
    }

    // If upsert fails, log the error details for debugging
    console.warn("[supabase] addLikedTrack upsert failed, attempting fallback:", {
      message: upsertError?.message,
      code: upsertError?.code,
      details: upsertError?.details,
      hint: upsertError?.hint
    })

    // Fallback: Try insert, and if it fails with duplicate key, try update
    const { data: insertData, error: insertError } = await supabase
      .from("liked_tracks")
      .insert([row])
      .select()

    if (!insertError) {
      console.log("[supabase] addLikedTrack success via insert:", insertData)
      return true
    }

    // If insert fails due to duplicate, try update
    if (insertError?.code === "23505" || insertError?.message?.includes("duplicate")) {
      console.log("[supabase] addLikedTrack: Duplicate detected, attempting update...")
      
      const { data: updateData, error: updateError } = await supabase
        .from("liked_tracks")
        .update(row)
        .eq("user_id", userId)
        .eq("track_id", trackId)
        .select()

      if (!updateError) {
        console.log("[supabase] addLikedTrack success via update:", updateData)
        return true
      }

      console.error("[supabase] addLikedTrack update failed:", {
        message: updateError?.message,
        code: updateError?.code,
        details: updateError?.details,
        hint: updateError?.hint
      })
      return false
    }

    // If it's not a duplicate error, log the original insert error
    console.error("[supabase] addLikedTrack insert failed:", {
      message: insertError?.message,
      code: insertError?.code,
      details: insertError?.details,
      hint: insertError?.hint
    })
    return false

  } catch (err: any) {
    console.error("[supabase] addLikedTrack EXCEPTION:", {
      message: err?.message,
      code: err?.code,
      stack: err?.stack
    })
    return false
  }
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

// Diagnostic: Check liked_tracks table status
export async function diagnoseLikedTracks(userId: string) {
  console.log("[supabase] diagnoseLikedTracks: Starting diagnostic for user", userId)
  
  // Check if table exists and has correct structure
  const { data: tableInfo, error: tableError } = await supabase
    .from("liked_tracks")
    .select("id, user_id, track_id, created_at")
    .limit(1)
  
  console.log("[supabase] diagnoseLikedTracks: table check result:", { tableInfo, tableError })
  
  // Check user's liked tracks
  const { data: userTracks, error: userError } = await supabase
    .from("liked_tracks")
    .select("id, track_id, created_at")
    .eq("user_id", userId)
    .limit(10)
  
  console.log("[supabase] diagnoseLikedTracks: user tracks:", { userTracks, userError })
  
  return {
    tableExists: !tableError,
    tableError,
    likedTracks: userTracks || [],
    userError
  }
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
  console.log("[supabase] createPlaylist called", { userId, name, imageUrl })
  console.trace("[supabase] createPlaylist trace")
  
  const normalized = name.trim()
  if (!normalized) return null

  try {
    const { data: existing, error: existingError } = await supabase
      .from("playlists")
      .select("id, name, user_id, created_at, tracks_json, image_url")
      .eq("user_id", userId)
      .ilike("name", normalized)
      .maybeSingle()

    if (existingError) {
      console.error("[supabase] Error checking existing playlist:", existingError)
    }

    if (existing) {
      console.log("[supabase] Playlist already exists", existing)
      return { ...existing, existed: true, tracks: Array.isArray(existing.tracks_json) ? existing.tracks_json : [] }
    }

    console.log("[supabase] Creating new playlist", { userId, name: normalized })
    
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
      console.error("[supabase] Erro ao criar playlist:", error.code, error.message, error.details, error.hint)
      return null
    }

    console.log("[supabase] Playlist created successfully", data)
    return { ...data, existed: false, tracks: Array.isArray(data.tracks_json) ? data.tracks_json : [] }
  } catch (err: any) {
    console.error("[supabase] Exception in createPlaylist:", err?.message, err)
    return null
  }
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
  console.log("[supabase] addTrackToPlaylist called", { playlistId, trackId: track?.id, trackTitle: track?.title })
  
  const { data: playlist, error: fetchError } = await supabase
    .from("playlists")
    .select("tracks_json")
    .eq("id", playlistId)
    .maybeSingle()

  if (fetchError || !playlist) {
    console.error("[supabase] Erro ao buscar playlist:", fetchError)
    return false
  }

  console.log("[supabase] Current playlist tracks:", playlist.tracks_json)
  
  const tracks = Array.isArray(playlist.tracks_json) ? playlist.tracks_json : []
  const exists = tracks.some((t: any) => t?.id === track.id)
  const updatedTracks = exists ? tracks : [...tracks, track]

  console.log("[supabase] Updated tracks:", updatedTracks)

  const { error } = await supabase
    .from("playlists")
    .update({ tracks_json: updatedTracks })
    .eq("id", playlistId)

  if (error) {
    console.error("[supabase] Erro ao adicionar a playlist:", error.code, error.message, error.details)
    return false
  }
  
  console.log("[supabase] Track added successfully to playlist")
  return true
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
