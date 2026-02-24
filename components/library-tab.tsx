"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Plus,
  Heart,
  ChevronRight,
  MoreVertical,
  Trash2,
  Music,
  X,
  Send,
  Inbox,
  Check,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { usePlayer, type Track } from "@/lib/player-context"
import {
  getPlaylists,
  createPlaylist,
  deletePlaylist,
  getLikedTracks,
  removeLikedTrack,
  getIncomingShareRequests,
  acceptShareRequest,
  rejectShareRequest,
  searchShareTargets,
  createShareRequest,
  type ShareRequest,
  type ShareTarget,
} from "@/lib/supabase"

interface Playlist {
  id: string
  name: string
  tracks: Track[]
  image_url?: string | null
}

export default function LibraryTab() {
  const { user } = useAuth()
  const { play, setQueue } = usePlayer()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [likedTracks, setLikedTracks] = useState<Track[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [viewPlaylist, setViewPlaylist] = useState<Playlist | null>(null)
  const [viewLiked, setViewLiked] = useState(false)
  const [viewPendingShares, setViewPendingShares] = useState(false)
  const [menuPlaylistId, setMenuPlaylistId] = useState<string | null>(null)
  const [libraryMsg, setLibraryMsg] = useState("")
  const [pendingShares, setPendingShares] = useState<ShareRequest[]>([])
  const [sharePlaylist, setSharePlaylist] = useState<Playlist | null>(null)
  const [shareQuery, setShareQuery] = useState("")
  const [shareTargets, setShareTargets] = useState<ShareTarget[]>([])
  const [shareMsg, setShareMsg] = useState("")

  function isTestPlaylist(playlist: Playlist) {
    return playlist.name.toLowerCase().includes("teste") || playlist.name.toLowerCase().includes("demo")
  }

  function testTrackLabel(track: Track) {
    if (!track.isTestContent) return null
    return track.testLabel || "musica de testes"
  }

  const loadData = useCallback(async () => {
    if (!user) return
    const [pl, lt, incoming] = await Promise.all([
      getPlaylists(user.id),
      getLikedTracks(user.id),
      getIncomingShareRequests(user.id),
    ])
    setPlaylists(pl.map((playlist: any) => ({ ...playlist, tracks: Array.isArray(playlist.tracks) ? playlist.tracks : [] })))
    setLikedTracks(lt)
    setPendingShares(incoming)
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleCreate() {
    if (!user || !newName.trim()) return
    const created: any = await createPlaylist(user.id, newName.trim())
    if (created?.existed) {
      setLibraryMsg("Ja existe uma playlist com esse nome.")
    } else if (created?.id) {
      setLibraryMsg("Playlist criada com sucesso.")
    }
    setNewName("")
    setShowCreate(false)
    loadData()
  }

  async function handleDelete(id: string) {
    await deletePlaylist(id)
    setMenuPlaylistId(null)
    loadData()
  }

  async function handleRemoveLiked(trackId: string) {
    if (!user) return
    await removeLikedTrack(user.id, trackId)
    loadData()
  }

  async function handleSearchShareTargets() {
    if (!user) return
    const items = await searchShareTargets(user.id, shareQuery)
    setShareTargets(items)
  }

  async function handleSharePlaylist(target: ShareTarget) {
    if (!user || !sharePlaylist) return
    const fromUsername = user.email?.split("@")[0] || "user"
    const res = await createShareRequest({
      fromUserId: user.id,
      toUserId: target.user_id,
      fromUsername,
      itemType: "playlist",
      itemTitle: sharePlaylist.name,
      itemPayload: {
        id: sharePlaylist.id,
        name: sharePlaylist.name,
        tracks: sharePlaylist.tracks,
        image_url: sharePlaylist.image_url || null,
      },
    })

    if (res.ok) {
      setShareMsg(`Playlist enviada para ${target.username}.`)
      return
    }

    setShareMsg("Falha ao partilhar. Verifica a tabela share_requests no Supabase.")
  }

  async function handleAcceptShare(request: ShareRequest) {
    if (!user) return
    await acceptShareRequest(user.id, request)
    loadData()
  }

  async function handleRejectShare(requestId: string) {
    if (!user) return
    await rejectShareRequest(user.id, requestId)
    loadData()
  }

  // Playlist colors based on index
  const playlistColors = [
    "from-[#4a3040] to-[#2a1a2a]",
    "from-[#3a2050] to-[#1a1030]",
    "from-[#504020] to-[#302010]",
    "from-[#204040] to-[#102020]",
    "from-[#403020] to-[#201810]",
  ]

  // View specific playlist
  if (viewPlaylist) {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2">
        <div className="mb-4 flex items-center gap-3">
          <button onClick={() => setViewPlaylist(null)} className="text-[#a08070]">
            <ChevronRight className="h-6 w-6 rotate-180" />
          </button>
          <h2 className="text-xl font-bold text-[#f0e0d0]">{viewPlaylist.name}</h2>
        </div>

        {viewPlaylist.tracks.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-[#706050]">
            <Music className="mb-3 h-10 w-10 opacity-40" />
            <p className="text-sm">Playlist vazia</p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto hide-scrollbar">
            {viewPlaylist.tracks.map((track: Track) => (
              <button
                key={track.id}
                onClick={() => {
                  setQueue(viewPlaylist.tracks)
                  play(track)
                }}
                className="glass-card flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-200 active:scale-[0.99]"
              >
                <img
                  src={track.thumbnail}
                  alt={track.title}
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#f0e0d0]">{track.title}</p>
                  <p className="truncate text-xs text-[#a08070]">{track.artist}</p>
                  {testTrackLabel(track) && <p className="truncate text-[10px] text-[#f59e0b]">({testTrackLabel(track)})</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // View liked tracks
  if (viewLiked) {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2">
      <div className="mb-4 flex items-center gap-3">
          <button onClick={() => setViewLiked(false)} className="text-[#a08070]">
            <ChevronRight className="h-6 w-6 rotate-180" />
          </button>
          <h2 className="text-xl font-bold text-[#f0e0d0]">Favoritos</h2>
        </div>

        {likedTracks.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-[#706050]">
            <Heart className="mb-3 h-10 w-10 opacity-40" />
            <p className="text-sm">Sem favoritos ainda</p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto hide-scrollbar">
            {likedTracks.map((track: Track) => (
              <button
                key={track.id}
                onClick={() => {
                  setQueue(likedTracks)
                  play(track)
                }}
                className="glass-card flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-200 active:scale-[0.99]"
              >
                <img
                  src={track.thumbnail}
                  alt={track.title}
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#f0e0d0]">{track.title}</p>
                  <p className="truncate text-xs text-[#a08070]">{track.artist}</p>
                  {testTrackLabel(track) && <p className="truncate text-[10px] text-[#f59e0b]">({testTrackLabel(track)})</p>}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveLiked(track.id)
                  }}
                  className="shrink-0 p-1.5 text-[#e63946]"
                  aria-label="Remover dos favoritos"
                >
                  <Heart className="h-5 w-5 fill-current" />
                </button>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (viewPendingShares) {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2">
        <div className="mb-4 flex items-center gap-3">
          <button onClick={() => setViewPendingShares(false)} className="text-[#a08070]">
            <ChevronRight className="h-6 w-6 rotate-180" />
          </button>
          <h2 className="text-xl font-bold text-[#f0e0d0]">Partilhas Pendentes</h2>
        </div>

        <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto hide-scrollbar">
          {pendingShares.map((request) => (
            <div key={request.id} className="glass-card rounded-xl p-3">
              <p className="truncate text-sm font-semibold text-[#f0e0d0]">{request.item_title}</p>
              <p className="truncate text-xs text-[#a08070]">
                {request.item_type === "playlist" ? "Playlist" : "Musica"} enviada por {request.from_username}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => handleAcceptShare(request)}
                  className="rounded-lg bg-[rgba(16,185,129,0.24)] px-2.5 py-1 text-xs text-[#f0e0d0]"
                >
                  <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Aceitar</span>
                </button>
                <button
                  onClick={() => handleRejectShare(request.id)}
                  className="rounded-lg bg-[rgba(230,57,70,0.24)] px-2.5 py-1 text-xs text-[#f0e0d0]"
                >
                  Recusar
                </button>
              </div>
            </div>
          ))}
          {pendingShares.length === 0 && (
            <p className="py-20 text-center text-sm text-[#706050]">Sem partilhas pendentes.</p>
          )}
        </div>
      </div>
    )
  }

  // Main library view
  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#f0e0d0]">Biblioteca</h1>
        <div className="h-10 w-10 overflow-hidden rounded-full bg-[rgba(255,255,255,0.1)]">
          <div className="flex h-full w-full items-center justify-center text-sm font-medium text-[#a08070]">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto hide-scrollbar">
        {libraryMsg && <p className="text-xs text-[#f59e0b]">{libraryMsg}</p>}
        {/* Create Playlist */}
        <button
          onClick={() => setShowCreate(true)}
          className="glass-card flex w-full items-center gap-4 rounded-xl p-4 transition-all duration-200 active:scale-[0.99]"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)]">
            <Plus className="h-5 w-5 text-[#e63946]" />
          </div>
          <span className="text-sm font-medium text-[#f0e0d0]">Criar Playlist</span>
        </button>

        {/* Favoritos */}
        <button
          onClick={() => setViewLiked(true)}
          className="glass-card flex w-full items-center gap-4 rounded-xl p-4 transition-all duration-200 active:scale-[0.99]"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e63946]">
            <Heart className="h-5 w-5 fill-current text-[#fff]" />
          </div>
          <span className="flex-1 text-left text-sm font-medium text-[#f0e0d0]">Favoritos</span>
          <ChevronRight className="h-5 w-5 text-[#706050]" />
        </button>

        <button
          onClick={() => setViewPendingShares(true)}
          className="glass-card flex w-full items-center gap-4 rounded-xl p-4 transition-all duration-200 active:scale-[0.99]"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)]">
            <Inbox className="h-5 w-5 text-[#e0b45a]" />
          </div>
          <span className="flex-1 text-left text-sm font-medium text-[#f0e0d0]">Partilhas Pendentes</span>
          {pendingShares.length > 0 && (
            <span className="rounded-full bg-[rgba(230,57,70,0.2)] px-2 py-0.5 text-[10px] text-[#f0e0d0]">{pendingShares.length}</span>
          )}
          <ChevronRight className="h-5 w-5 text-[#706050]" />
        </button>

        {/* Playlists */}
        {playlists.map((pl, idx) => (
          <div key={pl.id} className="relative">
            <button
              onClick={() => setViewPlaylist(pl)}
              className="glass-card flex w-full items-center gap-4 rounded-xl p-4 transition-all duration-200 active:scale-[0.99]"
            >
              {pl.image_url ? (
                <img src={pl.image_url} alt={pl.name} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
              ) : (
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${playlistColors[idx % playlistColors.length]}`}
                >
                  <Music className="h-5 w-5 text-[#c0a090]" />
                </div>
              )}
              <div className="min-w-0 flex-1 text-left">
                <span className="block truncate text-sm font-medium text-[#f0e0d0]">{pl.name}</span>
                {isTestPlaylist(pl) && <span className="block truncate text-[10px] text-[#f59e0b]">(playlist de testes)</span>}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuPlaylistId(menuPlaylistId === pl.id ? null : pl.id)
                }}
                className="shrink-0 p-1 text-[#706050]"
                aria-label="Opcoes da playlist"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            </button>

            {menuPlaylistId === pl.id && (
              <div className="absolute right-4 top-16 z-10 rounded-xl border border-[rgba(255,255,255,0.1)] p-2 shadow-xl"
                style={{ background: "linear-gradient(135deg, rgba(230,57,70,0.34) 0%, rgba(20,10,10,0.98) 100%)" }}>
                <button
                  onClick={() => handleDelete(pl.id)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#e63946] hover:bg-[rgba(255,255,255,0.05)]"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
                <button
                  onClick={() => {
                    setSharePlaylist(pl)
                    setMenuPlaylistId(null)
                    setShareTargets([])
                    setShareMsg("")
                  }}
                  className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#f0e0d0] hover:bg-[rgba(255,255,255,0.05)]"
                >
                  <Send className="h-4 w-4" />
                  Partilhar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Playlist Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.7)] p-6">
          <div className="glass-card-strong w-full max-w-sm rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#f0e0d0]">Nova Playlist</h3>
              <button onClick={() => setShowCreate(false)} className="text-[#706050]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Nome da playlist"
              autoFocus
              className="glass-card mb-4 w-full rounded-xl px-4 py-3 text-sm text-[#f0e0d0] placeholder-[#706050] focus:outline-none"
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="w-full rounded-xl py-3 text-sm font-semibold text-[#fff] disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #e63946 0%, #c1121f 100%)" }}
            >
              Criar
            </button>
          </div>
        </div>
      )}

      {sharePlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.7)] p-6">
          <div className="glass-card-strong w-full max-w-sm rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#f0e0d0]">Partilhar Playlist</h3>
              <button onClick={() => setSharePlaylist(null)} className="text-[#706050]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-3 truncate text-xs text-[#a08070]">Playlist: {sharePlaylist.name}</p>
            <div className="mb-2 flex items-center gap-2">
              <input
                value={shareQuery}
                onChange={(e) => setShareQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchShareTargets()}
                placeholder="Pesquisar user..."
                className="glass-card w-full rounded-xl px-3 py-2 text-xs text-[#f0e0d0] placeholder-[#706050] focus:outline-none"
              />
              <button onClick={handleSearchShareTargets} className="rounded-lg bg-[rgba(230,57,70,0.2)] px-3 py-2 text-xs text-[#f0e0d0]">
                Buscar
              </button>
            </div>
            <div className="max-h-48 space-y-1 overflow-y-auto hide-scrollbar">
              {shareTargets.map((target) => (
                <button
                  key={target.user_id}
                  onClick={() => handleSharePlaylist(target)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-[#f0e0d0] hover:bg-[rgba(255,255,255,0.08)]"
                >
                  <Send className="h-4 w-4 text-[#a08070]" />
                  <span className="truncate">{target.username}</span>
                </button>
              ))}
            </div>
            {shareMsg && <p className="mt-2 text-xs text-[#f59e0b]">{shareMsg}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
