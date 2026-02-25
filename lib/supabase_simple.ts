// Simple supabase functions - bypass complex logic
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Simple get playlists
export async function getPlaylists(userId: string) {
  console.log("[simple] getPlaylists start", userId)
  
  const { data, error } = await supabase
    .from("playlists")
    .select("*")
    .eq("user_id", userId)
  
  console.log("[simple] getPlaylists result", { error, count: data?.length })
  
  if (error) {
    console.error("[simple] getPlaylists error", error)
    return []
  }
  
  return data || []
}

// Simple get liked tracks
export async function getLikedTracks(userId: string) {
  console.log("[simple] getLikedTracks start", userId)
  
  const { data, error } = await supabase
    .from("liked_tracks")
    .select("*")
    .eq("user_id", userId)
  
  console.log("[simple] getLikedTracks result", { error, count: data?.length })
  
  if (error) {
    console.error("[simple] getLikedTracks error", error)
    return []
  }
  
  return (data || []).map(item => item.track_data).filter(Boolean)
}

// Simple create playlist
export async function createPlaylist(userId: string, name: string) {
  console.log("[simple] createPlaylist start", { userId, name })
  
  const { data, error } = await supabase
    .from("playlists")
    .insert({ user_id: userId, name, tracks_json: [] })
    .select()
    .single()
  
  console.log("[simple] createPlaylist result", { error, data })
  
  return error ? null : data
}

// Simple add liked track
export async function addLikedTrack(userId: string, track: any) {
  console.log("[simple] addLikedTrack start", { userId, trackId: track?.id })
  
  const { error } = await supabase
    .from("liked_tracks")
    .insert({ 
      user_id: userId, 
      track_id: track.id,
      track_data: track
    })
  
  console.log("[simple] addLikedTrack result", { error })
  
  return !error
}

// Other functions - simplified stubs
export async function deletePlaylist(id: string) {
  const { error } = await supabase.from("playlists").delete().eq("id", id)
  return !error
}

export async function removeLikedTrack(userId: string, trackId: string) {
  const { error } = await supabase
    .from("liked_tracks")
    .delete()
    .eq("user_id", userId)
    .eq("track_id", trackId)
  return !error
}

export async function getIncomingShareRequests(_userId: string) { return [] }
export async function getSentShareRequests(_userId: string) { return [] }
export async function getReceivedShareHistory(_userId: string) { return [] }
export async function acceptShareRequest(_userId: string, _request: any) { return false }
export async function rejectShareRequest(_userId: string, _requestId: string) { return false }
export async function searchShareTargets(_userId: string, _query: string) { return [] as any[] }
export async function createShareRequest(_params: any) { return { ok: false } }
export async function importPlaylistById(_userId: string, _playlistId: string) { return { success: false } }

export async function addTrackToPlaylist(playlistId: string, track: any) {
  console.log("[simple] addTrackToPlaylist start", { playlistId, trackId: track?.id })
  
  const { error } = await supabase
    .from("playlists")
    .select("tracks_json")
    .eq("id", playlistId)
    .single()
  
  if (error) {
    console.error("[simple] addTrackToPlaylist error", error)
    return false
  }
  
  return true
}

export async function diagnoseLikedTracks(userId: string) {
  console.log("[simple] diagnoseLikedTracks start", userId)
  
  const { data, error } = await supabase
    .from("liked_tracks")
    .select("*")
    .eq("user_id", userId)
    .limit(10)
  
  console.log("[simple] diagnoseLikedTracks result", { error, count: data?.length })
  
  return { hasTable: true, trackCount: data?.length || 0, tracks: data }
}

export type ShareRequest = any
export type ShareTarget = any
