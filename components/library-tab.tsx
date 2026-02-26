"use client"

import { useEffect, useState } from "react"
import {
  Plus,
  Heart,
  MoreVertical,
  Trash2,
  Music,
  X,
  Play,
  ArrowLeft,
  Share2,
  Download,
  Copy,
  Check,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { usePlayer, type Track } from "@/lib/player-context"
import { useTheme } from "@/lib/theme-context"
import { 
  createPlaylist, 
  deletePlaylist, 
  subscribeToPlaylists, 
  subscribeToLikedTracks, 
  removeTrackFromPlaylist,
  addTrackToPlaylist,
  unlikeTrack 
} from "@/lib/db"
import { toast } from "sonner"

interface Playlist {
  id: string
  name: string
  tracks: Track[]
  image_url?: string | null
}

type LibraryView = "list" | "playlist" | "liked" | "import"

// Menu de 3 pontinhos para playlists
function PlaylistMenu({ 
  onDelete, 
  shareId 
}: { 
  onDelete: () => void
  shareId: string 
}) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { accentHex } = useTheme()

  const handleCopy = () => {
    navigator.clipboard.writeText(shareId)
    setCopied(true)
    toast.success("ID copiado!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative flex-shrink-0">
      <button 
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        className="p-2 rounded-full hover:bg-[#f0e0d0]/10 text-[#a08070] transition-colors"
      >
        <MoreVertical className="h-5 w-5" />
      </button>
      
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl bg-[#1a1a1a] border border-[#f0e0d0]/10 shadow-xl overflow-hidden">
            <div className="p-3 border-b border-[#f0e0d0]/10">
              <p className="text-xs text-[#a08070] mb-2">ID da Playlist:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs text-[#f0e0d0] bg-[#0a0a0a] px-2 py-1.5 rounded truncate">
                  {shareId}
                </code>
                <button 
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: `${accentHex}30` }}
                >
                  {copied ? <Check className="h-4 w-4" style={{ color: accentHex }} /> : <Copy className="h-4 w-4" style={{ color: accentHex }} />}
                </button>
              </div>
            </div>
            <button 
              onClick={() => { onDelete(); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-sm">Eliminar playlist</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// Menu de 3 pontinhos para músicas
function TrackMenu({ 
  onRemove, 
  isLikedView = false 
}: { 
  onRemove: () => void
  isLikedView?: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative flex-shrink-0">
      <button 
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        className="p-2 rounded-full hover:bg-[#f0e0d0]/10 text-[#a08070] transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl bg-[#1a1a1a] border border-[#f0e0d0]/10 shadow-xl overflow-hidden">
            <button 
              onClick={() => { onRemove(); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-sm">{isLikedView ? "Remover dos favoritos" : "Remover da playlist"}</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function LibraryTab() {
  const { user } = useAuth()
  const { play, setQueue } = usePlayer()
  const { accentHex } = useTheme()
  const [view, setView] = useState<LibraryView>("list")
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [likedTracks, setLikedTracks] = useState<Track[]>([])
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [importId, setImportId] = useState("")
  const [importing, setImporting] = useState(false)

  const userId = user?.uid || ""

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userId) return

    const unsubPlaylists = subscribeToPlaylists(userId, (data) => {
      setPlaylists(data.map(p => ({
        id: p.id,
        name: p.name,
        tracks: p.tracks || [],
        image_url: p.image_url
      })))
    })

    const unsubLiked = subscribeToLikedTracks(userId, (tracks) => {
      setLikedTracks(tracks)
    })

    return () => {
      unsubPlaylists()
      unsubLiked()
    }
  }, [userId])

  async function handleCreatePlaylist() {
    if (!newPlaylistName.trim() || !userId) return
    
    const created = await createPlaylist(newPlaylistName.trim())
    if (created) {
      toast.success("Playlist criada!")
      setNewPlaylistName("")
      setShowCreate(false)
    } else {
      toast.error("Erro ao criar playlist")
    }
  }

  async function handleDeletePlaylist(id: string) {
    if (!confirm("Eliminar esta playlist?")) return
    
    const ok = await deletePlaylist(id)
    if (ok) {
      toast.success("Playlist eliminada")
      if (selectedPlaylist?.id === id) {
        setSelectedPlaylist(null)
        setView("list")
      }
    } else {
      toast.error("Erro ao eliminar")
    }
  }

  async function handleRemoveFromPlaylist(trackId: string) {
    if (!selectedPlaylist) return
    
    const ok = await removeTrackFromPlaylist(selectedPlaylist.id, trackId)
    if (ok) {
      toast.success("Música removida")
    } else {
      toast.error("Erro ao remover")
    }
  }

  async function handleRemoveFromLiked(trackId: string) {
    const ok = await unlikeTrack(trackId)
    if (ok) {
      toast.success("Removido dos favoritos")
    } else {
      toast.error("Erro ao remover")
    }
  }

  async function handleImportPlaylist() {
    if (!importId.trim() || !userId) {
      toast.error("Insere um ID válido")
      return
    }
    
    setImporting(true)
    
    try {
      // Procurar nas playlists do user atual
      const sourcePlaylist = playlists.find(p => p.id === importId)
      
      if (!sourcePlaylist) {
        toast.error("Playlist não encontrada. Verifica o ID.")
        setImporting(false)
        return
      }
      
      // Criar nova playlist com os dados
      const created = await createPlaylist(
        `${sourcePlaylist.name} (Importada)`, 
        sourcePlaylist.image_url || undefined
      )
      
      if (created) {
        // Adicionar todas as músicas
        for (const track of sourcePlaylist.tracks) {
          await addTrackToPlaylist(created.id, track)
        }
        
        toast.success(`Playlist importada com ${sourcePlaylist.tracks.length} músicas!`)
        setImportId("")
        setView("list")
      }
    } catch (error) {
      console.error("Erro ao importar:", error)
      toast.error("Erro ao importar playlist")
    } finally {
      setImporting(false)
    }
  }

  function playTrack(track: Track, tracks: Track[]) {
    setQueue(tracks)
    play(track)
  }

  // List View - Cards retangulares um em baixo do outro
  if (view === "list") {
    return (
      <div className="flex min-h-0 flex-1 flex-col w-full max-w-full overflow-hidden">
        <div className="px-4 sm:px-6 pb-6 pt-4 flex-1 overflow-y-auto">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#f0e0d0]">Biblioteca</h2>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all active:scale-95 flex-shrink-0"
              style={{ backgroundColor: accentHex }}
            >
              <Plus className="h-4 w-4" />
              Nova
            </button>
          </div>

          <div className="space-y-3 w-full">
            {/* Favoritos Card */}
            <button
              onClick={() => setView("liked")}
              className="w-full flex items-center gap-4 rounded-2xl bg-[#1a1a1a]/60 border border-[#f0e0d0]/10 p-4 hover:bg-[#1a1a1a] transition-all active:scale-95"
            >
              <div 
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${accentHex}20` }}
              >
                <Heart className="h-7 w-7 sm:h-8 sm:w-8" style={{ color: accentHex }} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-semibold text-[#f0e0d0] truncate">Favoritos</p>
                <p className="text-sm text-[#a08070]">{likedTracks.length} músicas</p>
              </div>
              <Play className="h-5 w-5 text-[#a08070] flex-shrink-0" />
            </button>

            {/* Playlists */}
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="w-full flex items-center gap-3 sm:gap-4 rounded-2xl bg-[#1a1a1a]/60 border border-[#f0e0d0]/10 p-3 sm:p-4 hover:bg-[#1a1a1a] transition-all"
              >
                <button
                  onClick={() => { setSelectedPlaylist(playlist); setView("playlist") }}
                  className="flex-1 flex items-center gap-3 sm:gap-4 text-left min-w-0"
                >
                  <div 
                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                    style={{ backgroundColor: playlist.image_url ? "transparent" : `${accentHex}20` }}
                  >
                    {playlist.image_url ? (
                      <img src={playlist.image_url} alt={playlist.name} className="h-full w-full object-cover" />
                    ) : (
                      <Music className="h-7 w-7 sm:h-8 sm:w-8" style={{ color: accentHex }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#f0e0d0] truncate text-sm sm:text-base">{playlist.name}</p>
                    <p className="text-xs sm:text-sm text-[#a08070]">{playlist.tracks.length} músicas</p>
                  </div>
                </button>
                
                <PlaylistMenu 
                  onDelete={() => handleDeletePlaylist(playlist.id)}
                  shareId={playlist.id}
                />
              </div>
            ))}

            {/* Import Playlist Card */}
            <button
              onClick={() => setView("import")}
              className="w-full flex items-center gap-4 rounded-2xl bg-[#1a1a1a]/60 border border-dashed border-[#f0e0d0]/20 p-4 hover:border-[#f0e0d0]/40 hover:bg-[#1a1a1a] transition-all active:scale-95"
            >
              <div 
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${accentHex}10` }}
              >
                <Download className="h-7 w-7 sm:h-8 sm:w-8 text-[#a08070]" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-semibold text-[#f0e0d0]">Importar Playlist</p>
                <p className="text-sm text-[#a08070]">Por ID</p>
              </div>
            </button>
          </div>
        </div>

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
            <div className="w-full max-w-sm rounded-2xl bg-[#1a1a1a] border border-[#f0e0d0]/10 p-6">
              <h3 className="mb-4 text-lg font-bold text-[#f0e0d0]">Nova Playlist</h3>
              <input
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
                placeholder="Nome da playlist..."
                autoFocus
                className="mb-4 w-full rounded-xl bg-[#0a0a0a] border border-[#f0e0d0]/10 px-4 py-3 text-sm text-[#f0e0d0] placeholder-[#a08070]/50"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 rounded-xl py-3 text-sm font-medium text-[#a08070] hover:text-[#f0e0d0]"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim()}
                  className="flex-1 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: accentHex }}
                >
                  Criar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Playlist Detail View
  if (view === "playlist" && selectedPlaylist) {
    return (
      <div className="flex min-h-0 flex-1 flex-col w-full max-w-full overflow-hidden">
        <div className="px-4 sm:px-6 pb-6 pt-4 flex-1 overflow-y-auto">
          <button 
            onClick={() => setView("list")} 
            className="mb-4 flex items-center gap-2 text-[#a08070] hover:text-[#f0e0d0]"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Voltar</span>
          </button>

          <div className="mb-6 flex items-start gap-3 sm:gap-4">
            <div 
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${accentHex}20` }}
            >
              {selectedPlaylist.image_url ? (
                <img src={selectedPlaylist.image_url} alt="" className="h-full w-full rounded-2xl object-cover" />
              ) : (
                <Music className="h-8 w-8 sm:h-10 sm:w-10" style={{ color: accentHex }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-[#f0e0d0] truncate">{selectedPlaylist.name}</h2>
              <p className="text-sm text-[#a08070]">{selectedPlaylist.tracks.length} músicas</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => selectedPlaylist.tracks.length > 0 && playTrack(selectedPlaylist.tracks[0], selectedPlaylist.tracks)}
                  disabled={selectedPlaylist.tracks.length === 0}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: accentHex }}
                >
                  <Play className="h-4 w-4" />
                  Tocar
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2 w-full">
            {selectedPlaylist.tracks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Music className="h-16 w-16 mb-4 text-[#f0e0d0]/20" />
                <p className="text-[#a08070]">Playlist vazia</p>
                <p className="text-sm text-[#706050] mt-2">Adiciona músicas da pesquisa</p>
              </div>
            ) : (
              selectedPlaylist.tracks.map((track, index) => (
                <div 
                  key={`${track.id}-${index}`} 
                  className="flex items-center gap-2 sm:gap-3 rounded-xl bg-[#1a1a1a]/60 border border-[#f0e0d0]/10 p-2 sm:p-3 hover:bg-[#1a1a1a] transition-colors w-full"
                >
                  <img src={track.thumbnail} alt={track.title} className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-[#f0e0d0] text-sm">{track.title}</p>
                    <p className="truncate text-xs sm:text-sm text-[#a08070]">{track.artist}</p>
                  </div>
                  <button
                    onClick={() => playTrack(track, selectedPlaylist.tracks)}
                    className="rounded-full p-1.5 sm:p-2 flex-shrink-0"
                    style={{ backgroundColor: `${accentHex}30` }}
                  >
                    <Play className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: accentHex }} />
                  </button>
                  <TrackMenu 
                    onRemove={() => handleRemoveFromPlaylist(track.id)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  // Liked Tracks View
  if (view === "liked") {
    return (
      <div className="flex min-h-0 flex-1 flex-col w-full max-w-full overflow-hidden">
        <div className="px-4 sm:px-6 pb-6 pt-4 flex-1 overflow-y-auto">
          <button 
            onClick={() => setView("list")} 
            className="mb-4 flex items-center gap-2 text-[#a08070] hover:text-[#f0e0d0]"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Voltar</span>
          </button>

          <div className="mb-6 flex items-center gap-3 sm:gap-4">
            <div 
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${accentHex}20` }}
            >
              <Heart className="h-8 w-8 sm:h-10 sm:w-10" style={{ color: accentHex }} />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-[#f0e0d0]">Favoritos</h2>
              <p className="text-sm text-[#a08070]">{likedTracks.length} músicas</p>
            </div>
          </div>

          <div className="space-y-2 w-full">
            {likedTracks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Heart className="h-16 w-16 mb-4 text-[#f0e0d0]/20" />
                <p className="text-[#a08070]">Ainda não tens favoritos</p>
                <p className="text-sm text-[#706050] mt-2">Adiciona músicas da pesquisa</p>
              </div>
            ) : (
              likedTracks.map((track, index) => (
                <div 
                  key={`${track.id}-${index}`} 
                  className="flex items-center gap-2 sm:gap-3 rounded-xl bg-[#1a1a1a]/60 border border-[#f0e0d0]/10 p-2 sm:p-3 hover:bg-[#1a1a1a] transition-colors w-full"
                >
                  <img src={track.thumbnail} alt={track.title} className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-[#f0e0d0] text-sm">{track.title}</p>
                    <p className="truncate text-xs sm:text-sm text-[#a08070]">{track.artist}</p>
                  </div>
                  <button
                    onClick={() => playTrack(track, likedTracks)}
                    className="rounded-full p-1.5 sm:p-2 flex-shrink-0"
                    style={{ backgroundColor: `${accentHex}30` }}
                  >
                    <Play className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: accentHex }} />
                  </button>
                  <TrackMenu 
                    onRemove={() => handleRemoveFromLiked(track.id)}
                    isLikedView={true}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  // Import View
  if (view === "import") {
    return (
      <div className="flex min-h-0 flex-1 flex-col w-full max-w-full overflow-hidden">
        <div className="px-4 sm:px-6 pb-6 pt-4 flex-1 overflow-y-auto">
          <button 
            onClick={() => setView("list")} 
            className="mb-4 flex items-center gap-2 text-[#a08070] hover:text-[#f0e0d0]"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Voltar</span>
          </button>

          <h2 className="mb-6 text-2xl font-bold text-[#f0e0d0]">Importar Playlist</h2>

          <div className="rounded-2xl bg-[#1a1a1a]/60 border border-[#f0e0d0]/10 p-6 space-y-4">
            <p className="text-sm text-[#a08070]">
              Cola o ID da playlist que queres importar. A playlist será adicionada à tua biblioteca com todas as músicas.
            </p>
            
            <input
              value={importId}
              onChange={(e) => setImportId(e.target.value)}
              placeholder="ID da playlist (ex: abc123...)"
              className="w-full rounded-xl bg-[#0a0a0a] border border-[#f0e0d0]/10 px-4 py-3 text-sm text-[#f0e0d0] placeholder-[#a08070]/50"
            />
            
            <button
              onClick={handleImportPlaylist}
              disabled={!importId.trim() || importing}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: accentHex }}
            >
              {importing ? "A importar..." : "Importar Playlist"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
