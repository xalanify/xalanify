"use client"

export interface UserPreferences {
  autoRetry: boolean
}

const PREFERENCES_KEY = "xalanify.preferences"

export function getPreferences(): UserPreferences {
  if (typeof window === "undefined") {
    return { autoRetry: true }
  }
  
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Migração: remove retryMethod antigo se existir
      const { retryMethod, ...rest } = parsed
      return { autoRetry: true, ...rest }
    }
  } catch {
    // Ignore
  }
  
  return { autoRetry: true }
}

export function setPreferences(prefs: Partial<UserPreferences>) {
  if (typeof window === "undefined") return
  
  const current = getPreferences()
  const updated = { ...current, ...prefs }
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated))
}

// Função helper para compatibilidade (sempre retorna false)
export function getShowDebugMenu(): boolean {
  return false
}
