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
    playerRef,
    audioRef,
    volume,
  } = usePlayer()

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
