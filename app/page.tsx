"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, Settings, Music } from "lucide-react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { PlayerProvider, usePlayer } from "@/lib/player-context"
import LoginScreen from "@/components/login-screen"
import SearchTab from "@/components/search-tab"
import LibraryTab from "@/components/library-tab"
import SettingsTab from "@/components/settings-tab"
import MiniPlayer from "@/components/mini-player"
import FullPlayer from "@/components/full-player"
import AudioEngine from "@/components/audio-engine"
import TrackMenu from "@/components/track-menu"
import type { Track } from "@/lib/player-context"

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

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  const contentBottomPadding = useMemo(
    () => (currentTrack ? "pb-[170px]" : "pb-[88px]"),
    [currentTrack]
  )

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
      style={{ background: "linear-gradient(180deg, #2a0e0e 0%, #0a0404 100%)" }}
    >
      <AudioEngine />

      <div className={`flex-1 overflow-hidden pt-4 ${contentBottomPadding}`}>
        {activeTab === "search" && <SearchTab onTrackMenu={setMenuTrack} />}
        {activeTab === "library" && <LibraryTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 px-3 pb-3 safe-bottom">
        {currentTrack && <MiniPlayer onExpand={() => setShowFullPlayer(true)} />}

        <nav className="glass-card-strong mt-2 flex items-center justify-around rounded-2xl px-2 py-2.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center gap-1 px-4 py-1 transition-colors"
                aria-label={tab.label}
              >
                <tab.icon className="h-5 w-5" style={{ color: isActive ? "#e63946" : "#605040" }} />
                <span
                  className="text-[10px] font-semibold tracking-wider"
                  style={{ color: isActive ? "#e63946" : "#605040" }}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {showFullPlayer && <FullPlayer onClose={() => setShowFullPlayer(false)} />}

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
