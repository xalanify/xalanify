"use client"

import { useEffect, useMemo, useState } from "react"
import {
  User,
  Info,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Palette,
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
import { CHANGELOG, APP_VERSION } from "@/lib/versions"
import { toast } from "sonner"

const THEME_COLORS = [
  { id: "purple" as const, name: "Roxo", hex: "#8B5CF6" },
  { id: "green" as const, name: "Verde", hex: "#1DB954" },
  { id: "blue" as const, name: "Azul", hex: "#3B82F6" },
  { id: "orange" as const, name: "Laranja", hex: "#F97316" },
  { id: "pink" as const, name: "Rosa", hex: "#EC4899" },
  { id: "red" as const, name: "Vermelho", hex: "#EF4444" },
  { id: "cyan" as const, name: "Ciano", hex: "#06B6D4" },
  { id: "yellow" as const, name: "Amarelo", hex: "#EAB308" },
]

type SettingsView = "menu" | "profile" | "customization" | "credits" | "updates" | "tools" | "smart_recommendations" | "discover_playlists" | "player_settings"

export default function SettingsTab() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const { accentColor, setAccentColor, accentHex } = useTheme()
  const [activeView, setActiveView] = useState<SettingsView>("menu")
  const [myPlaylists, setMyPlaylists] = useState<any[]>([])
  const [likedTracks, setLikedTracks] = useState<Track[]>([])
  
  const [smartLoading, setSmartLoading] = useState(false)
  const [smartResults, setSmartResults] = useState<Track[]>([])
  const [smartMsg, setSmartMsg] = useState("")

  const [discoverQuery, setDiscoverQuery] = useState("")
  const [discoverResults, setDiscoverResults] = useState<PlaylistSuggestion[]>([])
  const [discoverLoading, setDiscoverLoading] = useState(false)
  const [selectedDiscoverPlaylist, setSelectedDiscoverPlaylist] = useState<PlaylistSuggestion | null>(null)
  const [addingPlaylist, setAddingPlaylist] = useState(false)

  // Player settings - apenas autoRetry
  const [playerPrefs, setPlayerPrefs] = useState<{ autoRetry: boolean }>({ autoRetry: true })
  
  // PWA installation states
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [installing, setInstalling] = useState(false)

  // Check PWA install availability
  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      if (window.isPWAInstalled) {
        setIsInstalled(window.isPWAInstalled())
      }
    }
    checkInstalled()
    
    // Listen for install availability
    const handleInstallAvailable = () => setCanInstall(true)
    window.addEventListener('pwa-install-available', handleInstallAvailable)
    
    // Also check deferredPrompt directly
    if (window.deferredPrompt) {
      setCanInstall(true)
    }
    
    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable)
    }
  }, [])

  // Handle PWA installation
  async function handleInstallPWA() {
    if (!window.installPWA) return
    setInstalling(true)
    try {
      const success = await window.installPWA()
      if (success) {
        setIsInstalled(true)
        setCanInstall(false)
        toast.success("Xalanify adicionado ao ecrã inicial!")
      }
    } catch (error) {
      console.error("Install failed:", error)
    }
    setInstalling(false)
  }

  const userId = user?.uid || ""

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

  // Load player preferences
  useEffect(() => {
    const prefs = getPreferences()
    setPlayerPrefs(prefs)
  }, [])

  const initials = useMemo(() => {
    if (profile?.username) return profile.username.charAt(0).toUpperCase()
    if (!user?.email) return "X"
    return user.email.charAt(0).toUpperCase()
  }, [profile?.username, user?.email])

  async function handleSmartRecommendations() {
    if (!userId) return
    setSmartLoading(true)
    setSmartMsg("A analisar a tua biblioteca...")
    
    const seeds = new Set<string>()
    
    for (const track of likedTracks.slice(0, 5)) {
      if (track.artist) seeds.add(track.artist)
    }
    
    for (const playlist of myPlaylists.slice(0, 3)) {
      for (const track of (playlist.tracks || []).slice(0, 3)) {
        if (track.artist) seeds.add(track.artist)
      }
    }
    
    if (seeds.size === 0) {
      seeds.add("pop")
      seeds.add("rock")
    }
    
    setSmartMsg("A procurar recomendações...")
    
    const allTracks: Track[] = []
    const queries = Array.from(seeds).slice(0, 4)
    
    for (const query of queries) {
      const results = await searchMusic(query)
      allTracks.push(...results.slice(0, 8))
    }
    
    const likedIds = new Set(likedTracks.map(t => t.id))
    const uniqueTracks = allTracks.filter((t, index, self) => 
      !likedIds.has(t.id) && 
      index === self.findIndex(tt => tt.id === t.id)
    ).slice(0, 20)
    
    setSmartResults(uniqueTracks)
    setSmartLoading(false)
    setSmartMsg(`Encontradas ${uniqueTracks.length} recomendações!`)
  }

  async function handleAddRecommended(track: Track) {
    await likeTrack(track)
    toast.success("Adicionado aos favoritos!")
  }

  async function handleDiscoverSearch() {
    if (!discoverQuery.trim()) return
    setDiscoverLoading(true)
    const results = await searchPlaylistSuggestions(discoverQuery)
    setDiscoverResults(results)
    setDiscoverLoading(false)
  }

  async function handleAddDiscoverPlaylist(item: PlaylistSuggestion) {
    if (!userId) return
    setAddingPlaylist(true)
    const created = await createPlaylist(item.title, item.thumbnail)
    
    if (created) {
      for (const track of item.previewTracks) {
        await addTrackToPlaylist(created.id, track)
      }
      toast.success(`Playlist "${item.title}" adicionada com ${item.previewTracks.length} músicas!`)
      setSelectedDiscoverPlaylist(null)
      setActiveView("tools")
    } else {
      toast.error("Erro ao adicionar playlist")
    }
    setAddingPlaylist(false)
  }

  function handleAutoRetryToggle() {
    const newValue = !playerPrefs.autoRetry
    setPreferences({ autoRetry: newValue })
    setPlayerPrefs(prev => ({ ...prev, autoRetry: newValue }))
    toast.success(newValue ? "Retry automático ativado" : "Retry automático desativado")
  }

  if (activeView === "profile") {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-4">
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

  if (activeView === "customization") {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-4">
        <button onClick={() => setActiveView("menu")} className="mb-6 flex items-center gap-2 text-[#a08070] hover:text-[#f0e0d0]">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Voltar</span>
        </button>
        <h2 className="mb-6 text-2xl font-bold text-[#f0e0d0]">Personalização</h2>
        <div className="rounded-3xl bg-[#1a1a1a]/60 border border-[#f0e0d0]/10 p-6">
          <p className="mb-4 flex items-center gap-2 text-sm text-[#a08070]">
            <Palette className="h-4 w-4" />
            Cor de destaque
          </p>
          <div className="grid grid-cols-4 gap-3">
            {THEME_COLORS.map((color) => (
              <button
                key={color.id}
                onClick={() => setAccentColor(color.id)}
                className="flex flex-col items-center gap-2 rounded-xl p-3 transition-all"
                style={{ 
                  backgroundColor: accentColor === color.id ? `${color.hex}30` : "transparent",
                  border: accentColor === color.id ? `2px solid ${color.hex}` : "2px solid transparent"
                }}
              >
                <div className="h-10 w-10 rounded-full" style={{ backgroundColor: color.hex }} />
                <span className="text-xs text-[#a08070]">{color.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (activeView === "credits") {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-4">
        <button onClick={() => setActiveView("menu")} className="mb-6 flex items-center gap-2 text-[#a08070] hover:text-[#f0e0d0]">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Voltar</span>
        </button>
        <div className="rounded-3xl bg-[#1a1a1a]/60 border border-[#f0e0d0]/10 p-6 text-center">
          <h2 className="mb-4 text-2xl font-bold text-[#f0e0d0]">Créditos</h2>
          <p className="text-lg text-[#f0e0d0]">Criado por Xalana</p>
          <p className="mt-4 text-sm text-[#a08070]">Xalanify · 2026</p>
        </div>
      </div>
    )
  }

  if (activeView === "updates") {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-4">
        <button onClick={() => setActiveView("menu")} className="mb-6 flex items-center gap-2 text-[#a08070] hover:text-[#f0e0d0]">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Voltar</span>
        </button>
        
        <h2 className="mb-2 text-2xl font-bold text-[#f0e0d0] flex items-center gap-3">
          <History className="h-6 w-6" style={{ color: accentHex }} />
          Atualizações
        </h2>
        
        <p className="mb-6 text-sm text-[#a08070]">
          Versão atual: <span style={{ color: accentHex }}>{APP_VERSION}</span>
        </p>

        <div className="flex-1 overflow-y-auto space-y-4">
          {CHANGELOG.map((update, index) => (
            <div 
              key={update.version} 
              className="rounded-2xl bg-[#1a1a1a]/60 border border-[#f0e0d0]/10 p-4"
              style={{ borderColor: index === 0 ? `${accentHex}40` : undefined }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#f0e0d0]">{update.version}</span>
                  {index === 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: accentHex }}>
                      NOVO
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#a08070]">{update.date}</span>
              </div>
              <h3 className="text-sm font-medium text-[#f0e0d0] mb-2">{update.title}</h3>
              <ul className="space-y-1">
                {update.changes.map((change, i) => (
                  <li key={i} className="text-xs text-[#a08070] flex items-start gap-2">
                    <span className="text-[#f0e0d0]/50">•</span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activeView === "player_settings" && isAdmin) {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-4">
        <button onClick={() => setActiveView("tools")} className="mb-6 flex items-center gap-2 text-[#a08070] hover:text-[#f0e0d0]">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Voltar</span>
        </button>
        
        <h2 className="mb-4 text-2xl font-bold text-[#f0e0d0] flex items-center gap-3">
          <RefreshCw className="h-6 w-6" style={{ color: accentHex }} />
          Configurações do Player
        </h2>

        <p className="text-sm text-[#a08070] mb-6">
          O sistema usa automaticamente YouTube para reproduzir músicas completas.
        </p>

        <div className="space-y-4">
          {/* Auto Retry Toggle */}
          <div className="rounded-2xl bg-[#1a1a1a]/60 border border-[#f0e0d0]/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5" style={{ color: accentHex }} />
                <div>
                  <p className="text-[#f0e0d0] font-medium">Retry Automático</p>
                  <p className="text-xs text-[#a08070]">Tentar novamente automaticamente quando a música falha</p>
                </div>
              </div>
              <button
                onClick={handleAutoRetryToggle}
                className={`relative h-6 w-11 rounded-full transition-colors ${playerPrefs.autoRetry ? 'bg-green-500' : 'bg-[#3a3a3a]'}`}
              >
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${playerPrefs.autoRetry ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (activeView === "tools" && isAdmin) {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-4">
        <button onClick={() => setActiveView("menu")} className="mb-6 flex items-center gap-2 text-[#a08070] hover:text-[#f0e0d0]">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Voltar</span>
        </button>
        <h2 className="mb-6 text-2xl font-bold text-[#f0e0d0] flex items-center gap-3">
          <Wrench className="h-6 w-6" style={{ color: accentHex }} />
          Ferramentas (Admin)
        </h2>

        <div className="space-y-3">
          <button onClick={() => setActiveView("player_settings")} className="w-full flex items-center justify-between rounded-2xl bg-[#1a1a1a]/60 border border-[#f0e0d0]/10 p-4 hover:bg-[#1a1a1a] transition-all">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accentHex}20` }}>
                <RefreshCw className="h-5 w-5" style={{ color: accentHex }} />
              </div>
              <div className="text-left">
                <span className="text-[#f0e0d0] block">Configurações do Player</span>
                <span className="text-xs text-[#a08070]">Retry automático</span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[#a08070]" />
          </button>

          <button onClick={() => setActiveView("smart_recommendations")} className="w-full flex items-center justify-between rounded-2xl bg-[#1a1a1a]/60 border border-[#f0e0d0]/10 p-4 hover:bg-[#1a1a1a] transition-all">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accentHex}20` }}>
                <Brain className="h-5 w-5" style={{ color: accentHex }} />
              </div>
              <div className="text-left">
                <span className="text-[#f0e0d0] block">Recomendações Inteligentes</span>
                <span className="text-xs text-[#a08070]">Baseado na tua biblioteca</span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[#a08070]" />
          </button>

          <button onClick={() => setActiveView("discover_playlists")} className="w-full flex items-center justify-between rounded-2xl bg-[#1a1a1a]/60 border border-[#f0e0d0]/10 p-4 hover:bg-[#1a1a1a] transition-all">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accentHex}20` }}>
                <Sparkles className="h-5 w-5" style={{ color: accentHex }} />
              </div>
              <div className="text-left">
                <span className="text-[#f0e0d0] block">Descobrir Playlists</span>
                <span className="text-xs text-[#a08070]">Pesquisar playlists públicas</span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[#a08070]" />
          </button>
        </div>
      </div>
    )
  }

  if (activeView === "smart_recommendations" && isAdmin) {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-4">
        <button onClick={() => setActiveView("tools")} className="mb-6 flex items-center gap-2 text-[#a08070] hover:text-[#f0e0d0]">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Voltar</span>
        </button>
        
        <h2 className="mb-4 text-2xl font-bold text-[#f0e0d0] flex items-center gap-3">
          <Brain className="h-6 w-6" style={{ color: accentHex }} />
          Recomendações Inteligentes
        </h2>

        <p className="text-sm text-[#a08070] mb-4">
          Analisa os teus favoritos e playlists para encontrar músicas similares.
        </p>

        <button
          onClick={handleSmartRecommendations}
          disabled={smartLoading}
          className="w-full mb-4 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: accentHex }}
        >
          {smartLoading ? "A analisar..." : "Gerar Recomendações"}
        </button>

        {smartMsg && <p className="text-sm text-center mb-4" style={{ color: accentHex }}>{smartMsg}</p>}

        <div className="flex-1 overflow-y-auto space-y-2">
          {smartResults.map((track) => (
            <div key={track.id} className="flex items-center gap-3 rounded-xl bg-[#1a1a1a]/60 border border-[#f0e0d0]/10 p-3">
              <img src={track.thumbnail} alt={track.title} className="h-12 w-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-[#f0e0d0]">{track.title}</p>
                <p className="truncate text-sm text-[#a08070]">{track.artist}</p>
              </div>
              <button onClick={() => handleAddRecommended(track)} className="rounded-full p-2" style={{ backgroundColor: `${accentHex}30` }}>
                <Plus className="h-4 w-4" style={{ color: accentHex }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activeView === "discover_playlists" && isAdmin) {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-4">
        <button onClick={() => setActiveView("tools")} className="mb-6 flex items-center gap-2 text-[#a08070] hover:text-[#f0e0d0]">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Voltar</span>
        </button>
        
        <h2 className="mb-4 text-2xl font-bold text-[#f0e0d0] flex items-center gap-3">
          <Sparkles className="h-6 w-6" style={{ color: accentHex }} />
          Descobrir Playlists
        </h2>

        <p className="text-sm text-[#a08070] mb-4">
          Pesquisa playlists públicas e adiciona-as à tua biblioteca.
        </p>

        <div className="mb-4 flex gap-2">
          <input
            value={discoverQuery}
            onChange={(e) => setDiscoverQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleDiscoverSearch()}
            placeholder="Pesquisar playlists..."
            className="flex-1 rounded-xl bg-[#0a0a0a] border border-[#f0e0d0]/10 px-4 py-3 text-sm text-[#f0e0d0] placeholder-[#a08070]/50"
          />
          <button
            onClick={handleDiscoverSearch}
            disabled={discoverLoading}
            className="rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: accentHex }}
          >
            {discoverLoading ? "..." : <Search className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {selectedDiscoverPlaylist ? (
            <div className="space-y-4">
              <button onClick={() => setSelectedDiscoverPlaylist(null)} className="text-sm text-[#a08070] hover:text-[#f0e0d0]">
                ← Voltar aos resultados
              </button>
              
              <div className="flex items-center gap-4">
                <img src={selectedDiscoverPlaylist.thumbnail} alt={selectedDiscoverPlaylist.title} className="h-24 w-24 rounded-xl object-cover" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#f0e0d0]">{selectedDiscoverPlaylist.title}</h3>
                  <p className="text-sm text-[#a08070]">{selectedDiscoverPlaylist.trackCount} músicas</p>
                  <p className="text-xs text-[#706050] mt-1 line-clamp-2">{selectedDiscoverPlaylist.description}</p>
                  <button
                    onClick={() => handleAddDiscoverPlaylist(selectedDiscoverPlaylist)}
                    disabled={addingPlaylist}
                    className="mt-3 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    style={{ backgroundColor: accentHex }}
                  >
                    {addingPlaylist ? "A adicionar..." : "Adicionar à Biblioteca"}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-[#a08070]">Músicas:</p>
                {selectedDiscoverPlaylist.previewTracks.map((track, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl bg-[#1a1a1a]/60 p-3">
                    <img src={track.thumbnail} alt={track.title} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-[#f0e0d0]">{track.title}</p>
                      <p className="truncate text-sm text-[#a08070]">{track.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {discoverResults.length === 0 && !discoverLoading && discoverQuery && (
                <p className="text-center text-[#a08070] py-10">Nenhuma playlist encontrada</p>
              )}
              
              {discoverResults.map((item) => (
                <button
                  key={`${item.source}-${item.id}`}
                  onClick={() => setSelectedDiscoverPlaylist(item)}
                  className="w-full flex items-center gap-4 rounded-2xl bg-[#1a1a1a]/60 border border-[#f0e0d0]/10 p-4 hover:bg-[#1a1a1a] transition-all text-left"
                >
                  <img src={item.thumbnail} alt={item.title} className="h-16 w-16 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#f0e0d0] truncate">{item.title}</p>
                    <p className="text-sm text-[#a08070]">{item.trackCount} músicas</p>
                    <p className="text-xs text-[#706050] truncate">{item.description}</p>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-5 pb-6 pt-4 w-full max-w-full">
      {/* Header - Title at left with margin 16-20px */}
      <h2 className="mb-5 text-[34px] font-bold text-[#D2B48C]">Ajustes</h2>
      
      <div className="space-y-3 overflow-y-auto w-full">
        {/* Settings Cards - Glass Card Style with exact dimensions */}
        <button onClick={() => setActiveView("profile")} className="w-full flex items-center gap-4 rounded-[18px] glass-card p-4 hover:bg-[#1a1a1a] transition-all h-[76px]">
          {/* Left: Icon 48-56px, rounded 8-12px */}
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-[10px]" style={{ backgroundColor: `${accentHex}30` }}>
            <User className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: accentHex }} />
          </div>
          {/* Center: Title (Bege, 17pt, Semi-bold) + Subtitle (Gray, 14pt) */}
          <div className="flex-1 text-left">
            <p className="font-semibold text-[17px] text-[#D2B48C]">Perfil</p>
            <p className="text-[14px] text-[#8E8E93]">{profile?.username || "Editar perfil"}</p>
          </div>
          {/* Right: Arrow */}
          <ChevronRight className="h-5 w-5 text-[#8E8E93]" />
        </button>

        <button onClick={() => setActiveView("customization")} className="w-full flex items-center gap-4 rounded-[18px] glass-card p-4 hover:bg-[#1a1a1a] transition-all h-[76px]">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-[10px]" style={{ backgroundColor: `${accentHex}30` }}>
            <Palette className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: accentHex }} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-[17px] text-[#D2B48C]">Personalização</p>
            <p className="text-[14px] text-[#8E8E93]">Tema e cores</p>
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

        {/* Install PWA Button */}
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

        {/* Logout Button */}
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
