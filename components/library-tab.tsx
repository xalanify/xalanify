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
  Download,
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
  importPlaylistById,
  type ShareRequest,
  type ShareTarget,
} from "@/lib/supabase"
import { getShowDebugMenu } from "@/lib/preferences"

interface Playlist {
  id: string
  name: string
  tracks: Track[]
  image_url?: string | null
  is_test?: boolean
}

const LIBRARY_CACHE_KEY = "xalanify.library"

// Helper to get cached library data
function getCachedLibrary(userId: string): { playlists: Playlist[], likedTracks: Track[] } | null {
  if (typeof window === "undefined") return null
  try {
    const cached = localStorage.getItem(LIBRARY_CACHE_KEY)
    if (!cached) return null
    const data = JSON.parse(cached)
    // Check if cache is for the same user
    if (data.userId === userId && data.playlists && data.likedTracks) {
      return { playlists: data.playlists, likedTracks: data.likedTracks }
    }
    return null
  } catch {
    return null
  }
}

// Helper to cache library data
function setCachedLibrary(userId: string, playlists: Playlist[], likedTracks: Track[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(LIBRARY_CACHE_KEY, JSON.stringify({
      userId,
      playlists,
      likedTracks,
      timestamp: Date.now()
    }))
  } catch {
    // Ignore cache errors
  }
}

export default function LibraryTab() {
  const { user, profile, isAdmin } = useAuth()
  const { play, setQueue } = usePlayer()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [likedTracks, setLikedTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(false)
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
  const [adminDebug, setAdminDebug] = useState<string[]>([])
  const [showImport, setShowImport] = useState(false)
  const [importId, setImportId] = useState("")
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState("")

  function pushAdminDebug(message: string, payload?: any) {
    if (!isAdmin) return
    if (!getShowDebugMenu()) return
    const line = payload ? `${message} :: ${JSON.stringify(payload)}` : message
    setAdminDebug((prev) => [line, ...prev].slice(0, 25))
    console.info("[admin][library]", message, payload || "")
  }

  function isTestPlaylist(playlist: Playlist) {
    // Use is_test field if available, fallback to name check for backward compatibility
    if (playlist.is_test === true) return true
    return playlist.name.toLowerCase().includes("teste") || playlist.name.toLowerCase().includes("demo")
  }

  function testTrackLabel(track: Track) {
    if (!track.isTestContent) return null
    return track.testLabel || "musica de testes"
  }

  const loadData = useCallback(async (useCache = true) => {
    if (!user) return
    
    // Try to load from cache first for instant display
    if (useCache) {
      const cached = getCachedLibrary(user.id)
      if (cached) {
        console.log("[Library] Loaded from cache", { playlists: cached.playlists.length, likedTracks: cached.likedTracks.length })
        setPlaylists(cached.playlists)
        setLikedTracks(cached.likedTracks)
      }
    }
    
    setIsLoading(true)
    try {
      const [pl, lt, incoming, sent, received, knownTargets] = await Promise.allSettled([
        getPlaylists(user.id),
        getLikedTracks(user.id),
        getIncomingShareRequests(user.id),
        getSentShareRequests(user.id),
        getReceivedShareHistory(user.id),
        searchShareTargets(user.id, ""),
      ])

      let playlistsData: Playlist[] = []
      let likedTracksData: Track[] = []

      if (pl.status === "fulfilled") {
        playlistsData = pl.value.map((playlist: any) => ({ ...playlist, tracks: Array.isArray(playlist.tracks) ? playlist.tracks : [] }))
        setPlaylists(playlistsData)
      } else {
        console.error("Falha ao carregar playlists:", pl.reason)
        if (playlistsData.length === 0) setPlaylists([])
      }

      if (lt.status === "fulfilled") {
        likedTracksData = lt.value
        setLikedTracks(lt.value)
      } else {
        console.error("Falha ao carregar favoritos:", lt.reason)
        if (likedTracksData.length === 0) setLikedTracks([])
      }

      // Cache the data for next time
      if (playlistsData.length > 0 || likedTracksData.length > 0) {
        setCachedLibrary(user.id, playlistsData, likedTracksData)
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
        console.info("Library loaded from server", { userId: user.id, playlists: pl.value.length, likedTracks: lt.value.length })
        pushAdminDebug("Library loaded", { userId: user.id, playlists: pl.value.length, likedTracks: lt.value.length })
        if (pl.value.length === 0 && lt.value.length === 0) {
          setLibraryMsg(`Sem itens na biblioteca para a conta atual (${user.email || user.id}).`)
        } else {
          setLibraryMsg("")
        }
      }
    } catch (error) {
      console.error("Error loading library data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user, isAdmin])

  // Load from cache immediately on mount, then refresh from server
  useEffect(() => {
    if (user) {
      // First load from cache (instant)
      const cached = getCachedLibrary(user.id)
      if (cached) {
        setPlaylists(cached.playlists)
        setLikedTracks(cached.likedTracks)
      }
      // Then refresh from server
      loadData(true)
    }
  }, [user?.id])

  async function handleCreate() {
    if (!user || !newName.trim()) return
    pushAdminDebug("Create playlist click", { userId: user.id, name: newName.trim() })
    
    console.log("[Library] Before create - playlists:", playlists.length)
    const created: any = await createPlaylist(user.id, newName.trim())
    console.log("[Library] After create - result:", created)
    
    if (created?.existed) {
      pushAdminDebug("Create playlist result", { existed: true, id: created.id })
      setLibraryMsg("Ja existe uma playlist com esse nome.")
    } else if (created?.id) {
      pushAdminDebug("Create playlist result", { created: true, id: created.id })
      setLibraryMsg("Playlist criada com sucesso.")
    } else {
      pushAdminDebug("Create playlist result", { created: false })
      setLibraryMsg("Falha ao criar playlist. Verifica login e politicas RLS no Supabase.")
      return
    }
    setNewName("")
    setShowCreate(false)
    
    // Force a small delay and then reload
    console.log("[Library] Calling loadData...")
    await loadData()
    console.log("[Library] After loadData - playlists:", playlists.length)
  }

  async function handleDelete(id: string) {
    pushAdminDebug("Delete playlist click", { id })
    await deletePlaylist(id)
    setMenuPlaylistId(null)
    loadData()
  }

  async function handleRemoveLiked(trackId: string) {
    if (!user) return
    pushAdminDebug("Remove liked click", { userId: user.id, trackId })
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

  async function handleImportPlaylist() {
    if (!user || !importId.trim()) {
      setImportMsg("Insere um ID de playlist válido.")
      return
    }
    
    setImporting(true)
    setImportMsg("")
    
    const result = await importPlaylistById(user.id, importId.trim())
    
    if (result?.success) {
      setImportMsg(`Playlist "${result.name}" importada com ${result.track_count} faixas!`)
      setImportId("")
      setShowImport(false)
      loadData()
    } else {
      setImportMsg(result?.error || "Falha ao importar playlist. Verifica o ID.")
    }
    
    setImporting(false)
  }

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

        <div className="mb-3 grid grid-cols-3 gap-2">
          <button
            onClick={() => setShareView("pending")}
            className="rounded-lg px-2 py-1.5 text-xs text-[#f0e0d0]"
            style={{ background: shareView === "pending" ? "rgba(230,57,70,0.25)" : "rgba(255,255,255,0.04)" }}
          >
            Pendentes
          </button>
          <button
            onClick={() => setShareView("received")}
            className="rounded-lg px-2 py-1.5 text-xs text-[#f0e0d0]"
            style={{ background: shareView === "received" ? "rgba(230,57,70,0.25)" : "rgba(255,255,255,0.04)" }}
          >
            Recebidas
          </button>
          <button
            onClick={() => setShareView("sent")}
            className="rounded-lg px-2 py-1.5 text-xs text-[#f0e0d0]"
            style={{ background: shareView === "sent" ? "rgba(230,57,70,0.25)" : "rgba(255,255,255,0.04)" }}
          >
            Enviadas
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto hide-scrollbar">
          {shareView === "pending" && pendingShares.map((request) => (
            <div key={request.id} className="glass-card rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)] text-xs font-semibold text-[#f0e0d0]">
                  {shareAvatar(request.from_username)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#f0e0d0]">{request.item_title}</p>
                  <p className="truncate text-xs text-[#a08070]">
                    {request.item_type === "playlist" ? "Playlist" : "Musica"} enviada por {request.from_username}
                  </p>
                </div>
              </div>
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

          {shareView === "received" && receivedShares.map((request) => (
            <div key={request.id} className="glass-card rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)] text-xs font-semibold text-[#f0e0d0]">
                  {shareAvatar(request.from_username)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#f0e0d0]">{request.item_title}</p>
                  <p className="truncate text-xs text-[#a08070]">de {request.from_username}</p>
                </div>
                <span className="text-[10px] uppercase tracking-wide text-[#a08070]">{request.status}</span>
              </div>
            </div>
          ))}

          {shareView === "sent" && sentShares.map((request) => (
            <div key={request.id} className="glass-card rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)] text-xs font-semibold text-[#f0e0d0]">
                  {shareAvatar(request.item_type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#f0e0d0]">{request.item_title}</p>
                  <p className="truncate text-xs text-[#a08070]">
                    Para {targetMap[request.to_user_id]?.username || `user ${request.to_user_id.slice(0, 8)}...`}
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-wide text-[#a08070]">{request.status}</span>
              </div>
            </div>
          ))}

          {shareView === "pending" && pendingShares.length === 0 && <p className="py-20 text-center text-sm text-[#706050]">Sem partilhas pendentes.</p>}
          {shareView === "received" && receivedShares.length === 0 && <p className="py-20 text-center text-sm text-[#706050]">Sem historico recebido.</p>}
          {shareView === "sent" && sentShares.length === 0 && <p className="py-20 text-center text-sm text-[#706050]">Sem historico enviado.</p>}
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
        {isAdmin && adminDebug.length > 0 && (
          <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.25)] p-2">
            <p className="mb-1 text-[10px] uppercase tracking-wide text-[#a08070]">Admin debug</p>
            <div className="max-h-24 space-y-1 overflow-y-auto text-[10px] text-[#d8c8b8]">
              {adminDebug.map((line, idx) => (
                <p key={`${idx}-${line}`} className="break-words">{line}</p>
              ))}
            </div>
          </div>
        )}
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


        {/* Importar Playlist */}
        <button
          onClick={() => setShowImport(true)}
          className="glass-card flex w-full items-center gap-4 rounded-xl p-4 transition-all duration-200 active:scale-[0.99]"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgba(16,185,129,0.15)]">
            <Download className="h-5 w-5 text-[#10b981]" />
          </div>
          <span className="flex-1 text-left text-sm font-medium text-[#f0e0d0]">Importar Playlist</span>
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
              id="new-playlist-name"
              name="playlist_name"
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
            <p className="mb-2 text-xs text-[#a08070]">ID para partilhar: <code className="bg-[rgba(255,255,255,0.1)] px-1 rounded">{sharePlaylist.id}</code></p>
            <p className="text-[10px] text-[#706050]">Partilha este ID com outros utilizadores para importarem a playlist.</p>
          </div>
        </div>
      )}

      {/* Import Playlist Modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.7)] p-6">
          <div className="glass-card-strong w-full max-w-sm rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#f0e0d0]">Importar Playlist</h3>
              <button onClick={() => setShowImport(false)} className="text-[#706050]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-3 text-xs text-[#a08070]">Insere o ID de uma playlist para importares as suas músicas.</p>
            <input
              id="import-playlist-id"
              name="import_playlist_id"
              type="text"
              value={importId}
              onChange={(e) => setImportId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleImportPlaylist()}
              placeholder="ID da playlist (ex: abc123-def456...)"
              autoFocus
              className="glass-card mb-4 w-full rounded-xl px-4 py-3 text-sm text-[#f0e0d0] placeholder-[#706050] focus:outline-none"
            />
            {importMsg && <p className={`mb-3 text-xs ${importMsg.includes("sucesso") || importMsg.includes("importada") ? "text-[#10b981]" : "text-[#f59e0b]"}`}>{importMsg}</p>}
            <button
              onClick={handleImportPlaylist}
              disabled={!importId.trim() || importing}
              className="w-full rounded-xl py-3 text-sm font-semibold text-[#fff] disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
            >
              {importing ? "A importar..." : "Importar"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
