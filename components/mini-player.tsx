"use client"

import { Play, Pause, ChevronUp } from "lucide-react"
import { usePlayer } from "@/lib/player-context"
import { useTheme } from "@/lib/theme-context"

interface MiniPlayerProps {
  onExpand: () => void
}

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

export default function MiniPlayer({ onExpand }: MiniPlayerProps) {
  const { currentTrack, isPlaying, play, pause } = usePlayer()
  const { accentHex } = useTheme()

  if (!currentTrack) return null

  // Create solid gradient background from accent color
  const solidBackground = `linear-gradient(135deg, ${accentHex} 0%, ${accentHex}cc 100%)`

  return (
    <div 
      className="mx-4 mb-3 flex items-center gap-3 rounded-[18px] p-3 cursor-pointer active:scale-[0.98] transition-transform"
      style={{ 
        background: solidBackground,
        boxShadow: `0 4px 20px ${accentHex}40`
      }}
      onClick={onExpand}
    >
      {/* Thumbnail - 48px, rounded 8-12px */}
      <img 
        src={currentTrack.thumbnail} 
        alt={currentTrack.title}
        className="h-12 w-12 rounded-[10px] object-cover flex-shrink-0"
      />
      
      {/* Center: Title (Bege, 17pt, Semi-bold) + Subtitle (Gray, 14pt) */}
      <div className="flex-1 min-w-0">
        <p className="truncate font-semibold text-[17px] text-white">{currentTrack.title}</p>
        <p className="truncate text-[14px] text-white/70">{currentTrack.artist}</p>
      </div>

      {/* Play/Pause Button - White for contrast */}
      <button
        onClick={(e) => { e.stopPropagation(); isPlaying ? pause() : play(currentTrack) }}
        className="rounded-full p-2.5 bg-white text-black transition-all active:scale-90"
      >
        {isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5" />
        )}
      </button>

      {/* Expand Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onExpand() }}
        className="rounded-full p-2 text-white/70 hover:text-white"
      >
        <ChevronUp className="h-5 w-5" />
      </button>
    </div>
  )
}

