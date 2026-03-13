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
import { FirestoreProvider } from "@/lib/firestore-context"
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
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-5 bg-black/80 backdrop-blur-xl">
      <div className="w-full max-w-lg rounded-[28px] border border-[#D2B48C]/35 bg-[#050506]/95 shadow-[0_24px_80px_rgba(0,0,0,0.85)] px-6 py-7 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#D2B48C] to-[#8E8E93] flex items-center justify-center shadow-lg">
              <Sparkles className="h-7 w-7 text-black" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#8E8E93]">
                Atualização Disponível
              </p>
              <h2 className="mt-1 text-[22px] font-semibold text-[#F5E9D8]">
                Nova versão do Xalanify
              </h2>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="rounded-full border border-[#D2B48C]/40 bg-[#1c1c1e]/80 px-3 py-1 text-[11px] font-mono text-[#D2B48C]">
              v{update.version}
            </span>
            <span className="text-[11px] text-[#8E8E93]">
              {update.date}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#F5E9D8]">
            {update.title}
          </h3>
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {update.changes.slice(0, 5).map((change: string, i: number) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-2xl bg-[#111112] px-4 py-3"
              >
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-[#D2B48C]" />
                <p className="text-[13px] leading-snug text-[#D2B48C]">
                  {change}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 border-t border-white/10 pt-4">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-2xl border border-white/12 bg-white/[0.02] px-4 py-3.5 text-[13px] font-medium text-[#A0A0AB] transition-colors hover:bg-white/[0.05] hover:text-[#F5E9D8]"
            >
              Agora não
            </button>
            <button
              onClick={onUpdate}
              className="flex-1 rounded-2xl bg-gradient-to-r from-[#D2B48C] to-[#8E8E93] px-4 py-3.5 text-[13px] font-semibold text-black shadow-[0_18px_40px_rgba(0,0,0,0.8)] transition-transform hover:scale-[1.02]"
            >
              Atualizar e reiniciar
            </button>
          </div>
          <p className="text-center text-[11px] text-[#70707A]">
            O app será recarregado com a nova versão. Não perdes o login.
          </p>
        </div>
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
  const tabBarBackground = '#1c1c1e'

  useEffect(() => {
    // AUTO-REFRESH ONLY FOR PWA - site normal
    if (typeof window !== 'undefined') {
      const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                    window.matchMedia('(display-mode: fullscreen)').matches ||
                    (navigator as any).standalone === true
      
      if (isPWA) {
        // Only if not recent visit (5min cooldown)
        const lastRefresh = localStorage.getItem('xalanify.lastPwaRefresh')
        const now = Date.now()
        const cooldownOk = !lastRefresh || (now - parseInt(lastRefresh)) > 5*60*1000
        
        if (cooldownOk) {
          console.log('[App] PWA auto-refresh (cooldown OK)')
          setTimeout(() => {
            localStorage.setItem('xalanify.lastPwaRefresh', now.toString())
            performPWAUpdate()
          }, 2500)
        }
      }
    }

    autoClearCacheIfNeeded()
  }, [])


  // Removed: No update events needed

// Removed duplicate playlists fetch - using FirestoreContext


  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  function handleLibraryUpdate() {
    setLibraryKey((prev) => prev + 1)
  }

  // Removed: No manual update UI

  if (showSplash || loading) return <SplashScreen accentHex={accentHex} />
  if (!user) return <LoginScreen />
  // Removed: No more update modals

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
        />
      )}

    </div>
  )
}

export default function Page() {
  return (
    <AuthProvider>
      <FirestoreProvider>
        <PlayerProvider>
          <ThemeProvider>
            <XalanifyApp />
          </ThemeProvider>
        </PlayerProvider>
      </FirestoreProvider>
    </AuthProvider>
  )
}

