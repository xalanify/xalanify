"use client"

import { useEffect, useState, useRef, lazy, Suspense } from "react"
import { usePlayer } from "@/lib/player-context"

// Lazy load React Player
const ReactPlayer = lazy(() => import("react-player/youtube"))

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
  const wakeLockRef = useRef<any>(null)
  const streamAudioRef = useRef<HTMLAudioElement | null>(null)
  const lastVideoIdRef = useRef<string | null>(null)

  // Wake Lock
  useEffect(() => {
    async function requestWakeLock() {
      if (!currentTrack || !isPlaying) {
        if (wakeLockRef.current) {
          try { await wakeLockRef.current.release() } catch {}
          wakeLockRef.current = null
        }
        return
      }

      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen')
        } catch {}
      }
    }
    requestWakeLock()
    return () => {
      if (wakeLockRef.current) {
        try { wakeLockRef.current.release() } catch {}
      }
    }
  }, [currentTrack, isPlaying])

  // Reset quando muda track
  useEffect(() => {
    if (currentTrack?.youtubeId && currentTrack.youtubeId !== lastVideoIdRef.current) {
      lastVideoIdRef.current = currentTrack.youtubeId
      setStreamUrl(null)
      setUseDirectStream(true)
    }
  }, [currentTrack?.youtubeId])

  // Carregar stream via API route (proxy server-side)
  useEffect(() => {
    if (!currentTrack?.youtubeId) {
      setStreamUrl(null)
      return
    }

    const videoId = currentTrack.youtubeId
    
    // Usar API route como proxy para evitar CORS
    fetch(`/api/stream/${videoId}`)
      .then(res => res.json())
      .then(data => {
        if (data.url) {
          setStreamUrl(data.url)
          console.log("[AudioEngine] ✅ Stream direto obtido!")
        } else {
          console.log("[AudioEngine] ❌ Stream não encontrado")
          setUseDirectStream(false)
        }
      })
      .catch(err => {
        console.log("[AudioEngine] ❌ Erro ao buscar stream:", err)
        setUseDirectStream(false)
      })
  }, [currentTrack?.youtubeId])

  // Controlar stream
  useEffect(() => {
    if (!streamUrl || !streamAudioRef.current || !useDirectStream) return

    if (isPlaying) {
      streamAudioRef.current.play().catch(() => {
        console.log("[AudioEngine] ❌ Stream falhou")
        setUseDirectStream(false)
        setStreamUrl(null)
      })
    } else {
      streamAudioRef.current.pause()
    }
  }, [isPlaying, streamUrl, useDirectStream])

  // Volume
  useEffect(() => {
    if (streamAudioRef.current) {
      streamAudioRef.current.volume = volume
    }
  }, [volume])

  // Media Session
  useEffect(() => {
    if (!currentTrack || !("mediaSession" in navigator)) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title || "Unknown",
      artist: currentTrack.artist || "Unknown",
      album: "Xalanify",
      artwork: [{ src: currentTrack.thumbnail || "/icon-512.svg", sizes: "512x512", type: "image/png" }],
    })

    try {
      navigator.mediaSession.setActionHandler("play", () => resume?.())
      navigator.mediaSession.setActionHandler("pause", () => pause?.())
      navigator.mediaSession.setActionHandler("previoustrack", () => previous?.())
      navigator.mediaSession.setActionHandler("nexttrack", () => next?.())
    } catch {}
  }, [currentTrack, next, previous, resume, pause])

  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentTrack) return
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused"
  }, [isPlaying, currentTrack])

  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentTrack) return
    try {
      navigator.mediaSession.setPositionState({ duration: duration || 0, playbackRate: 1, position: progress || 0 })
    } catch {}
  }, [progress, duration, currentTrack])

  // Fallback preview
  useEffect(() => {
    if (!audioRef.current || currentTrack?.youtubeId || !currentTrack?.previewUrl) return
    if (isPlaying) audioRef.current.play().catch(() => {})
    else audioRef.current.pause()
  }, [isPlaying, currentTrack, audioRef])

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = volume
  }, [volume, audioRef])

  if (!currentTrack) return null

  const youtubeUrl = currentTrack.youtubeId 
    ? `https://www.youtube.com/watch?v=${currentTrack.youtubeId}`
    : null

  return (
    <div className="pointer-events-none fixed -left-[9999px] -top-[9999px] h-0 w-0 overflow-hidden opacity-0">
      {/* Direct Stream via API proxy */}
      {useDirectStream && streamUrl && (
        <audio
          ref={streamAudioRef}
          src={streamUrl}
          autoPlay={isPlaying}
          preload="auto"
          onTimeUpdate={(e) => setProgress((e.currentTarget as HTMLAudioElement).currentTime)}
          onLoadedMetadata={(e) => setDuration((e.currentTarget as HTMLAudioElement).duration || 0)}
          onEnded={() => next?.()}
          onError={() => {
            console.log("[AudioEngine] ❌ Stream error")
            setUseDirectStream(false)
            setStreamUrl(null)
          }}
        />
      )}

      {/* YouTube Embed Fallback */}
      {!useDirectStream && youtubeUrl && (
        <Suspense fallback={null}>
          <ReactPlayer
            ref={playerRef}
            url={youtubeUrl}
            playing={isPlaying}
            volume={volume}
            muted={volume <= 0}
            controls={false}
            width={0}
            height={0}
            playsInline={true}
            onProgress={({ playedSeconds }: { playedSeconds: number }) => setProgress(playedSeconds)}
            onDuration={(d: number) => setDuration(d)}
            onEnded={() => next?.()}
            onReady={() => console.log("[AudioEngine] ✅ YouTube ready")}
            onError={(e: any) => console.log("[AudioEngine] ❌ YouTube error:", e)}
            config={{
              playerVars: { 
                autoplay: 1, 
                controls: 0, 
                disablekb: 1, 
                modestbranding: 1,
                playsinline: 1,
              },
            }}
          />
        </Suspense>
      )}

      {/* Spotify Preview */}
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

