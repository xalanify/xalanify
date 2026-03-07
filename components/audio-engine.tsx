"use client"

import { useEffect, useRef, useState } from "react"
import { usePlayer } from "@/lib/player-context"

// YouTube Player API types
interface YouTubePlayer {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getCurrentTime: () => number
  getDuration: () => number
  getPlayerState: () => number
  loadVideoById: (videoId: string) => void
  cueVideoById: (videoId: string) => void
  setVolume: (volume: number) => void
  getVolume: () => number
  destroy: () => void
}

interface YouTubeConfig {
  height: string
  width: string
  playerVars: Record<string, number | string>
  events: {
    onReady?: () => void
    onStateChange?: (event: { data: number }) => void
    onError?: (event: { data: number }) => void
  }
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void
    YT: {
      Player: new (elementId: string, config: YouTubeConfig) => YouTubePlayer
      PlayerState: {
        BUFFERING: number
        CUED: number
        ENDED: number
        PAUSED: number
        PLAYING: number
        UNSTARTED: number
      }
    }
  }
}

export default function AudioEngine() {
  const {
    currentTrack,
    isPlaying,
    setProgress,
    setDuration,
    next,
    previous,
    volume,
    progress,
    duration,
    resume,
    pause,
  } = usePlayer()

  const [isReady, setIsReady] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  const ytPlayerRef = useRef<YouTubePlayer | null>(null)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isSeekingRef = useRef(false)
  const lastTrackIdRef = useRef<string | null>(null)

  // ========== LOAD YOUTUBE IFRAME API ==========
  useEffect(() => {
    if (typeof window === 'undefined') return

    // If already loaded
    if (window.YT && window.YT.Player) {
      setIsReady(true)
      return
    }

    // Load the API
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      setIsReady(true)
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  // ========== CREATE YOUTUBE PLAYER ==========
  useEffect(() => {
    if (!isReady || typeof window === 'undefined') return
    if (ytPlayerRef.current) return

    try {
      const player = new window.YT.Player('youtube-audio-player', {
        height: '0',
        width: '0',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            console.log("[AudioEngine] ✅ YouTube Player Ready")
            setPlayerReady(true)
          },
          onStateChange: (event) => {
            // Video ended - play next
            if (event.data === window.YT.PlayerState.ENDED) {
              console.log("[AudioEngine] 🎵 Track ended")
              next?.()
            }
            // Video buffering
            if (event.data === window.YT.PlayerState.BUFFERING) {
              console.log("[AudioEngine] ⏳ Buffering...")
            }
            // Video playing
            if (event.data === window.YT.PlayerState.PLAYING) {
              console.log("[AudioEngine] ▶️ Playing")
            }
            // Video paused
            if (event.data === window.YT.PlayerState.PAUSED) {
              console.log("[AudioEngine] ⏸️ Paused")
            }
          },
          onError: () => {
            console.log("[AudioEngine] ❌ YouTube Error")
            // Try to skip to next track on error
            next?.()
          },
        },
      })

      ytPlayerRef.current = player as unknown as YouTubePlayer
    } catch (err) {
      console.log("[AudioEngine] ❌ Error creating player:", err)
    }
  }, [isReady, next])

  // ========== HANDLE TRACK CHANGE ==========
  useEffect(() => {
    if (!currentTrack || !playerReady || !ytPlayerRef.current) return
    if (currentTrack.id === lastTrackIdRef.current) return

    lastTrackIdRef.current = currentTrack.id
    const videoId = currentTrack.youtubeId

    if (!videoId) {
      console.log("[AudioEngine] ❌ No YouTube ID")
      return
    }

    console.log("[AudioEngine] 🎵 Loading track:", videoId)

    // Load and play immediately
    try {
      ytPlayerRef.current.loadVideoById(videoId)
    } catch (err) {
      console.log("[AudioEngine] ❌ Error loading video:", err)
    }
  }, [currentTrack, playerReady])

  // ========== HANDLE PLAY/PAUSE ==========
  useEffect(() => {
    if (!playerReady || !ytPlayerRef.current) return

    if (isPlaying) {
      try {
        ytPlayerRef.current.playVideo()
        // Start progress tracking
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = setInterval(() => {
          if (!isSeekingRef.current && ytPlayerRef.current) {
            try {
              const currentTime = ytPlayerRef.current.getCurrentTime()
              const totalDuration = ytPlayerRef.current.getDuration()
              if (totalDuration > 0) {
                setProgress(currentTime)
                setDuration(totalDuration)
              }
            } catch {}
          }
        }, 250)
      } catch {}
    } else {
      try {
        ytPlayerRef.current.pauseVideo()
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
        }
      } catch {}
    }
  }, [isPlaying, playerReady, setProgress, setDuration])

  // ========== HANDLE VOLUME ==========
  useEffect(() => {
    if (!playerReady || !ytPlayerRef.current) return
    try {
      ytPlayerRef.current.setVolume(volume * 100)
    } catch {}
  }, [volume, playerReady])

  // Expose seek function to global
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).xalanifySeek = (seconds: number) => {
        if (ytPlayerRef.current) {
          isSeekingRef.current = true
          try {
            ytPlayerRef.current.seekTo(seconds, true)
          } catch {}
          setTimeout(() => {
            isSeekingRef.current = false
          }, 100)
        }
      }
    }
  }, [])

  // ========== MEDIA SESSION ==========
  useEffect(() => {
    if (!currentTrack || typeof navigator === 'undefined' || !('mediaSession' in navigator)) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title || "Unknown",
      artist: currentTrack.artist || "Unknown",
      album: "Xalanify",
      artwork: [
        { src: currentTrack.thumbnail || "/icon-512.svg", sizes: "512x512", type: "image/png" },
        { src: currentTrack.thumbnail || "/icon-192.svg", sizes: "192x192", type: "image/png" },
      ],
    })

    try {
      navigator.mediaSession.setActionHandler("play", () => resume?.())
      navigator.mediaSession.setActionHandler("pause", () => pause?.())
      navigator.mediaSession.setActionHandler("previoustrack", () => previous?.())
      navigator.mediaSession.setActionHandler("nexttrack", () => next?.())
      
      navigator.mediaSession.setActionHandler("seekbackward", () => {
        if (ytPlayerRef.current) {
          const newTime = Math.max(0, ytPlayerRef.current.getCurrentTime() - 10)
          ;(window as any).xalanifySeek?.(newTime)
        }
      })
      
      navigator.mediaSession.setActionHandler("seekforward", () => {
        if (ytPlayerRef.current) {
          const newTime = Math.min(ytPlayerRef.current.getDuration(), ytPlayerRef.current.getCurrentTime() + 10)
          ;(window as any).xalanifySeek?.(newTime)
        }
      })
    } catch (err) {
      console.log("[AudioEngine] ⚠️ Media Session error:", err)
    }
  }, [currentTrack, next, previous, resume, pause])

  // Update playback state
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused"
  }, [isPlaying])

  // Update position state
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
    if (!('setPositionState' in navigator.mediaSession)) return
    
    try {
      navigator.mediaSession.setPositionState({
        duration: duration || 0,
        playbackRate: 1,
        position: progress || 0,
      })
    } catch {}
  }, [progress, duration])

  // ========== VISIBILITY CHANGE - KEEP PLAYING ==========
  useEffect(() => {
    if (typeof document === 'undefined') return

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("[AudioEngine] 📱 App visible")
      } else {
        console.log("[AudioEngine] 📱 App in background - keeping playback")
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return (
    <div className="pointer-events-none fixed -left-[9999px] -top-[9999px] h-0 w-0 overflow-hidden opacity-0">
      {/* YouTube Player Container */}
      <div id="youtube-audio-player" />
    </div>
  )
}

