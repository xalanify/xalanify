"use client"

import { Play, Pause, ChevronUp, SkipForward, SkipBack } from "lucide-react"
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
  const { currentTrack, isPlaying, play, pause, next, previous } = usePlayer()
  const { accentHex } = useTheme()

  if (!currentTrack) return null

  // Solid background - use a darker version with accent tint
  const solidBackground = `rgba(30, 30, 30, 0.95)`

  return (
    <div 
      className="mx-4 mb-3 flex items-center gap-2 rounded-[18px] p-2 cursor-pointer active:scale-[0.98] transition-transform"
      style={{ 
        backgroundColor: solidBackground,
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
        <p className="truncate font-semibold text-[15px] text-white">{currentTrack.title}</p>
        <p className="truncate text-[12px] text-white/70">{currentTrack.artist}</p>
      </div>

      {/* Previous Button */}
      <button
        onClick={(e) => { e.stopPropagation(); previous() }}
        className="p-2 text-white/70 hover:text-white transition-colors"
        aria-label="Anterior"
      >
        <SkipBack className="h-4 w-4" />
      </button>

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

      {/* Next Button */}
      <button
        onClick={(e) => { e.stopPropagation(); next() }}
        className="p-2 text-white/70 hover:text-white transition-colors"
        aria-label="Próxima"
      >
        <SkipForward className="h-4 w-4" />
      </button>

      {/* Expand Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onExpand() }}
        className="p-2 text-white/70 hover:text-white"
      >
        <ChevronUp className="h-5 w-5" />
      </button>
    </div>
  )
}

