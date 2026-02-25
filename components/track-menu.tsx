"use client"

import { useState, useEffect, useMemo } from "react"
import { Heart, Plus, X, Music, Send } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { addLikedTrack, getPlaylists, addTrackToPlaylist, searchShareTargets, createShareRequest, diagnoseLikedTracks, type ShareTarget } from "@/lib/supabase_simple"
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
  const [adminDebug, setAdminDebug] = useState<string[]>([])


  function pushAdminDebug(message: string, payload?: any) {
    if (!isAdmin) return
    const line = payload ? `${message} :: ${JSON.stringify(payload)}` : message
    setAdminDebug((prev) => [line, ...prev].slice(0, 10))
    console.info("[admin][track-menu]", message, payload || "")
  }
  useEffect(() => {
    if (user) {
      getPlaylists(user.id).then((data: any) => {
        setPlaylists((data || []).map((item: any) => ({ ...item, tracks: Array.isArray(item.tracks) ? item.tracks : [] })))
      })
    }
  }, [user])

  async function handleLike() {
    if (!user) {
      toast.error("Inicia sessão para adicionar aos favoritos.")
      pushAdminDebug("Like blocked: no user")
      return
    }

    pushAdminDebug("Like click", { userId: user.id, trackId: track.id, title: track.title })
    console.log("[DEBUG] About to call addLikedTrack", user.id, track?.id)
    console.log("[DEBUG] User object:", { id: user.id, email: user.email })
    
    const ok = await addLikedTrack(user.id, track)
    console.log("[DEBUG] addLikedTrack returned", ok)
    
    // Run diagnostic if admin
    if (isAdmin) {
      const diag = await diagnoseLikedTracks(user.id)
      pushAdminDebug("Diagnostic result", diag)
    }
    
    pushAdminDebug("Like result", { ok, userId: user.id, trackId: track.id })
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
    pushAdminDebug("Add to playlist click", { playlistId, trackId: track.id })
    const ok = await addTrackToPlaylist(playlistId, track)
    pushAdminDebug("Add to playlist result", { ok, playlistId, trackId: track.id })
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
    if (!user) return
    pushAdminDebug("Search targets", { query: shareQuery })
    const results = await searchShareTargets(user.id, shareQuery)
    setShareTargets(results)
    pushAdminDebug("Search targets result", { count: results.length })
    if (results.length === 0) setShareMsg("Nenhum utilizador encontrado.")
  }

  async function handleShare(toUserId: string, username: string) {
    if (!user) return
    const fromUsername = profile?.username || user.email?.split("@")[0] || "user"
    pushAdminDebug("Share click", { toUserId, username, trackId: track.id })
    const res = await createShareRequest({
      fromUserId: user.id,
      toUserId,
      fromUsername,
      itemType: "track",
      itemTitle: track.title,
      itemPayload: track,
    })

    if (res.ok) {
      pushAdminDebug("Share result", { ok: true, toUserId })
      setShareMsg(`Musica enviada para ${username}.`)
      setTimeout(onClose, 800)
      return
    }

    pushAdminDebug("Share result", { ok: false, reason: res.reason || "unknown" })
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

        {isAdmin && adminDebug.length > 0 && (
          <div className="mt-2 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.25)] p-2">
            <p className="mb-1 text-[10px] uppercase tracking-wide text-[#a08070]">Admin debug</p>
            <div className="max-h-24 space-y-1 overflow-y-auto text-[10px] text-[#d8c8b8]">
              {adminDebug.map((line, idx) => (
                <p key={`${idx}-${line}`} className="break-words">{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
