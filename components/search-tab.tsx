"use client"

import { useState, useCallback, useEffect } from "react"
import { Search, MoreHorizontal, Play } from "lucide-react"
import { searchMusic, type SearchSource } from "@/lib/musicApi"
import { usePlayer, type Track } from "@/lib/player-context"
import { useTheme } from "@/lib/theme-context"

interface SearchTabProps {
  onTrackMenu?: (track: Track, triggerRect: DOMRect) => void
  query: string
  setQuery: (value: string) => void
  results: Track[]
  setResults: (tracks: Track[]) => void
}

export default function SearchTab({ onTrackMenu, query, setQuery, results, setResults }: SearchTabProps) {
  const [searching, setSearching] = useState(false)
  const [sourceFilter, setSourceFilter] = useState<SearchSource>("all")
  const [sourcesAvailable, setSourcesAvailable] = useState<{spotify: boolean, youtube: boolean}>({spotify: true, youtube: true})

  const { play, setQueue } = usePlayer()
  const { accentHex } = useTheme()

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    setSearching(true)
    const result = await searchMusic(query, sourceFilter)
    setResults(result)
    setSearching(false)
  }, [query, sourceFilter, setResults])

  // Re-search when source filter changes
  const handleSourceChange = useCallback(async (source: SearchSource) => {
    setSourceFilter(source)
    if (query.trim()) {
      setSearching(true)
      const tracks = await searchMusic(query, source)
      setResults(tracks)
      setSearching(false)
    }
  }, [query, setResults])

  // Check API availability on first search
  useEffect(() => {
    if (query.trim()) {
      searchMusic(query, 'spotify').then((spotifyTracks) => {
        setSourcesAvailable(prev => ({
          ...prev,
          spotify: spotifyTracks.length > 0
        }))
      }).catch(() => setSourcesAvailable(prev => ({...prev, spotify: false})))

      searchMusic(query, 'youtube').then((youtubeTracks) => {
        setSourcesAvailable(prev => ({
          ...prev,
          youtube: youtubeTracks.length > 0
        }))
      }).catch(() => setSourcesAvailable(prev => ({...prev, youtube: false})))
    }
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSearch()
    },
    [handleSearch]
  )

  function handlePlay(track: Track) {
    setQueue(results)
    play(track)
  }

  // Get source badge styles
  function getSourceBadge(source?: string) {
    if (source === "spotify") {
      return { bg: "#1DB954", text: "#fff", label: "Spotify" }
    } else if (source === "youtube") {
      return { bg: "#FF0000", text: "#fff", label: "YouTube" }
    }
    return null
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-5 pb-4 pt-2">
      {/* Search Bar - Glass Card Style */}
      <div className="flex items-center gap-3 rounded-[18px] glass-card px-4 py-3">
        <Search className="h-5 w-5 shrink-0 text-[#8E8E93]" />
        <input
          id="search-query"
          name="query"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pesquisar músicas..."
          className="w-full bg-transparent text-sm text-[#D2B48C] placeholder-[#8E8E93]/50 focus:outline-none"
        />
      </div>

      {/* Source Filter Tabs - Smaller buttons */}
      <div className="mt-3 flex gap-2">
        {(["all" as SearchSource] as SearchSource[]).map((source) => (
          <button
            key={source}
            onClick={() => handleSourceChange(source)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              sourceFilter === source
                ? "text-white"
                : "glass-card text-[#8E8E93] hover:text-[#D2B48C]"
            }`}
            style={sourceFilter === source ? { backgroundColor: accentHex } : {}}
          >
            Tudo
          </button>
        ))}
        {sourcesAvailable.youtube && (
          <button
            onClick={() => handleSourceChange("youtube")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              sourceFilter === "youtube"
                ? "text-white"
                : "glass-card text-[#8E8E93] hover:text-[#D2B48C]"
            }`}
            style={sourceFilter === "youtube" ? { backgroundColor: accentHex } : {}}
          >
            YouTube
          </button>
        )}
        {sourcesAvailable.spotify && (
          <button
            onClick={() => handleSourceChange("spotify")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              sourceFilter === "spotify"
                ? "text-white"
                : "glass-card text-[#8E8E93] hover:text-[#D2B48C]"
            }`}
            style={sourceFilter === "spotify" ? { backgroundColor: accentHex } : {}}
          >
            Spotify
          </button>
        )}
        {(!sourcesAvailable.spotify || !sourcesAvailable.youtube) && (
          <div className="text-xs text-[#8E8E93] ml-1">
            {!sourcesAvailable.spotify && "SP "} {!sourcesAvailable.youtube && "YT"} offline
          </div>
        )}
      </div>

      <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto hide-scrollbar">
        {searching && (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#3B82F6] border-t-transparent" />
          </div>
        )}

        {!searching && results.length === 0 && query && (
          <p className="py-20 text-center text-sm text-[#8E8E93]">
            Sem resultados para "{query}"
          </p>
        )}

        {!searching && results.length === 0 && !query && (
          <div className="flex flex-col items-center justify-center py-20 text-[#8E8E93]">
            <Search className="mb-3 h-10 w-10 opacity-40" />
            <p className="text-sm">Pesquisa a tua música favorita</p>
          </div>
        )}

        {results.map((track) => {
          const badge = getSourceBadge(track.source)
          
          return (
            <div
              key={track.id}
              className="flex w-full items-center gap-3 rounded-[18px] glass-card p-3 text-left transition-all duration-200 hover:bg-[#1a1a1a] h-[76px]"
            >
              {/* Left: Thumbnail 48-56px, rounded 8-12px */}
              <button
                onClick={() => handlePlay(track)}
                className="shrink-0 relative"
              >
                <img
                  src={track.thumbnail}
                  alt={track.title}
                  className="h-12 w-12 shrink-0 rounded-[10px] object-cover"
                />
                {/* Source badge on thumbnail */}
                {badge && (
                  <div
                    className="absolute -bottom-1 -right-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                    style={{ backgroundColor: badge.bg, color: badge.text }}
                  >
                    {badge.label === "Spotify" ? "SP" : "YT"}
                  </div>
                )}
              </button>
              
              {/* Center: Title (Bege, 17pt, Semi-bold) + Subtitle (Gray, 14pt) */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] font-semibold text-[#D2B48C]">{track.title}</p>
                <p className="truncate text-[14px] text-[#8E8E93]">{track.artist}</p>
              </div>
              
              {/* Right: Play button + More options */}
              <button
                onClick={() => handlePlay(track)}
                className="rounded-full p-2 shrink-0"
                style={{ backgroundColor: `${accentHex}30` }}
                aria-label="Tocar"
              >
                <Play className="h-4 w-4" style={{ color: accentHex }} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect()
                  onTrackMenu?.(track, rect)
                }}
                className="shrink-0 p-2 rounded-full hover:bg-[#f0e0d0]/10 text-[#8E8E93] transition-colors"
                aria-label="Mais opções"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
