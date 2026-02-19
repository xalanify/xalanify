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
}

interface PlayerContextType {
  currentTrack: Track | null
  isPlaying: boolean
  queue: Track[]
  progress: number
  duration: number
  play: (track: Track) => void
  pause: () => void
  resume: () => void
  next: () => void
  previous: () => void
  setQueue: (tracks: Track[]) => void
  setProgress: (p: number) => void
  setDuration: (d: number) => void
  seekTo: (fraction: number) => void
  playerRef: React.MutableRefObject<any>
}

const PlayerContext = createContext<PlayerContextType>({} as PlayerContextType)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [queue, setQueueState] = useState<Track[]>([])
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const playerRef = useRef<any>(null)

  const play = useCallback(async (track: Track) => {
    let ytId = track.youtubeId
    if (!ytId) {
      ytId = await getYoutubeId(track.title, track.artist)
    }
    setCurrentTrack({ ...track, youtubeId: ytId })
    setIsPlaying(true)
    setProgress(0)
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
    if (playerRef.current) {
      playerRef.current.seekTo(fraction, "fraction")
    }
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
        play,
        pause,
        resume,
        next,
        previous,
        setQueue,
        setProgress,
        setDuration,
        seekTo,
        playerRef,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  return useContext(PlayerContext)
}
