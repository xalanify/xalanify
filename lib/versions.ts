// Version and changelog management
// Auto-updates when version changes

export const APP_VERSION = "0.67.0"
export const APP_VERSION_DATE = "2026-01-21"

export interface AppUpdate {
  version: string
  date: string
  title: string
  changes: string[]
  isNew?: boolean
}

export const CHANGELOG: AppUpdate[] = [
  {
    version: "0.67.0",
    date: "2026-01-21",
    title: "Novo Design & Melhorias",
    changes: [
      "Design atualizado com sistema de cores (Bege #D2B48C, Cinzento #8E8E93)",
      "Glass cards com blur e bordas sutis",
      "Cards padronizados (76px altura, 18px raio)",
      "Inputs de login com estilo glass",
      "Barra de navegação com efeito glass",
      "Melhorias no background playback",
    ],
    isNew: true,
  },
  {
    version: "0.66.8",
    date: "2026-01-20",
    title: "Correções e Estabilidade",
    changes: [
      "Cards de playlist e favoritos com tamanho padronizado",
      "Histórico completo de atualizações nos Ajustes",
      "Sistema de auto-refresh ao iniciar a app",
      "Notificação automática de novas funcionalidades",
    ],
  },
  {
    version: "0.66.7",
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
    version: "0.66.6",
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
    version: "0.66.5",
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
    version: "0.66.4",
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
const FORCE_REFRESH_KEY = "xalanify.forceRefresh"

// Check if there's a new version compared to stored
export function checkForNewVersion(): AppUpdate | null {
  if (typeof window === "undefined") return null
  
  const storedVersion = localStorage.getItem(VERSION_KEY)
  
  // If no stored version, this is first visit
  if (!storedVersion) {
    return CHANGELOG[0]
  }
  
  // Compare versions - if different, there's an update
  if (storedVersion !== APP_VERSION) {
    return CHANGELOG[0]
  }
  
  return null
}

// Check if we need to force a page refresh
export function needsForceRefresh(): boolean {
  if (typeof window === "undefined") return false
  
  const shouldRefresh = localStorage.getItem(FORCE_REFRESH_KEY)
  return shouldRefresh === "true"
}

// Mark version as seen and clear force refresh flag
export function markVersionAsSeen() {
  if (typeof window !== "undefined") {
    localStorage.setItem(VERSION_KEY, APP_VERSION)
    localStorage.setItem(FORCE_REFRESH_KEY, "false")
  }
}

// Set force refresh flag
export function setForceRefresh() {
  if (typeof window !== "undefined") {
    localStorage.setItem(FORCE_REFRESH_KEY, "true")
  }
}

// Get what's new message
export function getWhatsNewMessage(): string {
  return CHANGELOG[0].changes.slice(0, 2).join(". ")
}

// Get full changelog for current version
export function getCurrentVersionChanges(): string[] {
  return CHANGELOG[0].changes
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
    
    // Set current version
    localStorage.setItem(VERSION_KEY, APP_VERSION)
    
    // Mark cache as cleared
    localStorage.setItem(CACHE_KEY, new Date().toISOString())
    
    console.log("[Xalanify] Cache cleared successfully")
  } catch (error) {
    console.error("[Xalanify] Error clearing cache:", error)
  }
}

// Smart version check - detects if version changed and triggers refresh
export async function smartVersionCheck(): Promise<{ hasUpdate: boolean; update: AppUpdate | null }> {
  if (typeof window === "undefined") {
    return { hasUpdate: false, update: null }
  }
  
  // Check if version changed
  const update = checkForNewVersion()
  const shouldForceRefresh = needsForceRefresh()
  
  if (update || shouldForceRefresh) {
    console.log("[Xalanify] 🔄 Version changed, triggering refresh...")
    
    // Clear cache to ensure fresh load
    clearAppCache()
    
    // Force reload without cache
    window.location.reload()
    
    return { hasUpdate: true, update }
  }
  
  return { hasUpdate: false, update: null }
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

