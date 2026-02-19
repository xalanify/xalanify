"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, Settings, Music } from "lucide-react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { PlayerProvider, usePlayer, type Track } from "@/lib/player-context"
import LoginScreen from "@/components/login-screen"
import SearchTab from "@/components/search-tab"
import LibraryTab from "@/components/library-tab"
import SettingsTab from "@/components/settings-tab"
import MiniPlayer from "@/components/mini-player"
import FullPlayer from "@/components/full-player"
import AudioEngine from "@/components/audio-engine"
import TrackMenu from "@/components/track-menu"

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "")
  const full = normalized.length === 3
    ? normalized.split("").map((c) => c + c).join("")
    : normalized

  const int = Number.parseInt(full, 16)
  const r = (int >> 16) & 255
  const g = (int >> 8) & 255
  const b = int & 255
  return { r, g, b }
}

function SplashScreen() {
  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center gap-4"
      style={{ background: "linear-gradient(180deg, #2a0e0e 0%, #0a0404 100%)" }}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#e63946] border-t-transparent" />
      <h1 className="text-3xl font-bold tracking-tight text-[#f0e0d0]">Xalanify</h1>
      <p className="text-xs tracking-[0.2em] text-[#a08070]">EM DESENVOLVIMENTO</p>
    </div>
  )
}

function XalanifyApp() {
  const { user, loading } = useAuth()
  const { currentTrack } = usePlayer()
  const [activeTab, setActiveTab] = useState<"search" | "library" | "settings">("search")
  const [showFullPlayer, setShowFullPlayer] = useState(false)
  const [menuTrack, setMenuTrack] = useState<Track | null>(null)
  const [showSplash, setShowSplash] = useState(true)
  const [accentColor, setAccentColor] = useState("#e63946")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Track[]>([])

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const loadPreferences = () => {
      const raw = localStorage.getItem("xalanify.preferences")
      if (!raw) return

      try {
        const parsed = JSON.parse(raw)
        if (parsed.accentColor) {
          setAccentColor(parsed.accentColor)
        }
      } catch {
        setAccentColor("#e63946")
      }
    }

    loadPreferences()

    const onPreferenceChange = () => loadPreferences()
    window.addEventListener("storage", onPreferenceChange)
    window.addEventListener("xalanify-preferences-changed", onPreferenceChange)

    return () => {
      window.removeEventListener("storage", onPreferenceChange)
      window.removeEventListener("xalanify-preferences-changed", onPreferenceChange)
    }
  }, [])

  const contentBottomPadding = useMemo(
    () => (currentTrack ? "pb-[170px]" : "pb-[88px]"),
    [currentTrack]
  )

  const appBackground = useMemo(() => {
    const { r, g, b } = hexToRgb(accentColor)
    return `linear-gradient(180deg, rgba(${r}, ${g}, ${b}, 0.35) 0%, #0a0404 72%)`
  }, [accentColor])

  const cardGradient = useMemo(() => {
    const { r, g, b } = hexToRgb(accentColor)
    return `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.34) 0%, rgba(20, 10, 10, 0.95) 100%)`
  }, [accentColor])

  if (showSplash || loading) {
    return <SplashScreen />
  }

  if (!user) {
    return <LoginScreen />
  }

  const tabs = [
    {
      id: "search" as const,
      label: "EXPLORAR",
      icon: Search,
    },
    {
      id: "library" as const,
      label: "BIBLIOTECA",
      icon: Music,
    },
    {
      id: "settings" as const,
      label: "AJUSTES",
      icon: Settings,
    },
  ]

  return (
    <div
      className="relative flex h-dvh flex-col overflow-hidden safe-top"
      style={{ background: appBackground }}
    >
      <AudioEngine />

      <div className={`flex-1 overflow-hidden pt-4 ${contentBottomPadding}`}>
        {activeTab === "search" && (
          <SearchTab
            onTrackMenu={setMenuTrack}
            query={searchQuery}
            setQuery={setSearchQuery}
            results={searchResults}
            setResults={setSearchResults}
          />
        )}
        {activeTab === "library" && <LibraryTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 px-3 pb-3 safe-bottom">
        {currentTrack && (
          <MiniPlayer
            onExpand={() => setShowFullPlayer(true)}
            accentColor={accentColor}
          />
        )}

        <nav
          className="mt-2 flex items-center justify-around rounded-2xl border border-[rgba(255,255,255,0.08)] px-2 py-2.5 shadow-xl backdrop-blur-sm"
          style={{ background: cardGradient }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center gap-1 px-4 py-1 transition-colors"
                aria-label={tab.label}
              >
                <tab.icon className="h-5 w-5" style={{ color: isActive ? accentColor : "#8a7464" }} />
                <span
                  className="text-[10px] font-semibold tracking-wider"
                  style={{ color: isActive ? accentColor : "#8a7464" }}
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
          accentColor={accentColor}
        />
      )}

      {menuTrack && <TrackMenu track={menuTrack} onClose={() => setMenuTrack(null)} />}
    </div>
  )
}

export default function Page() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <XalanifyApp />
      </PlayerProvider>
    </AuthProvider>
  )
}
