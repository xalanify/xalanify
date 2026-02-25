// Utility to get user preferences from localStorage

export interface Preferences {
  showDebugMenu?: boolean
}

const SETTINGS_STORAGE_KEY = "xalanify.preferences"

export function getPreferences(): Preferences {
  if (typeof window === "undefined") return {}
  
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!stored) return {}
    return JSON.parse(stored) as Preferences
  } catch {
    return {}
  }
}

export function getShowDebugMenu(): boolean {
  const prefs = getPreferences()
  // Default to true for admin users, can be toggled off
  return prefs.showDebugMenu ?? true
}
