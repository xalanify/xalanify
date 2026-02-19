"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { supabase, getCurrentUser, signInWithEmail, signUpWithEmail, signOut as supaSignOut } from "./supabase"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
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
    await supaSignOut()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut: signOutFn }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
