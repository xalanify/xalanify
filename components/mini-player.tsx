"use client"

import { Play, Pause, ChevronUp } from "lucide-react"
import { usePlayer } from "@/lib/player-context"
import { useTheme } from "@/lib/theme-context"

interface MiniPlayerProps {
  onExpand: () => void
}

export default function MiniPlayer({ onExpand }: MiniPlayerProps) {
  const { currentTrack, isPlaying, play, pause } = usePlayer()
  const { accentHex } = useTheme()

  if (!currentTrack) return null

  return (
    <div 
      className="mx-4 mb-3 flex items-center gap-3 rounded-[18px] glass-card p-3 cursor-pointer active:scale-[0.98] transition-transform"
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
        <p className="truncate font-semibold text-[17px] text-[#D2B48C]">{currentTrack.title}</p>
        <p className="truncate text-[14px] text-[#8E8E93]">{currentTrack.artist}</p>
      </div>

      {/* Play/Pause Button */}
      <button
        onClick={(e) => { e.stopPropagation(); isPlaying ? pause() : play(currentTrack) }}
        className="rounded-full p-2.5 text-white transition-all active:scale-90"
        style={{ backgroundColor: accentHex }}
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
        className="rounded-full p-2 text-[#8E8E93] hover:text-[#D2B48C]"
      >
        <ChevronUp className="h-5 w-5" />
      </button>
    </div>
  )
}
