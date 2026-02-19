"use client"

import { Play, Pause, SkipForward, SkipBack, ChevronDown, Heart } from "lucide-react"
import { usePlayer } from "@/lib/player-context"
import { useAuth } from "@/lib/auth-context"
import { addLikedTrack } from "@/lib/supabase"
import { useState } from "react"

interface FullPlayerProps {
  onClose: () => void
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export default function FullPlayer({ onClose }: FullPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    pause,
    resume,
    next,
    previous,
    progress,
    duration,
    seekTo,
  } = usePlayer()
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)

  if (!currentTrack) return null

  async function handleLike() {
    if (!user || !currentTrack) return
    await addLikedTrack(user.id, currentTrack)
    setLiked(true)
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value)
    seekTo(val)
  }

  const fraction = duration > 0 ? progress / duration : 0

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col safe-top safe-bottom"
      style={{
        background: "linear-gradient(180deg, #2a0e0e 0%, #0a0404 100%)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2">
        <button onClick={onClose} className="p-1 text-[#a08070]" aria-label="Fechar">
          <ChevronDown className="h-7 w-7" />
        </button>
        <p className="text-xs font-medium tracking-wider text-[#706050] uppercase">
          A Reproduzir
        </p>
        <div className="w-9" />
      </div>

      {/* Artwork */}
      <div className="flex flex-1 flex-col items-center justify-center px-10">
        <div className="aspect-square w-full max-w-[320px] overflow-hidden rounded-3xl shadow-2xl">
          <img
            src={currentTrack.thumbnail}
            alt={currentTrack.title}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Track Info + Controls */}
      <div className="px-8 pb-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-bold text-[#f0e0d0]">
              {currentTrack.title}
            </h2>
            <p className="truncate text-sm text-[#a08070]">{currentTrack.artist}</p>
          </div>
          <button
            onClick={handleLike}
            className={`shrink-0 p-2 ${liked ? "text-[#e63946]" : "text-[#706050]"}`}
            aria-label="Adicionar aos favoritos"
          >
            <Heart className={`h-6 w-6 ${liked ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={fraction}
            onChange={handleSeek}
            className="w-full"
            style={{
              background: `linear-gradient(to right, #e63946 ${fraction * 100}%, rgba(255,255,255,0.1) ${fraction * 100}%)`,
            }}
          />
          <div className="mt-1 flex justify-between text-xs text-[#706050]">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={previous}
            className="p-3 text-[#f0e0d0]"
            aria-label="Anterior"
          >
            <SkipBack className="h-7 w-7 fill-current" />
          </button>
          <button
            onClick={isPlaying ? pause : resume}
            className="flex h-16 w-16 items-center justify-center rounded-full text-[#fff]"
            style={{
              background: "linear-gradient(135deg, #e63946 0%, #c1121f 100%)",
            }}
            aria-label={isPlaying ? "Pausar" : "Reproduzir"}
          >
            {isPlaying ? (
              <Pause className="h-7 w-7 fill-current" />
            ) : (
              <Play className="ml-1 h-7 w-7 fill-current" />
            )}
          </button>
          <button
            onClick={next}
            className="p-3 text-[#f0e0d0]"
            aria-label="Proxima"
          >
            <SkipForward className="h-7 w-7 fill-current" />
          </button>
        </div>
      </div>
    </div>
  )
}
