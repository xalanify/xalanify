"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
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
import { APP_VERSION, checkForNewVersion, markVersionAsSeen, autoClearCacheIfNeeded, setDontShowVersion, performPWAUpdate, type AppUpdate } from "@/lib/versions"

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

function BlockingUpdateModal({ update, onClose, onUpdate }: { 
  update: AppUpdate
  onClose: () => void
  onUpdate: () => void
}) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90">
      <div className="w-full max-w-md rounded-3xl bg-[#1c1c1e] border-4 border-[#D2B48C] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-[#D2B48C] to-[#8E8E93] p-4 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-black" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#D2B48C]">Nova Atualização!</h2>
            <p className="text-xl font-semibold text-white">{update.version}</p>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">{update.title}</h3>
          <div className="space-y-3">
            {update.changes.slice(0, 5).map((change: string, i: number) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-white/10 rounded-2xl">
                <div className="h-3 w-3 bg-[#D2B48C] rounded-full mt-2 flex-shrink-0" />
                <span className="text-base text-[#D2B48C]">{change}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-4 pt-6 border-t border-white/20">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl py-4 px-6 text-lg font-semibold text-[#8E8E93] bg-white/10 hover:bg-white/20 hover:text-white transition-all border border-white/30"
          >
            Ignorar (Não recomendado)
          </button>
          <button
            onClick={onUpdate}
            className="flex-1 rounded-2xl py-4 px-6 text-lg font-bold text-black bg-gradient-to-r from-[#D2B48C] to-[#8E8E93] hover:from-[#D2B48C]/90 shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-200"
          >
            Atualizar Agora
          </button>
        </div>
        <p className="mt-4 text-xs text-[#8E8E93] text-center opacity-75">
          Atualização necessária para novas funcionalidades
        </p>
      </div>
    </div>
  )
}

function XalanifyApp() {
  const { user, loading } = useAuth()
  const { currentTrack } = usePlayer()
  const theme = useTheme()
  const { accentHex, fontClass, backgroundClass, navIconClass } = theme
  const [activeTab, setActiveTab] = useState<"search" | "library" | "settings">("search")
  const [showFullPlayer, setShowFullPlayer] = useState(false)
  const [menuTrack, setMenuTrack] = useState<Track | null>(null)
  const [menuAnchorRect, setMenuAnchorRect] = useState<DOMRect | null>(null)
  const [showSplash, setShowSplash] = useState(true)
  const [forceUpdate, setForceUpdate] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Track[]>([])
  const [libraryKey, setLibraryKey] = useState(0)
  const [userPlaylists, setUserPlaylists] = useState<{id: string, name: string}[]>([])
  const [whatsNewUpdate, setWhatsNewUpdate] = useState<AppUpdate | null>(null)

  const tabBarBackground = '#1c1c1e'

  useEffect(() => {
    autoClearCacheIfNeeded()
    const update = checkForNewVersion()
    if (update) {
      setWhatsNewUpdate(update)
      setForceUpdate(true)
    }
  }, [])

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
    setDontShowVersion(APP_VERSION)
    markVersionAsSeen()
    setWhatsNewUpdate(null)
    setForceUpdate(false)
  }

  const handleForceUpdate = useCallback(async () => {
    await performPWAUpdate()
  }, [])

  if (showSplash || loading) return <SplashScreen accentHex={accentHex} />
  if (!user) return <LoginScreen />
  if (forceUpdate && whatsNewUpdate) return (
    <BlockingUpdateModal 
      update={whatsNewUpdate}
      onClose={handleWhatsNewClose}
      onUpdate={handleForceUpdate}
    />
  )

  const tabs = [
    { id: "search" as const, label: "Pesquisar", icon: Search },
    { id: "library" as const, label: "Biblioteca", icon: Library },
    { id: "settings" as const, label: "Ajustes", icon: Settings },
  ]

  return (
    <div className={`h-dvh min-h-0 flex flex-col overflow-hidden bg-[#000000] text-[#D2B48C] ${fontClass} ${backgroundClass}`}>
      <AudioEngine />
      <Toaster position="top-center" richColors />

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

      <div className="absolute inset-x-0 bottom-0 z-50">
        {currentTrack && (
          <MiniPlayer 
            onExpand={() => setShowFullPlayer(true)} 
          />
        )}
        
        <nav 
          className={`mx-4 mb-4 flex items-center justify-around rounded-2xl px-2 py-3 ${navIconClass}`}
          style={{ 
            backgroundColor: tabBarBackground,
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
