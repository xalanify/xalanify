"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Pause, Activity, AlertCircle, Volume2, VolumeX } from "lucide-react";
import { useState, useRef } from "react";
import dynamic from "next/dynamic";

// Importação dinâmica do ReactPlayer
const ReactPlayer = dynamic(() => import("react-player"), { 
  ssr: false,
  loading: () => <div className="hidden" /> 
}) as any;

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, themeColor, isAdmin } = useXalanify();
  const [isReady, setIsReady] = useState(false);
  const [errorLog, setErrorLog] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.8); // Volume padrão 80%
  const [isMuted, setIsMuted] = useState(false);
  const playerRef = useRef<any>(null);

  if (!currentTrack) return null;

  // Se for track local (Admin), usa o ficheiro da pasta public. Caso contrário, YouTube.
  const audioSource = currentTrack.isLocal 
    ? "/test.mp3" 
    : `https://www.youtube.com/watch?v=${currentTrack.youtubeId}`;

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed bottom-[85px] left-0 right-0 z-50 px-4 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        
        {/* DEBUG PANEL - ADMIN ONLY */}
        {isAdmin && (
          <div className="mb-2 p-3 bg-black/95 border border-white/10 rounded-2xl font-mono text-[10px] shadow-2xl">
            <div className="flex justify-between items-center mb-1 border-b border-white/5 pb-1 text-yellow-500 font-bold">
              <span className="flex items-center gap-1"><Activity size={12}/> ENGINE</span>
              <span>{isReady ? "✓ READY" : "⏳ LOADING"}</span>
            </div>
            <p className="truncate opacity-50 mb-1">Src: {audioSource}</p>
            <p className="opacity-50">Volume: {Math.round(volume * 100)}% | Muted: {isMuted ? "Yes" : "No"}</p>
            {errorLog && (
              <p className="text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={10}/> {errorLog}
              </p>
            )}
          </div>
        )}

        {/* PLAYER ESCONDIDO */}
        <div className="hidden">
          <ReactPlayer
            ref={playerRef}
            url={audioSource}
            playing={isPlaying}
            volume={isMuted ? 0 : volume}
            playsinline
            controls={false}
            width="0"
            height="0"
            onReady={() => {
              console.log("✓ Player Ready:", audioSource);
              setIsReady(true);
              setErrorLog(null);
            }}
            onStart={() => {
              console.log("▶ Playback Started");
              setErrorLog(null);
            }}
            onPlay={() => {
              console.log("▶ Playing");
            }}
            onPause={() => {
              console.log("⏸ Paused");
            }}
            onError={(e: any) => {
              console.error("❌ Playback Error:", e);
              const errorMsg = currentTrack.isLocal 
                ? "Ficheiro test.mp3 não encontrado em /public" 
                : "Vídeo bloqueado ou indisponível no YouTube";
              setErrorLog(errorMsg);
            }}
            onBuffer={() => {
              console.log("⏳ Buffering...");
            }}
            onBufferEnd={() => {
              console.log("✓ Buffer Complete");
            }}
            config={{
              youtube: {
                playerVars: {
                  autoplay: 1,
                  controls: 0,
                  modestbranding: 1,
                  playsinline: 1,
                  rel: 0,
                  showinfo: 0,
                  iv_load_policy: 3,
                  fs: 0,
                  disablekb: 1,
                  enablejsapi: 1
                },
                embedOptions: {
                  host: 'https://www.youtube-nocookie.com'
                }
              },
              file: {
                attributes: {
                  controlsList: 'nodownload',
                  disablePictureInPicture: true
                }
              }
            }}
          />
        </div>

        {/* UI DO PLAYER */}
        <div className="bg-zinc-900/95 border border-white/10 p-3 rounded-[2.2rem] flex items-center justify-between shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center gap-3 pl-1 truncate max-w-[60%] text-left">
            <img 
              src={currentTrack.thumbnail} 
              className="w-12 h-12 rounded-2xl object-cover" 
              alt="" 
            />
            <div className="truncate">
              <p className="text-[14px] font-bold text-white truncate leading-tight">
                {currentTrack.title}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">
                  {currentTrack.artist}
                </p>
                {isReady && isPlaying && (
                  <Volume2 size={10} className="text-green-500 animate-pulse" />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Controle de Volume */}
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <button
                onClick={toggleMute}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${themeColor} 0%, ${themeColor} ${volume * 100}%, #3f3f46 ${volume * 100}%, #3f3f46 100%)`
                }}
              />
            </div>

            {/* Botão Play/Pause */}
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              disabled={!isReady && !currentTrack.isLocal}
              className="w-12 h-12 rounded-full flex items-center justify-center text-black active:scale-90 transition-all shadow-lg disabled:opacity-50"
              style={{ backgroundColor: themeColor }}
            >
              {isPlaying ? (
                <Pause size={20} fill="currentColor" />
              ) : (
                <Play size={20} fill="currentColor" className="ml-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
