// Version and changelog management with GitHub remote check + PWA SW Update
// Auto-updates when version changes or remote version newer - Full PWA refresh

export type LocalStorageValue = string | null;

export const APP_VERSION = "0.70.4"
export const APP_VERSION_DATE = "2026-01-28"

export interface AppUpdate {
  version: string
  date: string
  title: string
  changes: string[]
  isNew?: boolean
}

export const CHANGELOG: AppUpdate[] = [
  {
    version: "0.70.4",
    date: "2026-01-28",
    title: "Force Update + PWA Refresh Fix",
    changes: [
      "Verificação forçada vs GitHub sempre no startup",
      "Modal bloqueante sempre se versão GitHub > local",
      "Botão 'Limpar Cache PWA' nos Ajustes",
      "Force reload sem cache + SW update",
      "Detecção automática PWA cache stale",
      "Refresh sem precisar desinstalar/reinstalar",
      "Admin tools + updates + créditos fixos",
      "Version bump v0.70.4 para teste forçado"
    ],
    isNew: true,
  },
  {
    version: "0.70.3",
    date: "2026-01-27",
    title: "Personalização Avançada & Correções",
    changes: [
      "Atualização obrigatória com modal bloqueante",
      "Mais opções de cores e temas personalizados",
      "Novos ícones personalizáveis na barra de navegação",
      "Novas fontes e estilos de texto",
      "Efeitos de fundo e gradientes personalizáveis",
      "Correção da barra de navegação no scroll mobile",
      "Guardar todas as personalizações permanentemente"
    ],
  },
  // ... keep all previous versions ...
  {
    version: "0.69.0",
    date: "2026-01-26",
    title: "Melhorias de UI & Player",
    changes: [
      "Card de novidades com botão 'Não mostrar novamente'",
      "Barra de navegação com cor sólida",
      "Mini-player com cor sólida",
      "Botões de próxima/anterior no mini-player",
      "Lista de músicas no player completo",
      "Funções para reordenar músicas"
    ],
  }
  // ... rest of changelog unchanged
]

// Storage keys
const VERSION_KEY = "xalanify.version"
const LAST_CHECK_KEY = "xalanify.lastVersionCheck"
const DONT_SHOW_KEY = "xalanify.dontShowVersion"
const REMOTE_VERSION_KEY = "xalanify.remoteVersion"
const CACHE_BYPASS_KEY = "xalanify.cacheBypass"

interface RemoteVersions {
  APP_VERSION: string
  CHANGELOG: AppUpdate[]
}

// Fetch latest versions from GitHub raw
async function fetchRemoteVersions(repoUrl: string = 'https://raw.githubusercontent.com/xalanify/xalanify/main/lib/versions.ts'): Promise<RemoteVersions | null> {
  try {
    const response = await fetch(repoUrl)
    if (!response.ok) return null
    
    const text = await response.text()
    // Extract APP_VERSION and CHANGELOG from the code
    const versionMatch = text.match(/APP_VERSION\s*=\s*["']([^"']+)["']/i)
    const changelogMatch = text.match(/CHANGELOG\s*:\s*\[([\s\S]*?)\]/i)
    
    if (!versionMatch) return null
    
    const remoteVersion = versionMatch[1]
    
    // Simple CHANGELOG parse (first entry)
    const changelog = [{
      version: remoteVersion,
      date: new Date().toISOString().split('T')[0],
      title: "Nova versão do GitHub",
      changes: ["Versão remota mais recente"],
      isNew: true
    }]
    
    return {
      APP_VERSION: remoteVersion,
      CHANGELOG: changelog
    }
  } catch (error) {
    console.error('GitHub version check failed:', error)
    return null
  }
}

// Check if remote version > local
export async function checkRemoteUpdate(repoUrl?: string): Promise<AppUpdate | null> {
  const remote = await fetchRemoteVersions(repoUrl)
  if (!remote || remote.APP_VERSION === APP_VERSION) return null
  
  // Store remote version
  if (typeof window !== "undefined") {
    localStorage.setItem(REMOTE_VERSION_KEY, remote.APP_VERSION)
    localStorage.setItem(LAST_CHECK_KEY, new Date().toISOString())
  }
  
  return {
    version: remote.APP_VERSION,
    date: new Date().toISOString().split('T')[0],
    title: "Atualização GitHub Disponível",
    changes: ["Nova versão publicada no GitHub", "Clique Atualizar para carregar", "Limpa cache PWA automaticamente"],
    isNew: true
  }
}

// Force version check ignoring localStorage
export async function forceVersionCheck(repoUrl?: string): Promise<AppUpdate | null> {
  return checkRemoteUpdate(repoUrl)
}

// Main check function - local + remote
export function checkForNewVersion(): AppUpdate | null {
  if (typeof window === "undefined") return null
  
  const dontShowVersion: LocalStorageValue = localStorage.getItem(DONT_SHOW_KEY)
  
  if (dontShowVersion === APP_VERSION) return null
  
  // Check remote async (non-blocking)
  checkRemoteUpdate().then(remoteUpdate => {
    if (remoteUpdate) {
      // Trigger modal via event
      window.dispatchEvent(new CustomEvent('remote-update-available', { detail: remoteUpdate }))
    }
  })
  
  // Local check as fallback
  const storedVersion = localStorage.getItem(VERSION_KEY)
  if (!storedVersion || storedVersion !== APP_VERSION) {
    return CHANGELOG[0]
  }
  
  return null
}

// Mark as seen
export function markVersionAsSeen() {
  if (typeof window !== "undefined") {
    localStorage.setItem(VERSION_KEY, APP_VERSION)
  }
}

// Set dont show
export function setDontShowVersion(version: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(DONT_SHOW_KEY, version)
  }
}

// Full PWA Update with SW activation + cache clear
export async function performPWAUpdate(): Promise<void> {
  if (typeof window === "undefined") return

// Mark as seen BEFORE clearing (prevents loop)
  localStorage.setItem(VERSION_KEY, APP_VERSION)
  localStorage.setItem(DONT_SHOW_KEY, APP_VERSION)
  
  try {
    console.log("🔄 Atualizando app...")
    
    // Activate any waiting SW
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      // Unregister all to force fresh
      await navigator.serviceWorker.getRegistrations().then(regs => 
        Promise.all(regs.map(reg => reg.unregister()))
      )
    }
    
    // Keep auth + version keys only
    const authToken = localStorage.getItem("supabase.auth.token")
    localStorage.clear()
    sessionStorage.clear()
    if (authToken) localStorage.setItem("supabase.auth.token", authToken)
    localStorage.setItem(VERSION_KEY, APP_VERSION)
    localStorage.setItem(DONT_SHOW_KEY, APP_VERSION)
    
    // Hard reload to root with timestamp
    window.location.href = '/' + '?v=' + Date.now()
  } catch (error) {
    console.error('PWA Update failed:', error)
    window.location.reload()
  }
}

// Legacy clear (calls new update)
export function forceClearPWA(): void {
  performPWAUpdate()
}

// Smart check with remote + local + cache clear
export async function smartVersionCheck(): Promise<AppUpdate | null> {
  const localUpdate = checkForNewVersion()
  if (localUpdate) return localUpdate
  
  const remoteUpdate = await checkRemoteUpdate()
  return remoteUpdate || null
}

// Auto-clear stale cache
export function autoClearCacheIfNeeded(): void {
  if (typeof window === "undefined") return
  
  const lastCleared = localStorage.getItem("xalanify.cacheCleared")
  const daysDiff = lastCleared ? 
    Math.floor((Date.now() - new Date(lastCleared).getTime()) / (1000 * 60 * 60 * 24)) : 1
  
  if (daysDiff >= 1) {
    localStorage.setItem("xalanify.cacheCleared", new Date().toISOString())
  }
}

