"use client"

import { Play, Pause, SkipForward, Volume2, VolumeX } from "lucide-react"
import { useState } from "react"
import { usePlayer } from "@/lib/player-context"

interface MiniPlayerProps {
  onExpand: () => void
  accentColor: string
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

export default function MiniPlayer({ onExpand, accentColor }: MiniPlayerProps) {
  const { currentTrack, isPlaying, pause, resume, next, volume, setVolume } = usePlayer()
  const [showVolume, setShowVolume] = useState(false)

  if (!currentTrack) return null

  const { r, g, b } = hexToRgb(accentColor)
  const playerBackground = `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.35) 0%, rgba(20, 10, 10, 0.95) 100%)`

  return (
    <button
      onClick={onExpand}
      className="flex w-full items-center gap-3 rounded-2xl border border-[rgba(255,255,255,0.08)] p-3 text-left shadow-xl"
      style={{ background: playerBackground }}
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
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowVolume((prev) => !prev)
            }}
            className="p-2 text-[#f0e0d0]"
            aria-label="Volume"
          >
            {volume <= 0.01 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          {showVolume && (
            <div
              className="absolute bottom-[120%] right-0 w-28 rounded-lg border border-[rgba(255,255,255,0.1)] p-2"
              style={{ background: "rgba(20, 10, 10, 0.96)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full"
                aria-label="Controlo de volume"
              />
            </div>
          )}
        </div>
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
