"use client"

import { Play, Pause, SkipForward } from "lucide-react"
import { usePlayer } from "@/lib/player-context"

interface MiniPlayerProps {
  onExpand: () => void
}

export default function MiniPlayer({ onExpand }: MiniPlayerProps) {
  const { currentTrack, isPlaying, pause, resume, next } = usePlayer()

  if (!currentTrack) return null

  return (
    <button
      onClick={onExpand}
      className="glass-card-strong flex w-full items-center gap-3 rounded-2xl p-3 text-left"
    >
      <img
        src={currentTrack.thumbnail}
        alt={currentTrack.title}
        className="h-11 w-11 shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#f0e0d0]">
          {currentTrack.title}
        </p>
        <p className="truncate text-xs text-[#a08070]">{currentTrack.artist}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation()
            isPlaying ? pause() : resume()
          }}
          className="p-2 text-[#f0e0d0]"
          aria-label={isPlaying ? "Pausar" : "Reproduzir"}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 fill-current" />
          ) : (
            <Play className="h-5 w-5 fill-current" />
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            next()
          }}
          className="p-2 text-[#f0e0d0]"
          aria-label="Proxima"
        >
          <SkipForward className="h-5 w-5 fill-current" />
        </button>
      </div>
    </button>
  )
}
