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
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { usePlayer, type Track } from "@/lib/player-context"
import {
  getPlaylists,
  createPlaylist,
  deletePlaylist,
  getLikedTracks,
  removeLikedTrack,
} from "@/lib/supabase"

interface Playlist {
  id: string
  name: string
  tracks: Track[]
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
  const [menuPlaylistId, setMenuPlaylistId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!user) return
    const [pl, lt] = await Promise.all([
      getPlaylists(user.id),
      getLikedTracks(user.id),
    ])
    setPlaylists(pl)
    setLikedTracks(lt)
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleCreate() {
    if (!user || !newName.trim()) return
    await createPlaylist(user.id, newName.trim())
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
      <div className="flex flex-1 flex-col px-4 pb-4 pt-2">
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
          <div className="flex-1 space-y-2.5 overflow-y-auto hide-scrollbar">
            {viewPlaylist.tracks.map((track: Track) => (
              <button
                key={track.id}
                onClick={() => {
                  setQueue(viewPlaylist.tracks)
                  play(track)
                }}
                className="glass-card flex w-full items-center gap-3 rounded-xl p-3 text-left"
              >
                <img
                  src={track.thumbnail}
                  alt={track.title}
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#f0e0d0]">{track.title}</p>
                  <p className="truncate text-xs text-[#a08070]">{track.artist}</p>
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
      <div className="flex flex-1 flex-col px-4 pb-4 pt-2">
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
          <div className="flex-1 space-y-2.5 overflow-y-auto hide-scrollbar">
            {likedTracks.map((track: Track) => (
              <button
                key={track.id}
                onClick={() => {
                  setQueue(likedTracks)
                  play(track)
                }}
                className="glass-card flex w-full items-center gap-3 rounded-xl p-3 text-left"
              >
                <img
                  src={track.thumbnail}
                  alt={track.title}
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#f0e0d0]">{track.title}</p>
                  <p className="truncate text-xs text-[#a08070]">{track.artist}</p>
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

  // Main library view
  return (
    <div className="flex flex-1 flex-col px-4 pb-4 pt-2">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#f0e0d0]">Biblioteca</h1>
        <div className="h-10 w-10 overflow-hidden rounded-full bg-[rgba(255,255,255,0.1)]">
          <div className="flex h-full w-full items-center justify-center text-sm font-medium text-[#a08070]">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto hide-scrollbar">
        {/* Create Playlist */}
        <button
          onClick={() => setShowCreate(true)}
          className="glass-card flex w-full items-center gap-4 rounded-xl p-4"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)]">
            <Plus className="h-5 w-5 text-[#e63946]" />
          </div>
          <span className="text-sm font-medium text-[#f0e0d0]">Criar Playlist</span>
        </button>

        {/* Favoritos */}
        <button
          onClick={() => setViewLiked(true)}
          className="glass-card flex w-full items-center gap-4 rounded-xl p-4"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e63946]">
            <Heart className="h-5 w-5 fill-current text-[#fff]" />
          </div>
          <span className="flex-1 text-left text-sm font-medium text-[#f0e0d0]">Favoritos</span>
          <ChevronRight className="h-5 w-5 text-[#706050]" />
        </button>

        {/* Playlists */}
        {playlists.map((pl, idx) => (
          <div key={pl.id} className="relative">
            <button
              onClick={() => setViewPlaylist(pl)}
              className="glass-card flex w-full items-center gap-4 rounded-xl p-4"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${playlistColors[idx % playlistColors.length]}`}
              >
                <Music className="h-5 w-5 text-[#c0a090]" />
              </div>
              <span className="flex-1 text-left text-sm font-medium text-[#f0e0d0]">
                {pl.name}
              </span>
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
              <div className="glass-card-strong absolute right-4 top-16 z-10 rounded-xl p-2 shadow-xl">
                <button
                  onClick={() => handleDelete(pl.id)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#e63946] hover:bg-[rgba(255,255,255,0.05)]"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
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
    </div>
  )
}
