// Version and changelog management
// This file tracks all app updates

export const APP_VERSION = "1.1.0"
export const APP_VERSION_DATE = "2026-01-20"

export interface AppUpdate {
  version: string
  date: string
  title: string
  changes: string[]
  isNew?: boolean
}

export const CHANGELOG: AppUpdate[] = [
  {
    version: "1.1.0",
    date: "2026-01-20",
    title: "Melhorias e Atualizações",
    changes: [
      "Cards de playlist e favoritos com tamanho padronizado",
      "Histórico completo de atualizações nos Ajustes",
      "Sistema de auto-refresh ao iniciar a app",
      "Notificação automática de novas funcionalidades",
      "Limpeza automática de cache ao entrar na app",
    ],
    isNew: true,
  },
  {
    version: "1.0.0",
    date: "2026-01-15",
    title: "Correção do Sistema de Reprodução",
    changes: [
      "Sistema de streaming via API proxy (resolve CORS)",
      "Reprodução direta de áudio do YouTube",
      "Fallback automático para YouTube Embed",
      "Melhoria na estabilidade da reprodução",
    ],
  },
  {
    version: "0.9.0",
    date: "2026-01-10",
    title: "Busca Integrada",
    changes: [
      "Busca simultânea Spotify + YouTube",
      "Filtros por fonte (All/Spotify/YouTube)",
      "Badges visuais para cada fonte",
      "Preview de músicas Spotify",
    ],
  },
  {
    version: "0.8.0",
    date: "2026-01-05",
    title: "Biblioteca e Playlists",
    changes: [
      "Criação de playlists",
      "Favoritos",
      "Importar playlists por ID",
      "Menu de opções para músicas",
    ],
  },
  {
    version: "0.7.0",
    date: "2025-12-20",
    title: "UI e Personalização",
    changes: [
      "Temas coloridos",
      "Player completo e mini player",
      "Media Session API",
      "Design refinado",
    ],
  },
]

// Storage keys
const VERSION_KEY = "xalanify.version"
const CACHE_KEY = "xalanify.cacheCleared"

// Check if there's a new version
export function checkForNewVersion(): AppUpdate | null {
  if (typeof window === "undefined") return null
  
  const storedVersion = localStorage.getItem(VERSION_KEY)

  if (!storedVersion) {
    // First visit - show what's new
    return CHANGELOG[0]
  }

  if (storedVersion !== APP_VERSION) {
    return CHANGELOG[0]
  }

  return null
}

// Mark version as seen
export function markVersionAsSeen() {
  if (typeof window !== "undefined") {
    localStorage.setItem(VERSION_KEY, APP_VERSION)
  }
}

// Get what's new message
export function getWhatsNewMessage(): string {
  return CHANGELOG[0].changes.slice(0, 2).join(". ")
}

// Clear all app caches (localStorage, sessionStorage)
export function clearAppCache(): void {
  if (typeof window === "undefined") return
  
  try {
    // Clear localStorage except for auth data
    const authToken = localStorage.getItem("supabase.auth.token")
    const themePrefs = localStorage.getItem("xalanify.theme")
    const prefs = localStorage.getItem("xalanify.preferences")
    
    localStorage.clear()
    
    // Restore essential data
    if (authToken) localStorage.setItem("supabase.auth.token", authToken)
    if (themePrefs) localStorage.setItem("xalanify.theme", themePrefs)
    if (prefs) localStorage.setItem("xalanify.preferences", prefs)
    if (VERSION_KEY) localStorage.setItem(VERSION_KEY, APP_VERSION)
    
    // Mark cache as cleared
    localStorage.setItem(CACHE_KEY, new Date().toISOString())
    
    console.log("[Xalanify] Cache cleared successfully")
  } catch (error) {
    console.error("[Xalanify] Error clearing cache:", error)
  }
}

// Check if cache should be cleared (once per day)
export function shouldClearCache(): boolean {
  if (typeof window === "undefined") return false
  
  const lastCleared = localStorage.getItem(CACHE_KEY)
  if (!lastCleared) return true
  
  const lastDate = new Date(lastCleared)
  const now = new Date()
  const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
  
  return daysDiff >= 1
}

// Auto-clear cache if needed
export function autoClearCacheIfNeeded(): void {
  if (shouldClearCache()) {
    clearAppCache()
  }
}

