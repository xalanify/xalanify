"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { usePlayer } from "@/lib/player-context"

export default function AudioEngine() {
  const {
    currentTrack,
    isPlaying,
    setProgress,
    setDuration,
    next,
    previous,
    playerRef,
    audioRef,
    volume,
    progress,
    duration,
    resume,
    pause,
  } = usePlayer()

  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [useDirectStream, setUseDirectStream] = useState(true)
  const [streamError, setStreamError] = useState(false)
  const wakeLockRef = useRef<any>(null)
  const streamAudioRef = useRef<HTMLAudioElement | null>(null)
  const lastVideoIdRef = useRef<string | null>(null)
  const retryCountRef = useRef(0)
  const isMobileRef = useRef(false)

  // Detect mobile device
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      isMobileRef.current = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
  }, [])

  // ========== WAKE LOCK - Keep screen on while playing ==========
  const requestWakeLock = useCallback(async () => {
    if (!currentTrack || !isPlaying) return

    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen')
        console.log("[AudioEngine] 🔒 Wake Lock ativado")
      } catch (err) {
        console.log("[AudioEngine] ⚠️ Wake Lock não disponível")
      }
    }
  }, [currentTrack, isPlaying])

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release()
        wakeLockRef.current = null
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (isPlaying && currentTrack) {
      requestWakeLock()
    } else {
      releaseWakeLock()
    }
  }, [isPlaying, currentTrack, requestWakeLock, releaseWakeLock])

  // ========== MEDIA SESSION - Lock screen controls & notifications ==========
  useEffect(() => {
    if (!currentTrack || typeof navigator === 'undefined' || !('mediaSession' in navigator)) return

    // Set media metadata for lock screen
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title || "Unknown",
      artist: currentTrack.artist || "Unknown",
      album: "Xalanify",
      artwork: [
        { src: currentTrack.thumbnail || "/icon-512.svg", sizes: "512x512", type: "image/png" },
        { src: currentTrack.thumbnail || "/icon-192.svg", sizes: "192x192", type: "image/png" },
      ],
    })

    // Set action handlers for lock screen controls
    try {
      navigator.mediaSession.setActionHandler("play", () => {
        console.log("[AudioEngine] ▶️ Media Session: Play")
        resume?.()
      })
      navigator.mediaSession.setActionHandler("pause", () => {
        console.log("[AudioEngine] ⏸️ Media Session: Pause")
        pause?.()
      })
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        console.log("[AudioEngine] ⏮️ Media Session: Previous")
        previous?.()
      })
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        console.log("[AudioEngine] ⏭️ Media Session: Next")
        next?.()
      })
      
      // Seek actions
      navigator.mediaSession.setActionHandler("seekbackward", () => {
        const newPos = Math.max(0, progress - 10)
        if (playerRef.current?.seekTo) {
          playerRef.current.seekTo(newPos, 'seconds')
        }
      })
      navigator.mediaSession.setActionHandler("seekforward", () => {
        const newPos = Math.min(duration, progress + 10)
        if (playerRef.current?.seekTo) {
          playerRef.current.seekTo(newPos, 'seconds')
        }
      })
    } catch (err) {
      console.log("[AudioEngine] ⚠️ Media Session handlers error:", err)
    }
  }, [currentTrack, next, previous, resume, pause, progress, duration, playerRef])

  // Update playback state
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || !currentTrack) return
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused"
  }, [isPlaying, currentTrack])

  // Update position state
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || !currentTrack) return
    if (!('setPositionState' in navigator.mediaSession)) return
    
    try {
      navigator.mediaSession.setPositionState({
        duration: duration || 0,
        playbackRate: 1,
        position: progress || 0,
      })
    } catch {}
  }, [progress, duration, currentTrack])

  // ========== BACKGROUND PLAYBACK - Handle visibility changes ==========
  useEffect(() => {
    if (typeof document === 'undefined') return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("[AudioEngine] 📱 App em segundo plano")
        // Keep playing in background - don't pause!
      } else {
        console.log("[AudioEngine] 📱 App visível")
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // ========== RESET ON TRACK CHANGE ==========
  useEffect(() => {
    if (currentTrack?.youtubeId && currentTrack.youtubeId !== lastVideoIdRef.current) {
      lastVideoIdRef.current = currentTrack.youtubeId
      setStreamUrl(null)
      setUseDirectStream(true)
      setStreamError(false)
      retryCountRef.current = 0
    }
  }, [currentTrack?.youtubeId])

  // ========== FETCH STREAM URL ==========
  useEffect(() => {
    if (!currentTrack?.youtubeId) {
      setStreamUrl(null)
      return
    }

    const videoId = currentTrack.youtubeId
    
    fetch(`/api/stream/${videoId}`)
      .then(res => res.json())
      .then(data => {
        if (data.url) {
          console.log("[AudioEngine] ✅ Stream direto obtido!")
          setStreamUrl(data.url)
          setStreamError(false)
        } else {
          console.log("[AudioEngine] ❌ Stream não encontrado")
          setUseDirectStream(false)
        }
      })
      .catch(err => {
        console.log("[AudioEngine] ❌ Erro ao buscar stream:", err)
        setUseDirectStream(false)
        setStreamError(true)
      })
  }, [currentTrack?.youtubeId])

  // ========== CONTROL STREAM PLAYBACK ==========
  useEffect(() => {
    if (!streamUrl || !streamAudioRef.current || !useDirectStream) return

    const audio = streamAudioRef.current

    if (isPlaying) {
      audio.play()
        .then(() => console.log("[AudioEngine] ▶️ Stream a reproduzir"))
        .catch(err => {
          console.log("[AudioEngine] ❌ Erro ao reproduzir stream:", err)
          // Retry logic
          if (retryCountRef.current < 3) {
            retryCountRef.current++
            console.log(`[AudioEngine] 🔄 Retry ${retryCountRef.current}/3`)
            setTimeout(() => audio.play().catch(() => {}), 1000)
          } else {
            setUseDirectStream(false)
            setStreamUrl(null)
          }
        })
    } else {
      audio.pause()
    }
  }, [isPlaying, streamUrl, useDirectStream])

  // ========== VOLUME CONTROL ==========
  useEffect(() => {
    if (streamAudioRef.current) {
      streamAudioRef.current.volume = volume
    }
  }, [volume])

  // ========== FALLBACK PREVIEW AUDIO ==========
  useEffect(() => {
    if (!audioRef.current || currentTrack?.youtubeId || !currentTrack?.previewUrl) return
    if (isPlaying) audioRef.current.play().catch(() => {})
    else audioRef.current.pause()
  }, [isPlaying, currentTrack, audioRef])

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = volume
  }, [volume, audioRef])

  // ========== RENDER ==========
  if (!currentTrack) return null

  const youtubeUrl = currentTrack.youtubeId 
    ? `https://www.youtube.com/watch?v=${currentTrack.youtubeId}`
    : null

  return (
    <div className="pointer-events-none fixed -left-[9999px] -top-[9999px] h-0 w-0 overflow-hidden opacity-0">
      {/* Direct Audio Stream - Best for background playback */}
      {useDirectStream && streamUrl && (
        <audio
          ref={streamAudioRef}
          src={streamUrl}
          autoPlay={isPlaying}
          preload="auto"
          crossOrigin="anonymous"
          onTimeUpdate={(e) => setProgress((e.currentTarget as HTMLAudioElement).currentTime)}
          onLoadedMetadata={(e) => setDuration((e.currentTarget as HTMLAudioElement).duration || 0)}
          onEnded={() => {
            console.log("[AudioEngine] 🎵 Stream ended, next track")
            next?.()
          }}
          onError={() => {
            console.log("[AudioEngine] ❌ Stream error")
            setStreamError(true)
            setUseDirectStream(false)
            setStreamUrl(null)
          }}
          onCanPlay={() => console.log("[AudioEngine] ✅ Stream ready")}
        />
      )}

      {/* YouTube Iframe - Hidden but keeps playing in background on mobile */}
      {!useDirectStream && youtubeUrl && (
        <iframe
          ref={(el) => {
            if (el && playerRef) {
              // Store the iframe element for YouTube API
              (playerRef as any).current = el
            }
          }}
          src={`https://www.youtube.com/embed/${currentTrack.youtubeId}?autoplay=1&playsinline=1&controls=0&disablekb=1&modestbranding=1&rel=0&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          style={{ display: 'none', visibility: 'hidden' }}
          title="YouTube Player"
        />
      )}

      {/* Spotify/Preview Audio Fallback */}
      {!currentTrack.youtubeId && currentTrack.previewUrl && (
        <audio
          key={currentTrack.id}
          ref={audioRef}
          src={currentTrack.previewUrl}
          autoPlay={isPlaying}
          preload="auto"
          onTimeUpdate={(e) => setProgress((e.currentTarget as HTMLAudioElement).currentTime)}
          onLoadedMetadata={(e) => setDuration((e.currentTarget as HTMLAudioElement).duration || 0)}
          onEnded={() => next?.()}
        />
      )}
    </div>
  )
}

