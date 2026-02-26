import { initializeApp, getApps } from "firebase/app"
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
  serverTimestamp
} from "firebase/firestore"
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyAu4DYE5LlPxgWa4osMpJpVxAtsA8M1ru0",
  authDomain: "xalanify-61eda.firebaseapp.com",
  projectId: "xalanify-61eda",
  storageBucket: "xalanify-61eda.appspot.com",
  messagingSenderId: "932648497777",
  appId: "1:932648497777:web:abc123def456"
}

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)
export const auth = getAuth(app)

console.log("[FIREBASE] Initialized with project:", firebaseConfig.projectId)

// Collection names
const COLLECTIONS = {
  USERS: "users",
  PLAYLISTS: "playlists",
  LIKED_TRACKS: "liked_tracks"
}

// Helper to get current user
export async function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

// Types
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

// Sign in
export async function signInWithEmail(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return { data: result.user, error: null }
  } catch (error: any) {
    return { data: null, error: { message: error.message } }
  }
}

// Sign up
export async function signUpWithEmail(email: string, password: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return { data: result.user, error: null }
  } catch (error: any) {
    return { data: null, error: { message: error.message } }
  }
}

// Sign out
export async function signOut() {
  try {
    await firebaseSignOut(auth)
    return null
  } catch (error: any) {
    return error
  }
}

// Get user profile
export async function getMyProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId))
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile
    }
    // Create default profile
    const defaultProfile: UserProfile = {
      user_id: userId,
      username: userId.slice(0, 8),
      email: null,
      avatar_url: null,
      is_admin: false
    }
    await setDoc(doc(db, COLLECTIONS.USERS, userId), defaultProfile)
    return defaultProfile
  } catch (error) {
    console.error("[FIREBASE] getMyProfile error:", error)
    return null
  }
}

// Update username
export async function updateMyUsername(userId: string, username: string) {
  try {
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), { username })
    return { ok: true }
  } catch (error) {
    return { ok: false, reason: (error as Error).message }
  }
}

// Get liked tracks
export async function getLikedTracks(userId: string) {
  console.log("[FIREBASE] getLikedTracks for user:", userId)
  
  try {
    const q = query(
      collection(db, COLLECTIONS.LIKED_TRACKS),
      where("user_id", "==", userId),
      orderBy("created_at", "desc")
    )
    
    const snapshot = await getDocs(q)
    const tracks = snapshot.docs.map((d: any) => d.data().track_data).filter(Boolean)
    
    console.log("[FIREBASE] getLikedTracks SUCCESS:", tracks.length)
    return tracks
  } catch (error: any) {
    console.error("[FIREBASE] getLikedTracks ERROR:", error.message)
    return []
  }
}

// Check if track is liked
export async function isTrackLiked(userId: string, trackId: string) {
  try {
    const docRef = doc(db, COLLECTIONS.LIKED_TRACKS, `${userId}_${trackId}`)
    const docSnap = await getDoc(docRef)
    return docSnap.exists()
  } catch (error) {
    return false
  }
}

// Add liked track
export async function addLikedTrack(userId: string, track: any) {
  if (!track?.id) return false
  
  try {
    const docRef = doc(db, COLLECTIONS.LIKED_TRACKS, `${userId}_${track.id}`)
    await setDoc(docRef, {
      user_id: userId,
      track_id: track.id,
      track_data: track,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    })
    return true
  } catch (error: any) {
    console.error("[FIREBASE] addLikedTrack ERROR:", error.message)
    return false
  }
}

// Remove liked track
export async function removeLikedTrack(userId: string, trackId: string) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.LIKED_TRACKS, `${userId}_${trackId}`))
    return true
  } catch (error) {
    return false
  }
}

// Diagnostic
export async function diagnoseLikedTracks(userId: string) {
  try {
    const q = query(collection(db, COLLECTIONS.LIKED_TRACKS), where("user_id", "==", userId))
    const snapshot = await getDocs(q)
    return { count: snapshot.size, tracks: snapshot.docs.map((d: any) => d.data()) }
  } catch (error: any) {
    return { error: error.message, count: 0 }
  }
}

// Get playlists
export async function getPlaylists(userId: string) {
  console.log("[FIREBASE] getPlaylists for user:", userId)
  
  try {
    const q = query(
      collection(db, COLLECTIONS.PLAYLISTS),
      where("user_id", "==", userId),
      orderBy("created_at", "desc")
    )
    
    const snapshot = await getDocs(q)
    const playlists = snapshot.docs.map((d: any) => ({
      id: d.id,
      ...d.data(),
      tracks: d.data().tracks || []
    }))
    
    console.log("[FIREBASE] getPlaylists SUCCESS:", playlists.length)
    return playlists
  } catch (error: any) {
    console.error("[FIREBASE] getPlaylists ERROR:", error.message)
    return []
  }
}

// Create playlist
export async function createPlaylist(userId: string, name: string, imageUrl?: string) {
  const normalized = name.trim()
  if (!normalized) return null
  
  try {
    // Check if exists
    const q = query(
      collection(db, COLLECTIONS.PLAYLISTS),
      where("user_id", "==", userId),
      where("name", "==", normalized)
    )
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      const existing = snapshot.docs[0].data()
      return { ...existing, id: snapshot.docs[0].id, existed: true, tracks: existing.tracks || [] }
    }
    
    // Create new
    const playlistRef = doc(collection(db, COLLECTIONS.PLAYLISTS))
    const playlistData = {
      user_id: userId,
      name: normalized,
      tracks: [],
      image_url: imageUrl || null,
      created_at: serverTimestamp()
    }
    
    await setDoc(playlistRef, playlistData)
    return { ...playlistData, id: playlistRef.id, existed: false, tracks: [] }
  } catch (error: any) {
    console.error("[FIREBASE] createPlaylist ERROR:", error.message)
    return null
  }
}

// Delete playlist
export async function deletePlaylist(playlistId: string) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.PLAYLISTS, playlistId))
    return true
  } catch (error) {
    return false
  }
}

// Add track to playlist
export async function addTrackToPlaylist(playlistId: string, track: any) {
  try {
    const playlistDoc = await getDoc(doc(db, COLLECTIONS.PLAYLISTS, playlistId))
    if (!playlistDoc.exists()) return false
    
    const playlistData = playlistDoc.data()
    const tracks = playlistData.tracks || []
    
    if (tracks.some((t: any) => t.id === track.id)) return true
    
    const updatedTracks = [...tracks, track]
    await updateDoc(doc(db, COLLECTIONS.PLAYLISTS, playlistId), { tracks: updatedTracks })
    return true
  } catch (error) {
    return false
  }
}

// Remove track from playlist
export async function removeTrackFromPlaylist(playlistId: string, trackId: string) {
  try {
    const playlistDoc = await getDoc(doc(db, COLLECTIONS.PLAYLISTS, playlistId))
    if (!playlistDoc.exists()) return false
    
    const playlistData = playlistDoc.data()
    const tracks = playlistData.tracks || []
    const updatedTracks = tracks.filter((t: any) => t.id !== trackId)
    
    await updateDoc(doc(db, COLLECTIONS.PLAYLISTS, playlistId), { tracks: updatedTracks })
    return true
  } catch (error) {
    return false
  }
}

// Create playlist from share
export async function createPlaylistFromShare(userId: string, name: string, imageUrl?: string) {
  const existing = await getPlaylists(userId)
  const names = new Set(existing.map((p: any) => (p.name || "").toLowerCase()))
  
  const baseName = name?.trim() || "Playlist Partilhada"
  
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

// Import playlist
export async function importPlaylistById(userId: string, playlistId: string) {
  try {
    const playlistDoc = await getDoc(doc(db, COLLECTIONS.PLAYLISTS, playlistId))
    if (playlistDoc.exists()) {
      const playlistData = playlistDoc.data()
      return createPlaylistFromShare(userId, `${playlistData.name} (imported)`, playlistData.image_url)
    }
  } catch (error) {
    console.error("[FIREBASE] importPlaylistById error:", error)
  }
  return { success: false, error: "Playlist not found" }
}

// Placeholder functions
export async function listShareTargets(_currentUserId: string, _isAdmin = false) {
  return [] as ShareTarget[]
}

export async function searchShareTargets(_currentUserId: string, _query: string) {
  return [] as ShareTarget[]
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

export async function createShareRequest(_params: any) {
  return { ok: false as const, reason: "Partilha desativada nesta versao." }
}

export async function acceptShareRequest(_userId: string, _request: ShareRequest) {
  return false
}

export async function rejectShareRequest(_userId: string, _requestId: string) {
  return false
}
