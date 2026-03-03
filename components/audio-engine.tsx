"use client"

import { useEffect, useState, useRef, lazy, Suspense } from "react"
import { usePlayer } from "@/lib/player-context"

// Instâncias Invidious públicas (alternam se uma falhar)
const INVIDIOUS_INSTANCES = [
  "https://invidious.snopyta.org",
  "https://invidious.kavin.rocks",
  "https://invidious.namazso.eu",
  "https://yewtu.be",
]

let currentInstanceIndex = 0

async function getInvidiousStreamUrl(videoId: string): Promise<string | null> {
  for (let i = 0; i < INVIDIOUS_INSTANCES.length; i++) {
    const instance = INVIDIOUS_INSTANCES[currentInstanceIndex]
    currentInstanceIndex = (currentInstanceIndex + 1) % INVIDIOUS_INSTANCES.length
    
    try {
      const response = await fetch(`${instance}/api/v1/videos/${videoId}`)
      if (!response.ok) continue
      
      const data = await response.json()
      
      // Procurar stream de áudio
      const audioStreams = data.adaptiveFormats?.filter((f: any) => f.type?.includes("audio"))
      
      if (audioStreams && audioStreams.length > 0) {
        const bestAudio = audioStreams.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))[0]
        console.log("[AudioEngine] ✅ Stream Invidious obtido")
        return bestAudio.url
      }
    } catch {
      console.log("[AudioEngine] ❌ Instância Invidious falhou:", instance)
    }
  }
  
  return null
}

// Lazy load React Player
const ReactPlayer = lazy(() => import("react-player/youtube"))

function LoadingPlayer() {
  return null
}

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
  } = usePlayer()

  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [loadingStream, setLoadingStream] = useState(false)
  const [useInvidious, setUseInvidious] = useState(true)
  const streamAudioRef = useRef<HTMLAudioElement | null>(null)
  
  // Carregar stream do Invidious quando muda o youtubeId
  useEffect(() => {
    if (!currentTrack?.youtubeId) {
      setStreamUrl(null)
      return
    }

    // Primeiro tentar Invidious
    setLoadingStream(true)
    setUseInvidious(true)
    
    getInvidiousStreamUrl(currentTrack.youtubeId)
      .then((url) => {
        if (url) {
          setStreamUrl(url)
          console.log("[AudioEngine] ✅ Usando stream Invidious")
        } else {
          console.log("[AudioEngine] ⚠️ Invidious falhou")
          setUseInvidious(false)
        }
      })
      .catch(() => {
        console.log("[AudioEngine] ❌ Erro Invidious")
        setUseInvidious(false)
      })
      .finally(() => {
        setLoadingStream(false)
      })
  }, [currentTrack?.youtubeId])

  // Controlar reprodução do stream
  useEffect(() => {
    if (!streamUrl || !streamAudioRef.current) return

    if (isPlaying) {
      streamAudioRef.current.play().catch(() => {
        console.log("[AudioEngine] ⚠️ Stream falhou, tentando YouTube")
        setUseInvidious(false)
      })
    } else {
      streamAudioRef.current.pause()
    }
  }, [isPlaying, streamUrl])

  // Atualizar volume
  useEffect(() => {
    if (streamAudioRef.current) {
      streamAudioRef.current.volume = volume
    }
  }, [volume])

  // Media Session API
  useEffect(() => {
    if (!currentTrack || !("mediaSession" in navigator)) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title || "Unknown Title",
      artist: currentTrack.artist || "Unknown Artist",
      album: "Xalanify",
      artwork: [{ src: currentTrack.thumbnail || "/icon-512.svg", sizes: "512x512", type: "image/png" }],
    })

    try {
      navigator.mediaSession.setActionHandler("play", () => isPlaying ? null : null)
      navigator.mediaSession.setActionHandler("pause", () => null)
      navigator.mediaSession.setActionHandler("previoustrack", () => previous?.())
      navigator.mediaSession.setActionHandler("nexttrack", () => next?.())
    } catch {}
  }, [currentTrack, next, previous])

  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentTrack) return
    try {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused"
    } catch {}
  }, [isPlaying, currentTrack])

  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentTrack) return
    try {
      navigator.mediaSession.setPositionState({ duration: duration || 0, playbackRate: 1, position: progress || 0 })
    } catch {}
  }, [progress, duration, currentTrack])

  // Fallback para previewUrl (iTunes)
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

  return (
    <div className="pointer-events-none fixed -left-[9999px] -top-[9999px] h-0 w-0 overflow-hidden opacity-0">
      {/* Stream do Invidious (preferido) */}
      {useInvidious && streamUrl && !loadingStream && (
        <audio
          ref={streamAudioRef}
          src={streamUrl}
          autoPlay={isPlaying}
          preload="auto"
          onTimeUpdate={(e) => setProgress((e.currentTarget as HTMLAudioElement).currentTime)}
          onLoadedMetadata={(e) => setDuration((e.currentTarget as HTMLAudioElement).duration || 0)}
          onEnded={next}
          onError={() => {
            console.log("[AudioEngine] ❌ Erro stream, fallback YouTube")
            setUseInvidious(false)
            setStreamUrl(null)
          }}
        />
      )}

      {/* YouTube Embed (fallback) */}
      {!useInvidious && currentTrack.youtubeId && (
        <Suspense fallback={null}>
          <ReactPlayer
            ref={playerRef}
            url={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
            playing={isPlaying}
            volume={volume}
            muted={volume <= 0}
            controls={false}
            width={0}
            height={0}
            onProgress={({ playedSeconds }: { playedSeconds: number }) => setProgress(playedSeconds)}
            onDuration={(d: number) => setDuration(d)}
            onEnded={next}
            config={{
              playerVars: { autoplay: 1, controls: 0, disablekb: 1, modestbranding: 1 },
            }}
          />
        </Suspense>
      )}

      {/* iTunes Preview (fallback final) */}
      {!currentTrack.youtubeId && currentTrack.previewUrl && (
        <audio
          key={currentTrack.id}
          ref={audioRef}
          src={currentTrack.previewUrl}
          autoPlay={isPlaying}
          preload="auto"
          onTimeUpdate={(e) => setProgress((e.currentTarget as HTMLAudioElement).currentTime)}
          onLoadedMetadata={(e) => setDuration((e.currentTarget as HTMLAudioElement).duration || 0)}
          onEnded={next}
        />
      )}
    </div>
  )
}
