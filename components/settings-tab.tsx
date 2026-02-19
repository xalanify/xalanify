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
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { addTrackToPlaylist, createPlaylist } from "@/lib/supabase"
import { searchPlaylistSuggestions, type PlaylistSuggestion } from "@/lib/musicApi"

interface Preferences {
  accentColor: string
  visualEffects: "desligado" | "suave" | "intenso"
  audioQuality: "auto" | "normal" | "alta"
  compactMode: boolean
  animateBackground: boolean
}

const DEFAULT_PREFERENCES: Preferences = {
  accentColor: "#e63946",
  visualEffects: "suave",
  audioQuality: "alta",
  compactMode: false,
  animateBackground: true,
}

const SETTINGS_STORAGE_KEY = "xalanify.preferences"

type SettingsView = "menu" | "profile" | "customization" | "credits" | "tools" | "playlist_tests"

export default function SettingsTab() {
  const { user, signOut } = useAuth()
  const [activeView, setActiveView] = useState<SettingsView>("menu")
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES)
  const [playlistQuery, setPlaylistQuery] = useState("")
  const [playlistLoading, setPlaylistLoading] = useState(false)
  const [playlistResults, setPlaylistResults] = useState<PlaylistSuggestion[]>([])
  const [addingPlaylistId, setAddingPlaylistId] = useState<string | null>(null)

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
    const created = await createPlaylist(user.id, item.title)

    if (created?.id && item.previewTracks.length > 0) {
      for (const track of item.previewTracks) {
        await addTrackToPlaylist(created.id, track)
      }
    }

    setAddingPlaylistId(null)
  }

  if (activeView === "profile") {
    return (
      <div className="flex flex-1 flex-col px-4 pb-4 pt-2">
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
      <div className="flex flex-1 flex-col px-4 pb-4 pt-2">
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
      <div className="flex flex-1 flex-col px-4 pb-4 pt-2">
        <button onClick={() => setActiveView("menu")} className="mb-4 flex items-center gap-2 text-[#a08070]">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Voltar</span>
        </button>

        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#f0e0d0]"><Wrench className="h-5 w-5" /> Ferramentas de Testes</h2>

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
      </div>
    )
  }

  if (activeView === "playlist_tests") {
    return (
      <div className="flex flex-1 flex-col px-4 pb-4 pt-2">
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

        <div className="space-y-2 overflow-y-auto hide-scrollbar">
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
      <div className="flex flex-1 flex-col px-4 pb-4 pt-2">
        <button onClick={() => setActiveView("menu")} className="mb-4 flex items-center gap-2 text-[#a08070]">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Voltar</span>
        </button>

        <h2 className="mb-4 text-xl font-bold text-[#f0e0d0]">Personalização</h2>

        <div className="space-y-3 overflow-y-auto hide-scrollbar">
          <div className="glass-card-strong rounded-2xl p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-medium text-[#f0e0d0]"><Palette className="h-4 w-4" /> Cor de destaque</p>
            <div className="flex gap-2">
              {["#e63946", "#8b5cf6", "#0ea5e9", "#f59e0b", "#10b981"].map((color) => (
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
            <p className="mt-2 text-xs text-[#706050]">Ao trocar a cor, o tema da app atualiza automaticamente.</p>
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
    <div className="flex flex-1 flex-col px-4 pb-4 pt-2">
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

      <p className="mt-8 text-center text-xs tracking-[0.2em] text-[#504030]">XALANIFY V3.0.0</p>
    </div>
  )
}
