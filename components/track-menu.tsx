"use client"

import { useState, useEffect, useMemo } from "react"
import { Heart, Plus, X, Music, Send } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getPlaylists, addTrackToPlaylist, searchShareTargets, createShareRequest, type ShareTarget } from "@/lib/supabase"
import { likeTrack } from "@/lib/db"
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
}

// Helper function to get user ID (works with both Firebase uid and Supabase id)
function getUserId(user: any): string {
  return user?.uid || user?.id || ""
}

export default function TrackMenu({ track, onClose, anchorRect, onLibraryUpdate }: TrackMenuProps) {
  const { user, profile, isAdmin } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [showPlaylists, setShowPlaylists] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [shareQuery, setShareQuery] = useState("")
  const [shareTargets, setShareTargets] = useState<ShareTarget[]>([])
  const [added, setAdded] = useState(false)
  const [shareMsg, setShareMsg] = useState("")
  const [actionMsg, setActionMsg] = useState("")

  const userId = getUserId(user)

  
  useEffect(() => {
    if (userId) {
      getPlaylists(userId).then((data: any) => {
        setPlaylists((data || []).map((item: any) => ({ ...item, tracks: Array.isArray(item.tracks) ? item.tracks : [] })))
      })
    }
  }, [userId])

  async function handleLike() {
    if (!userId) {
      toast.error("Inicia sessão para adicionar aos favoritos.")
      return
    }

    console.log("[TrackMenu] Liking track:", track.id)
    
    const ok = await likeTrack(track)
    console.log("[TrackMenu] Like result:", ok)
    
    if (!ok) {
      toast.error("Falha ao adicionar aos favoritos.")
      return
    }

    toast.success(`"${track.title}" adicionado aos favoritos!`)
    setAdded(true)
    if (onLibraryUpdate) onLibraryUpdate()
    setTimeout(onClose, 500)
  }


  async function handleAddToPlaylist(playlistId: string) {
    const playlist = playlists.find(p => p.id === playlistId)
    console.log("[TrackMenu] Adding to playlist:", { playlistId, trackId: track.id })
    const ok = await addTrackToPlaylist(playlistId, track)
    console.log("[TrackMenu] Add result:", ok)
    if (!ok) {
      toast.error("Falha ao adicionar à playlist.")
      return
    }

    toast.success(`"${track.title}" adicionado a "${playlist?.name}"!`)
    setAdded(true)
    if (onLibraryUpdate) onLibraryUpdate()
    setTimeout(onClose, 500)
  }

  async function handleSearchTargets() {
    if (!userId) return
    console.log("[TrackMenu] Searching targets:", shareQuery)
    const results = await searchShareTargets(userId, shareQuery)
    setShareTargets(results)
    console.log("[TrackMenu] Found targets:", results.length)
    if (results.length === 0) setShareMsg("Nenhum utilizador encontrado.")
  }

  async function handleShare(toUserId: string, username: string) {
    if (!userId) return
    const fromUsername = profile?.username || user?.email?.split("@")[0] || "user"
    console.log("[TrackMenu] Sharing to:", { toUserId, username })
    const res = await createShareRequest({
      fromUserId: userId,
      toUserId,
      fromUsername,
      itemType: "track",
      itemTitle: track.title,
      itemPayload: track,
    })

    if (res.ok) {
      setShareMsg(`Musica enviada para ${username}.`)
      setTimeout(onClose, 800)
      return
    }

    setShareMsg("Falha ao partilhar.")
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
        ) : showShare ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                id="track-menu-share-query"
                name="share_query"
                value={shareQuery}
                onChange={(e) => setShareQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchTargets()}
                placeholder="Pesquisar user..."
                className="w-full rounded-lg bg-[rgba(255,255,255,0.08)] px-2 py-1.5 text-xs text-[#f0e0d0] placeholder-[#a08070] outline-none"
              />
              <button onClick={handleSearchTargets} className="rounded-lg bg-[rgba(255,255,255,0.12)] px-2 py-1.5 text-xs text-[#f0e0d0]">
                Buscar
              </button>
            </div>
            {shareTargets.map((target) => (
              <button
                key={target.user_id}
                onClick={() => handleShare(target.user_id, target.username)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-[#f0e0d0] hover:bg-[rgba(255,255,255,0.08)]"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)] text-[10px] font-semibold text-[#f0e0d0]">
                  {(target.username || "U").charAt(0).toUpperCase()}
                </div>
                <span className="truncate">{target.username}</span>
                <span className="truncate text-[10px] text-[#a08070]">{target.email || ""}</span>
              </button>
            ))}
            {shareMsg && <p className="text-xs text-[#f59e0b]">{shareMsg}</p>}
          </div>
        ) : showPlaylists ? (
          <div className="space-y-1">
            {actionMsg && <p className="px-1 pb-1 text-xs text-[#f59e0b]">{actionMsg}</p>}
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
            {actionMsg && <p className="px-1 pb-1 text-xs text-[#f59e0b]">{actionMsg}</p>}
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
            <button
              onClick={() => setShowShare(true)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-[#f0e0d0] transition-all duration-150 hover:bg-[rgba(255,255,255,0.08)]"
            >
              <Send className="h-4 w-4 text-[#a08070]" />
              <span>Partilhar Musica</span>
            </button>
          </div>
        )}


      </div>
    </div>
  )
}
