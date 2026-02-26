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
      className="mx-4 mb-3 flex items-center gap-3 rounded-2xl bg-[#1a1a1a]/90 backdrop-blur-md border border-[#f0e0d0]/10 p-3 cursor-pointer active:scale-[0.98] transition-transform"
      onClick={onExpand}
    >
      <img 
        src={currentTrack.thumbnail} 
        alt={currentTrack.title}
        className="h-12 w-12 rounded-xl object-cover flex-shrink-0"
      />
      
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium text-sm text-[#f0e0d0]">{currentTrack.title}</p>
        <p className="truncate text-xs text-[#a08070]">{currentTrack.artist}</p>
      </div>

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

      <button
        onClick={(e) => { e.stopPropagation(); onExpand() }}
        className="rounded-full p-2 text-[#a08070] hover:text-[#f0e0d0]"
      >
        <ChevronUp className="h-5 w-5" />
      </button>
    </div>
  )
}
