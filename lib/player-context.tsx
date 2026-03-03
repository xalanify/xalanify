"use client"

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react"
import { getYoutubeId, getYoutubeIdsForRetry, getAudioStreamUrl, searchMusic } from "./musicApi"
import { getPreferences } from "./preferences"

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
  
  // Track retry attempts
  const retryCountRef = useRef(0)
  const lastProgressRef = useRef(0)
  const isRetrying = useRef(false)
  const currentTrackRef = useRef<Track | null>(null)
  const triedYouTubeIdsRef = useRef<string[]>([])

  // Keep track of current track
  useEffect(() => {
    currentTrackRef.current = currentTrack
  }, [currentTrack])

  const play = useCallback(async (track: Track) => {
    setProgress(0)
    retryCountRef.current = 0
    lastProgressRef.current = Date.now()
    triedYouTubeIdsRef.current = []

    let ytId = track.youtubeId
    let streamUrl = track.previewUrl

    // Se não tem YouTube ID, procurar
    if (!ytId) {
      console.log("[Player] 🔍 A procurar YouTube ID para:", track.title, "-", track.artist)
      ytId = await getYoutubeId(track.title, track.artist)
      
      if (!ytId) {
        console.log("[Player] ❌ Não foi possível encontrar YouTube ID para:", track.title)
      }
    }

    // Se tem YouTube ID, obter stream direto via Invidious
    if (ytId && !streamUrl) {
      console.log("[Player] 🎵 A obter stream direto para YouTube ID:", ytId)
      streamUrl = await getAudioStreamUrl(ytId)
      if (streamUrl) {
        console.log("[Player] ✅ Stream direto obtido via Invidious!")
      } else {
        console.log("[Player] ⚠️ Falha ao obter stream Invidious, usando YouTube embed como fallback")
      }
    }

    if (ytId) {
      triedYouTubeIdsRef.current.push(ytId)
    }

    console.log("[Player] ▶️ A reproduzir:", track.title, "YouTube ID:", ytId, "Stream direto:", streamUrl ? "Sim" : "Não (vai usar YouTube embed)")

    // Usar streamUrl se disponível, caso contrário usar YouTube embed
    setCurrentTrack({ ...track, youtubeId: ytId ?? null, previewUrl: streamUrl })
    setIsPlaying(true)
  }, [])

  const retryTrack = useCallback(async () => {
    const track = currentTrackRef.current
    if (!track) return
    
    console.log("[Player] 🔄 Retry attempt #" + retryCountRef.current + " for:", track.title)
    retryCountRef.current += 1
    
    // Buscar múltiplos IDs alternativos
    const alternativeIds = await getYoutubeIdsForRetry(track.title, track.artist)
    
    // Filtrar IDs que já tentamos
    const newIds = alternativeIds.filter(id => !triedYouTubeIdsRef.current.includes(id))
    
    console.log("[Player] 📋 IDs alternativos encontrados:", newIds.length)
    
    if (newIds.length > 0) {
      // Usar o primeiro ID alternativo
      const newId = newIds[0]
      triedYouTubeIdsRef.current.push(newId)
      
      console.log("[Player] ✅ A tentar ID alternativo:", newId)
      
      // Obter stream direto para o novo ID
      const streamUrl = await getAudioStreamUrl(newId)
      if (streamUrl) {
        console.log("[Player] ✅ Stream direto obtido via Invidious no retry!")
      }
      
      setCurrentTrack({ ...track, youtubeId: newId, previewUrl: streamUrl })
      setIsPlaying(true)
    } else {
      console.log("[Player] ❌ Sem mais IDs alternativos disponíveis")
      // Tentar buscar de novo com query diferente
      const freshId = await getYoutubeId(track.title, track.artist)
      if (freshId && !triedYouTubeIdsRef.current.includes(freshId)) {
        triedYouTubeIdsRef.current.push(freshId)
        console.log("[Player] ✅ Nova pesquisa encontrou ID:", freshId)
        
        // Obter stream direto
        const streamUrl = await getAudioStreamUrl(freshId)
        if (streamUrl) {
          console.log("[Player] ✅ Stream direto obtido via Invidious!")
        }
        
        setCurrentTrack({ ...track, youtubeId: freshId, previewUrl: streamUrl })
        setIsPlaying(true)
      } else {
        console.log("[Player] ❌ Não foi possível encontrar alternativa")
      }
    }
  }, [])

  // Monitor progress and auto-retry if stuck
  useEffect(() => {
    if (!currentTrack || !isPlaying || isRetrying.current) return
    
    const prefs = getPreferences()
    if (!prefs.autoRetry) return
    
    const now = Date.now()
    const timeSinceLastUpdate = now - lastProgressRef.current
    
    // Detectar se música está presa (progress não avança por mais de 5 segundos)
    if (timeSinceLastUpdate > 5000 && progress > 0 && progress < 1 && retryCountRef.current < 5) {
      isRetrying.current = true
      console.log("[Player] ⚠️ Música presa, a fazer retry...", { progress, retryCount: retryCountRef.current })
      
      retryTrack().finally(() => {
        isRetrying.current = false
      })
    }
    
    lastProgressRef.current = now
  }, [progress, currentTrack, isPlaying, retryTrack])

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
