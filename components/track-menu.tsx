"use client"

import { useState, useEffect } from "react"
import { Heart, Plus, X, Music } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { addLikedTrack, getPlaylists, addTrackToPlaylist } from "@/lib/supabase"
import type { Track } from "@/lib/player-context"

interface Playlist {
  id: string
  name: string
  tracks: Track[]
}

interface TrackMenuProps {
  track: Track
  onClose: () => void
}

export default function TrackMenu({ track, onClose }: TrackMenuProps) {
  const { user } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [showPlaylists, setShowPlaylists] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (user) {
      getPlaylists(user.id).then(setPlaylists)
    }
  }, [user])

  async function handleLike() {
    if (!user) return
    await addLikedTrack(user.id, track)
    setAdded(true)
    setTimeout(onClose, 600)
  }

  async function handleAddToPlaylist(playlistId: string) {
    await addTrackToPlaylist(playlistId, track)
    setAdded(true)
    setTimeout(onClose, 600)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(0,0,0,0.7)]"
      onClick={onClose}
    >
      <div
        className="glass-card-strong w-full max-w-lg rounded-t-3xl p-5 pb-8 safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Track Info */}
        <div className="mb-4 flex items-center gap-3">
          <img
            src={track.thumbnail}
            alt={track.title}
            className="h-12 w-12 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#f0e0d0]">
              {track.title}
            </p>
            <p className="truncate text-xs text-[#a08070]">{track.artist}</p>
          </div>
          <button onClick={onClose} className="p-1 text-[#706050]" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>

        {added ? (
          <div className="py-6 text-center text-sm text-[#e63946]">
            Adicionado com sucesso!
          </div>
        ) : showPlaylists ? (
          <div className="space-y-2">
            <p className="mb-2 text-xs font-medium text-[#706050] uppercase tracking-wider">
              Escolher Playlist
            </p>
            {playlists.length === 0 ? (
              <p className="py-4 text-center text-xs text-[#504030]">
                Sem playlists. Cria uma na Biblioteca.
              </p>
            ) : (
              playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => handleAddToPlaylist(pl.id)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors active:bg-[rgba(255,255,255,0.05)]"
                >
                  <Music className="h-5 w-5 text-[#a08070]" />
                  <span className="text-sm text-[#f0e0d0]">{pl.name}</span>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <button
              onClick={handleLike}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors active:bg-[rgba(255,255,255,0.05)]"
            >
              <Heart className="h-5 w-5 text-[#e63946]" />
              <span className="text-sm text-[#f0e0d0]">Adicionar aos Favoritos</span>
            </button>
            <button
              onClick={() => setShowPlaylists(true)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors active:bg-[rgba(255,255,255,0.05)]"
            >
              <Plus className="h-5 w-5 text-[#a08070]" />
              <span className="text-sm text-[#f0e0d0]">Adicionar a Playlist</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
