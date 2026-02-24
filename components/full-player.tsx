"use client"

import { Play, Pause, SkipForward, SkipBack, ChevronDown, Heart, Volume2, VolumeX } from "lucide-react"
import { usePlayer } from "@/lib/player-context"
import { useAuth } from "@/lib/auth-context"
import { addLikedTrack, isTrackLiked } from "@/lib/supabase"
import { useEffect, useMemo, useState } from "react"

interface FullPlayerProps {
  onClose: () => void
  accentColor: string
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
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

export default function FullPlayer({ onClose, accentColor }: FullPlayerProps) {
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
    volume,
    setVolume,
  } = usePlayer()
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)

  const fullBackground = useMemo(() => {
    const { r, g, b } = hexToRgb(accentColor)
    return `linear-gradient(180deg, rgba(${r}, ${g}, ${b}, 0.45) 0%, #0a0404 72%)`
  }, [accentColor])

  const playButtonBackground = useMemo(() => {
    const { r, g, b } = hexToRgb(accentColor)
    return `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 1) 0%, rgba(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)}, 1) 100%)`
  }, [accentColor])

  if (!currentTrack) return null

  async function handleLike() {
    if (!user || !currentTrack) return
    await addLikedTrack(user.id, currentTrack)
    setLiked(true)
  }

  useEffect(() => {
    let mounted = true

    async function syncLikedState() {
      if (!user || !currentTrack) {
        if (mounted) setLiked(false)
        return
      }

      const likedNow = await isTrackLiked(user.id, currentTrack.id)
      if (mounted) setLiked(likedNow)
    }

    syncLikedState()
    return () => {
      mounted = false
    }
  }, [user, currentTrack])

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value)
    seekTo(val)
  }

  const fraction = duration > 0 ? progress / duration : 0

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col safe-top safe-bottom"
      style={{
        background: fullBackground,
      }}
    >
      <div className="flex items-center justify-between px-6 pb-2 pt-4">
        <button onClick={onClose} className="p-1 text-[#a08070]" aria-label="Fechar">
          <ChevronDown className="h-7 w-7" />
        </button>
        <p className="text-xs font-medium uppercase tracking-wider text-[#706050]">
          A Reproduzir
        </p>
        <div className="w-9" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-10">
        <div className="aspect-square w-full max-w-[320px] overflow-hidden rounded-3xl shadow-2xl">
          <img
            src={currentTrack.thumbnail}
            alt={currentTrack.title}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

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
              background: `linear-gradient(to right, ${accentColor} ${fraction * 100}%, rgba(255,255,255,0.1) ${fraction * 100}%)`,
            }}
          />
          <div className="mt-1 flex justify-between text-xs text-[#706050]">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => setVolume(volume <= 0.01 ? 0.85 : 0)}
            className="p-1 text-[#a08070]"
            aria-label="Ativar ou silenciar volume"
          >
            {volume <= 0.01 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="xala-volume-slider w-full"
            aria-label="Controlo de volume"
          />
        </div>

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
            style={{ background: playButtonBackground }}
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
