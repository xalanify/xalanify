"use client"

import { useEffect, useState } from "react"
import { Search, Settings, Library, X, Sparkles } from "lucide-react"
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
import { APP_VERSION, checkForNewVersion, markVersionAsSeen, autoClearCacheIfNeeded, smartVersionCheck, setDontShowVersion, type AppUpdate } from "@/lib/versions"

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

// WhatsNew Modal Component
function WhatsNewModal({ update, onClose }: { update: AppUpdate; onClose: () => void }) {
  const { accentHex } = useTheme()

  function handleDontShow() {
    setDontShowVersion(update.version)
    markVersionAsSeen()
    onClose()
  }

  function handleOk() {
    markVersionAsSeen()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleOk}
      />
      
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-sm rounded-3xl border p-6 animate-in fade-in zoom-in-95 duration-200"
        style={{ 
          backgroundColor: "#1a1a1a",
          borderColor: `${accentHex}30`
        }}
      >
        {/* Close button */}
        <button
          onClick={handleOk}
          className="absolute right-4 top-4 rounded-full p-1.5 text-[#8E8E93] hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div 
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${accentHex}20` }}
          >
            <Sparkles className="h-6 w-6" style={{ color: accentHex }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#f0e0d0]">Novidades!</h2>
            <p className="text-sm text-[#8E8E93]">Versão {update.version}</p>
          </div>
        </div>

        {/* Title */}
        <h3 
          className="text-lg font-semibold mb-4"
          style={{ color: accentHex }}
        >
          {update.title}
        </h3>

        {/* Changes List */}
        <ul className="space-y-3 mb-6">
          {update.changes.slice(0, 4).map((change, index) => (
            <li key={index} className="flex items-start gap-3">
              <span 
                className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: accentHex }}
              />
              <span className="text-sm text-[#c0c0c0]">{change}</span>
            </li>
          ))}
        </ul>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleDontShow}
            className="flex-1 rounded-xl py-3 text-sm font-medium text-[#8E8E93] hover:text-white transition-colors border border-[#8E8E93]/30"
          >
            Não mostrar novamente
          </button>
          <button
            onClick={handleOk}
            className="flex-1 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: accentHex }}
          >
            OK
          </button>
        </div>
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
  const [whatsNewUpdate, setWhatsNewUpdate] = useState<AppUpdate | null>(null)

  // Create solid background for tab bar from accent color
  const tabBarBackground = `${accentHex}25`

  // Check for updates and show WhatsNew modal on mount
  useEffect(() => {
    // Auto-clear cache daily
    autoClearCacheIfNeeded()

    // Check for version update
    const update = checkForNewVersion()
    if (update) {
      // Show WhatsNew modal
      setWhatsNewUpdate(update)
      // Mark version as seen (don't auto-refresh anymore, just show modal)
      markVersionAsSeen()
    }
  }, [])

  // Fetch user playlists for track menu
  useEffect(() => {
    if (user?.uid) {
      getPlaylists(user.uid).then((data: unknown) => {
        const playlists = data as Array<{id: string, name: string}>
        if (playlists && Array.isArray(playlists)) {
          setUserPlaylists(playlists.map((p) => ({ id: p.id, name: p.name })))
        }
      })
    }
  }, [user, libraryKey])

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  function handleLibraryUpdate() {
    setLibraryKey((prev) => prev + 1)
  }

  function handleWhatsNewClose() {
    setWhatsNewUpdate(null)
  }

  if (showSplash || loading) return <SplashScreen accentHex={accentHex} />
  if (!user) return <LoginScreen />

  const tabs = [
    { id: "search" as const, label: "Pesquisar", icon: Search },
    { id: "library" as const, label: "Biblioteca", icon: Library },
    { id: "settings" as const, label: "Ajustes", icon: Settings },
  ]

  return (
    <div className="relative flex h-dvh min-h-0 flex-col overflow-hidden bg-[#000000] text-[#D2B48C]">
      <AudioEngine />
      <Toaster position="top-center" richColors />

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

      {/* Bottom Player + Navigation - Solid Tab Bar */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        {currentTrack && (
          <MiniPlayer 
            onExpand={() => setShowFullPlayer(true)} 
          />
        )}
        
        {/* Navigation - Solid Background */}
        <nav 
          className="mx-4 mb-4 flex items-center justify-around rounded-2xl px-2 py-3"
          style={{ 
            background: tabBarBackground,
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center gap-1.5 px-6 py-2 transition-all duration-200 active:scale-95 rounded-xl"
                style={{ 
                  backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                }}
                aria-label={tab.label}
              >
                <tab.icon 
                  className="h-5 w-5 transition-colors" 
                  style={{ color: isActive ? "#ffffff" : "rgba(255,255,255,0.6)" }} 
                />
                <span 
                  className="text-[11px] font-medium transition-colors"
                  style={{ color: isActive ? "#ffffff" : "rgba(255,255,255,0.6)" }}
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
      {whatsNewUpdate && (
        <WhatsNewModal 
          update={whatsNewUpdate} 
          onClose={handleWhatsNewClose} 
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

