// src/lib/supabase.ts

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn("Supabase credentials not found")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

  if (error) console.error("Erro ao carregar favoritos:", error)
  return data?.map((item: any) => item.track_data) || []
}

export async function addLikedTrack(userId: string, track: any) {
  const { error } = await supabase.from("liked_tracks").upsert(
    {
      user_id: userId,
      track_id: track.id,
      track_data: track,
    },
    { onConflict: "user_id,track_id" }
  )

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
    .select("id, name, user_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao carregar playlists:", error)
    return []
  }

  if (!playlists?.length) {
    return []
  }

  const playlistIds = playlists.map((playlist: any) => playlist.id)
  const { data: trackRows, error: tracksError } = await supabase
    .from("playlist_tracks")
    .select("playlist_id, track_data")
    .in("playlist_id", playlistIds)

  if (tracksError) {
    console.error("Erro ao carregar faixas das playlists:", tracksError)
    return playlists.map((playlist: any) => ({ ...playlist, tracks: [] }))
  }

  const tracksByPlaylist = new Map<string, any[]>()
  for (const row of trackRows || []) {
    const list = tracksByPlaylist.get(row.playlist_id) || []
    list.push(row.track_data)
    tracksByPlaylist.set(row.playlist_id, list)
  }

  return playlists.map((playlist: any) => ({
    ...playlist,
    tracks: tracksByPlaylist.get(playlist.id) || [],
  }))
}

export async function createPlaylist(userId: string, name: string) {
  const { data, error } = await supabase
    .from("playlists")
    .insert({
      user_id: userId,
      name,
    })
    .select("id, name, user_id, created_at")
    .single()

  if (error) {
    console.error("Erro ao criar playlist:", error)
    return null
  }

  return { ...data, tracks: [] }
}

export async function deletePlaylist(playlistId: string) {
  await supabase.from("playlist_tracks").delete().eq("playlist_id", playlistId)

  const { error } = await supabase.from("playlists").delete().eq("id", playlistId)

  if (error) console.error("Erro ao deletar playlist:", error)
  return !error
}

export async function addTrackToPlaylist(playlistId: string, track: any) {
  const { data: existing, error: fetchError } = await supabase
    .from("playlist_tracks")
    .select("id")
    .eq("playlist_id", playlistId)
    .eq("track_id", track.id)
    .maybeSingle()

  if (fetchError) {
    console.error("Erro ao buscar faixa da playlist:", fetchError)
    return false
  }

  if (existing) {
    return true
  }

  const { error } = await supabase.from("playlist_tracks").insert({
    playlist_id: playlistId,
    track_id: track.id,
    track_data: track,
  })

  if (error) console.error("Erro ao adicionar à playlist:", error)
  return !error
}

export async function removeTrackFromPlaylist(playlistId: string, trackId: string) {
  const { error } = await supabase
    .from("playlist_tracks")
    .delete()
    .eq("playlist_id", playlistId)
    .eq("track_id", trackId)

  if (error) console.error("Erro ao remover da playlist:", error)
  return !error
}
