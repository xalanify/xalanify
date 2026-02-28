"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import { usePlayer } from "@/lib/player-context"

const ReactPlayer = dynamic(() => import("react-player/youtube"), {
  ssr: false,
})

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

  // Media Session API - para 控制音乐在锁定屏幕上
  useEffect(() => {
    if (!currentTrack || !("mediaSession" in navigator)) return

    // 设置媒体元数据
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title || "Unknown Title",
      artist: currentTrack.artist || "Unknown Artist",
      album: "Xalanify",
      artwork: [
        {
          src: currentTrack.thumbnail || "/icon-512.svg",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    })

    // 处理播放操作
    const handlePlay = () => {
      if (playerRef?.current) {
        // YouTube player
      } else if (audioRef?.current) {
        audioRef.current.play().catch(() => {})
      }
    }

    const handlePause = () => {
      if (playerRef?.current) {
        // YouTube player
      } else if (audioRef?.current) {
        audioRef.current.pause()
      }
    }

    const handleSeek = (details: any) => {
      const seekTime = details.seekTime
      if (playerRef?.current) {
        playerRef.current.seekTo(seekTime / 1000, "seconds")
      } else if (audioRef?.current) {
        audioRef.current.currentTime = seekTime / 1000
      }
    }

    // 注册媒体操作处理器
    try {
      navigator.mediaSession.setActionHandler("play", handlePlay)
      navigator.mediaSession.setActionHandler("pause", handlePause)
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        previous?.()
      })
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        next?.()
      })
      navigator.mediaSession.setActionHandler("seekbackward", (details) => {
        const seekTime = (details.seekOffset || 10) * 1000
        const newTime = Math.max(0, (progress * duration) - seekTime / 1000)
        if (playerRef?.current) {
          playerRef.current.seekTo(newTime, "seconds")
        } else if (audioRef?.current) {
          audioRef.current.currentTime = newTime
        }
      })
      navigator.mediaSession.setActionHandler("seekforward", (details) => {
        const seekTime = (details.seekOffset || 10) * 1000
        const newTime = Math.min(duration, (progress * duration) + seekTime / 1000)
        if (playerRef?.current) {
          playerRef.current.seekTo(newTime, "seconds")
        } else if (audioRef?.current) {
          audioRef.current.currentTime = newTime
        }
      })
      navigator.mediaSession.setActionHandler("seekto", handleSeek)
    } catch (e) {
      console.log("Media Session not supported:", e)
    }

    return () => {
      // 清理
      try {
        navigator.mediaSession.setActionHandler("play", null)
        navigator.mediaSession.setActionHandler("pause", null)
        navigator.mediaSession.setActionHandler("previoustrack", null)
        navigator.mediaSession.setActionHandler("nexttrack", null)
        navigator.mediaSession.setActionHandler("seekbackward", null)
        navigator.mediaSession.setActionHandler("seekforward", null)
        navigator.mediaSession.setActionHandler("seekto", null)
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }, [currentTrack])

  // 更新播放状态
  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentTrack) return
    
    try {
      if (isPlaying) {
        navigator.mediaSession.playbackState = "playing"
      } else {
        navigator.mediaSession.playbackState = "paused"
      }
    } catch (e) {
      // Ignore
    }
  }, [isPlaying, currentTrack])

  // 更新进度
  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentTrack) return
    
    try {
      navigator.mediaSession.setPositionState({
        duration: duration || 0,
        playbackRate: 1,
        position: progress || 0,
      })
    } catch (e) {
      // Ignore
    }
  }, [progress, duration, currentTrack])

  useEffect(() => {
    if (!audioRef.current || currentTrack?.youtubeId || !currentTrack?.previewUrl) return

    if (isPlaying) {
      audioRef.current.play().catch(() => {})
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, currentTrack, audioRef])

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = volume
  }, [volume, audioRef])

  if (!currentTrack) return null

  return (
    <div className="pointer-events-none fixed -left-[9999px] -top-[9999px] h-0 w-0 overflow-hidden opacity-0">
      {currentTrack.youtubeId ? (
        <ReactPlayer
          ref={playerRef}
          url={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
          playing={isPlaying}
          volume={volume}
          muted={volume <= 0}
          controls={false}
          width={0}
          height={0}
          onProgress={({ playedSeconds }) => setProgress(playedSeconds)}
          onDuration={(d) => setDuration(d)}
          onEnded={next}
          config={{
            playerVars: {
              autoplay: 1,
              controls: 0,
              disablekb: 1,
              modestbranding: 1,
            },
          }}
        />
      ) : currentTrack.previewUrl ? (
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
      ) : null}
    </div>
  )
}
