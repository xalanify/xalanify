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

async function getUserEmail(userId: string) {
  const { data } = await supabase.auth.getUser()
  if (data.user?.id === userId) {
    return data.user.email ?? null
  }
  return null
}

export interface ShareTarget {
  user_id: string
  username: string
}

// User Functions
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser()
  return data.user
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
  const { error } = await supabase.auth.signOut()
  return error
}

// Liked Tracks
export async function getLikedTracks(userId: string) {
  const { data, error } = await supabase
    .from("liked_tracks")
    .select("track_data")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) console.error("Erro ao carregar favoritos:", error)
  return data?.map((item: any) => item.track_data).filter(Boolean) || []
}

export async function addLikedTrack(userId: string, track: any) {
  const email = await getUserEmail(userId)
  const username = usernameFromEmail(email)

  const { data: existing, error: existingError } = await supabase
    .from("liked_tracks")
    .select("id")
    .eq("user_id", userId)
    .eq("track_id", track.id)
    .maybeSingle()

  if (existingError) {
    console.error("Erro ao verificar favorito existente:", existingError)
    return false
  }

  if (existing) {
    return true
  }

  const { error } = await supabase.from("liked_tracks").insert({
    user_id: userId,
    username,
    track_id: track.id,
    track_data: track,
  })

  if (error) console.error("Erro ao adicionar favorito:", error)
  return !error
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

export async function listShareTargets(currentUserId: string, isAdmin = false) {
  const [fromPlaylists, fromLikes, fromProfiles, fromUsers, fromUsersPublic, fromRpc] = await Promise.all([
    supabase.from("playlists").select("user_id, username").limit(1000),
    supabase.from("liked_tracks").select("user_id, username").limit(1000),
    supabase.from("profiles").select("user_id, username").limit(1000),
    supabase.from("users").select("id, username, email").limit(1000),
    supabase.from("users_public").select("id, username, email").limit(1000),
    isAdmin ? supabase.rpc("list_share_targets", { exclude_user_id: currentUserId }) : Promise.resolve({ data: null, error: null } as any),
  ])

  const targets = new Map<string, ShareTarget>()

  for (const row of fromPlaylists.data || []) {
    if (!row.user_id || row.user_id === currentUserId) continue
    targets.set(row.user_id, { user_id: row.user_id, username: row.username || "user" })
  }

  for (const row of fromLikes.data || []) {
    if (!row.user_id || row.user_id === currentUserId) continue
    if (!targets.has(row.user_id)) {
      targets.set(row.user_id, { user_id: row.user_id, username: row.username || "user" })
    }
  }

  for (const row of (fromProfiles.data as any[]) || []) {
    const userId = row?.user_id
    if (!userId || userId === currentUserId) continue
    if (!targets.has(userId)) {
      targets.set(userId, { user_id: userId, username: row?.username || "user" })
    }
  }

  for (const row of (fromUsers.data as any[]) || []) {
    const userId = row?.id
    if (!userId || userId === currentUserId) continue
    if (!targets.has(userId)) {
      const username = row?.username || usernameFromEmail(row?.email)
      targets.set(userId, { user_id: userId, username: username || "user" })
    }
  }

  for (const row of (fromUsersPublic.data as any[]) || []) {
    const userId = row?.id
    if (!userId || userId === currentUserId) continue
    if (!targets.has(userId)) {
      const username = row?.username || usernameFromEmail(row?.email)
      targets.set(userId, { user_id: userId, username: username || "user" })
    }
  }

  for (const row of (fromRpc.data as any[]) || []) {
    const userId = row?.user_id || row?.id
    if (!userId || userId === currentUserId) continue
    if (!targets.has(userId)) {
      const username = row?.username || usernameFromEmail(row?.email)
      targets.set(userId, { user_id: userId, username: username || "user" })
    }
  }

  if (fromPlaylists.error) console.error("Erro ao listar targets em playlists:", fromPlaylists.error)
  if (fromLikes.error) console.error("Erro ao listar targets em liked_tracks:", fromLikes.error)
  if (fromProfiles.error && fromProfiles.error.code !== "PGRST205") console.error("Erro ao listar targets em profiles:", fromProfiles.error)
  if (fromUsers.error && fromUsers.error.code !== "PGRST205") console.error("Erro ao listar targets em users:", fromUsers.error)
  if (fromUsersPublic.error && fromUsersPublic.error.code !== "PGRST205") console.error("Erro ao listar targets em users_public:", fromUsersPublic.error)
  if (fromRpc?.error && fromRpc.error.code !== "PGRST202") console.error("Erro ao listar targets via rpc:", fromRpc.error)

  return Array.from(targets.values()).sort((a, b) => a.username.localeCompare(b.username))
}

// Playlists
export async function getPlaylists(userId: string) {
  const { data: playlists, error } = await supabase
    .from("playlists")
    .select("id, name, user_id, username, created_at, tracks_json, image_url")
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

export async function createPlaylist(userId: string, name: string, imageUrl?: string) {
  const email = await getUserEmail(userId)
  const username = usernameFromEmail(email)

  const { data, error } = await supabase
    .from("playlists")
    .insert({
      user_id: userId,
      username,
      name,
      tracks_json: [],
      image_url: imageUrl || null,
    })
    .select("id, name, user_id, username, created_at, tracks_json, image_url")
    .single()

  if (error) {
    console.error("Erro ao criar playlist:", error)
    return null
  }

  return { ...data, tracks: Array.isArray(data.tracks_json) ? data.tracks_json : [] }
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

  if (error) console.error("Erro ao adicionar à playlist:", error)
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
