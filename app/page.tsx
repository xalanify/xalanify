"use client"

import { useState } from "react"
import { Search, Settings, Home, Music } from "lucide-react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { PlayerProvider } from "@/lib/player-context"
import LoginScreen from "@/components/login-screen"
import SearchTab from "@/components/search-tab"
import LibraryTab from "@/components/library-tab"
import SettingsTab from "@/components/settings-tab"
import MiniPlayer from "@/components/mini-player"
import FullPlayer from "@/components/full-player"
import AudioEngine from "@/components/audio-engine"
import TrackMenu from "@/components/track-menu"
import type { Track } from "@/lib/player-context"

function MusifyApp() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState<"search" | "library" | "settings">("search")
  const [showFullPlayer, setShowFullPlayer] = useState(false)
  const [menuTrack, setMenuTrack] = useState<Track | null>(null)

  if (loading) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center"
        style={{ background: "linear-gradient(180deg, #2a0e0e 0%, #0a0404 100%)" }}
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e63946] border-t-transparent" />
      </div>
    )
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
      className="flex min-h-dvh flex-col safe-top"
      style={{ background: "linear-gradient(180deg, #2a0e0e 0%, #0a0404 100%)" }}
    >
      {/* Audio engine (hidden) */}
      <AudioEngine />

      {/* Content area */}
      <div className="flex flex-1 flex-col overflow-hidden pt-4">
        {activeTab === "search" && <SearchTab onTrackMenu={setMenuTrack} />}
        {activeTab === "library" && <LibraryTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>

      {/* Mini Player */}
      <MiniPlayer onExpand={() => setShowFullPlayer(true)} />

      {/* Bottom Navigation */}
      <nav className="glass-card-strong mx-3 mb-3 flex items-center justify-around rounded-2xl px-2 py-2.5 safe-bottom">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-1 px-4 py-1 transition-colors"
              aria-label={tab.label}
            >
              <tab.icon
                className="h-5 w-5"
                style={{ color: isActive ? "#e63946" : "#605040" }}
              />
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

      {/* Full Player Overlay */}
      {showFullPlayer && (
        <FullPlayer onClose={() => setShowFullPlayer(false)} />
      )}

      {/* Track Context Menu */}
      {menuTrack && (
        <TrackMenu track={menuTrack} onClose={() => setMenuTrack(null)} />
      )}
    </div>
  )
}

export default function Page() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <MusifyApp />
      </PlayerProvider>
    </AuthProvider>
  )
}
