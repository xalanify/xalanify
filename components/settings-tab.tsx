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
  Brain,
  Bot,
  PaletteIcon,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { addLikedTrack, addTrackToPlaylist, createPlaylist, createShareRequest, getLikedTracks, getPlaylists, listShareTargets, updateMyUsername, type ShareTarget } from "@/lib/supabase"
import { searchMusic, searchPlaylistSuggestions, type PlaylistSuggestion } from "@/lib/musicApi"
import { usePlayer, type Track } from "@/lib/player-context"

interface Preferences {
  accentColor: string
  visualEffects: "desligado" | "suave" | "intenso"
  audioQuality: "auto" | "normal" | "alta"
  compactMode: boolean
  animateBackground: boolean
  themeMode: "dark" | "puredark" | "light"
  surfaceEffect: "glass" | "solid" | "neon" | "hybrid"
  accentStyle: "solid" | "chrome" | "gold" | "rainbow"
  iconPack: "classic" | "modern" | "bold"
}

interface UserPlaylist {
  id: string
  name: string
  tracks: Track[]
}

interface SmartPlaylistResult {
  id: string
  title: string
  description: string
  thumbnail: string
  trackCount: number
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
  accentStyle: "solid",
  iconPack: "classic",
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
  | "smart_discovery_tests"

const DEMO_TEST_TRACKS = [
  {
    id: "demo-track-1",
    title: "Demo Pulse",
    artist: "Xalanify Lab",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
    duration: 205,
    youtubeId: null,
    isTestContent: true,
    testLabel: "musica de testes",
  },
  {
    id: "demo-track-2",
    title: "Neon Streets",
    artist: "Xalanify Lab",
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
    duration: 188,
    youtubeId: null,
    isTestContent: true,
    testLabel: "musica de testes",
  },
  {
    id: "demo-track-3",
    title: "Night Session",
    artist: "Xalanify Lab",
    thumbnail: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400",
    duration: 233,
    youtubeId: null,
    isTestContent: true,
    testLabel: "musica de testes",
  },
]

const EXTRA_TEST_TRACKS = [
  {
    id: "demo-track-4",
    title: "Solar Drift",
    artist: "Xalanify Lab",
    thumbnail: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400",
    duration: 201,
    youtubeId: null,
    isTestContent: true,
    testLabel: "musica de testes",
  },
  {
    id: "demo-track-5",
    title: "Deep Focus",
    artist: "Xalanify Lab",
    thumbnail: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400",
    duration: 224,
    youtubeId: null,
    isTestContent: true,
    testLabel: "musica de testes",
  },
  {
    id: "demo-track-6",
    title: "Velvet Echo",
    artist: "Xalanify Lab",
    thumbnail: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400",
    duration: 192,
    youtubeId: null,
    isTestContent: true,
    testLabel: "musica de testes",
  },
]

export default function SettingsTab() {
  const { user, profile, isAdmin, signOut, refreshProfile } = useAuth()
  const { play, setQueue } = usePlayer()
  const [activeView, setActiveView] = useState<SettingsView>("menu")
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES)
  const [playlistQuery, setPlaylistQuery] = useState("")
  const [playlistLoading, setPlaylistLoading] = useState(false)
  const [playlistResults, setPlaylistResults] = useState<PlaylistSuggestion[]>([])
  const [addingPlaylistId, setAddingPlaylistId] = useState<string | null>(null)
  const [playlistActionMessage, setPlaylistActionMessage] = useState("")
  const [experimentMessage, setExperimentMessage] = useState("")

  const [myPlaylists, setMyPlaylists] = useState<UserPlaylist[]>([])
  const [shareTargets, setShareTargets] = useState<ShareTarget[]>([])
  const [selectedTargetUserId, setSelectedTargetUserId] = useState("")
  const [manualTargetUserId, setManualTargetUserId] = useState("")
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("")
  const [sharing, setSharing] = useState(false)
  const [shareMessage, setShareMessage] = useState("")
  const [smartSuggestions, setSmartSuggestions] = useState<Track[]>([])
  const [smartPlaylists, setSmartPlaylists] = useState<SmartPlaylistResult[]>([])
  const [smartLoading, setSmartLoading] = useState(false)
  const [smartMode, setSmartMode] = useState<"tracks" | "playlists" | "both">("both")
  const [addingSmartTrackId, setAddingSmartTrackId] = useState<string | null>(null)
  const [addingSmartPlaylistId, setAddingSmartPlaylistId] = useState<string | null>(null)
  const [smartMessage, setSmartMessage] = useState("")
  const [usernameInput, setUsernameInput] = useState("")
  const [savingUsername, setSavingUsername] = useState(false)
  const [profileMessage, setProfileMessage] = useState("")
  const [signingOut, setSigningOut] = useState(false)

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
      setMyPlaylists(
        (lists || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          tracks: Array.isArray(item.tracks) ? item.tracks : [],
        }))
      )
    })

    listShareTargets(user.id, isAdmin).then((targets) => {
      setShareTargets(targets)
      setSelectedTargetUserId((prev) => prev || targets[0]?.user_id || "")
    })
  }, [user, isAdmin, activeView])

  useEffect(() => {
    if (profile?.username) {
      setUsernameInput(profile.username)
      return
    }
    if (user?.email) {
      setUsernameInput(user.email.split("@")[0] || "")
    }
  }, [profile?.username, user?.email])

  const initials = useMemo(() => {
    if (profile?.username) return profile.username.charAt(0).toUpperCase()
    if (!user?.email) return "X"
    return user.email.charAt(0).toUpperCase()
  }, [profile?.username, user?.email])

  function updatePreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  function asTestTrack(track: Track, label = "musica de testes"): Track {
    return {
      ...track,
      isTestContent: true,
      testLabel: label,
    }
  }

  async function handleSaveUsername() {
    if (!user) return
    setSavingUsername(true)
    setProfileMessage("")
    const res = await updateMyUsername(user.id, usernameInput)
    if (!res.ok) {
      setProfileMessage(res.reason || "Nao foi possivel atualizar o username.")
      setSavingUsername(false)
      return
    }

    await refreshProfile()
    setProfileMessage("Username atualizado com sucesso.")
    setSavingUsername(false)
  }

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
    } finally {
      setSigningOut(false)
    }
  }

  async function handlePlaylistSearch() {
    if (!playlistQuery.trim()) return
    setPlaylistLoading(true)
    setPlaylistActionMessage("")
    const items = await searchPlaylistSuggestions(playlistQuery)
    setPlaylistResults(items)
    setPlaylistLoading(false)
  }

  async function handleAddSuggestedPlaylist(item: PlaylistSuggestion) {
    if (!user) return

    setAddingPlaylistId(item.id)
    setPlaylistActionMessage("A adicionar playlist de testes na biblioteca...")
    const created: any = await createPlaylist(user.id, `Teste Playlist · ${item.title}`, item.thumbnail)

    if (created?.id && item.previewTracks.length > 0) {
      if (created?.existed) {
        setPlaylistActionMessage("Playlist ja existia. Vou apenas garantir que as faixas estao atualizadas.")
      }
      for (const track of item.previewTracks) {
        await addTrackToPlaylist(created.id, asTestTrack(track as Track))
      }
      setPlaylistActionMessage("Playlist adicionada com sucesso na biblioteca.")
    } else {
      setPlaylistActionMessage("Nao foi possivel adicionar esta playlist.")
    }

    setAddingPlaylistId(null)
  }

  async function handleCreateDemoPlaylist() {
    if (!user) return
    setExperimentMessage("A criar playlist demo...")

    const created = await createPlaylist(user.id, "Teste Playlist · Novidades")
    if (!created?.id) {
      setExperimentMessage("Não foi possível criar a playlist demo.")
      return
    }

    for (const track of DEMO_TEST_TRACKS) {
      await addTrackToPlaylist(created.id, asTestTrack(track as Track))
    }

    setExperimentMessage("Playlist demo criada com 3 músicas de teste.")
  }

  async function handleInsertDemoFavorite() {
    if (!user) return
    setExperimentMessage("A inserir favorito de teste...")
    await addLikedTrack(user.id, asTestTrack(DEMO_TEST_TRACKS[0] as Track))
    setExperimentMessage("Favorito de teste inserido.")
  }

  async function handleSharePlaylistToUser() {
    if (!user) {
      setShareMessage("Sessao invalida. Faz login novamente.")
      return
    }

    const targetUserId = (selectedTargetUserId || manualTargetUserId).trim()

    if (!targetUserId || !selectedPlaylistId) {
      setShareMessage("Escolhe um utilizador da lista (ou cola um User ID) e seleciona uma playlist.")
      return
    }

    const chosen = myPlaylists.find((p) => p.id === selectedPlaylistId)
    if (!chosen) {
      setShareMessage("Playlist nao encontrada.")
      return
    }

    setSharing(true)
    setShareMessage("A enviar pedido de partilha...")

    const fromUsername = profile?.username || user.email?.split("@")[0] || "user"
    const result = await createShareRequest({
      fromUserId: user.id,
      toUserId: targetUserId,
      fromUsername,
      itemType: "playlist",
      itemTitle: chosen.name,
      itemPayload: {
        id: chosen.id,
        name: chosen.name,
        tracks: chosen.tracks,
      },
    })

    if (!result.ok) {
      setShareMessage(result.reason || "Falha ao criar pedido de partilha.")
      setSharing(false)
      return
    }

    setShareMessage("Pedido de partilha enviado. O utilizador deve aceitar na biblioteca.")
    setSharing(false)
  }

  async function handleCreateMegaDemoPlaylist() {
    if (!user) return
    setExperimentMessage("A criar Mega Demo...")

    const created = await createPlaylist(user.id, "Teste Playlist · Mega")
    if (!created?.id) {
      setExperimentMessage("Falha ao criar Mega Demo.")
      return
    }

    const tracks = [...DEMO_TEST_TRACKS, ...EXTRA_TEST_TRACKS, ...DEMO_TEST_TRACKS, ...EXTRA_TEST_TRACKS]
    for (const track of tracks) {
      await addTrackToPlaylist(created.id, asTestTrack(track as Track))
    }

    setExperimentMessage(`Mega Demo criada com ${tracks.length} faixas.`)
  }

  async function handleCreateFocusMix() {
    if (!user) return
    setExperimentMessage("A criar Focus Mix...")

    const created = await createPlaylist(user.id, "Teste Playlist · Focus Mix")
    if (!created?.id) {
      setExperimentMessage("Falha ao criar Focus Mix.")
      return
    }

    for (const track of [EXTRA_TEST_TRACKS[1], DEMO_TEST_TRACKS[2], EXTRA_TEST_TRACKS[0]]) {
      await addTrackToPlaylist(created.id, asTestTrack(track as Track))
    }

    setExperimentMessage("Focus Mix criada.")
  }

  async function handleCreateNightDrive() {
    if (!user) return
    setExperimentMessage("A criar Night Drive...")

    const created = await createPlaylist(user.id, "Teste Playlist · Night Drive")
    if (!created?.id) {
      setExperimentMessage("Falha ao criar Night Drive.")
      return
    }

    for (const track of [DEMO_TEST_TRACKS[1], EXTRA_TEST_TRACKS[2], DEMO_TEST_TRACKS[0]]) {
      await addTrackToPlaylist(created.id, asTestTrack(track as Track))
    }

    setExperimentMessage("Night Drive criada.")
  }

  async function handleCreateTopHitsMock() {
    if (!user) return
    setExperimentMessage("A criar Top Hits Mock...")

    const created = await createPlaylist(user.id, "Teste Playlist · Top Hits Mock")
    if (!created?.id) {
      setExperimentMessage("Falha ao criar Top Hits Mock.")
      return
    }

    const tracks = [DEMO_TEST_TRACKS[0], DEMO_TEST_TRACKS[1], DEMO_TEST_TRACKS[2], EXTRA_TEST_TRACKS[0], EXTRA_TEST_TRACKS[1]]
    for (const track of tracks) {
      await addTrackToPlaylist(created.id, asTestTrack(track as Track))
    }

    setExperimentMessage("Top Hits Mock criada com 5 faixas.")
  }

  async function handleSeedAllFavorites() {
    if (!user) return
    setExperimentMessage("A inserir 6 favoritos de teste...")

    const tracks = [...DEMO_TEST_TRACKS, ...EXTRA_TEST_TRACKS]
    for (const track of tracks) {
      await addLikedTrack(user.id, asTestTrack(track as Track))
    }

    setExperimentMessage("6 favoritos de teste inseridos.")
  }

  async function handleSmartDiscovery() {
    if (!user) return
    setSmartLoading(true)
    setSmartMessage("")

    const [liked, playlists] = await Promise.all([getLikedTracks(user.id), getPlaylists(user.id)])

    const seeds = new Set<string>()
    for (const track of liked.slice(0, 5)) {
      if (track.artist) seeds.add(track.artist)
      if (track.title) seeds.add(track.title.split(" ").slice(0, 2).join(" "))
    }

    for (const playlist of playlists.slice(0, 3)) {
      for (const track of (playlist.tracks || []).slice(0, 3)) {
        if (track.artist) seeds.add(track.artist)
      }
    }

    const queries = Array.from(seeds).slice(0, 4)
    const allTracks: Track[] = []
    const allPlaylists: PlaylistSuggestion[] = []
    for (const q of queries) {
      if (smartMode === "tracks" || smartMode === "both") {
        const tracksRes = await searchMusic(q)
        allTracks.push(...tracksRes.slice(0, 12))
      }

      if (smartMode === "playlists" || smartMode === "both") {
        const playlistsRes = await searchPlaylistSuggestions(q)
        allPlaylists.push(...playlistsRes.slice(0, 4))
      }
    }

    const dedup = new Map<string, Track>()
    for (const t of allTracks) {
      dedup.set(t.id, t)
    }

    const playlistsDedup = new Map<string, SmartPlaylistResult>()
    for (const item of allPlaylists) {
      const tracks = (item.previewTracks || []).map((entry) =>
        asTestTrack(
          {
            id: `${item.source}-${entry.id}`,
            title: entry.title,
            artist: entry.artist,
            thumbnail: entry.thumbnail || item.thumbnail,
            duration: entry.duration || 0,
            youtubeId: entry.youtubeId,
            previewUrl: entry.previewUrl || null,
            source: item.source,
          },
          "musica de playlist de testes"
        )
      )

      playlistsDedup.set(`${item.source}-${item.id}`, {
        id: `${item.source}-${item.id}`,
        title: item.title,
        description: item.description,
        thumbnail: item.thumbnail,
        trackCount: item.trackCount,
        tracks,
      })
    }

    setSmartSuggestions(smartMode === "playlists" ? [] : Array.from(dedup.values()).slice(0, 40))
    setSmartPlaylists(smartMode === "tracks" ? [] : Array.from(playlistsDedup.values()).slice(0, 12))
    setSmartLoading(false)
  }

  async function handleAddSmartTrack(track: Track) {
    if (!user) return
    setAddingSmartTrackId(track.id)
    const ok = await addLikedTrack(user.id, asTestTrack(track))
    setAddingSmartTrackId(null)
    setSmartMessage(ok ? "Musica adicionada a biblioteca (Favoritos)." : "Nao foi possivel adicionar a musica.")
  }

  async function handleAddSmartPlaylist(item: SmartPlaylistResult) {
    if (!user) return
    setAddingSmartPlaylistId(item.id)
    const created: any = await createPlaylist(user.id, `Teste Playlist · ${item.title}`, item.thumbnail)
    if (created?.id) {
      for (const track of item.tracks) {
        await addTrackToPlaylist(created.id, asTestTrack(track, "musica de playlist de testes"))
      }
      setSmartMessage("Playlist adicionada a biblioteca com sucesso.")
    } else {
      setSmartMessage("Nao foi possivel adicionar a playlist.")
    }
    setAddingSmartPlaylistId(null)
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
          <div className="mt-4 space-y-2">
            <label className="block text-xs text-[#a08070]">Username</label>
            <div className="flex items-center gap-2">
              <input
                id="profile-username"
                name="username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="teu_username"
                className="glass-card w-full rounded-xl px-3 py-2 text-sm text-[#f0e0d0] placeholder-[#706050] focus:outline-none"
              />
              <button
                onClick={handleSaveUsername}
                disabled={savingUsername || !usernameInput.trim()}
                className="rounded-xl px-3 py-2 text-xs font-semibold text-[#fff] disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #e63946 0%, #c1121f 100%)" }}
              >
                {savingUsername ? "A guardar..." : "Guardar"}
              </button>
            </div>
            <p className="text-[11px] text-[#706050]">Permitido: letras, numeros, _, . e - (3 a 24 chars).</p>
            {profileMessage && <p className="text-xs text-[#f59e0b]">{profileMessage}</p>}
          </div>
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

          <button
            onClick={() => setActiveView("smart_discovery_tests")}
            className="glass-card-strong flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(230,57,70,0.2)]">
              <Brain className="h-5 w-5 text-[#e63946]" />
            </div>
            <span className="flex-1 text-sm font-medium text-[#f0e0d0]">Página inteligente por gostos (teste)</span>
            <ChevronRight className="h-5 w-5 text-[#504030]" />
          </button>

          <div className="glass-card-strong rounded-2xl p-4">
            <p className="mb-1 text-sm font-semibold text-[#f0e0d0]">Modo laboratório</p>
            <p className="text-xs text-[#a08070]">Esta secção só aparece para contas com permissao de admin no perfil.</p>
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
          <select
            value={selectedTargetUserId}
            onChange={(e) => setSelectedTargetUserId(e.target.value)}
            className="glass-card w-full rounded-xl px-4 py-3 text-sm text-[#f0e0d0] focus:outline-none"
          >
            <option value="">Seleciona um utilizador destino</option>
            {shareTargets.map((target) => (
              <option key={target.user_id} value={target.user_id}>{target.username} · {target.user_id.slice(0, 8)}...</option>
            ))}
          </select>

          {shareTargets.length === 0 && (
            <p className="text-xs text-[#a08070]">Nenhum utilizador encontrado nas tabelas públicas. Podes colar manualmente o User ID ou criar a funcao SQL `list_share_targets` no Supabase para admin.</p>
          )}

          <input
            id="share-target-user-id"
            name="target_user_id"
            value={manualTargetUserId}
            onChange={(e) => setManualTargetUserId(e.target.value)}
            placeholder="Ou cola aqui um User ID (fallback)"
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

        <p className="mt-3 text-xs text-[#a08070]">{shareMessage || "Escolhe o utilizador de destino numa lista e depois a playlist para replicar."}</p>
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

          <button
            onClick={handleCreateMegaDemoPlaylist}
            className="glass-card-strong flex w-full items-center justify-between rounded-xl px-4 py-3 text-left"
          >
            <span className="text-sm text-[#f0e0d0]">Criar Mega Demo (12+ faixas)</span>
            <Plus className="h-4 w-4 text-[#e63946]" />
          </button>

          <button
            onClick={handleCreateFocusMix}
            className="glass-card-strong flex w-full items-center justify-between rounded-xl px-4 py-3 text-left"
          >
            <span className="text-sm text-[#f0e0d0]">Criar Focus Mix</span>
            <Plus className="h-4 w-4 text-[#e63946]" />
          </button>

          <button
            onClick={handleCreateNightDrive}
            className="glass-card-strong flex w-full items-center justify-between rounded-xl px-4 py-3 text-left"
          >
            <span className="text-sm text-[#f0e0d0]">Criar Night Drive</span>
            <Plus className="h-4 w-4 text-[#e63946]" />
          </button>

          <button
            onClick={handleCreateTopHitsMock}
            className="glass-card-strong flex w-full items-center justify-between rounded-xl px-4 py-3 text-left"
          >
            <span className="text-sm text-[#f0e0d0]">Criar Top Hits Mock (5 faixas)</span>
            <Plus className="h-4 w-4 text-[#e63946]" />
          </button>

          <button
            onClick={handleSeedAllFavorites}
            className="glass-card-strong flex w-full items-center justify-between rounded-xl px-4 py-3 text-left"
          >
            <span className="text-sm text-[#f0e0d0]">Inserir pacote de favoritos (6)</span>
            <Plus className="h-4 w-4 text-[#e63946]" />
          </button>
        </div>

        {experimentMessage && <p className="mt-3 text-xs text-[#a08070]">{experimentMessage}</p>}
      </div>
    )
  }

  if (activeView === "smart_discovery_tests") {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2">
        <button onClick={() => setActiveView("tools")} className="mb-4 flex items-center gap-2 text-[#a08070]">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Voltar</span>
        </button>

        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#f0e0d0]"><Bot className="h-5 w-5" /> Descoberta inteligente (teste)</h2>

        <div className="mb-3 grid grid-cols-3 gap-2">
          <button
            onClick={() => setSmartMode("tracks")}
            className="rounded-lg px-3 py-2 text-xs"
            style={{ background: smartMode === "tracks" ? "rgba(230,57,70,0.28)" : "rgba(255,255,255,0.04)", color: "#f0e0d0" }}
          >
            So musicas
          </button>
          <button
            onClick={() => setSmartMode("playlists")}
            className="rounded-lg px-3 py-2 text-xs"
            style={{ background: smartMode === "playlists" ? "rgba(230,57,70,0.28)" : "rgba(255,255,255,0.04)", color: "#f0e0d0" }}
          >
            So playlists
          </button>
          <button
            onClick={() => setSmartMode("both")}
            className="rounded-lg px-3 py-2 text-xs"
            style={{ background: smartMode === "both" ? "rgba(230,57,70,0.28)" : "rgba(255,255,255,0.04)", color: "#f0e0d0" }}
          >
            Ambos
          </button>
        </div>

        <button
          onClick={handleSmartDiscovery}
          disabled={smartLoading}
          className="mb-3 w-full rounded-xl py-3 text-sm font-semibold text-[#fff] disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #e63946 0%, #c1121f 100%)" }}
        >
          {smartLoading ? "A gerar recomendações..." : "Gerar recomendações com base em favoritos + biblioteca"}
        </button>

        {smartMessage && <p className="mb-3 text-xs text-[#f59e0b]">{smartMessage}</p>}

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto hide-scrollbar">
          {smartSuggestions.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-[#a08070]">Musicas recomendadas</p>
              <div className="space-y-2">
                {smartSuggestions.map((track) => (
                  <div key={track.id} className="glass-card rounded-xl p-3">
                    <button
                      onClick={() => {
                        setQueue(smartSuggestions)
                        play(track)
                      }}
                      className="flex w-full items-center gap-3 text-left"
                    >
                      <img src={track.thumbnail} alt={track.title} className="h-12 w-12 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#f0e0d0]">{track.title}</p>
                        <p className="truncate text-xs text-[#a08070]">{track.artist}</p>
                      </div>
                    </button>
                    <button
                      onClick={() => handleAddSmartTrack(track)}
                      disabled={addingSmartTrackId === track.id}
                      className="mt-2 rounded-lg bg-[rgba(230,57,70,0.2)] px-2.5 py-1 text-xs text-[#f0e0d0] disabled:opacity-40"
                    >
                      {addingSmartTrackId === track.id ? "A adicionar..." : "Adicionar musica a biblioteca"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {smartPlaylists.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-[#a08070]">Playlists recomendadas</p>
              <div className="space-y-2">
                {smartPlaylists.map((item) => (
                  <div key={item.id} className="glass-card rounded-xl p-3">
                    <button
                      onClick={() => {
                        if (item.tracks.length === 0) return
                        setQueue(item.tracks)
                        play(item.tracks[0])
                      }}
                      className="flex w-full items-center gap-3 text-left"
                    >
                      <img src={item.thumbnail} alt={item.title} className="h-12 w-12 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#f0e0d0]">{item.title}</p>
                        <p className="truncate text-xs text-[#a08070]">{item.description}</p>
                        <p className="text-[10px] uppercase tracking-wide text-[#706050]">{item.trackCount} faixas</p>
                      </div>
                    </button>
                    <button
                      onClick={() => handleAddSmartPlaylist(item)}
                      disabled={addingSmartPlaylistId === item.id}
                      className="mt-2 rounded-lg bg-[rgba(230,57,70,0.2)] px-2.5 py-1 text-xs text-[#f0e0d0] disabled:opacity-40"
                    >
                      {addingSmartPlaylistId === item.id ? "A adicionar..." : "Adicionar playlist a biblioteca"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!smartLoading && smartSuggestions.length === 0 && smartPlaylists.length === 0 && (
            <p className="py-10 text-center text-xs text-[#a08070]">Gera recomendacoes para ver resultados.</p>
          )}
        </div>
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
            id="playlist-tests-query"
            name="playlist_query"
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
        {playlistActionMessage && <p className="mb-2 text-xs text-[#f59e0b]">{playlistActionMessage}</p>}

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
              {(["glass", "solid", "neon", "hybrid"] as const).map((value) => (
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
            <p className="mb-3 flex items-center gap-2 text-sm font-medium text-[#f0e0d0]"><PaletteIcon className="h-4 w-4" /> Efeito de cor</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(["solid", "chrome", "gold", "rainbow"] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => updatePreference("accentStyle", value)}
                  className="rounded-lg px-3 py-2"
                  style={{
                    background: preferences.accentStyle === value ? `${preferences.accentColor}33` : "rgba(255,255,255,0.04)",
                    color: "#f0e0d0",
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card-strong rounded-2xl p-4">
            <p className="mb-3 text-sm font-medium text-[#f0e0d0]">Pacote de ícones</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(["classic", "modern", "bold"] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => updatePreference("iconPack", value)}
                  className="rounded-lg px-3 py-2"
                  style={{
                    background: preferences.iconPack === value ? `${preferences.accentColor}33` : "rgba(255,255,255,0.04)",
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
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-4 border-t border-[rgba(255,255,255,0.05)] px-5 py-4 text-left transition-colors active:bg-[rgba(255,255,255,0.05)] disabled:opacity-60"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(230,57,70,0.15)]">
            <LogOut className="h-5 w-5 text-[#e63946]" />
          </div>
          <span className="flex-1 text-sm font-medium text-[#e63946]">{signingOut ? "A terminar..." : "Terminar Sessão"}</span>
          <ChevronRight className="h-5 w-5 text-[#504030]" />
        </button>
      </div>

      <p className="mt-8 text-center text-xs tracking-[0.12em] text-[#e63946]">XALANIFY · Em desenvolvimento</p>
    </div>
  )
}



