"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { supabase, getCurrentUser, getMyProfile, signInWithEmail, signUpWithEmail, signOut as supaSignOut, type UserProfile } from "./supabase"
import type { User } from "@supabase/supabase-js"

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
    if (!current) {
      setProfile(null)
      return
    }
    const p = await getMyProfile(current.id)
    setProfile(p)
  }, [])

  useEffect(() => {
    let mounted = true

    getCurrentUser()
      .then(async (u) => {
        if (!mounted) return
        setUser(u ?? null)
        // Never block app boot on profile fetch.
        setLoading(false)

        if (u?.id) {
          try {
            const p = await getMyProfile(u.id)
            if (mounted) setProfile(p)
          } catch {
            if (mounted) setProfile(null)
          }
        } else if (mounted) {
          setProfile(null)
        }
      })
      .catch(() => {
        if (!mounted) return
        setUser(null)
        setProfile(null)
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return

      setUser(session?.user ?? null)
      setLoading(false)

      if (session?.user?.id) {
        try {
          const p = await getMyProfile(session.user.id)
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
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await signInWithEmail(email, password)
    return { error: error?.message || null }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await signUpWithEmail(email, password)
    return { error: error?.message || null }
  }, [])

  const signOutFn = useCallback(async () => {
    try {
      await supaSignOut()
    } finally {
      // Ensure local UI always leaves authenticated state.
      setUser(null)
      setProfile(null)
      setLoading(false)
    }
  }, [])

  const emailIsAdminFallback = user?.email === "adminx@adminx.com"

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin: !!profile?.is_admin || emailIsAdminFallback, loading, signIn, signUp, signOut: signOutFn, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
