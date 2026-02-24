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
  source?: "spotify" | "youtube" | "itunes"
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
  setProgress: (p: number) => void
  setDuration: (d: number) => void
  seekTo: (fraction: number) => void
  setVolume: (value: number) => void
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

  const play = useCallback(async (track: Track) => {
    setProgress(0)

    let ytId = track.youtubeId
    if (!ytId) {
      ytId = await getYoutubeId(track.title, track.artist)
    }

    // Prefer full-length playback via YouTube whenever possible.
    setCurrentTrack({ ...track, youtubeId: ytId ?? null })
    setIsPlaying(true)
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

  const seekTo = useCallback((fraction: number) => {
    if (currentTrack?.previewUrl && !currentTrack.youtubeId && audioRef.current && duration > 0) {
      audioRef.current.currentTime = fraction * duration
      return
    }

    if (playerRef.current) {
      playerRef.current.seekTo(fraction, "fraction")
    }
  }, [audioRef, currentTrack, duration])

  const setVolume = useCallback((value: number) => {
    const nextValue = Math.max(0, Math.min(1, value))
    setVolumeState(nextValue)
  }, [])

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
        { src: currentTrack.thumbnail, sizes: "96x96", type: "image/png" },
        { src: currentTrack.thumbnail, sizes: "128x128", type: "image/png" },
        { src: currentTrack.thumbnail, sizes: "192x192", type: "image/png" },
        { src: currentTrack.thumbnail, sizes: "256x256", type: "image/png" },
      ],
    })

    navigator.mediaSession.setActionHandler("play", () => setIsPlaying(true))
    navigator.mediaSession.setActionHandler("pause", () => setIsPlaying(false))
    navigator.mediaSession.setActionHandler("nexttrack", () => next())
    navigator.mediaSession.setActionHandler("previoustrack", () => previous())
  }, [currentTrack, next, previous])

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused"
  }, [isPlaying])

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
        setProgress,
        setDuration,
        seekTo,
        setVolume,
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
