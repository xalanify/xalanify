import { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  useRef, 
  ReactNode 
} from 'react'
import { toast } from "sonner"
// getPlaylists added to db.ts
import { useAuth } from './auth-context'
import { subscribeToPlaylists, subscribeToLikedTracks } from './db'

// Types - from db.ts
export interface Playlist {
  id: string
  name: string
  tracks: any[]
  image_url?: string | null
  user_id: string
  created_at?: any
}

export type TrackData = any

interface FirestoreData {
  playlists: Playlist[]
  likedTracks: TrackData[]
  loading: boolean
  error: string | null
}

// Context
const FirestoreContext = createContext<FirestoreData | null>(null)
const FirestoreUpdateContext = createContext<() => void>(() => {})

export function useFirestore() {
  const context = useContext(FirestoreContext)
  if (!context) throw new Error('useFirestore must be used within FirestoreProvider')
  return context
}

export function useFirestoreUpdate() {
  const context = useContext(FirestoreUpdateContext)
  if (!context) throw new Error('useFirestoreUpdate must be used within FirestoreProvider')
  return context
}

// Provider - SINGLE subscription point
export function FirestoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [data, setData] = useState<FirestoreData>({
    playlists: [],
    likedTracks: [],
    loading: true,
    error: null
  })
  
  const unsubsRef = useRef<(() => void)[]>([])

  useEffect(() => {
    const userId = user?.uid
    if (!userId) return

    console.log('[Firestore] Starting subscriptions for:', userId)
    setData(prev => ({ ...prev, loading: true, error: null }))

    // Clear old subs
    unsubsRef.current.forEach(unsub => unsub())
    unsubsRef.current = []

    // Playlists sub - FORCE REFETCH every 2s if empty
    const unsubPlaylists = subscribeToPlaylists(userId, (playlists) => {
      console.log('[Firestore] Playlists FULL:', playlists)
      setData(prev => ({ ...prev, playlists }))
    }, (err) => {
      console.error('[Firestore] Playlists error:', err)
      setData(prev => ({ ...prev, error: 'Playlists failed: ' + err.message, loading: false }))
    })
    unsubsRef.current.push(unsubPlaylists)

    // Liked tracks sub
    const unsubLiked = subscribeToLikedTracks(userId, (tracks) => {
      console.log('[Firestore] Liked FULL:', tracks.length, tracks.slice(0,2))
      setData(prev => ({ ...prev, likedTracks: tracks }))
    }, (err) => {
      console.error('[Firestore] Liked error:', err)
      setData(prev => ({ ...prev, error: 'Favorites failed: ' + err.message, loading: false }))
    })
    unsubsRef.current.push(unsubLiked)

    // FORCE REFETCH if playlists empty after 3s
    const forceRefetch = setTimeout(() => {
      if (data.playlists.length === 0) {
        console.log('[Firestore] FORCE REFETCH - playlists empty!')
        toast.info('🔄 Verificando playlists...', { duration: 2000 })
      }
    }, 3000)

    // FALLBACK: One-time fetch if subscription fails
    const fallbackTimer = setTimeout(() => {
      if (data.playlists.length === 0 && !data.error) {
        console.log('[Firestore] FALLBACK: getPlaylists one-time fetch')
        import('./db').then(module => module.getPlaylists(userId))
          .then(playlists => {
            console.log('[Firestore] FALLBACK got:', playlists.length)
            if (playlists.length > 0) {
              setData(prev => ({ ...prev, playlists }))
            }
          }).catch(err => {
            console.error('[Firestore] FALLBACK error:', err)
          })
      }
    }, 5000)

    // Loading done
    setTimeout(() => {
      setData(prev => ({ ...prev, loading: false }))
    }, 1000)

    return () => {
      console.log('[Firestore] Cleaning up')
      unsubsRef.current.forEach(unsub => unsub())
      unsubsRef.current = []
    }
  }, [user?.uid])

  const refresh = () => {
    console.log('[Firestore] Manual refresh')
    setData(prev => ({ ...prev, loading: true }))
    setTimeout(() => setData(prev => ({ ...prev, loading: false })), 500)
  }

  return (
    <FirestoreContext.Provider value={data}>
      <FirestoreUpdateContext.Provider value={refresh}>
        {children}
      </FirestoreUpdateContext.Provider>
    </FirestoreContext.Provider>
  )
}

