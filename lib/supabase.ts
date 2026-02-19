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
