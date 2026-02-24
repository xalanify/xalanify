"use client"

import { useState, useEffect, useMemo } from "react"
import { Heart, Plus, X, Music, Send } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { addLikedTrack, getPlaylists, addTrackToPlaylist, searchShareTargets, createShareRequest, type ShareTarget } from "@/lib/supabase"
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
  const { user, profile } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [showPlaylists, setShowPlaylists] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [shareQuery, setShareQuery] = useState("")
  const [shareTargets, setShareTargets] = useState<ShareTarget[]>([])
  const [added, setAdded] = useState(false)
  const [shareMsg, setShareMsg] = useState("")

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

  async function handleSearchTargets() {
    if (!user) return
    const results = await searchShareTargets(user.id, shareQuery)
    setShareTargets(results)
    if (results.length === 0) setShareMsg("Nenhum utilizador encontrado.")
  }

  async function handleShare(toUserId: string, username: string) {
    if (!user) return
    const fromUsername = profile?.username || user.email?.split("@")[0] || "user"
    const res = await createShareRequest({
      fromUserId: user.id,
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

    setShareMsg("Falha ao partilhar. Verifica a tabela share_requests no Supabase.")
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
