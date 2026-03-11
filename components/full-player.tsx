"use client"

import { Play, Pause, SkipForward, SkipBack, ChevronDown, Heart, Volume2, VolumeX, List, X, GripVertical, ChevronUp, ChevronDown as DownArrow } from "lucide-react"
import { usePlayer } from "@/lib/player-context"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@/lib/theme-context"
import { addLikedTrack, isTrackLiked } from "@/lib/supabase"
import { useEffect, useMemo, useState } from "react"

interface FullPlayerProps {
  onClose: () => void
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
    volume,
    setVolume,
    queue,
    play,
    reorderQueue,
  } = usePlayer()
  const { user, isAdmin } = useAuth()
  const { accentHex } = useTheme()
  const [liked, setLiked] = useState(false)
  const [isSeeking, setIsSeeking] = useState(false)
  const [seekValue, setSeekValue] = useState(0)
  const [showQueue, setShowQueue] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null)

  const fullBackground = useMemo(() => {
    const { r, g, b } = hexToRgb(accentHex)
    return `linear-gradient(180deg, rgba(${r}, ${g}, ${b}, 0.45) 0%, #000000 72%)`
  }, [accentHex])

  const playButtonBackground = useMemo(() => {
    const { r, g, b } = hexToRgb(accentHex)
    return `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 1) 0%, rgba(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)}, 1) 100%)`
  }, [accentHex])

  if (!currentTrack) return null

  // Update seek value when not seeking
  const fraction = duration > 0 ? progress / duration : 0
  const displayValue = isSeeking ? seekValue : fraction

  async function handleLike() {
    if (!user || !currentTrack) return
    const userId = user.uid
    if (isAdmin) console.info("[admin][full-player] click like", { userId, trackId: currentTrack.id, trackTitle: currentTrack.title })
    const ok = await addLikedTrack(userId, currentTrack)
    if (isAdmin) console.info("[admin][full-player] like result", { ok, userId, trackId: currentTrack.id })
    if (ok) setLiked(true)
  }

  useEffect(() => {
    let mounted = true

    async function syncLikedState() {
      if (!user || !currentTrack) {
        if (mounted) setLiked(false)
        return
      }

      const userId = user.uid
      const likedNow = await isTrackLiked(userId, currentTrack.id)
      if (isAdmin) console.info("[admin][full-player] sync liked state", { userId, trackId: currentTrack.id, likedNow })
      if (mounted) setLiked(likedNow)
    }

    syncLikedState()
    return () => {
      mounted = false
    }
  }, [user, currentTrack, isAdmin])

  function handleSeekStart() {
    setIsSeeking(true)
    setSeekValue(fraction)
  }

  function handleSeekChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value)
    setSeekValue(val)
  }

  function handleSeekEnd() {
    seekTo(seekValue)
    setIsSeeking(false)
  }

  function handleSelectTrack(index: number) {
    if (selectedTrack === index) {
      setSelectedTrack(null)
    } else {
      setSelectedTrack(index)
    }
  }

  function handleMoveUp(index: number) {
    if (index > 0) {
      reorderQueue(index, index - 1)
    }
  }

  function handleMoveDown(index: number) {
    if (index < queue.length - 1) {
      reorderQueue(index, index + 1)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col safe-top safe-bottom"
      style={{
        background: fullBackground,
      }}
    >
      <div className="flex items-center justify-between px-6 pb-2 pt-4">
        <button onClick={onClose} className="p-1 text-[#8E8E93]" aria-label="Fechar">
          <ChevronDown className="h-7 w-7" />
        </button>
        <p className="text-xs font-medium uppercase tracking-wider text-[#8E8E93]">
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
        {/* Track Info */}
        <div className="mb-6 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-bold text-[#D2B48C]">
              {currentTrack.title}
            </h2>
            <p className="truncate text-sm text-[#8E8E93]">{currentTrack.artist}</p>
          </div>
          <button
            onClick={handleLike}
            className={`shrink-0 p-2 ${liked ? "text-red-500" : "text-[#8E8E93]"}`}
            aria-label="Adicionar aos favoritos"
          >
            <Heart className={`h-6 w-6 ${liked ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <input
            id="player-seek"
            name="seek"
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={displayValue}
            onMouseDown={handleSeekStart}
            onChange={handleSeekChange}
            onMouseUp={handleSeekEnd}
            onTouchStart={handleSeekStart}
            onChangeCapture={handleSeekChange}
            onTouchEnd={handleSeekEnd}
            className="w-full cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${accentHex} ${displayValue * 100}%, rgba(255,255,255,0.1) ${displayValue * 100}%)`,
            }}
          />
          <div className="mt-1 flex justify-between text-xs text-[#8E8E93]">
            <span>{formatTime(isSeeking ? seekValue * duration : progress)}</span>
            <span>{formatTime(duration || 0)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => setVolume(volume <= 0.01 ? 0.85 : 0)}
            className="p-1 text-[#8E8E93]"
            aria-label="Ativar ou silenciar volume"
          >
            {volume <= 0.01 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            id="player-volume"
            name="volume"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${accentHex} ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)`,
            }}
          />
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={previous}
            className="p-3 text-[#D2B48C]"
            aria-label="Anterior"
          >
            <SkipBack className="h-7 w-7 fill-current" />
          </button>
          <button
            onClick={isPlaying ? pause : resume}
            className="flex h-16 w-16 items-center justify-center rounded-full text-white"
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
            className="p-3 text-[#D2B48C]"
            aria-label="Próxima"
          >
            <SkipForward className="h-7 w-7 fill-current" />
          </button>
        </div>

        {/* Queue Button - Now at bottom */}
        <div className="flex justify-center mt-6">
          <button 
            onClick={() => setShowQueue(true)} 
            className="flex items-center gap-2 px-6 py-3 rounded-full text-white"
            style={{ backgroundColor: `${accentHex}40` }}
          >
            <List className="h-5 w-5" />
            <span className="text-sm font-medium">Lista ({queue.length})</span>
          </button>
        </div>
      </div>

      {/* Queue Modal */}
      {showQueue && (
        <div className="fixed inset-0 z-[60] bg-black/90">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 pt-12">
              <button 
                onClick={() => setShowQueue(false)} 
                className="p-2 text-[#8E8E93] hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
              <p className="text-sm font-medium text-[#8E8E93]">Fila de Reprodução</p>
              <div className="w-10" />
            </div>

            {/* Instructions */}
            <div className="px-4 pb-2">
              <p className="text-xs text-[#8E8E93]">Clica na música para selecionar, depois move para cima/baixo</p>
            </div>

            {/* Queue List */}
            <div className="flex-1 overflow-y-auto px-4 pb-20">
              {queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-[#8E8E93]">
                  <List className="h-12 w-12 mb-4 opacity-30" />
                  <p>Nenhuma música na fila</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {queue.map((track, index) => {
                    const isCurrent = track.id === currentTrack?.id
                    const isSelected = selectedTrack === index
                    return (
                      <div
                        key={`${track.id}-${index}`}
                        className={`flex items-center gap-2 rounded-xl p-2 transition-colors ${
                          isCurrent ? "bg-white/10" : isSelected ? "bg-white/20" : "hover:bg-white/5"
                        }`}
                      >
                        {/* Track number / playing indicator */}
                        <button
                          onClick={() => handleSelectTrack(index)}
                          className="w-8 flex-shrink-0"
                        >
                          {isCurrent && isPlaying ? (
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span className={`text-xs ${isCurrent ? "text-white" : "text-[#8E8E93]"}`}>{index + 1}</span>
                          )}
                        </button>

                        {/* Thumbnail */}
                        <button
                          onClick={() => play(track)}
                          className="shrink-0"
                        >
                          <img 
                            src={track.thumbnail} 
                            alt={track.title} 
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        </button>

                        {/* Track info */}
                        <button
                          onClick={() => play(track)}
                          className="flex-1 text-left min-w-0"
                        >
                          <p className={`truncate text-sm ${isCurrent ? "text-white font-medium" : "text-[#D2B48C]"}`}>
                            {track.title}
                          </p>
                          <p className="truncate text-xs text-[#8E8E93]">{track.artist}</p>
                        </button>

                        {/* Reorder buttons - only show when selected */}
                        {isSelected && (
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                              className="p-1 rounded bg-white/10 disabled:opacity-30"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleMoveDown(index)}
                              disabled={index === queue.length - 1}
                              className="p-1 rounded bg-white/10 disabled:opacity-30"
                            >
                              <DownArrow className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

