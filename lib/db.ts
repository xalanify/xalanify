// Simple, fast Firebase database - inspired by Spotify/Musify
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot,
  type QuerySnapshot,
  type DocumentData
} from "firebase/firestore"
import { auth } from "./supabase"

const db = getFirestore()

// Collections
const COLLECTIONS = {
  PLAYLISTS: "playlists",
  LIKED_TRACKS: "liked_tracks",
  USERS: "users"
}

// Types
export interface Playlist {
  id: string
  name: string
  tracks: any[]
  image_url?: string | null
  user_id: string
  created_at?: any
}

export interface LikedTrack {
  id: string
  user_id: string
  track_id: string
  track_data: any
  created_at?: any
}

// Get current user ID safely
function getCurrentUserId(): string | null {
  return auth.currentUser?.uid || null
}

// Real-time playlists listener - updates instantly like Spotify
export function subscribeToPlaylists(
  userId: string, 
  onUpdate: (playlists: Playlist[]) => void,
  onError?: (error: Error) => void
) {
  console.log("[DB] Subscribing to playlists for:", userId)
  
  const q = query(
    collection(db, COLLECTIONS.PLAYLISTS),
    where("user_id", "==", userId)
  )


  return onSnapshot(q, 
    (snapshot: QuerySnapshot<DocumentData>) => {
      const playlists = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tracks: doc.data().tracks || []
      })) as Playlist[]
      
      console.log("[DB] Playlists updated:", playlists.length)
      onUpdate(playlists)
    },
    (error) => {
      console.error("[DB] Playlists subscription error:", error)
      onError?.(error)
    }
  )
}

// Real-time liked tracks listener
export function subscribeToLikedTracks(
  userId: string,
  onUpdate: (tracks: any[]) => void,
  onError?: (error: Error) => void
) {
  console.log("[DB] Subscribing to liked tracks for:", userId)
  
  const q = query(
    collection(db, COLLECTIONS.LIKED_TRACKS),
    where("user_id", "==", userId)
  )


  return onSnapshot(q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const tracks = snapshot.docs
        .map(doc => doc.data().track_data)
        .filter(Boolean)
      
      console.log("[DB] Liked tracks updated:", tracks.length)
      onUpdate(tracks)
    },
    (error) => {
      console.error("[DB] Liked tracks subscription error:", error)
      onError?.(error)
    }
  )
}

// Create playlist - simple and fast
export async function createPlaylist(name: string, imageUrl?: string): Promise<Playlist | null> {
  const userId = getCurrentUserId()
  if (!userId || !name.trim()) return null

  try {
    // Check for duplicate
    const q = query(
      collection(db, COLLECTIONS.PLAYLISTS),
      where("user_id", "==", userId),
      where("name", "==", name.trim())
    )
    const existing = await getDocs(q)
    
    if (!existing.empty) {
      const doc = existing.docs[0]
      return { ...doc.data(), id: doc.id, tracks: doc.data().tracks || [] } as Playlist
    }

    // Create new
    const ref = doc(collection(db, COLLECTIONS.PLAYLISTS))
    const playlist: Omit<Playlist, "id"> = {
      user_id: userId,
      name: name.trim(),
      tracks: [],
      image_url: imageUrl || null,
      created_at: serverTimestamp()
    }
    
    await setDoc(ref, playlist)
    
    return { ...playlist, id: ref.id, tracks: [] } as Playlist
  } catch (error) {
    console.error("[DB] Create playlist error:", error)
    return null
  }
}

// Delete playlist
export async function deletePlaylist(playlistId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.PLAYLISTS, playlistId))
    return true
  } catch (error) {
    console.error("[DB] Delete playlist error:", error)
    return false
  }
}

// Add track to playlist
export async function addTrackToPlaylist(playlistId: string, track: any): Promise<boolean> {
  try {
    const ref = doc(db, COLLECTIONS.PLAYLISTS, playlistId)
    const snap = await getDoc(ref)
    
    if (!snap.exists()) return false
    
    const data = snap.data()
    const tracks = data.tracks || []
    
    if (tracks.some((t: any) => t.id === track.id)) return true
    
    await updateDoc(ref, { tracks: [...tracks, track] })
    return true
  } catch (error) {
    console.error("[DB] Add track error:", error)
    return false
  }
}

// Remove track from playlist
export async function removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<boolean> {
  try {
    const ref = doc(db, COLLECTIONS.PLAYLISTS, playlistId)
    const snap = await getDoc(ref)
    
    if (!snap.exists()) return false
    
    const data = snap.data()
    const tracks = data.tracks || []
    
    await updateDoc(ref, { 
      tracks: tracks.filter((t: any) => t.id !== trackId) 
    })
    return true
  } catch (error) {
    console.error("[DB] Remove track error:", error)
    return false
  }
}

// Like track - simple
export async function likeTrack(track: any): Promise<boolean> {
  const userId = getCurrentUserId()
  if (!userId || !track?.id) return false

  try {
    const id = `${userId}_${track.id}`
    await setDoc(doc(db, COLLECTIONS.LIKED_TRACKS, id), {
      user_id: userId,
      track_id: track.id,
      track_data: track,
      created_at: serverTimestamp()
    })
    return true
  } catch (error) {
    console.error("[DB] Like track error:", error)
    return false
  }
}

// Unlike track - remove from liked
export async function unlikeTrack(trackId: string): Promise<boolean> {
  const userId = getCurrentUserId()
  if (!userId || !trackId) return false

  try {
    const id = `${userId}_${trackId}`
    await deleteDoc(doc(db, COLLECTIONS.LIKED_TRACKS, id))
    return true
  } catch (error) {
    console.error("[DB] Unlike track error:", error)
    return false
  }
}


// Check if track is liked
export async function isTrackLiked(trackId: string): Promise<boolean> {
  const userId = getCurrentUserId()
  if (!userId) return false

  try {
    const snap = await getDoc(doc(db, COLLECTIONS.LIKED_TRACKS, `${userId}_${trackId}`))
    return snap.exists()
  } catch (error) {
    return false
  }
}

// Get all liked tracks for current user (one-time fetch)
export async function getLikedTracks(userId: string): Promise<any[]> {
  if (!userId) return []

  try {
    const q = query(
      collection(db, COLLECTIONS.LIKED_TRACKS),
      where("user_id", "==", userId)
    )
    
    const snapshot = await getDocs(q)
    const tracks = snapshot.docs
      .map(doc => doc.data().track_data)
      .filter(Boolean)
    
    console.log("[DB] getLikedTracks:", tracks.length)
    return tracks
  } catch (error) {
    console.error("[DB] getLikedTracks error:", error)
    return []
  }
}
