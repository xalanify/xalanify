"use client"

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react"
import { getYoutubeId } from "./musicApi"

export interface Track {
  id: string
  title: string
  artist: string
  thumbnail: string
  duration: number
  youtubeId: string | null
  previewUrl?: string | null
  source?: "spotify" | "youtube" | "itunes" | "soundcloud"
  isTestContent?: boolean
  testLabel?: string
}

interface PlayerContextType {
  currentTrack: Track | null
  isPlaying: boolean
  queue: Track[]
  progress: number
  duration: number
  volume: number
  play: (track: Track) => void
  pause: () => void
  resume: () => void
  next: () => void
  previous: () => void
  setQueue: (tracks: Track[]) => void
  addToQueue: (track: Track) => void
  removeFromQueue: (index: number) => void
  reorderQueue: (fromIndex: number, toIndex: number) => void
  setProgress: (p: number) => void
  setDuration: (d: number) => void
  seekTo: (fraction: number) => void
  setVolume: (value: number) => void
  retryTrack: () => void
  playerRef: React.MutableRefObject<any>
  audioRef: React.MutableRefObject<HTMLAudioElement | null>
}

const PlayerContext = createContext<PlayerContextType>({} as PlayerContextType)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [queue, setQueueState] = useState<Track[]>([])
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.85)
  const playerRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  const currentTrackRef = useRef<Track | null>(null)

  useEffect(() => {
    currentTrackRef.current = currentTrack
  }, [currentTrack])

  // Play - Simple and direct
  const play = useCallback(async (track: Track) => {
    setProgress(0)
    setDuration(0)

    let ytId = track.youtubeId

    // If no YouTube ID, search for it
    if (!ytId) {
      console.log("[Player] 🔍 Searching YouTube ID for:", track.title, "-", track.artist)
      ytId = await getYoutubeId(track.title, track.artist)
    }

    console.log("[Player] ▶️ Playing:", track.title, "YouTube ID:", ytId)

    // Save track with YouTube ID
    setCurrentTrack({ ...track, youtubeId: ytId ?? null })
    setIsPlaying(true)
  }, [])

  // Retry - for when Piped/YouTube fails
  const retryTrack = useCallback(async () => {
    const track = currentTrackRef.current
    if (!track) return
    
    console.log("[Player] 🔄 Retry for:", track.title)
    
    const newId = await getYoutubeId(track.title, track.artist)
    
    if (newId) {
      console.log("[Player] ✅ New YouTube ID:", newId)
      setCurrentTrack({ ...track, youtubeId: newId })
      setIsPlaying(true)
    }
  }, [])

  const pause = useCallback(() => setIsPlaying(false), [])
  const resume = useCallback(() => setIsPlaying(true), [])

  const next = useCallback(() => {
    if (queue.length === 0 || !currentTrack) return
    const idx = queue.findIndex((t) => t.id === currentTrack.id)
    const nextTrack = queue[(idx + 1) % queue.length]
    if (nextTrack) play(nextTrack)
  }, [queue, currentTrack, play])

  const previous = useCallback(() => {
    if (queue.length === 0 || !currentTrack) return
    const idx = queue.findIndex((t) => t.id === currentTrack.id)
    const prevTrack = queue[(idx - 1 + queue.length) % queue.length]
    if (prevTrack) play(prevTrack)
  }, [queue, currentTrack, play])

  const setQueue = useCallback((tracks: Track[]) => {
    setQueueState(tracks)
  }, [])

  const addToQueue = useCallback((track: Track) => {
    setQueueState(prev => [...prev, track])
  }, [])

  const removeFromQueue = useCallback((index: number) => {
    setQueueState(prev => prev.filter((_, i) => i !== index))
  }, [])

  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    setQueueState(prev => {
      const newQueue = [...prev]
      const [removed] = newQueue.splice(fromIndex, 1)
      newQueue.splice(toIndex, 0, removed)
      return newQueue
    })
  }, [])

  const seekTo = useCallback((fraction: number) => {
    // Calculate seconds from fraction
    const seconds = fraction * duration
    
    // Try to use global seek function (from AudioEngine)
    if (typeof window !== 'undefined') {
      const globalSeek = (window as any).xalanifySeek
      if (globalSeek) {
        globalSeek(seconds)
        return
      }
    }
    
    // Fallback: set progress directly
    if (duration > 0) {
      setProgress(seconds)
    }
  }, [duration])

  const setVolume = useCallback((value: number) => {
    const nextValue = Math.max(0, Math.min(1, value))
    setVolumeState(nextValue)
  }, [])

  // Volume localStorage
  useEffect(() => {
    const stored = localStorage.getItem("xalanify.volume")
    if (!stored) return
    const parsed = Number(stored)
    if (!Number.isNaN(parsed)) {
      setVolumeState(Math.max(0, Math.min(1, parsed)))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("xalanify.volume", String(volume))
  }, [volume])

  // Media Session
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return
    if (!currentTrack) {
      navigator.mediaSession.metadata = null
      return
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: "Xalanify",
      artwork: [
        { src: currentTrack.thumbnail, sizes: "96x96", type: "image/jpeg" },
        { src: currentTrack.thumbnail, sizes: "128x128", type: "image/jpeg" },
        { src: currentTrack.thumbnail, sizes: "192x192", type: "image/jpeg" },
        { src: currentTrack.thumbnail, sizes: "256x256", type: "image/jpeg" },
      ],
    })

    try { navigator.mediaSession.setActionHandler("play", () => setIsPlaying(true)) } catch {}
    try { navigator.mediaSession.setActionHandler("pause", () => setIsPlaying(false)) } catch {}
    try { navigator.mediaSession.setActionHandler("nexttrack", () => next()) } catch {}
    try { navigator.mediaSession.setActionHandler("previoustrack", () => previous()) } catch {}
    try { navigator.mediaSession.setActionHandler("seekbackward", () => previous()) } catch {}
    try { navigator.mediaSession.setActionHandler("seekforward", () => next()) } catch {}
  }, [currentTrack, next, previous])

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused"
  }, [isPlaying])

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return
    if (!("setPositionState" in navigator.mediaSession)) return
    if (!duration || !Number.isFinite(duration)) return

    try {
      navigator.mediaSession.setPositionState({
        duration,
        position: Math.min(Math.max(progress, 0), duration),
        playbackRate: 1,
      })
    } catch {}
  }, [progress, duration])

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        queue,
        progress,
        duration,
        volume,
        play,
        pause,
        resume,
        next,
        previous,
        setQueue,
        addToQueue,
        removeFromQueue,
        reorderQueue,
        setProgress,
        setDuration,
        seekTo,
        setVolume,
        retryTrack,
        playerRef,
        audioRef,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  return useContext(PlayerContext)
}

