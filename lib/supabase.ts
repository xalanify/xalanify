// src/lib/supabase.ts

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn("Supabase credentials not found")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

function usernameFromEmail(email?: string | null) {
  if (!email) return "user"
  return email.split("@")[0] || "user"
}

async function getUserEmail(userId: string) {
  const { data } = await supabase.auth.getUser()
  if (data.user?.id === userId) {
    return data.user.email ?? null
  }
  return null
}

async function getCurrentUserForId(userId: string) {
  const { data } = await supabase.auth.getUser()
  if (data.user?.id === userId) return data.user
  return null
}

const relinkAttemptedForUser = new Set<string>()

async function getLegacyUsernames(userId: string) {
  const names = new Set<string>()
  const authUser = await getCurrentUserForId(userId)
  if (authUser?.email) names.add(usernameFromEmail(authUser.email).toLowerCase())

  const profile = await getMyProfile(userId).catch(() => null)
  if (profile?.username) names.add(profile.username.toLowerCase())

  return Array.from(names).filter(Boolean)
}

async function tryRelinkLegacyContent(userId: string) {
  if (relinkAttemptedForUser.has(userId)) return
  relinkAttemptedForUser.add(userId)

  const authUser = await getCurrentUserForId(userId)
  if (!authUser?.email) return

  const fallbackUsername = usernameFromEmail(authUser.email).toLowerCase()
  await supabase.rpc("relink_my_legacy_content", {
    target_email: authUser.email,
    target_username: fallbackUsername,
  }).catch(() => {})
}

export interface ShareTarget {
  user_id: string
  username: string
  email?: string | null
}

export interface UserProfile {
  user_id: string
  username: string
  email: string | null
  avatar_url?: string | null
  is_admin?: boolean
}

export interface ShareRequest {
  id: string
  from_user_id: string
  to_user_id: string
  from_username: string
  item_type: "track" | "playlist"
  item_title: string
  item_payload: any
  status: "pending" | "accepted" | "rejected"
  created_at: string
}

// User Functions
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function getMyProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, username, email, avatar_url, is_admin")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    if (error.code !== "PGRST205") console.error("Erro ao carregar profile:", error)
    return null
  }

  if (data) return data as UserProfile

  const authUser = await getCurrentUserForId(userId)
  if (!authUser) return null

  const fallbackUsername = usernameFromEmail(authUser.email)
  const { data: inserted, error: insertError } = await supabase
    .from("profiles")
    .upsert({
      user_id: userId,
      username: fallbackUsername,
      email: authUser.email ?? null,
    })
    .select("user_id, username, email, avatar_url, is_admin")
    .maybeSingle()

  if (insertError) {
    if (insertError.code !== "PGRST205") console.error("Erro ao criar profile fallback:", insertError)
    return null
  }

  return (inserted as UserProfile) || {
    user_id: userId,
    username: fallbackUsername,
    email: authUser.email ?? null,
    avatar_url: null,
    is_admin: authUser.email === "adminx@adminx.com",
  }
}

export async function updateMyUsername(userId: string, username: string) {
  const cleaned = username.trim().toLowerCase()
  if (!cleaned) return { ok: false as const, reason: "Username vazio." }
  if (!/^[a-z0-9_.-]{3,24}$/.test(cleaned)) {
    return { ok: false as const, reason: "Use 3-24 caracteres: letras, numeros, _, . ou -." }
  }

  const authUser = await getCurrentUserForId(userId)
  const email = authUser?.email ?? null

  const { data: existing } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("username", cleaned)
    .neq("user_id", userId)
    .maybeSingle()

  if (existing?.user_id) {
    return { ok: false as const, reason: "Esse username ja esta em uso." }
  }

  const { error } = await supabase.from("profiles").upsert({
    user_id: userId,
    username: cleaned,
    email,
  })

  if (error) {
    console.error("Erro ao atualizar username:", error)
    return { ok: false as const, reason: error.message }
  }

  return { ok: true as const }
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut({ scope: "global" })
  if (!error) return null

  console.warn("Global signOut failed, falling back to local signOut:", error.message)
  const { error: localError } = await supabase.auth.signOut({ scope: "local" })
  return localError || null
}

// Liked Tracks
export async function getLikedTracks(userId: string) {
  const loadPrimary = async () => supabase
    .from("liked_tracks")
    .select("track_data")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  let { data, error } = await loadPrimary()

  if (error) {
    console.error("Erro ao carregar favoritos:", error)
    return []
  }

  const primaryRows = data || []
  const primary = primaryRows.map((item: any) => item.track_data).filter(Boolean)

  await tryRelinkLegacyContent(userId)
  ;({ data, error } = await loadPrimary())
  if (!error) {
    const afterRelink = data?.map((item: any) => item.track_data).filter(Boolean) || []
    if (afterRelink.length > 0) return afterRelink
  }

  const legacyUsernames = await getLegacyUsernames(userId)
  if (legacyUsernames.length === 0) return primary

  const { data: legacyData, error: legacyError } = await supabase
    .from("liked_tracks")
    .select("track_data")
    .in("username", legacyUsernames)
    .order("created_at", { ascending: false })

  if (legacyError) {
    console.error("Erro ao carregar favoritos legacy:", legacyError)
    return primary
  }

  let legacyRows = legacyData || []
  if (legacyRows.length === 0) {
    const orFilter = legacyUsernames.map((u) => `username.ilike.${u}`).join(",")
    const { data: ilikeRows } = await supabase
      .from("liked_tracks")
      .select("track_data")
      .or(orFilter)
      .order("created_at", { ascending: false })
    legacyRows = ilikeRows || []
  }

  const merged = new Map<string, any>()
  for (const track of primary) {
    if (track?.id) merged.set(track.id, track)
  }
  for (const track of legacyRows.map((item: any) => item.track_data).filter(Boolean)) {
    if (track?.id && !merged.has(track.id)) merged.set(track.id, track)
  }

  return Array.from(merged.values())
}

export async function isTrackLiked(userId: string, trackId: string) {
  const { data, error } = await supabase
    .from("liked_tracks")
    .select("id")
    .eq("user_id", userId)
    .eq("track_id", trackId)
    .maybeSingle()

  if (error) {
    console.error("Erro ao verificar favorito:", error)
    return false
  }

  return !!data
}

export async function addLikedTrack(userId: string, track: any) {
  const email = await getUserEmail(userId)
  const username = usernameFromEmail(email)

  const { data: existing, error: existingError } = await supabase
    .from("liked_tracks")
    .select("id")
    .eq("user_id", userId)
    .eq("track_id", track.id)
    .maybeSingle()

  if (existingError) {
    console.error("Erro ao verificar favorito existente:", existingError)
    return false
  }

  if (existing) {
    return true
  }

  const { error } = await supabase.from("liked_tracks").insert({
    user_id: userId,
    username,
    track_id: track.id,
    track_data: track,
  })

  if (error) console.error("Erro ao adicionar favorito:", error)
  return !error
}

export async function removeLikedTrack(userId: string, trackId: string) {
  const { error } = await supabase
    .from("liked_tracks")
    .delete()
    .eq("user_id", userId)
    .eq("track_id", trackId)

  if (error) console.error("Erro ao remover favorito:", error)
  return !error
}

export async function listShareTargets(currentUserId: string, isAdmin = false) {
  const [fromProfiles, fromUsersPublic, fromRpc, fromPlaylists, fromLikes, fromUsers] = await Promise.all([
    supabase.from("profiles").select("user_id, username, email").limit(1000),
    supabase.from("users_public").select("id, username, email").limit(1000),
    isAdmin ? supabase.rpc("list_share_targets", { exclude_user_id: currentUserId }) : Promise.resolve({ data: null, error: null } as any),
    supabase.from("playlists").select("user_id, username").limit(1000),
    supabase.from("liked_tracks").select("user_id, username").limit(1000),
    supabase.from("users").select("id, username, email").limit(1000),
  ])

  const targets = new Map<string, ShareTarget>()

  for (const row of (fromProfiles.data as any[]) || []) {
    const userId = row?.user_id
    if (!userId || userId === currentUserId) continue
    targets.set(userId, {
      user_id: userId,
      username: row?.username || usernameFromEmail(row?.email),
      email: row?.email || null,
    })
  }

  for (const row of fromPlaylists.data || []) {
    if (!row.user_id || row.user_id === currentUserId) continue
    if (!targets.has(row.user_id)) {
      targets.set(row.user_id, { user_id: row.user_id, username: row.username || "user", email: null })
    }
  }

  for (const row of fromLikes.data || []) {
    if (!row.user_id || row.user_id === currentUserId) continue
    if (!targets.has(row.user_id)) {
      targets.set(row.user_id, { user_id: row.user_id, username: row.username || "user", email: null })
    }
  }

  for (const row of (fromUsers.data as any[]) || []) {
    const userId = row?.id
    if (!userId || userId === currentUserId) continue
    if (!targets.has(userId)) {
      const username = row?.username || usernameFromEmail(row?.email)
      targets.set(userId, { user_id: userId, username: username || "user", email: row?.email || null })
    }
  }

  for (const row of (fromUsersPublic.data as any[]) || []) {
    const userId = row?.id
    if (!userId || userId === currentUserId) continue
    if (!targets.has(userId)) {
      const username = row?.username || usernameFromEmail(row?.email)
      targets.set(userId, { user_id: userId, username: username || "user", email: row?.email || null })
    }
  }

  for (const row of (fromRpc.data as any[]) || []) {
    const userId = row?.user_id || row?.id
    if (!userId || userId === currentUserId) continue
    if (!targets.has(userId)) {
      const username = row?.username || usernameFromEmail(row?.email)
      targets.set(userId, { user_id: userId, username: username || "user", email: row?.email || null })
    }
  }

  if (fromPlaylists.error) console.error("Erro ao listar targets em playlists:", fromPlaylists.error)
  if (fromLikes.error) console.error("Erro ao listar targets em liked_tracks:", fromLikes.error)
  if (fromProfiles.error && fromProfiles.error.code !== "PGRST205") console.error("Erro ao listar targets em profiles:", fromProfiles.error)
  if (fromUsers.error && fromUsers.error.code !== "PGRST205") console.error("Erro ao listar targets em users:", fromUsers.error)
  if (fromUsersPublic.error && fromUsersPublic.error.code !== "PGRST205") console.error("Erro ao listar targets em users_public:", fromUsersPublic.error)
  if (fromRpc?.error && fromRpc.error.code !== "PGRST202") console.error("Erro ao listar targets via rpc:", fromRpc.error)

  return Array.from(targets.values()).sort((a, b) => a.username.localeCompare(b.username))
}

export async function searchShareTargets(currentUserId: string, query: string) {
  const rawNeedle = query.trim()
  const fromProfiles = rawNeedle
    ? await supabase
        .from("profiles")
        .select("user_id, username, email")
        .neq("user_id", currentUserId)
        .or(`username.ilike.%${rawNeedle}%,email.ilike.%${rawNeedle}%`)
        .limit(30)
    : ({ data: [], error: null } as any)

  const fromList = await listShareTargets(currentUserId, false)
  const directTargets = ((fromProfiles.data as any[]) || []).map((row) => ({
    user_id: row.user_id,
    username: row.username || usernameFromEmail(row.email),
    email: row.email || null,
  })) as ShareTarget[]

  const merged = new Map<string, ShareTarget>()
  for (const t of [...directTargets, ...fromList]) {
    merged.set(t.user_id, t)
  }

  const targets = Array.from(merged.values())
  const needle = rawNeedle.toLowerCase()

  if (!needle) return targets.slice(0, 20)

  return targets
    .map((target) => {
      const username = target.username.toLowerCase()
      const email = (target.email || "").toLowerCase()
      const userId = target.user_id.toLowerCase()

      let score = 0
      if (username === needle) score += 100
      if (username.startsWith(needle)) score += 40
      if (username.includes(needle)) score += 20
      if (email.startsWith(needle)) score += 15
      if (email.includes(needle)) score += 10
      if (userId.startsWith(needle)) score += 8
      if (userId.includes(needle)) score += 4

      return { target, score }
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.target.username.localeCompare(b.target.username))
    .map((row) => row.target)
    .slice(0, 20)
}

// Playlists
export async function getPlaylists(userId: string) {
  const loadPrimary = async () => supabase
    .from("playlists")
    .select("id, name, user_id, username, created_at, tracks_json, image_url")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  let { data: playlists, error } = await loadPrimary()

  if (error) {
    console.error("Erro ao carregar playlists:", error)
    return []
  }

  const primary = (playlists || []).map((playlist: any) => ({
    ...playlist,
    tracks: Array.isArray(playlist.tracks_json) ? playlist.tracks_json : [],
  }))

  await tryRelinkLegacyContent(userId)
  ;({ data: playlists, error } = await loadPrimary())
  if (!error) {
    const afterRelink = (playlists || []).map((playlist: any) => ({
      ...playlist,
      tracks: Array.isArray(playlist.tracks_json) ? playlist.tracks_json : [],
    }))
    if (afterRelink.length > 0) return afterRelink
  }

  const legacyUsernames = await getLegacyUsernames(userId)
  if (legacyUsernames.length === 0) return primary

  const { data: legacy, error: legacyError } = await supabase
    .from("playlists")
    .select("id, name, user_id, username, created_at, tracks_json, image_url")
    .in("username", legacyUsernames)
    .order("created_at", { ascending: false })

  if (legacyError) {
    console.error("Erro ao carregar playlists legacy:", legacyError)
    return primary
  }

  let legacyRows = legacy || []
  if (legacyRows.length === 0) {
    const orFilter = legacyUsernames.map((u) => `username.ilike.${u}`).join(",")
    const { data: ilikeRows } = await supabase
      .from("playlists")
      .select("id, name, user_id, username, created_at, tracks_json, image_url")
      .or(orFilter)
      .order("created_at", { ascending: false })
    legacyRows = ilikeRows || []
  }

  const merged = new Map<string, any>()
  for (const playlist of primary) {
    merged.set(playlist.id, playlist)
  }

  for (const playlist of legacyRows.map((entry: any) => ({
    ...entry,
    tracks: Array.isArray(entry.tracks_json) ? entry.tracks_json : [],
  }))) {
    if (!merged.has(playlist.id)) merged.set(playlist.id, playlist)
  }

  return Array.from(merged.values())
}

export async function createPlaylist(userId: string, name: string, imageUrl?: string) {
  const email = await getUserEmail(userId)
  const username = usernameFromEmail(email)
  const normalized = name.trim()

  if (!normalized) return null

  const { data: existing, error: existingError } = await supabase
    .from("playlists")
    .select("id, name, user_id, username, created_at, tracks_json, image_url")
    .eq("user_id", userId)
    .ilike("name", normalized)
    .maybeSingle()

  if (!existingError && existing) {
    return { ...existing, existed: true, tracks: Array.isArray(existing.tracks_json) ? existing.tracks_json : [] }
  }

  const { data, error } = await supabase
    .from("playlists")
    .insert({
      user_id: userId,
      username,
      name: normalized,
      tracks_json: [],
      image_url: imageUrl || null,
    })
    .select("id, name, user_id, username, created_at, tracks_json, image_url")
    .single()

  if (error) {
    console.error("Erro ao criar playlist:", error)
    return null
  }

  return { ...data, existed: false, tracks: Array.isArray(data.tracks_json) ? data.tracks_json : [] }
}

export async function createPlaylistFromShare(userId: string, name: string, imageUrl?: string) {
  const baseName = name.trim() || "Playlist Partilhada"
  const existing = await getPlaylists(userId)
  const names = new Set(existing.map((playlist: any) => (playlist.name || "").toLowerCase()))

  if (!names.has(baseName.toLowerCase())) {
    return createPlaylist(userId, baseName, imageUrl)
  }

  let idx = 2
  let candidate = `${baseName} (${idx})`
  while (names.has(candidate.toLowerCase())) {
    idx += 1
    candidate = `${baseName} (${idx})`
  }

  return createPlaylist(userId, candidate, imageUrl)
}

export async function deletePlaylist(playlistId: string) {
  const { error } = await supabase.from("playlists").delete().eq("id", playlistId)

  if (error) console.error("Erro ao deletar playlist:", error)
  return !error
}

export async function addTrackToPlaylist(playlistId: string, track: any) {
  const { data: playlist, error: fetchError } = await supabase
    .from("playlists")
    .select("tracks_json")
    .eq("id", playlistId)
    .maybeSingle()

  if (fetchError || !playlist) {
    console.error("Erro ao buscar playlist:", fetchError)
    return false
  }

  const tracks = Array.isArray(playlist.tracks_json) ? playlist.tracks_json : []
  const exists = tracks.some((t: any) => t?.id === track.id)
  const updatedTracks = exists ? tracks : [...tracks, track]

  const { error } = await supabase
    .from("playlists")
    .update({ tracks_json: updatedTracks })
    .eq("id", playlistId)

  if (error) console.error("Erro ao adicionar a playlist:", error)
  return !error
}

export async function removeTrackFromPlaylist(playlistId: string, trackId: string) {
  const { data: playlist, error: fetchError } = await supabase
    .from("playlists")
    .select("tracks_json")
    .eq("id", playlistId)
    .maybeSingle()

  if (fetchError || !playlist) {
    console.error("Erro ao buscar playlist:", fetchError)
    return false
  }

  const tracks = Array.isArray(playlist.tracks_json) ? playlist.tracks_json : []
  const updatedTracks = tracks.filter((t: any) => t?.id !== trackId)

  const { error } = await supabase
    .from("playlists")
    .update({ tracks_json: updatedTracks })
    .eq("id", playlistId)

  if (error) console.error("Erro ao remover da playlist:", error)
  return !error
}

export async function createShareRequest(params: {
  fromUserId: string
  toUserId: string
  fromUsername: string
  itemType: "track" | "playlist"
  itemTitle: string
  itemPayload: any
}) {
  const { fromUserId, toUserId, fromUsername, itemType, itemTitle, itemPayload } = params
  const payloadId = itemPayload?.id || null

  const { data: existing } = await supabase
    .from("share_requests")
    .select("id, item_payload")
    .eq("from_user_id", fromUserId)
    .eq("to_user_id", toUserId)
    .eq("item_type", itemType)
    .eq("item_title", itemTitle)
    .eq("status", "pending")
    .limit(20)

  if ((existing || []).some((row: any) => (row?.item_payload?.id || null) === payloadId)) {
    return { ok: false as const, reason: "Pedido de partilha ja pendente para este conteudo." }
  }

  const { error } = await supabase.from("share_requests").insert({
    from_user_id: fromUserId,
    to_user_id: toUserId,
    from_username: fromUsername,
    item_type: itemType,
    item_title: itemTitle,
    item_payload: itemPayload,
    status: "pending",
  })

  if (error) {
    console.error("Erro ao criar pedido de partilha:", error)
    return { ok: false as const, reason: error.message }
  }

  return { ok: true as const }
}

export async function getIncomingShareRequests(userId: string): Promise<ShareRequest[]> {
  const { data, error } = await supabase
    .from("share_requests")
    .select("id, from_user_id, to_user_id, from_username, item_type, item_title, item_payload, status, created_at")
    .eq("to_user_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error) {
    if (error.code !== "PGRST205") console.error("Erro ao carregar partilhas pendentes:", error)
    return []
  }

  return (data || []) as ShareRequest[]
}

export async function getSentShareRequests(userId: string): Promise<ShareRequest[]> {
  const { data, error } = await supabase
    .from("share_requests")
    .select("id, from_user_id, to_user_id, from_username, item_type, item_title, item_payload, status, created_at")
    .eq("from_user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    if (error.code !== "PGRST205") console.error("Erro ao carregar partilhas enviadas:", error)
    return []
  }

  return (data || []) as ShareRequest[]
}

export async function getReceivedShareHistory(userId: string): Promise<ShareRequest[]> {
  const { data, error } = await supabase
    .from("share_requests")
    .select("id, from_user_id, to_user_id, from_username, item_type, item_title, item_payload, status, created_at")
    .eq("to_user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    if (error.code !== "PGRST205") console.error("Erro ao carregar historico recebido:", error)
    return []
  }

  return (data || []) as ShareRequest[]
}

export async function acceptShareRequest(userId: string, request: ShareRequest) {
  if (request.to_user_id !== userId) return false

  if (request.item_type === "track") {
    await addLikedTrack(userId, request.item_payload)
  } else {
    const payload = request.item_payload || {}
    const playlistName = payload.name || request.item_title || "Playlist Partilhada"
    const created = await createPlaylistFromShare(userId, playlistName, payload.image_url || null)

    if (created?.id && Array.isArray(payload.tracks)) {
      for (const track of payload.tracks) {
        await addTrackToPlaylist(created.id, track)
      }
    }
  }

  const { error } = await supabase
    .from("share_requests")
    .update({ status: "accepted" })
    .eq("id", request.id)
    .eq("to_user_id", userId)

  if (error) {
    console.error("Erro ao aceitar partilha:", error)
    return false
  }

  return true
}

export async function rejectShareRequest(userId: string, requestId: string) {
  const { error } = await supabase
    .from("share_requests")
    .update({ status: "rejected" })
    .eq("id", requestId)
    .eq("to_user_id", userId)

  if (error) {
    console.error("Erro ao rejeitar partilha:", error)
    return false
  }

  return true
}
