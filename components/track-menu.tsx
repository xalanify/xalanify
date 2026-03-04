"use client"

import { useState, useEffect, useMemo } from "react"
import { Heart, Plus, X, Music, Trash2, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getPlaylists, addTrackToPlaylist } from "@/lib/supabase"
import { useTheme } from "@/lib/theme-context"
import { likeTrack, unlikeTrack } from "@/lib/db"
import { toast } from "sonner"
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
  onLibraryUpdate?: () => void
  showRemoveFromFavorites?: boolean
  onRemoveFromFavorites?: () => void
  playlists?: { id: string; name: string }[]
  onAddToPlaylist?: (playlistId: string) => void
}

// Helper function to get user ID (works with both Firebase uid and Supabase id)
function getUserId(user: any): string {
  return user?.uid || user?.id || ""
}

export default function TrackMenu({ 
  track, 
  onClose, 
  anchorRect, 
  onLibraryUpdate,
  showRemoveFromFavorites = false,
  onRemoveFromFavorites,
  playlists: externalPlaylists,
  onAddToPlaylist
}: TrackMenuProps) {
  const { user, profile, isAdmin } = useAuth()
  const { accentHex } = useTheme()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [showPlaylists, setShowPlaylists] = useState(false)
  const [added, setAdded] = useState(false)
  const [actionMsg, setActionMsg] = useState("")

  const userId = getUserId(user)

  useEffect(() => {
    if (userId && !externalPlaylists) {
      getPlaylists(userId).then((data: any) => {
        setPlaylists((data || []).map((item: any) => ({ ...item, tracks: Array.isArray(item.tracks) ? item.tracks : [] })))
      })
    }
  }, [userId, externalPlaylists])

  const playlistData = externalPlaylists || playlists

  async function handleLike() {
    if (!userId) {
      toast.error("Inicia sessão para adicionar aos favoritos.")
      return
    }

    const ok = await likeTrack(track)
    if (!ok) {
      toast.error("Falha ao adicionar aos favoritos.")
      return
    }

    toast.success(`"${track.title}" adicionado aos favoritos!`)
    setAdded(true)
    if (onLibraryUpdate) onLibraryUpdate()
    setTimeout(onClose, 500)
  }

  async function handleUnlike() {
    if (!userId) return

    const ok = await unlikeTrack(track.id)
    if (!ok) {
      toast.error("Falha ao remover dos favoritos.")
      return
    }

    toast.success(`"${track.title}" removido dos favoritos!`)
    if (onRemoveFromFavorites) onRemoveFromFavorites()
    if (onLibraryUpdate) onLibraryUpdate()
    setTimeout(onClose, 500)
  }

  async function handleAddToPlaylist(playlistId: string) {
    const playlist = playlistData.find(p => p.id === playlistId)
    const ok = await addTrackToPlaylist(playlistId, track)
    if (!ok) {
      toast.error("Falha ao adicionar à playlist.")
      return
    }

    toast.success(`"${track.title}" adicionado a "${playlist?.name}"!`)
    setAdded(true)
    if (onLibraryUpdate) onLibraryUpdate()
    if (onAddToPlaylist) onAddToPlaylist(playlistId)
    setTimeout(onClose, 500)
  }

  const menuPosition = useMemo(() => {
    if (!anchorRect) return null
    const width = 280
    const margin = 10
    const left = Math.max(margin, Math.min(window.innerWidth - width - margin, anchorRect.right - width))
    const top = Math.min(window.innerHeight - 300, anchorRect.bottom + 8)
    return { left, top, width }
  }, [anchorRect])

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        className="absolute rounded-[18px] glass-card p-3 shadow-2xl overflow-hidden"
        style={{
          left: menuPosition?.left ?? 12,
          top: menuPosition?.top ?? 90,
          width: menuPosition?.width ?? 280,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Track Info */}
        <div className="mb-3 flex items-center gap-3">
          <img src={track.thumbnail} alt={track.title} className="h-12 w-12 rounded-[10px] object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[17px] font-semibold text-[#D2B48C]">{track.title}</p>
            <p className="truncate text-[14px] text-[#8E8E93]">{track.artist}</p>
          </div>
          <button onClick={onClose} className="p-1 text-[#8E8E93] hover:text-[#D2B48C]" aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>

        {added ? (
          <div className="py-3 text-center text-sm text-green-400">Adicionado com sucesso!</div>
        ) : showPlaylists ? (
          <div className="space-y-1">
            <button 
              onClick={() => setShowPlaylists(false)}
              className="flex items-center gap-2 text-xs text-[#8E8E93] hover:text-[#D2B48C] mb-2"
            >
              <ArrowLeft className="h-3 w-3" /> Voltar
            </button>
            <p className="text-xs uppercase tracking-wide text-[#8E8E93] px-1">Escolher Playlist</p>
            {playlistData.length === 0 ? (
              <p className="py-3 text-center text-xs text-[#8E8E93]/50">Sem playlists. Cria uma na Biblioteca.</p>
            ) : (
              playlistData.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => handleAddToPlaylist(pl.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#D2B48C] hover:bg-[#D2B48C]/10"
                >
                  <Music className="h-4 w-4 text-[#8E8E93]" />
                  <span className="truncate">{pl.name}</span>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {showRemoveFromFavorites ? (
              <button
                onClick={handleUnlike}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Remover dos Favoritos</span>
              </button>
            ) : (
              <button
                onClick={handleLike}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#D2B48C] hover:bg-[#D2B48C]/10 transition-colors"
              >
                <Heart className="h-4 w-4 text-[#e63946]" />
                <span>Adicionar aos Favoritos</span>
              </button>
            )}
            <button
              onClick={() => setShowPlaylists(true)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#D2B48C] hover:bg-[#D2B48C]/10 transition-colors"
            >
              <Plus className="h-4 w-4 text-[#8E8E93]" />
              <span>Adicionar a Playlist</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
