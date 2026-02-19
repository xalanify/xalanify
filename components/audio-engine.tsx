"use client"

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
  } = usePlayer()

  if (!currentTrack?.youtubeId) return null

  return (
    <div className="pointer-events-none fixed -left-[9999px] -top-[9999px] h-0 w-0 overflow-hidden opacity-0">
      <ReactPlayer
        ref={playerRef}
        url={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
        playing={isPlaying}
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
    </div>
  )
}
