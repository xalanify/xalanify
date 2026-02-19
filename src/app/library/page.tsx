// src/app/library/page.tsx

"use client";
import { Plus, Heart, Play } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { useState } from "react";
import TrackOptionsMenu from "@/components/TrackOptions";
import { searchMusic } from "@/lib/musicApi";

export default function LibraryPage() {
  const {
    likedTracks,
    playlists,
    currentTrack,
    setCurrentTrack,
    setIsPlaying,
    setActiveQueue,
    createPlaylist,
    toggleLike,
    audioRef,
    themeColor
  } = useXalanify();

  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  const handlePlayTrack = async (track: any, queue: any[]) => {
    // Obter audio do YouTube
    const trackWithAudio = await searchMusic(track);
    
    setCurrentTrack(trackWithAudio);
    setActiveQueue(queue);
    setIsPlaying(true);
    
    if (audioRef.current && trackWithAudio.audioUrl) {
      audioRef.current.src = trackWithAudio.audioUrl;
      audioRef.current.play();
    }
  };

  const displayTracks = selectedPlaylist === "favorites" ? likedTracks : 
    selectedPlaylist ? playlists.find(p => p.id === selectedPlaylist)?.tracks || [] : 
    likedTracks;

  return (
    <div className="flex-1 bg-gradient-to-br from-[#2a1a2a] to-[#1a0f1a] rounded-3xl p-6 border border-white/10 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-black">Biblioteca</h1>
        <button
          onClick={() => {
            const name = prompt("Nome da playlist:");
            if (name) createPlaylist(name);
          }}
          className="p-3 bg-white text-black rounded-2xl font-bold text-xs hover:bg-white/90 transition"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Playlists Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedPlaylist("favorites")}
          className={`px-4 py-2 rounded-full whitespace-nowrap font-bold text-sm transition ${
            selectedPlaylist === "favorites" || !selectedPlaylist
              ? "bg-white text-black"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          <Heart size={16} className="inline mr-2" />
          Favoritos ({likedTracks.length})
        </button>
        {playlists.filter(p => p.id !== "favorites").map((playlist) => (
          <button
            key={playlist.id}
            onClick={() => setSelectedPlaylist(playlist.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-bold text-sm transition ${
              selectedPlaylist === playlist.id
                ? "bg-white text-black"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {playlist.name} ({playlist.tracks.length})
          </button>
        ))}
      </div>

      {/* Favoritos Card */}
      {(selectedPlaylist === "favorites" || !selectedPlaylist) && (
        <div
          className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-6 mb-6 flex items-center justify-between cursor-pointer hover:from-blue-500 transition"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Heart size={28} fill="white" className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black">Músicas Favoritas</h3>
              <p className="text-sm text-white/80 font-bold mt-1">{likedTracks.length} FAIXAS</p>
            </div>
          </div>
          <div className="text-white/60">→</div>
        </div>
      )}

      {/* Tracks List */}
      <div className="flex-1 overflow-y-auto custom-scroll space-y-3">
        {displayTracks.length > 0 ? (
          displayTracks.map((track) => {
            const isLiked = likedTracks.some(t => t.id === track.id);
            const isCurrentTrack = currentTrack?.id === track.id;
            return (
              <div
                key={track.id}
                className={`p-3 rounded-2xl flex items-center gap-4 transition group ${
                  isCurrentTrack
                    ? "bg-white/20 border border-white/30"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
              >
                <img
                  src={track.thumbnail}
                  alt={track.title}
                  className="w-14 h-14 rounded-lg object-cover cursor-pointer hover:scale-110 transition"
                  onClick={() => handlePlayTrack(track, displayTracks)}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${isCurrentTrack ? themeColor : ""}`}>
                    {track.title}
                  </p>
                  <p className="text-xs text-white/50 truncate">{track.artist}</p>
                </div>
                <button
                  onClick={() => handlePlayTrack(track, displayTracks)}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition opacity-0 group-hover:opacity-100"
                >
                  <Play size={16} fill="white" className="text-white" />
                </button>
                <button
                  onClick={() => toggleLike(track)}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                >
                  <Heart
                    size={16}
                    fill={isLiked ? themeColor : "none"}
                    color={isLiked ? themeColor : "white"}
                    className="text-white/60"
                  />
                </button>
                <TrackOptionsMenu track={track} playlistId={selectedPlaylist || "favorites"} />
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-40 text-white/40">
            <p className="text-sm">Nenhuma música nesta playlist</p>
          </div>
        )}
      </div>
    </div>
  );
}