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
  getSentShareRequests,
  getReceivedShareHistory,
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
  const { user, profile } = useAuth()
  const { play, setQueue } = usePlayer()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [likedTracks, setLikedTracks] = useState<Track[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [viewPlaylist, setViewPlaylist] = useState<Playlist | null>(null)
  const [viewLiked, setViewLiked] = useState(false)
  const [viewPendingShares, setViewPendingShares] = useState(false)
  const [shareView, setShareView] = useState<"pending" | "sent" | "received">("pending")
  const [menuPlaylistId, setMenuPlaylistId] = useState<string | null>(null)
  const [libraryMsg, setLibraryMsg] = useState("")
  const [pendingShares, setPendingShares] = useState<ShareRequest[]>([])
  const [sentShares, setSentShares] = useState<ShareRequest[]>([])
  const [receivedShares, setReceivedShares] = useState<ShareRequest[]>([])
  const [sharePlaylist, setSharePlaylist] = useState<Playlist | null>(null)
  const [shareQuery, setShareQuery] = useState("")
  const [shareTargets, setShareTargets] = useState<ShareTarget[]>([])
  const [targetMap, setTargetMap] = useState<Record<string, ShareTarget>>({})
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
    const [pl, lt, incoming, sent, received, knownTargets] = await Promise.allSettled([
      getPlaylists(user.id),
      getLikedTracks(user.id),
      getIncomingShareRequests(user.id),
      getSentShareRequests(user.id),
      getReceivedShareHistory(user.id),
      searchShareTargets(user.id, ""),
    ])

    if (pl.status === "fulfilled") {
      setPlaylists(pl.value.map((playlist: any) => ({ ...playlist, tracks: Array.isArray(playlist.tracks) ? playlist.tracks : [] })))
    } else {
      console.error("Falha ao carregar playlists:", pl.reason)
      setPlaylists([])
    }

    if (lt.status === "fulfilled") {
      setLikedTracks(lt.value)
    } else {
      console.error("Falha ao carregar favoritos:", lt.reason)
      setLikedTracks([])
    }

    if (incoming.status === "fulfilled") setPendingShares(incoming.value)
    else setPendingShares([])
    if (sent.status === "fulfilled") setSentShares(sent.value)
    else setSentShares([])
    if (received.status === "fulfilled") setReceivedShares(received.value)
    else setReceivedShares([])

    const map: Record<string, ShareTarget> = {}
    if (knownTargets.status === "fulfilled") {
      for (const target of knownTargets.value) map[target.user_id] = target
    }
    setTargetMap(map)

    if (pl.status === "fulfilled" && lt.status === "fulfilled") {
      console.info("Library loaded", { userId: user.id, playlists: pl.value.length, likedTracks: lt.value.length })
      if (pl.value.length === 0 && lt.value.length === 0) {
        setLibraryMsg(`Sem itens na biblioteca para a conta atual (${user.email || user.id}).`)
      } else {
        setLibraryMsg("")
      }
    }
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
    } else {
      setLibraryMsg("Falha ao criar playlist. Verifica login e politicas RLS no Supabase.")
      return
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

  function shareAvatar(name: string) {
    return (name || "U").trim().charAt(0).toUpperCase()
  }

  async function handleSharePlaylist(target: ShareTarget) {
    if (!user || !sharePlaylist) return
    const fromUsername = profile?.username || user.email?.split("@")[0] || "user"
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
              <div
                key={track.id}
                className="glass-card flex w-full items-center gap-3 rounded-xl p-3"
              >
                <button
                  onClick={() => {
                    setQueue(likedTracks)
                    play(track)
                  }}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
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
                <button
                  onClick={() => handleRemoveLiked(track.id)}
                  className="rounded-lg p-2 text-[#a08070] transition hover:bg-[rgba(255,255,255,0.06)]"
                  aria-label="Remover dos favoritos"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (viewPendingShares) {
    const currentList = shareView === "pending" ? pendingShares : shareView === "sent" ? sentShares : receivedShares

    return (
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2">
        <div className="mb-3 flex items-center gap-3">
          <button onClick={() => setViewPendingShares(false)} className="text-[#a08070]">
            <ChevronRight className="h-6 w-6 rotate-180" />
          </button>
          <h2 className="text-xl font-bold text-[#f0e0d0]">Partilhas</h2>
        </div>

        <div className="mb-3 flex gap-2 text-xs">
          <button
            className={`rounded-full px-3 py-1.5 ${shareView === "pending" ? "bg-[#e63946] text-white" : "bg-[rgba(255,255,255,0.08)] text-[#a08070]"}`}
            onClick={() => setShareView("pending")}
          >
            Pendentes ({pendingShares.length})
          </button>
          <button
            className={`rounded-full px-3 py-1.5 ${shareView === "sent" ? "bg-[#e63946] text-white" : "bg-[rgba(255,255,255,0.08)] text-[#a08070]"}`}
            onClick={() => setShareView("sent")}
          >
            Enviadas
          </button>
          <button
            className={`rounded-full px-3 py-1.5 ${shareView === "received" ? "bg-[#e63946] text-white" : "bg-[rgba(255,255,255,0.08)] text-[#a08070]"}`}
            onClick={() => setShareView("received")}
          >
            Recebidas
          </button>
        </div>

        {currentList.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-[#706050]">
            <Inbox className="mb-3 h-10 w-10 opacity-40" />
            <p className="text-sm">Sem itens</p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto hide-scrollbar">
            {currentList.map((request) => (
              <div key={request.id} className="glass-card rounded-xl p-3">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)] text-xs font-semibold text-[#f0e0d0]">
                    {shareAvatar(request.from_username)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-[#f0e0d0]">
                      {request.item_type === "playlist" ? "Playlist" : "Musica"} enviada por {request.from_username}
                    </p>
                    <p className="truncate text-xs text-[#a08070]">{request.item_title}</p>
                  </div>
                </div>

                {shareView === "pending" ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptShare(request)}
                      className="flex items-center gap-1 rounded-lg bg-[#e63946] px-3 py-1.5 text-xs font-medium text-white"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Aceitar
                    </button>
                    <button
                      onClick={() => handleRejectShare(request.id)}
                      className="rounded-lg bg-[rgba(255,255,255,0.08)] px-3 py-1.5 text-xs text-[#a08070]"
                    >
                      Rejeitar
                    </button>
                  </div>
                ) : shareView === "sent" ? (
                  <p className="text-xs text-[#a08070]">
                    Para {targetMap[request.to_user_id]?.username || `user ${request.to_user_id.slice(0, 8)}...`}
                  </p>
                ) : (
                  <p className="text-xs text-[#a08070]">Estado: {request.status}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#f0e0d0]">Biblioteca</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="glass-button rounded-full p-2.5 text-[#f0e0d0]"
          aria-label="Criar playlist"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {libraryMsg && (
        <div className="mb-3 rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-xs text-[#f59e0b]">
          {libraryMsg}
        </div>
      )}

      <button
        onClick={() => setViewLiked(true)}
        className="mb-3 flex items-center justify-between rounded-xl bg-gradient-to-r from-[#4a3040] to-[#2a1a2a] px-4 py-3 text-left shadow-lg"
      >
        <div className="flex min-w-0 items-center gap-3">
          <Heart className="h-5 w-5 text-[#e63946]" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#f0e0d0]">Favoritos</p>
            <p className="text-xs text-[#a08070]">{likedTracks.length} musicas</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-[#706050]" />
      </button>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-[#a08070]">Playlists</p>
        <button
          onClick={() => setViewPendingShares(true)}
          className="inline-flex items-center gap-1 rounded-full bg-[rgba(255,255,255,0.08)] px-2.5 py-1 text-[11px] text-[#f0e0d0]"
        >
          <Inbox className="h-3.5 w-3.5" />
          Partilhas {pendingShares.length > 0 ? `(${pendingShares.length})` : ""}
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto hide-scrollbar">
        {playlists.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-[#706050]">
            <Music className="mb-3 h-10 w-10 opacity-40" />
            <p className="text-sm">Sem playlists ainda</p>
          </div>
        ) : (
          playlists.map((pl, idx) => (
            <div
              key={pl.id}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${playlistColors[idx % playlistColors.length]} shadow-lg`}
            >
              <button
                onClick={() => setViewPlaylist(pl)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#f0e0d0]">{pl.name}</p>
                  <p className="text-xs text-[#a08070]">{pl.tracks.length} musicas</p>
                  {isTestPlaylist(pl) && (
                    <p className="mt-0.5 text-[10px] text-[#f59e0b]">playlist de testes</p>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-[#706050]" />
              </button>

              <button
                onClick={() => setMenuPlaylistId((prev) => (prev === pl.id ? null : pl.id))}
                className="absolute right-2 top-2 rounded-full p-1.5 text-[#a08070] hover:bg-[rgba(255,255,255,0.08)]"
                aria-label="Mais opções"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {menuPlaylistId === pl.id && (
                <div className="absolute right-2 top-10 z-10 w-44 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(15,8,8,0.98)] p-1.5 shadow-2xl">
                  <button
                    onClick={() => {
                      setSharePlaylist(pl)
                      setShareTargets([])
                      setShareQuery("")
                      setShareMsg("")
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-[#f0e0d0] hover:bg-[rgba(255,255,255,0.08)]"
                  >
                    <Send className="h-3.5 w-3.5 text-[#a08070]" />
                    Partilhar
                  </button>
                  <button
                    onClick={() => handleDelete(pl.id)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-[#f0e0d0] hover:bg-[rgba(255,255,255,0.08)]"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-[#a08070]" />
                    Apagar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setShowCreate(false)}>
          <div
            className="w-full max-w-sm rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(15,8,8,0.98)] p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-base font-semibold text-[#f0e0d0]">Nova Playlist</h3>
            <input
              id="library-new-playlist-name"
              name="playlist_name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nome da playlist"
              className="w-full rounded-lg bg-[rgba(255,255,255,0.08)] px-3 py-2 text-sm text-[#f0e0d0] placeholder-[#a08070] outline-none"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg bg-[rgba(255,255,255,0.08)] px-3 py-2 text-xs text-[#a08070]"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                className="rounded-lg bg-[#e63946] px-3 py-2 text-xs font-medium text-white"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {sharePlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setSharePlaylist(null)}>
          <div
            className="w-full max-w-sm rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(15,8,8,0.98)] p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-base font-semibold text-[#f0e0d0]">Partilhar Playlist</h3>
            <p className="mb-2 truncate text-xs text-[#a08070]">{sharePlaylist.name}</p>

            <div className="mb-2 flex items-center gap-2">
              <input
                id="library-share-query"
                name="share_query"
                value={shareQuery}
                onChange={(e) => setShareQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchShareTargets()}
                placeholder="Pesquisar username/email..."
                className="w-full rounded-lg bg-[rgba(255,255,255,0.08)] px-2 py-1.5 text-xs text-[#f0e0d0] placeholder-[#a08070] outline-none"
              />
              <button
                onClick={handleSearchShareTargets}
                className="rounded-lg bg-[rgba(255,255,255,0.12)] px-2 py-1.5 text-xs text-[#f0e0d0]"
              >
                Buscar
              </button>
            </div>

            <div className="max-h-52 space-y-1 overflow-y-auto hide-scrollbar">
              {shareTargets.map((target) => (
                <button
                  key={target.user_id}
                  onClick={() => handleSharePlaylist(target)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-[#f0e0d0] hover:bg-[rgba(255,255,255,0.08)]"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)] text-[10px] font-semibold text-[#f0e0d0]">
                    {shareAvatar(target.username)}
                  </div>
                  <span className="truncate">{target.username}</span>
                  <span className="truncate text-[10px] text-[#a08070]">{target.email || ""}</span>
                </button>
              ))}
              {shareTargets.length === 0 && <p className="text-center text-xs text-[#a08070]">Sem resultados.</p>}
            </div>

            {shareMsg && <p className="mt-2 text-xs text-[#f59e0b]">{shareMsg}</p>}

            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setSharePlaylist(null)}
                className="rounded-lg bg-[rgba(255,255,255,0.08)] px-3 py-2 text-xs text-[#a08070]"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
