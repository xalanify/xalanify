"use client"

import { useEffect, useMemo, useState } from "react"
import {
  User,
  Info,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Palette,
  Type,
  Shapes,
  Wrench,
  Brain,
  Plus,
  Search,
  Sparkles,
  RefreshCw,
  History,
  Download,
  Check,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@/lib/theme-context"
import { likeTrack, createPlaylist, subscribeToPlaylists, subscribeToLikedTracks, addTrackToPlaylist } from "@/lib/db"
import { searchMusic, searchPlaylistSuggestions, type PlaylistSuggestion } from "@/lib/musicApi"
import { type Track } from "@/lib/player-context"
import { getPreferences, setPreferences } from "@/lib/preferences"
import { CHANGELOG, APP_VERSION, forceVersionCheck, forceClearPWA, type AppUpdate } from "@/lib/versions"
import { toast } from "sonner"

const THEME_COLORS = [
  { id: "purple" as const, name: "Roxo", hex: "#8B5CF6" },
  { id: "green" as const, name: "Verde", hex: "#10B981" },
  { id: "blue" as const, name: "Azul", hex: "#3B82F6" },
  { id: "orange" as const, name: "Laranja", hex: "#F97316" },
  { id: "pink" as const, name: "Rosa", hex: "#EC4899" },
  { id: "red" as const, name: "Vermelho", hex: "#EF4444" },
  { id: "cyan" as const, name: "Ciano", hex: "#06B6D4" },
  { id: "yellow" as const, name: "Amarelo", hex: "#EAB308" },
  { id: "indigo" as const, name: "Anil", hex: "#6366F1" },
  { id: "teal" as const, name: "Verde Água", hex: "#0D9488" },
  { id: "emerald" as const, name: "Esmeralda", hex: "#059669" },
  { id: "rose" as const, name: "Rosa Escuro", hex: "#F43F5E" },
  { id: "lime" as const, name: "Lima", hex: "#84CC16" },
  { id: "violet" as const, name: "Violeta", hex: "#A855F7" },
]

const FONTS = [
  { id: "inter", name: "Inter", icon: "𝔸𝕓ℂ" },
  { id: "geist", name: "Geist", icon: "𝕬𝖇ℂ" },
  { id: "sf-pro", name: "SF Pro", icon: "𝐀𝐛ℂ" },
  { id: "system", name: "Sistema", icon: "AbC" },
]

const BACKGROUNDS = [
  { id: "solid-dark", name: "Preto Sólido", preview: "🖤" },
  { id: "gradient", name: "Gradiente", preview: "🌈" },
  { id: "shapes", name: "Formas", preview: "⭒" },
  { id: "glass", name: "Glass", preview: "❄️" },
]

const NAV_ICONS = [
  { id: "default" as const, name: "Padrão" },
  { id: "minimal" as const, name: "Minimal" },
  { id: "bold" as const, name: "Negrito" },
]

type SettingsView = "menu" | "profile" | "customization" | "credits" | "updates" | "tools" | "smart_recommendations" | "discover_playlists" | "player_settings"

export default function SettingsTab() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const theme = useTheme()
  const { prefs, accentHex, setAccentColor, setFontFamily, setBackgroundStyle, setNavIcons } = theme
  const [activeView, setActiveView] = useState<SettingsView>("menu")
  const [myPlaylists, setMyPlaylists] = useState<any[]>([])
  const [likedTracks, setLikedTracks] = useState<Track[]>([])
  
  const [smartLoading, setSmartLoading] = useState(false)
  const [smartResults, setSmartResults] = useState<Track[]>([])
  const [smartMsg, setSmartMsg] = useState("")

const [discoverQuery, setDiscoverQuery] = useState("")
const [discoverResults, setDiscoverResults] = useState<PlaylistSuggestion[]>([])
const [discoverError, setDiscoverError] = useState<{spotify?: string, youtube?: string} | null>(null)
const [discoverLoading, setDiscoverLoading] = useState(false)
const [selectedDiscoverPlaylist, setSelectedDiscoverPlaylist] = useState<PlaylistSuggestion | null>(null)
const [addingPlaylist, setAddingPlaylist] = useState(false)

  const [playerPrefs, setPlayerPrefs] = useState<{ autoRetry: boolean }>({ autoRetry: true })
  
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [installing, setInstalling] = useState(false)

  const [checking, setChecking] = useState(false)
  const [hasUpdate, setHasUpdate] = useState<AppUpdate | null>(null)

  const userId = user?.uid || ""

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setCanInstall(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallPWA = async () => {
    const deferredPrompt = (window as any).deferredPrompt
    if (!deferredPrompt) {
      toast.error("Installation not available")
      return
    }

    setInstalling(true)
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === "accepted") {
      setIsInstalled(true)
      toast.success("App installed successfully")
    } else {
      toast.error("Installation cancelled")
    }
    
    setInstalling(false)
    ;(window as any).deferredPrompt = null
  }

  useEffect(() => {
    if (!userId) return
    const unsubPlaylists = subscribeToPlaylists(userId, (playlists) => {
      setMyPlaylists(playlists)
    })
    const unsubLiked = subscribeToLikedTracks(userId, (tracks) => {
      setLikedTracks(tracks)
    })
    return () => {
      unsubPlaylists()
      unsubLiked()
    }
  }, [userId])

  useEffect(() => {
    const prefsData = getPreferences()
    setPlayerPrefs(prefsData)
  }, [])

  const initials = useMemo(() => {
    if (profile?.username) return profile.username.charAt(0).toUpperCase()
    if (!user?.email) return "X"
    return user.email.charAt(0).toUpperCase()
  }, [profile?.username, user?.email])

  // ... all functions unchanged ...

  // Customization view - Full implementation
  if (activeView === "customization") {
    return (
      <div className={`flex min-h-0 flex-1 flex-col px-6 pb-6 pt-4 ${prefs.fontFamily}`}>
        <button onClick={() => setActiveView("menu")} className="mb-6 flex items-center gap-2 text-[#a08070] hover:text-[#f0e0d0]">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Voltar</span>
        </button>
        <h2 className="mb-6 text-2xl font-bold text-[#f0e0d0]">Personalização Completa</h2>
        
        <div className="space-y-6">
          <div className="rounded-3xl bg-[#1a1a1a]/60 border border-[#f0e0d0]/10 p-6">
            <p className="mb-4 flex items-center gap-2 text-sm text-[#a08070]">
              <Palette className="h-4 w-4" />
              Cor de Destaque
            </p>
            <div className="grid grid-cols-4 gap-3">
              {THEME_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setAccentColor(color.id)}
                  className="flex flex-col items-center gap-2 rounded-xl p-3 transition-all"
                  style={{ 
                    backgroundColor: prefs.accentColor === color.id ? `${color.hex}30` : "transparent",
                    border: prefs.accentColor === color.id ? `2px solid ${color.hex}` : "2px solid transparent"
                  }}
                >
                  <div className="h-10 w-10 rounded-full" style={{ backgroundColor: color.hex }} />
                  <span className="text-xs text-[#a08070]">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#1a1a1a]/60 border border-[#f0e0d0]/10 p-6">
            <p className="mb-4 flex items-center gap-2 text-sm text-[#a08070]">
              <Type className="h-4 w-4" />
              Fonte
            </p>
            <div className="space-y-3">
              {FONTS.map((font) => (
                <button
                  key={font.id}
                  onClick={() => setFontFamily(font.id as any)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all w-full ${
                    prefs.fontFamily === font.id ? 'bg-white/10 border border-[${accentHex}]' : 'hover:bg-white/5'
                  }`}
                >
                  <span className={`font-bold text-lg ${font.id}`} style={{ color: accentHex }}>
                    {font.icon}
                  </span>
                  <div>
                    <p className={`font-semibold ${font.id}`}>{font.name}</p>
                    <p className={`text-sm opacity-75 ${font.id}`}>Texto de exemplo</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#1a1a1a]/60 border border-[#f0e0d0]/10 p-6">
            <p className="mb-4 flex items-center gap-2 text-sm text-[#a08070]">
              <Shapes className="h-4 w-4" />
              Fundo
            </p>
            <div className="grid grid-cols-2 gap-3">
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setBackgroundStyle(bg.id as any)}
                  className={`relative rounded-xl p-6 transition-all aspect-square flex flex-col items-center justify-center ${
                    prefs.backgroundStyle === bg.id ? 'ring-2 ring-[${accentHex}] shadow-2xl' : 'hover:shadow-lg'
                  }`}
                  style={{ 
                    backgroundColor: prefs.backgroundStyle === bg.id ? accentHex : undefined,
                    color: prefs.backgroundStyle === bg.id ? 'white' : undefined
                  }}
                >
                  <span className="text-3xl mb-2">{bg.preview}</span>
                  <span className="text-xs">{bg.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#1a1a1a]/60 border border-[#f0e0d0]/10 p-6">
            <p className="mb-4 flex items-center gap-2 text-sm text-[#a08070]">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 5h18v2H3V5zm0 4h18v2H3V9zm0 4h18v2H3v-2zm0 4h12v2H3v-2z"/>
              </svg>
              Ícones Navegação
            </p>
            <div className="space-y-3">
              {NAV_ICONS.map((iconStyle) => (
                <button
                  key={iconStyle.id}
                  onClick={() => setNavIcons(iconStyle.id as any)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all w-full ${
                    prefs.navIcons === iconStyle.id ? 'bg-white/10 border border-[${accentHex}]' : 'hover:bg-white/5'
                  }`}
                >
                  <div className={`nav-icons-${iconStyle.id}`}>
                    <Search className="h-5 w-5" />
                  </div>
                  <span>{iconStyle.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Profile view
  if (activeView === "profile") {
    return (
      <div className={`flex min-h-0 flex-1 flex-col px-6 pb-6 pt-4 ${prefs.fontFamily}`}>
        <button onClick={() => setActiveView("menu")} className="mb-6 flex items-center gap-2 text-[#a08070] hover:text-[#f0e0d0]">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Voltar</span>
        </button>
        <div className="rounded-3xl bg-[#1a1a1a]/60 border border-[#f0e0d0]/10 p-6">
          <h2 className="mb-6 text-2xl font-bold text-[#f0e0d0]">Perfil</h2>
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold" style={{ backgroundColor: `${accentHex}30`, color: accentHex }}>
              {initials}
            </div>
            <div>
              <p className="text-lg font-medium text-[#f0e0d0]">{profile?.username || "Utilizador"}</p>
              <p className="text-sm text-[#a08070]">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Updates view - Full changelog + update controls
  if (activeView === "updates") {
    const checkUpdates = async () => {
      setChecking(true)
      const update = await forceVersionCheck()
      setChecking(false)
      if (update) {
        setHasUpdate(update)
        toast.success(`Nova versão ${update.version} disponível!`)
        window.dispatchEvent(new CustomEvent('remote-update-available', { detail: update }))
      } else {
        toast.success('App atualizado!')
      }
    }

    const clearPWACache = async () => {
      if (confirm('Limpar cache PWA e recarregar app? (mantém login)')) {
        await forceClearPWA()
      }
    }

    return (
      <div className={`flex min-h-0 flex-1 flex-col px-6 pb-6 pt-4 ${prefs.fontFamily}`}>
        <button onClick={() => setActiveView("menu")} className="mb-6 flex items-center gap-2 text-[#a08070] hover:text-[#f0e0d0]">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Voltar</span>
        </button>
        
        <div className="space-y-6">
          <div className="rounded-3xl bg-gradient-to-r from-[#D2B48C]/10 to-[#8E8E93]/10 border-2 border-[#D2B48C]/30 p-6">
            <h2 className="text-2xl font-bold text-[#D2B48C] mb-4 flex items-center gap-3">
              <RefreshCw className="h-6 w-6" />
              Atualizações & Cache PWA
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                onClick={checkUpdates} 
                disabled={checking}
                className="flex items-center gap-3 rounded-xl p-4 bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
              >
                {checking ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#D2B48C] border-t-transparent" />
                ) : (
                  <Sparkles className="h-5 w-5 text-[#D2B48C]" />
                )}
                <span className="font-semibold text-[#D2B48C]">Verificar GitHub</span>
              </button>
              <button 
                onClick={clearPWACache}
                className="flex items-center gap-3 rounded-xl p-4 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 transition-all text-red-100 hover:text-red-50"
              >
                <RefreshCw className="h-5 w-5" />
                <span className="font-semibold">Limpar Cache PWA</span>
              </button>
            </div>
            
            <div className="text-sm text-[#8E8E93] bg-black/50 p-3 rounded-xl">
              Versão atual: <span className="font-bold text-[#D2B48C]">{APP_VERSION}</span>
              {hasUpdate && (
                <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                  Atualização: {hasUpdate.version}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Atualizações
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {CHANGELOG.slice(0, 5).map((update, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-xl border-l-4" style={{ borderLeftColor: update.isNew ? '#D2B48C' : '#8E8E93' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-lg text-[#D2B48C]">{update.version}</span>
                    <span className="text-sm opacity-75">{update.date}</span>
                  </div>
                  <ul className="space-y-1 text-sm">
                    {update.changes.slice(0, 3).map((change, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <div className="h-2 w-2 bg-[#D2B48C] rounded-full mt-1.5 flex-shrink-0" />
                        <span>{change}</span>
                      </li>
                    ))}
                    {update.changes.length > 3 && (
                      <span className="text-xs opacity-50">...e mais</span>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Ferramentas de admin (só visível para isAdmin)
  if (activeView === "tools") {
    return (
      <div className={`flex min-h-0 flex-1 flex-col px-6 pb-6 pt-4 ${prefs.fontFamily}`}>
        <button onClick={() => setActiveView("menu")} className="mb-6 flex items-center gap-2 text-[#a08070] hover:text-[#f0e0d0]">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Voltar</span>
        </button>
        <h2 className="mb-6 text-2xl font-bold text-[#f0e0d0] flex items-center gap-3">
          <Wrench className="h-6 w-6" style={{ color: accentHex }} />
          Ferramentas de Admin
        </h2>
        <div className="space-y-4">
          <div className="rounded-3xl bg-[#1a1a1a]/60 border border-[#f0e0d0]/10 p-6">
            <p className="text-sm text-[#a08070] mb-4">
              Área reservada a administradores. Ferramentas apenas para testes e gestão.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setActiveView("discover_playlists")}
                className="flex w-full items-center justify-between rounded-2xl bg-[#111112] px-4 py-3 hover:bg-[#18181b] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Search className="h-5 w-5 text-[#D2B48C]" />
                  <div className="text-left">
                    <p className="text-[15px] font-semibold text-[#f0e0d0]">
                      Procurar playlists públicas
                    </p>
                    <p className="text-[12px] text-[#a08070]">
                      Importar playlists de teste para a tua biblioteca
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#8E8E93]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Discover playlists (admin only)
  if (activeView === "discover_playlists") {
    const handleSearch = async () => {
      if (!discoverQuery.trim()) {
        toast.error("Escreve um nome ou artista para procurar playlists")
        return
      }
      setDiscoverLoading(true)
      setDiscoverError(null)
      setSelectedDiscoverPlaylist(null)
      try {
        const result = await searchPlaylistSuggestions(discoverQuery.trim())
        setDiscoverResults(result.playlists)
        
        if (result.playlists.length === 0) {
          if (result.spotifyError || result.youtubeError) {
            let msg = "APIs não disponíveis: "
            if (result.spotifyError?.includes('CREDENTIALS_MISSING')) msg += "Spotify keys em falta; "
            if (result.youtubeError?.includes('API_KEY_MISSING')) msg += "YouTube key em falta; "
            if (result.youtubeError?.includes('QUOTA')) msg += "YouTube quota esgotada; "
            toast.error(msg || "Erro desconhecido nas APIs")
setDiscoverError({spotify: result.spotifyError || undefined, youtube: result.youtubeError || undefined})
          } else {
            toast.message("Nenhuma playlist encontrada", {
              description: "Tenta outro termo de pesquisa.",
            })
          }
        }
      } catch (e) {
        console.error("[Settings] Search playlists error:", e)
        toast.error("Erro de rede na pesquisa")
setDiscoverError({spotify: "NETWORK_ERROR", youtube: "NETWORK_ERROR"})
      } finally {
        setDiscoverLoading(false)
      }
    }

    const handleRetrySearch = () => {
      setDiscoverQuery("")
      setDiscoverResults([])
      setDiscoverError(null)
    }

    const handleImportSelected = async () => {
      if (!userId || !selectedDiscoverPlaylist) {
        toast.error("Nenhuma playlist selecionada")
        return
      }
      setAddingPlaylist(true)
      try {
        const playlistName = `${selectedDiscoverPlaylist.title}`.slice(0, 80)
        const newPlaylist = await createPlaylist(playlistName, selectedDiscoverPlaylist.thumbnail)
        if (!newPlaylist) {
          toast.error("Não foi possível criar a playlist")
          setAddingPlaylist(false)
          return
        }

        const tracksToImport = selectedDiscoverPlaylist.previewTracks.slice(0, 200).map((t) => ({
          id: t.id,
          title: t.title,
          artist: t.artist,
          thumbnail: t.thumbnail,
          duration: t.duration,
          youtubeId: t.youtubeId,
          previewUrl: t.previewUrl,
          source: t.source,
        }))

        for (const track of tracksToImport) {
          // Ignorar falhas individuais, é só ferramenta de teste/admin
          // eslint-disable-next-line no-await-in-loop
          await addTrackToPlaylist(newPlaylist.id, track)
        }

        toast.success("Playlist importada para a tua biblioteca")
      } catch {
        toast.error("Erro ao importar playlist")
      } finally {
        setAddingPlaylist(false)
      }
    }

    return (
      <div className={`flex min-h-0 flex-1 flex-col px-6 pb-6 pt-4 ${prefs.fontFamily}`}>
        <button onClick={() => setActiveView("tools")} className="mb-6 flex items-center gap-2 text-[#a08070] hover:text-[#f0e0d0]">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Voltar às ferramentas</span>
        </button>
        <h2 className="mb-4 text-2xl font-bold text-[#f0e0d0] flex items-center gap-3">
          <Search className="h-6 w-6" style={{ color: accentHex }} />
          Procurar playlists públicas
        </h2>
        <p className="mb-4 text-xs text-[#a08070]">
          Apenas para admin. Usa APIs externas (Spotify / YouTube) para testes – conteúdo pode ser removido a qualquer momento.
        </p>

        <div className="mb-5 flex gap-3">
          <div className="flex-1 rounded-2xl bg-[#111112] px-3.5 py-2.5 flex items-center gap-2 border border-white/5">
            <Search className="h-4 w-4 text-[#8E8E93]" />
            <input
              value={discoverQuery}
              onChange={(e) => setDiscoverQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Nome da playlist, artista, mood..."
              className="w-full bg-transparent text-sm text-[#f0e0d0] placeholder:text-[#61616b] outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={discoverLoading}
            className="rounded-2xl bg-[#D2B48C] px-4 text-sm font-semibold text-black disabled:opacity-60"
          >
            {discoverLoading ? "A procurar..." : "Procurar"}
          </button>
        </div>

        <div className="flex min-h-0 flex-1 gap-4">
          <div className="w-full space-y-3 overflow-y-auto pr-1">
            {discoverResults.map((pl) => (
              <button
                key={`${pl.source}-${pl.id}`}
                onClick={() => setSelectedDiscoverPlaylist(pl)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors ${
                  selectedDiscoverPlaylist?.id === pl.id && selectedDiscoverPlaylist.source === pl.source
                    ? "border-[#D2B48C] bg-[#111112]"
                    : "border-white/8 bg-[#050506] hover:bg-[#111112]"
                }`}
              >
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-[#111112]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pl.thumbnail} alt={pl.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-[#f0e0d0]">{pl.title}</p>
                  <p className="truncate text-[11px] text-[#a08070]">{pl.description}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#61616b]">
                    {pl.trackCount} faixas • {pl.source === "spotify" ? "Spotify" : "YouTube"}
                  </p>
                </div>
              </button>
            ))}
            {discoverResults.length === 0 && !discoverLoading && !discoverError ? (
              <p className="text-xs text-[#61616b]">
                Ainda sem resultados. Faz uma pesquisa para ver playlists sugeridas.
              </p>
            ) : discoverError && !discoverLoading ? (
              <div className="p-4 text-center space-y-2">
                <p className="text-sm text-red-400">Erro na pesquisa:</p>
                {discoverError.spotify && <p className="text-xs text-red-300">Spotify: {discoverError.spotify}</p>}
                {discoverError.youtube && <p className="text-xs text-red-300">YouTube: {discoverError.youtube}</p>}
                <button 
                  onClick={handleRetrySearch}
                  className="mt-2 px-4 py-1.5 bg-red-500/80 hover:bg-red-500 text-xs rounded-full text-white"
                >
                  Tentar novamente
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {selectedDiscoverPlaylist && (
          <div className="mt-6 rounded-3xl border border-[#f0e0d0]/10 bg-[#050506] p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-[#111112]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedDiscoverPlaylist.thumbnail}
                  alt={selectedDiscoverPlaylist.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#f0e0d0]">
                  {selectedDiscoverPlaylist.title}
                </p>
                <p className="truncate text-[11px] text-[#a08070]">
                  {selectedDiscoverPlaylist.description}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#61616b]">
                  {selectedDiscoverPlaylist.trackCount} faixas
                </p>
              </div>
            </div>

            <div className="mb-3 flex-1 overflow-y-auto rounded-2xl bg-[#111112] p-3">
              {selectedDiscoverPlaylist.previewTracks.slice(0, 20).map((t, idx) => (
                <div key={t.id + idx} className="mb-2 flex items-center gap-3">
                  <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-[#050506]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.thumbnail} alt={t.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[12px] text-[#f0e0d0]">{t.title}</p>
                    <p className="truncate text-[11px] text-[#61616b]">{t.artist}</p>
                  </div>
                </div>
              ))}
              {selectedDiscoverPlaylist.previewTracks.length > 20 && (
                <p className="mt-1 text-[10px] text-[#61616b]">
                  …e mais {selectedDiscoverPlaylist.previewTracks.length - 20} faixas
                </p>
              )}
            </div>

            <button
              onClick={handleImportSelected}
              disabled={addingPlaylist}
              className="mt-2 rounded-2xl bg-[#D2B48C] px-4 py-3 text-[13px] font-semibold text-black disabled:opacity-60"
            >
              {addingPlaylist ? "A importar playlist..." : "Importar playlist para a biblioteca"}
            </button>
          </div>
        )}
      </div>
    )
  }

  // Créditos / Sobre a app
  if (activeView === "credits") {
    return (
      <div className={`flex min-h-0 flex-1 flex-col px-6 pb-6 pt-4 ${prefs.fontFamily}`}>
        <button onClick={() => setActiveView("menu")} className="mb-6 flex items-center gap-2 text-[#a08070] hover:text-[#f0e0d0]">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Voltar</span>
        </button>
        <h2 className="mb-6 text-2xl font-bold text-[#f0e0d0] flex items-center gap-3">
          <Info className="h-6 w-6" style={{ color: accentHex }} />
          Créditos
        </h2>
        <div className="space-y-6">
          <div className="rounded-3xl bg-[#1a1a1a]/60 border border-[#f0e0d0]/10 p-6">
            <p className="text-xl font-semibold text-[#D2B48C] mb-1">Xalanify</p>
            <p className="text-sm text-[#a08070] mb-4">Your music, everywhere.</p>
            <p className="text-sm text-[#a08070]">Versão <span className="font-mono font-semibold text-[#f0e0d0]">{APP_VERSION}</span></p>
          </div>
          <div className="rounded-3xl bg-[#1a1a1a]/60 border border-[#f0e0d0]/10 p-6">
            <h3 className="font-semibold text-[#f0e0d0] mb-3">Sobre</h3>
            <p className="text-sm text-[#a08070] leading-relaxed">
              Aplicação de música em desenvolvimento. Obrigado por usares o Xalanify.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Main menu
  return (
    <div className={`flex min-h-0 flex-1 flex-col px-5 pb-6 pt-4 w-full max-w-full ${prefs.fontFamily} ${prefs.backgroundStyle}`}>
      <h2 className="mb-5 text-[34px] font-bold text-[#D2B48C]">Ajustes</h2>
      
      <div className={`space-y-3 overflow-y-auto w-full nav-icons-${prefs.navIcons}`}>
        <button onClick={() => setActiveView("profile")} className="w-full flex items-center gap-4 rounded-[18px] glass-card p-4 hover:bg-[#1a1a1a] transition-all h-[76px]">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-[10px]" style={{ backgroundColor: `${accentHex}30` }}>
            <User className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: accentHex }} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-[17px] text-[#D2B48C]">Perfil</p>
            <p className="text-[14px] text-[#8E8E93]">{profile?.username || "Editar perfil"}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-[#8E8E93]" />
        </button>

        <button onClick={() => setActiveView("customization")} className="w-full flex items-center gap-4 rounded-[18px] glass-card p-4 hover:bg-[#1a1a1a] transition-all h-[76px]">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-[10px]" style={{ backgroundColor: `${accentHex}30` }}>
            <Palette className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: accentHex }} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-[17px] text-[#D2B48C]">Personalização</p>
            <p className="text-[14px] text-[#8E8E93]">Tema, cores e muito mais</p>
          </div>
          <ChevronRight className="h-5 w-5 text-[#8E8E93]" />
        </button>

        <button onClick={() => setActiveView("updates")} className="w-full flex items-center gap-4 rounded-[18px] glass-card p-4 hover:bg-[#1a1a1a] transition-all h-[76px]">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-[10px]" style={{ backgroundColor: `${accentHex}30` }}>
            <History className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: accentHex }} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-[17px] text-[#D2B48C]">Atualizações</p>
            <p className="text-[14px] text-[#8E8E93]">Histórico de alterações</p>
          </div>
          <ChevronRight className="h-5 w-5 text-[#8E8E93]" />
        </button>

        {isAdmin && (
          <button onClick={() => setActiveView("tools")} className="w-full flex items-center gap-4 rounded-[18px] glass-card p-4 hover:bg-[#1a1a1a] transition-all h-[76px]">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-[10px]" style={{ backgroundColor: `${accentHex}30` }}>
              <Wrench className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: accentHex }} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-[17px] text-[#D2B48C]">Ferramentas</p>
              <p className="text-[14px] text-[#8E8E93]">Admin</p>
            </div>
            <ChevronRight className="h-5 w-5 text-[#8E8E93]" />
          </button>
        )}

        <button onClick={() => setActiveView("credits")} className="w-full flex items-center gap-4 rounded-[18px] glass-card p-4 hover:bg-[#1a1a1a] transition-all h-[76px]">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-[10px]" style={{ backgroundColor: `${accentHex}30` }}>
            <Info className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: accentHex }} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-[17px] text-[#D2B48C]">Créditos</p>
            <p className="text-[14px] text-[#8E8E93]">Sobre a app</p>
          </div>
          <ChevronRight className="h-5 w-5 text-[#8E8E93]" />
        </button>

        {isAdmin && (canInstall || !isInstalled) && (
          <button 
            onClick={handleInstallPWA} 
            disabled={installing}
            className="w-full flex items-center gap-4 rounded-[18px] glass-card p-4 hover:bg-[#1a1a1a] transition-all h-[76px]"
          >
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-[10px]" style={{ backgroundColor: `${accentHex}30` }}>
              {isInstalled ? (
                <Check className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: accentHex }} />
              ) : (
                <Download className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: accentHex }} />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-[17px] text-[#D2B48C]">
                {isInstalled ? "Instalado" : "Instalar App"}
              </p>
              <p className="text-[14px] text-[#8E8E93]">
                {isInstalled ? "Adicionado ao ecrã inicial" : "Adicionar ao ecrã inicial"}
              </p>
            </div>
            {installing ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#8E8E93] border-t-transparent" />
            ) : (
              <ChevronRight className="h-5 w-5 text-[#8E8E93]" />
            )}
          </button>
        )}

        <button onClick={signOut} className="w-full flex items-center gap-4 rounded-[18px] glass-card p-4 hover:bg-red-500/20 mt-6 h-[76px]">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-[10px] bg-red-500/20">
            <LogOut className="h-6 w-6 sm:h-7 sm:w-7 text-red-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-[17px] text-red-400">Terminar Sessão</p>
          </div>
        </button>
      </div>
    </div>
  )
}

