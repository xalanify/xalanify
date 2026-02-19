// src/lib/supabase.ts

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials not found");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User Functions
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return error;
}

// Liked Tracks
export async function getLikedTracks(userId: string) {
  const { data, error } = await supabase
    .from("liked_tracks")
    .select("track_data")
    .eq("user_id", userId);

  if (error) console.error("Erro ao carregar favoritos:", error);
  return data?.map((item: any) => item.track_data) || [];
}

export async function addLikedTrack(userId: string, track: any) {
  const { error } = await supabase.from("liked_tracks").insert({
    user_id: userId,
    track_id: track.id,
    track_data: track,
  });

  if (error) console.error("Erro ao adicionar favorito:", error);
  return !error;
}

export async function removeLikedTrack(userId: string, trackId: string) {
  const { error } = await supabase
    .from("liked_tracks")
    .delete()
    .eq("user_id", userId)
    .eq("track_id", trackId);

  if (error) console.error("Erro ao remover favorito:", error);
  return !error;
}

// Playlists
export async function getPlaylists(userId: string) {
  const { data, error } = await supabase
    .from("playlists")
    .select("*")
    .eq("user_id", userId);

  if (error) console.error("Erro ao carregar playlists:", error);
  return data || [];
}

export async function createPlaylist(userId: string, name: string) {
  const { data, error } = await supabase
    .from("playlists")
    .insert({
      user_id: userId,
      name,
      tracks: [],
    })
    .select()
    .single();

  if (error) console.error("Erro ao criar playlist:", error);
  return data;
}

export async function deletePlaylist(playlistId: string) {
  const { error } = await supabase
    .from("playlists")
    .delete()
    .eq("id", playlistId);

  if (error) console.error("Erro ao deletar playlist:", error);
  return !error;
}

export async function addTrackToPlaylist(playlistId: string, track: any) {
  const { data: playlist, error: fetchError } = await supabase
    .from("playlists")
    .select("tracks")
    .eq("id", playlistId)
    .single();

  if (fetchError) {
    console.error("Erro ao buscar playlist:", fetchError);
    return false;
  }

  const tracks = playlist?.tracks || [];
  const updatedTracks = tracks.find((t: any) => t.id === track.id)
    ? tracks
    : [...tracks, track];

  const { error } = await supabase
    .from("playlists")
    .update({ tracks: updatedTracks })
    .eq("id", playlistId);

  if (error) console.error("Erro ao adicionar à playlist:", error);
  return !error;
}

export async function removeTrackFromPlaylist(playlistId: string, trackId: string) {
  const { data: playlist, error: fetchError } = await supabase
    .from("playlists")
    .select("tracks")
    .eq("id", playlistId)
    .single();

  if (fetchError) {
    console.error("Erro ao buscar playlist:", fetchError);
    return false;
  }

  const tracks = playlist?.tracks || [];
  const updatedTracks = tracks.filter((t: any) => t.id !== trackId);

  const { error } = await supabase
    .from("playlists")
    .update({ tracks: updatedTracks })
    .eq("id", playlistId);

  if (error) console.error("Erro ao remover da playlist:", error);
  return !error;
}