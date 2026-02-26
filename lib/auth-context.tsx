"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { getCurrentUser, getMyProfile, signInWithEmail, signUpWithEmail, signOut as firebaseSignOut, type UserProfile } from "./supabase"
import { auth } from "./supabase"
import { onAuthStateChanged, type User } from "firebase/auth"

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    const current = await getCurrentUser()
    if (!current?.uid) return
    const p = await getMyProfile(current.uid)
    setProfile(p)
  }, [])

  useEffect(() => {
    let mounted = true

    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return
      
      setUser(firebaseUser)
      setLoading(false)

      if (firebaseUser?.uid) {
        try {
          const p = await getMyProfile(firebaseUser.uid)
          if (mounted) setProfile(p)
        } catch {
          if (mounted) setProfile(null)
        }
      } else if (mounted) {
        setProfile(null)
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await signInWithEmail(email, password)
    if (!error) await refreshProfile().catch(() => {})
    return { error: error?.message || null }
  }, [refreshProfile])

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await signUpWithEmail(email, password)
    if (!error) await refreshProfile().catch(() => {})
    return { error: error?.message || null }
  }, [refreshProfile])

  const signOutFn = useCallback(async () => {
    setUser(null)
    setProfile(null)
    setLoading(false)
    await firebaseSignOut().catch(() => {})
  }, [])

  // Simple admin check - customize as needed
  const emailIsAdminFallback = user?.email === "adminx@adminx.com"
  const profileIsAdmin = profile?.is_admin === true
  const isAdmin = profileIsAdmin || emailIsAdminFallback

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, signIn, signUp, signOut: signOutFn, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
