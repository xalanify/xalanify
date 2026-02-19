"use client"

import { useState, useEffect, useMemo } from "react"
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
  anchorRect?: DOMRect | null
}

export default function TrackMenu({ track, onClose, anchorRect }: TrackMenuProps) {
  const { user } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [showPlaylists, setShowPlaylists] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (user) {
      getPlaylists(user.id).then((data: any) => {
        setPlaylists((data || []).map((item: any) => ({ ...item, tracks: Array.isArray(item.tracks) ? item.tracks : [] })))
      })
    }
  }, [user])

  async function handleLike() {
    if (!user) return
    await addLikedTrack(user.id, track)
    setAdded(true)
    setTimeout(onClose, 500)
  }

  async function handleAddToPlaylist(playlistId: string) {
    await addTrackToPlaylist(playlistId, track)
    setAdded(true)
    setTimeout(onClose, 500)
  }

  const menuPosition = useMemo(() => {
    if (!anchorRect) return null
    const width = 260
    const margin = 10
    const left = Math.max(margin, Math.min(window.innerWidth - width - margin, anchorRect.right - width))
    const top = Math.min(window.innerHeight - 220, anchorRect.bottom + 8)
    return { left, top, width }
  }, [anchorRect])

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        className="absolute rounded-2xl border border-[rgba(255,255,255,0.1)] p-3 shadow-2xl"
        style={{
          left: menuPosition?.left ?? 12,
          top: menuPosition?.top ?? 90,
          width: menuPosition?.width ?? 260,
          background: "linear-gradient(135deg, rgba(230,57,70,0.34) 0%, rgba(20,10,10,0.98) 100%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-3">
          <img src={track.thumbnail} alt={track.title} className="h-10 w-10 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#f0e0d0]">{track.title}</p>
            <p className="truncate text-xs text-[#a08070]">{track.artist}</p>
          </div>
          <button onClick={onClose} className="p-1 text-[#706050]" aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>

        {added ? (
          <div className="py-3 text-center text-sm text-[#f0e0d0]">Adicionado com sucesso!</div>
        ) : showPlaylists ? (
          <div className="space-y-1">
            <p className="mb-1 text-[10px] uppercase tracking-wide text-[#a08070]">Escolher Playlist</p>
            {playlists.length === 0 ? (
              <p className="py-2 text-center text-xs text-[#a08070]">Sem playlists. Cria uma na Biblioteca.</p>
            ) : (
              playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => handleAddToPlaylist(pl.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-[#f0e0d0] transition-all duration-150 hover:bg-[rgba(255,255,255,0.08)]"
                >
                  <Music className="h-4 w-4 text-[#a08070]" />
                  <span className="truncate">{pl.name}</span>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <button
              onClick={handleLike}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-[#f0e0d0] transition-all duration-150 hover:bg-[rgba(255,255,255,0.08)]"
            >
              <Heart className="h-4 w-4 text-[#e63946]" />
              <span>Adicionar aos Favoritos</span>
            </button>
            <button
              onClick={() => setShowPlaylists(true)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-[#f0e0d0] transition-all duration-150 hover:bg-[rgba(255,255,255,0.08)]"
            >
              <Plus className="h-4 w-4 text-[#a08070]" />
              <span>Adicionar a Playlist</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
