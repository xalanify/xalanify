"use client"

import { useEffect, useState } from "react"
import { Search, Settings, Library, Sparkles } from "lucide-react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { PlayerProvider, usePlayer, type Track } from "@/lib/player-context"
import { ThemeProvider, useTheme } from "@/lib/theme-context"
import LoginScreen from "@/components/login-screen"
import SearchTab from "@/components/search-tab"
import LibraryTab from "@/components/library-tab"
import SettingsTab from "@/components/settings-tab"
import MiniPlayer from "@/components/mini-player"
import FullPlayer from "@/components/full-player"
import AudioEngine from "@/components/audio-engine"
import TrackMenu from "@/components/track-menu"
import { Toaster } from "@/components/ui/sonner"
import { getPlaylists } from "@/lib/supabase"
import { 
  checkForNewVersion, 
  markVersionAsSeen, 
  autoClearCacheIfNeeded,
  smartVersionCheck,
  type AppUpdate
} from "@/lib/versions"

function SplashScreen({ accentHex }: { accentHex: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[#000000]">
      <div 
        className="h-16 w-16 animate-spin rounded-full border-4 border-white/10"
        style={{ borderTopColor: accentHex }}
      />
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-[#D2B48C]">Xalanify</h1>
        <p className="mt-3 text-sm tracking-[0.3em] text-[#8E8E93] uppercase">Em Desenvolvimento</p>
      </div>
    </div>
  )
}

// What's New Modal with glass card style
function WhatsNewModal({ 
  update, 
  onClose 
}: { 
  update: AppUpdate
  onClose: () => void 
}) {
  const { accentHex } = useTheme()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
      <div className="w-full max-w-sm rounded-[18px] glass-card p-6 animate-in fade-in zoom-in duration-300">
        {/* Header with icon */}
        <div className="flex items-center justify-center mb-4">
          <div 
            className="h-16 w-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${accentHex}30` }}
          >
            <Sparkles className="h-8 w-8" style={{ color: accentHex }} />
          </div>
        </div>

        {/* Title and version */}
        <div className="text-center mb-2">
          <h2 className="text-xl font-bold text-[#D2B48C] mb-1">Nova Versão!</h2>
          <p className="text-sm" style={{ color: accentHex }}>v{update.version}</p>
        </div>

        {/* Version title */}
        <h3 className="text-center text-[#8E8E93] font-medium mb-4">{update.title}</h3>

        {/* Changes list */}
        <div className="space-y-2 mb-6 max-h-[200px] overflow-y-auto">
          {update.changes.map((change, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-[#8E8E93] mt-1">•</span>
              <p className="text-sm text-[#D2B48C]/80">{change}</p>
            </div>
          ))}
        </div>

        {/* Continue button */}
        <button
          onClick={onClose}
          className="w-full rounded-xl py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: accentHex }}
        >
          Continuar
        </button>
      </div>
    </div>
  )
}

function XalanifyApp() {
  const { user, loading } = useAuth()
  const { currentTrack } = usePlayer()
  const { accentHex } = useTheme()
  const [activeTab, setActiveTab] = useState<"search" | "library" | "settings">("search")
  const [showFullPlayer, setShowFullPlayer] = useState(false)
  const [menuTrack, setMenuTrack] = useState<Track | null>(null)
  const [menuAnchorRect, setMenuAnchorRect] = useState<DOMRect | null>(null)
  const [showSplash, setShowSplash] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Track[]>([])
  const [libraryKey, setLibraryKey] = useState(0)
  const [userPlaylists, setUserPlaylists] = useState<{id: string, name: string}[]>([])
  const [showWhatsNew, setShowWhatsNew] = useState(false)
  const [currentUpdate, setCurrentUpdate] = useState<AppUpdate | null>(null)

  // Smart version check on app start
  useEffect(() => {
    // First, do auto clear cache
    autoClearCacheIfNeeded()
    
    // Then check for version changes
    const initApp = async () => {
      // Check if we need to force refresh (version changed)
      const result = await smartVersionCheck()
      
      // If no refresh needed, check for new version to show modal
      if (!result.hasUpdate) {
        const update = checkForNewVersion()
        if (update) {
          setCurrentUpdate(update)
          setShowWhatsNew(true)
          markVersionAsSeen()
        }
      }
    }
    
    initApp()
  }, [])

  // Check version on app focus (when user returns to app)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // App became visible - check for updates
        const update = checkForNewVersion()
        if (update && !showWhatsNew) {
          setCurrentUpdate(update)
          setShowWhatsNew(true)
          markVersionAsSeen()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [showWhatsNew])

  // Fetch user playlists for track menu
  useEffect(() => {
    if (user?.uid) {
      getPlaylists(user.uid).then((data: any) => {
        if (data && Array.isArray(data)) {
          setUserPlaylists(data.map((p: any) => ({ id: p.id, name: p.name })))
        }
      })
    }
  }, [user, libraryKey])

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  function handleWhatsNewClose() {
    setShowWhatsNew(false)
    setCurrentUpdate(null)
  }

  if (showSplash || loading) return <SplashScreen accentHex={accentHex} />
  if (!user) return <LoginScreen />

  const tabs = [
    { id: "search" as const, label: "Pesquisar", icon: Search },
    { id: "library" as const, label: "Biblioteca", icon: Library },
    { id: "settings" as const, label: "Ajustes", icon: Settings },
  ]

  function handleLibraryUpdate() {
    setLibraryKey(prev => prev + 1)
  }

  return (
    <div className="relative flex h-dvh min-h-0 flex-col overflow-hidden bg-[#000000] text-[#D2B48C]">
      <AudioEngine />
      <Toaster position="top-center" richColors />

      {/* What's New Modal */}
      {showWhatsNew && currentUpdate && (
        <WhatsNewModal 
          update={currentUpdate} 
          onClose={handleWhatsNewClose} 
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 overflow-y-auto ${currentTrack ? "pb-[160px]" : "pb-[100px]"}`}>
        {activeTab === "search" && (
          <SearchTab
            onTrackMenu={(track, rect) => {
              setMenuTrack(track)
              setMenuAnchorRect(rect)
            }}
            query={searchQuery}
            setQuery={setSearchQuery}
            results={searchResults}
            setResults={setSearchResults}
          />
        )}
        {activeTab === "library" && <LibraryTab key={libraryKey} />}
        {activeTab === "settings" && <SettingsTab />}
      </div>

      {/* Bottom Player + Navigation - Glass Tab Bar */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        {currentTrack && (
          <MiniPlayer 
            onExpand={() => setShowFullPlayer(true)} 
          />
        )}
        
        {/* Navigation - Glass Effect Tab Bar */}
        <nav className="mx-4 mb-4 flex items-center justify-around rounded-2xl glass-card px-2 py-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center gap-1.5 px-6 py-2 transition-all duration-200 active:scale-95 rounded-xl"
                style={{ 
                  backgroundColor: isActive ? `${accentHex}20` : "transparent",
                }}
                aria-label={tab.label}
              >
                <tab.icon 
                  className="h-5 w-5 transition-colors" 
                  style={{ color: isActive ? accentHex : "#8E8E93" }} 
                />
                <span 
                  className="text-[11px] font-medium transition-colors"
                  style={{ color: isActive ? accentHex : "#8E8E93" }}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Modals */}
      {showFullPlayer && (
        <FullPlayer 
          onClose={() => setShowFullPlayer(false)} 
        />
      )}
      {menuTrack && (
        <TrackMenu 
          track={menuTrack} 
          anchorRect={menuAnchorRect} 
          onClose={() => { setMenuTrack(null); setMenuAnchorRect(null) }}
          onLibraryUpdate={handleLibraryUpdate}
          playlists={userPlaylists}
        />
      )}
    </div>
  )
}

export default function Page() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <ThemeProvider>
          <XalanifyApp />
        </ThemeProvider>
      </PlayerProvider>
    </AuthProvider>
  )
}

