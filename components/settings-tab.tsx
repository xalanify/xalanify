"use client"

import { useEffect, useMemo, useState } from "react"
import {
  User,
  Palette,
  Info,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Volume2,
  SlidersHorizontal,
  Shield,
  Wrench,
  ListMusic,
  Plus,
  FlaskConical,
  Wand2,
  Send,
  UserRound,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { addLikedTrack, addTrackToPlaylist, createPlaylist, getPlaylists } from "@/lib/supabase"
import { searchPlaylistSuggestions, type PlaylistSuggestion } from "@/lib/musicApi"
import type { Track } from "@/lib/player-context"

interface Preferences {
  accentColor: string
  visualEffects: "desligado" | "suave" | "intenso"
  audioQuality: "auto" | "normal" | "alta"
  compactMode: boolean
  animateBackground: boolean
  themeMode: "dark" | "puredark" | "light"
  surfaceEffect: "glass" | "solid" | "neon"
}

interface UserPlaylist {
  id: string
  name: string
  tracks: Track[]
}

const DEFAULT_PREFERENCES: Preferences = {
  accentColor: "#e63946",
  visualEffects: "suave",
  audioQuality: "alta",
  compactMode: false,
  animateBackground: true,
  themeMode: "dark",
  surfaceEffect: "glass",
}

const SETTINGS_STORAGE_KEY = "xalanify.preferences"

type SettingsView =
  | "menu"
  | "profile"
  | "customization"
  | "credits"
  | "tools"
  | "playlist_tests"
  | "experiments"
  | "share_tests"

const DEMO_TEST_TRACKS = [
  {
    id: "demo-track-1",
    title: "Demo Pulse",
    artist: "Xalanify Lab",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
    duration: 205,
    youtubeId: null,
  },
  {
    id: "demo-track-2",
    title: "Neon Streets",
    artist: "Xalanify Lab",
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
    duration: 188,
    youtubeId: null,
  },
  {
    id: "demo-track-3",
    title: "Night Session",
    artist: "Xalanify Lab",
    thumbnail: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400",
    duration: 233,
    youtubeId: null,
  },
]

export default function SettingsTab() {
  const { user, signOut } = useAuth()
  const [activeView, setActiveView] = useState<SettingsView>("menu")
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES)
  const [playlistQuery, setPlaylistQuery] = useState("")
  const [playlistLoading, setPlaylistLoading] = useState(false)
  const [playlistResults, setPlaylistResults] = useState<PlaylistSuggestion[]>([])
  const [addingPlaylistId, setAddingPlaylistId] = useState<string | null>(null)
  const [experimentMessage, setExperimentMessage] = useState("")

  const [myPlaylists, setMyPlaylists] = useState<UserPlaylist[]>([])
  const [targetUserId, setTargetUserId] = useState("")
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("")
  const [sharing, setSharing] = useState(false)
  const [shareMessage, setShareMessage] = useState("")

  const isAdmin = user?.email === "adminx@adminx.com"

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!stored) return

    try {
      const parsed = JSON.parse(stored) as Partial<Preferences>
      setPreferences({ ...DEFAULT_PREFERENCES, ...parsed })
    } catch {
      setPreferences(DEFAULT_PREFERENCES)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(preferences))
    window.dispatchEvent(new Event("xalanify-preferences-changed"))
  }, [preferences])

  useEffect(() => {
    if (!user || !isAdmin) return
    getPlaylists(user.id).then((lists: any) => {
      setMyPlaylists((lists || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        tracks: Array.isArray(item.tracks) ? item.tracks : [],
      })))
    })
  }, [user, isAdmin, activeView])

  const initials = useMemo(() => {
    if (!user?.email) return "X"
    return user.email.charAt(0).toUpperCase()
  }, [user?.email])

  function updatePreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  async function handlePlaylistSearch() {
    if (!playlistQuery.trim()) return
    setPlaylistLoading(true)
    const items = await searchPlaylistSuggestions(playlistQuery)
    setPlaylistResults(items)
    setPlaylistLoading(false)
  }

  async function handleAddSuggestedPlaylist(item: PlaylistSuggestion) {
    if (!user) return

    setAddingPlaylistId(item.id)
    const created = await createPlaylist(user.id, item.title, item.thumbnail)

    if (created?.id && item.previewTracks.length > 0) {
      for (const track of item.previewTracks) {
        await addTrackToPlaylist(created.id, track)
      }
    }

    setAddingPlaylistId(null)
  }

  async function handleCreateDemoPlaylist() {
    if (!user) return
    setExperimentMessage("A criar playlist demo...")

    const created = await createPlaylist(user.id, "Demo · Novidades de Teste")
    if (!created?.id) {
      setExperimentMessage("Não foi possível criar a playlist demo.")
      return
    }

    for (const track of DEMO_TEST_TRACKS) {
      await addTrackToPlaylist(created.id, track)
    }

    setExperimentMessage("Playlist demo criada com 3 músicas de teste.")
  }

  async function handleInsertDemoFavorite() {
    if (!user) return
    setExperimentMessage("A inserir favorito de teste...")
    await addLikedTrack(user.id, DEMO_TEST_TRACKS[0])
    setExperimentMessage("Favorito de teste inserido.")
  }

  async function handleSharePlaylistToUser() {
    if (!targetUserId.trim() || !selectedPlaylistId) {
      setShareMessage("Preenche o User ID de destino e escolhe uma playlist.")
      return
    }

    const chosen = myPlaylists.find((p) => p.id === selectedPlaylistId)
    if (!chosen) {
      setShareMessage("Playlist não encontrada.")
      return
    }

    setSharing(true)
    setShareMessage("A enviar playlist para o utilizador...")

    const created = await createPlaylist(targetUserId.trim(), `Partilhado · ${chosen.name}`)

    if (!created?.id) {
      setShareMessage("Falhou ao criar playlist no utilizador de destino. Verifica as políticas RLS/admin.")
      setSharing(false)
      return
    }

    for (const track of chosen.tracks) {
      await addTrackToPlaylist(created.id, track)
    }

    setShareMessage("Playlist partilhada com sucesso para o utilizador de destino.")
    setSharing(false)
  }

  if (activeView === "profile") {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2">
        <button onClick={() => setActiveView("menu")} className="mb-4 flex items-center gap-2 text-[#a08070]">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Voltar</span>
        </button>

        <div className="glass-card-strong rounded-2xl p-5">
          <h2 className="mb-4 text-xl font-bold text-[#f0e0d0]">Perfil e Conta</h2>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)] text-base font-semibold text-[#e0c0a0]">
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium text-[#f0e0d0]">Conta ativa</p>
              <p className="text-xs text-[#a08070]">{user?.email || "Sem email"}</p>
            </div>
          </div>
          <p className="text-xs text-[#706050]">
            A tua sessão está sincronizada com Supabase. Usa "Terminar Sessão" para sair em segurança.
          </p>
        </div>
      </div>
    )
  }

  if (activeView === "credits") {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2">
        <button onClick={() => setActiveView("menu")} className="mb-4 flex items-center gap-2 text-[#a08070]">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Voltar</span>
        </button>

        <div className="glass-card-strong rounded-2xl p-5">
          <h2 className="mb-4 text-xl font-bold text-[#f0e0d0]">Créditos</h2>
          <p className="text-sm text-[#f0e0d0]">Criado por Xalana</p>
          <p className="mt-2 text-xs text-[#a08070]">Em desenvolvimento.</p>
        </div>
      </div>
    )
  }

  if (activeView === "tools") {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2">
        <button onClick={() => setActiveView("menu")} className="mb-4 flex items-center gap-2 text-[#a08070]">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Voltar</span>
        </button>

        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#f0e0d0]"><Wrench className="h-5 w-5" /> Ferramentas de Testes</h2>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto hide-scrollbar">
          <button
            onClick={() => setActiveView("playlist_tests")}
            className="glass-card-strong flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(230,57,70,0.2)]">
              <ListMusic className="h-5 w-5 text-[#e63946]" />
            </div>
            <span className="flex-1 text-sm font-medium text-[#f0e0d0]">Opções de Testes: Pesquisa de Playlist</span>
            <ChevronRight className="h-5 w-5 text-[#504030]" />
          </button>

          <button
            onClick={() => setActiveView("share_tests")}
            className="glass-card-strong flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(230,57,70,0.2)]">
              <Send className="h-5 w-5 text-[#e63946]" />
            </div>
            <span className="flex-1 text-sm font-medium text-[#f0e0d0]">Partilha de playlist/música para outro user</span>
            <ChevronRight className="h-5 w-5 text-[#504030]" />
          </button>

          <button
            onClick={() => setActiveView("experiments")}
            className="glass-card-strong flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(230,57,70,0.2)]">
              <FlaskConical className="h-5 w-5 text-[#e63946]" />
            </div>
            <span className="flex-1 text-sm font-medium text-[#f0e0d0]">Experimentos rápidos (seed/teste)</span>
            <ChevronRight className="h-5 w-5 text-[#504030]" />
          </button>

          <div className="glass-card-strong rounded-2xl p-4">
            <p className="mb-1 text-sm font-semibold text-[#f0e0d0]">Modo laboratório</p>
            <p className="text-xs text-[#a08070]">Esta secção só aparece para adminx@adminx.com para testar ideias futuras.</p>
          </div>
        </div>
      </div>
    )
  }

  if (activeView === "share_tests") {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2">
        <button onClick={() => setActiveView("tools")} className="mb-4 flex items-center gap-2 text-[#a08070]">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Voltar</span>
        </button>

        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#f0e0d0]"><UserRound className="h-5 w-5" /> Partilha de teste (Admin)</h2>

        <div className="space-y-3">
          <input
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            placeholder="User ID de destino (auth uid)"
            className="glass-card w-full rounded-xl px-4 py-3 text-sm text-[#f0e0d0] placeholder-[#706050] focus:outline-none"
          />

          <select
            value={selectedPlaylistId}
            onChange={(e) => setSelectedPlaylistId(e.target.value)}
            className="glass-card w-full rounded-xl px-4 py-3 text-sm text-[#f0e0d0] focus:outline-none"
          >
            <option value="">Seleciona uma playlist tua</option>
            {myPlaylists.map((pl) => (
              <option key={pl.id} value={pl.id}>{pl.name} ({pl.tracks.length} faixas)</option>
            ))}
          </select>

          <button
            onClick={handleSharePlaylistToUser}
            disabled={sharing}
            className="w-full rounded-xl py-3 text-sm font-semibold text-[#fff] disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #e63946 0%, #c1121f 100%)" }}
          >
            {sharing ? "A partilhar..." : "Partilhar playlist para outro user"}
          </button>
        </div>

        <p className="mt-3 text-xs text-[#a08070]">{shareMessage || "Define o user id de destino e escolhe uma playlist para replicar no outro utilizador."}</p>
      </div>
    )
  }

  if (activeView === "experiments") {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2">
        <button onClick={() => setActiveView("tools")} className="mb-4 flex items-center gap-2 text-[#a08070]">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Voltar</span>
        </button>

        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#f0e0d0]"><Wand2 className="h-5 w-5" /> Experimentos rápidos</h2>

        <div className="space-y-2">
          <button
            onClick={handleCreateDemoPlaylist}
            className="glass-card-strong flex w-full items-center justify-between rounded-xl px-4 py-3 text-left"
          >
            <span className="text-sm text-[#f0e0d0]">Criar playlist demo com 3 faixas</span>
            <Plus className="h-4 w-4 text-[#e63946]" />
          </button>

          <button
            onClick={handleInsertDemoFavorite}
            className="glass-card-strong flex w-full items-center justify-between rounded-xl px-4 py-3 text-left"
          >
            <span className="text-sm text-[#f0e0d0]">Inserir favorito de teste</span>
            <Plus className="h-4 w-4 text-[#e63946]" />
          </button>
        </div>

        {experimentMessage && <p className="mt-3 text-xs text-[#a08070]">{experimentMessage}</p>}
      </div>
    )
  }

  if (activeView === "playlist_tests") {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2">
        <button onClick={() => setActiveView("tools")} className="mb-4 flex items-center gap-2 text-[#a08070]">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Voltar</span>
        </button>

        <h2 className="mb-4 text-xl font-bold text-[#f0e0d0]">Pesquisa de Playlist (Teste)</h2>

        <div className="glass-card-strong mb-3 flex items-center gap-2 rounded-xl px-3 py-2">
          <input
            value={playlistQuery}
            onChange={(e) => setPlaylistQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePlaylistSearch()}
            placeholder="Pesquisar por artista, estilo, mood..."
            className="w-full bg-transparent text-sm text-[#f0e0d0] placeholder-[#706050] focus:outline-none"
          />
          <button onClick={handlePlaylistSearch} className="rounded-lg bg-[rgba(230,57,70,0.2)] px-3 py-1.5 text-xs text-[#f0e0d0]">
            Buscar
          </button>
        </div>

        {playlistLoading && <p className="text-xs text-[#a08070]">A procurar playlists no Spotify e YouTube...</p>}

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto hide-scrollbar">
          {playlistResults.map((item) => (
            <div key={`${item.source}-${item.id}`} className="glass-card rounded-xl p-3">
              <div className="mb-2 flex items-center gap-3">
                <img src={item.thumbnail} alt={item.title} className="h-12 w-12 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#f0e0d0]">{item.title}</p>
                  <p className="truncate text-xs text-[#a08070]">{item.description}</p>
                  <p className="text-[10px] uppercase tracking-wide text-[#706050]">{item.source} · {item.trackCount} faixas</p>
                </div>
                <button
                  onClick={() => handleAddSuggestedPlaylist(item)}
                  disabled={addingPlaylistId === item.id}
                  className="rounded-lg bg-[rgba(230,57,70,0.2)] px-2 py-1 text-xs text-[#f0e0d0] disabled:opacity-40"
                >
                  <span className="inline-flex items-center gap-1"><Plus className="h-3.5 w-3.5" /> {addingPlaylistId === item.id ? "A adicionar..." : "Biblioteca"}</span>
                </button>
              </div>

              {item.previewTracks.length > 0 && (
                <div className="space-y-1">
                  {item.previewTracks.slice(0, 3).map((track) => (
                    <p key={track.id} className="truncate text-xs text-[#a08070]">• {track.title} — {track.artist}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activeView === "customization") {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2">
        <button onClick={() => setActiveView("menu")} className="mb-4 flex items-center gap-2 text-[#a08070]">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Voltar</span>
        </button>

        <h2 className="mb-4 text-xl font-bold text-[#f0e0d0]">Personalização</h2>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto hide-scrollbar">
          <div className="glass-card-strong rounded-2xl p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-medium text-[#f0e0d0]"><Palette className="h-4 w-4" /> Cor de destaque</p>
            <div className="flex flex-wrap gap-2">
              {["#e63946", "#8b5cf6", "#0ea5e9", "#f59e0b", "#10b981", "#ec4899", "#14b8a6", "#f97316"].map((color) => (
                <button
                  key={color}
                  onClick={() => updatePreference("accentColor", color)}
                  className="h-7 w-7 rounded-full border-2"
                  style={{
                    backgroundColor: color,
                    borderColor: preferences.accentColor === color ? "#fff" : "transparent",
                  }}
                  aria-label={`Cor ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="glass-card-strong rounded-2xl p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-medium text-[#f0e0d0]"><Sparkles className="h-4 w-4" /> Efeitos visuais</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(["desligado", "suave", "intenso"] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => updatePreference("visualEffects", value)}
                  className="rounded-lg px-3 py-2"
                  style={{
                    background: preferences.visualEffects === value ? `${preferences.accentColor}33` : "rgba(255,255,255,0.04)",
                    color: "#f0e0d0",
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card-strong rounded-2xl p-4">
            <p className="mb-3 text-sm font-medium text-[#f0e0d0]">Modo de tema</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(["dark", "puredark", "light"] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => updatePreference("themeMode", value)}
                  className="rounded-lg px-3 py-2"
                  style={{
                    background: preferences.themeMode === value ? `${preferences.accentColor}33` : "rgba(255,255,255,0.04)",
                    color: "#f0e0d0",
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card-strong rounded-2xl p-4">
            <p className="mb-3 text-sm font-medium text-[#f0e0d0]">Estilo de superfície</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(["glass", "solid", "neon"] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => updatePreference("surfaceEffect", value)}
                  className="rounded-lg px-3 py-2"
                  style={{
                    background: preferences.surfaceEffect === value ? `${preferences.accentColor}33` : "rgba(255,255,255,0.04)",
                    color: "#f0e0d0",
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card-strong rounded-2xl p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-medium text-[#f0e0d0]"><Volume2 className="h-4 w-4" /> Qualidade de áudio</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(["auto", "normal", "alta"] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => updatePreference("audioQuality", value)}
                  className="rounded-lg px-3 py-2"
                  style={{
                    background: preferences.audioQuality === value ? `${preferences.accentColor}33` : "rgba(255,255,255,0.04)",
                    color: "#f0e0d0",
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card-strong rounded-2xl p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-medium text-[#f0e0d0]"><SlidersHorizontal className="h-4 w-4" /> Interface</p>
            <label className="mb-2 flex items-center justify-between text-xs text-[#f0e0d0]">
              Modo compacto
              <input type="checkbox" checked={preferences.compactMode} onChange={(e) => updatePreference("compactMode", e.target.checked)} />
            </label>
            <label className="flex items-center justify-between text-xs text-[#f0e0d0]">
              Fundo animado
              <input type="checkbox" checked={preferences.animateBackground} onChange={(e) => updatePreference("animateBackground", e.target.checked)} />
            </label>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2">
      <h1 className="mb-6 text-3xl font-bold text-[#f0e0d0]">Ajustes</h1>

      <div className="glass-card-strong overflow-hidden rounded-2xl">
        <button onClick={() => setActiveView("profile")} className="flex w-full items-center gap-4 px-5 py-4 text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(230,57,70,0.15)]">
            <User className="h-5 w-5 text-[#e63946]" />
          </div>
          <span className="flex-1 text-sm font-medium text-[#f0e0d0]">Perfil e Conta</span>
          <ChevronRight className="h-5 w-5 text-[#504030]" />
        </button>

        <button onClick={() => setActiveView("customization")} className="flex w-full items-center gap-4 border-t border-[rgba(255,255,255,0.05)] px-5 py-4 text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(230,57,70,0.15)]">
            <Palette className="h-5 w-5 text-[#e63946]" />
          </div>
          <span className="flex-1 text-sm font-medium text-[#f0e0d0]">Personalização</span>
          <ChevronRight className="h-5 w-5 text-[#504030]" />
        </button>

        <button onClick={() => setActiveView("credits")} className="flex w-full items-center gap-4 border-t border-[rgba(255,255,255,0.05)] px-5 py-4 text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(230,57,70,0.15)]">
            <Info className="h-5 w-5 text-[#e63946]" />
          </div>
          <span className="flex-1 text-sm font-medium text-[#f0e0d0]">Créditos</span>
          <ChevronRight className="h-5 w-5 text-[#504030]" />
        </button>

        {isAdmin && (
          <button onClick={() => setActiveView("tools")} className="flex w-full items-center gap-4 border-t border-[rgba(255,255,255,0.05)] px-5 py-4 text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(230,57,70,0.15)]">
              <Shield className="h-5 w-5 text-[#e63946]" />
            </div>
            <span className="flex-1 text-sm font-medium text-[#f0e0d0]">Ferramentas de Testes</span>
            <ChevronRight className="h-5 w-5 text-[#504030]" />
          </button>
        )}

        <button
          onClick={signOut}
          className="flex w-full items-center gap-4 border-t border-[rgba(255,255,255,0.05)] px-5 py-4 text-left transition-colors active:bg-[rgba(255,255,255,0.05)]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(230,57,70,0.15)]">
            <LogOut className="h-5 w-5 text-[#e63946]" />
          </div>
          <span className="flex-1 text-sm font-medium text-[#e63946]">Terminar Sessão</span>
          <ChevronRight className="h-5 w-5 text-[#504030]" />
        </button>
      </div>

      <p className="mt-8 text-center text-xs tracking-[0.12em] text-[#e63946]">XALANIFY · Em desenvolvimento</p>
    </div>
  )
}
