// Simplified supabase functions for debugging
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getPlaylists(userId: string) {
  console.log("[getPlaylists] Starting with userId:", userId)
  
  try {
    const result = await supabase
      .from("playlists")
      .select("*")
      .eq("user_id", userId)
    
    console.log("[getPlaylists] Result:", result)
    return result.data || []
  } catch (e) {
    console.error("[getPlaylists] Error:", e)
    return []
  }
}

export async function getLikedTracks(userId: string) {
  console.log("[getLikedTracks] Starting with userId:", userId)
  
  try {
    const result = await supabase
      .from("liked_tracks")
      .select("*")
      .eq("user_id", userId)
    
    console.log("[getLikedTracks] Result:", result)
    return result.data || []
  } catch (e) {
    console.error("[getLikedTracks] Error:", e)
    return []
  }
}

export async function createPlaylist(userId: string, name: string) {
  console.log("[createPlaylist] Starting with:", { userId, name })
  
  try {
    const result = await supabase
      .from("playlists")
      .insert({ user_id: userId, name: name, tracks_json: [] })
      .select()
    
    console.log("[createPlaylist] Result:", result)
    return result.data?.[0] || null
  } catch (e) {
    console.error("[createPlaylist] Error:", e)
    return null
  }
}

export async function addLikedTrack(userId: string, track: any) {
  console.log("[addLikedTrack] Starting with:", { userId, trackId: track?.id })
  
  try {
    const result = await supabase
      .from("liked_tracks")
      .insert({ 
        user_id: userId, 
        track_id: track.id,
        track_data: track
      })
      .select()
    
    console.log("[addLikedTrack] Result:", result)
    return !result.error
  } catch (e) {
    console.error("[addLikedTrack] Error:", e)
    return false
  }
}
