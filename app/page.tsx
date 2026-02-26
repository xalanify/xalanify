"use client"

import { useEffect, useState } from "react"
import { Search, Settings, Library } from "lucide-react"
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

function SplashScreen({ accentHex }: { accentHex: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[#0a0a0a]">
      <div 
        className="h-16 w-16 animate-spin rounded-full border-4 border-white/10"
        style={{ borderTopColor: accentHex }}
      />
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-[#f0e0d0]">Xalanify</h1>
        <p className="mt-3 text-sm tracking-[0.3em] text-[#a08070] uppercase">Em Desenvolvimento</p>
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

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (showSplash || loading) return <SplashScreen accentHex={accentHex} />
  if (!user) return <LoginScreen />

  const tabs = [
    { id: "search" as const, label: "Pesquisar", icon: Search },
    { id: "library" as const, label: "Biblioteca", icon: Library },
    { id: "settings" as const, label: "Ajustes", icon: Settings },
  ]

  return (
    <div className="relative flex h-dvh min-h-0 flex-col overflow-hidden bg-[#0a0a0a] text-[#f0e0d0]">
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
        {activeTab === "library" && <LibraryTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>

      {/* Bottom Player + Navigation */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent">
        {currentTrack && (
          <MiniPlayer 
            onExpand={() => setShowFullPlayer(true)} 
          />
        )}
        
        {/* Navigation */}
        <nav className="mx-4 mb-4 flex items-center justify-around rounded-2xl bg-[#1a1a1a]/80 backdrop-blur-md border border-[#f0e0d0]/10 px-2 py-3">
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
                  style={{ color: isActive ? accentHex : "#a08070" }} 
                />
                <span 
                  className="text-[11px] font-medium transition-colors"
                  style={{ color: isActive ? accentHex : "#a08070" }}
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
