"use client"

import { useState, useCallback } from "react"
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
  const { play, setQueue } = usePlayer()
  const { accentHex } = useTheme()

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    setSearching(true)
    const tracks = await searchMusic(query, sourceFilter)
    setResults(tracks)
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
    <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2">
      <div className="flex items-center gap-3 rounded-xl bg-[#1a1a1a]/60 border border-[#f0e0d0]/10 px-4 py-3">
        <Search className="h-5 w-5 shrink-0 text-[#a08070]" />
        <input
          id="search-query"
          name="query"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pesquisar musicas..."
          className="w-full bg-transparent text-sm text-[#f0e0d0] placeholder-[#706050] focus:outline-none"
        />
      </div>

      {/* Source Filter Tabs */}
      <div className="mt-3 flex gap-2">
        {(["all", "spotify", "youtube"] as SearchSource[]).map((source) => (
          <button
            key={source}
            onClick={() => handleSourceChange(source)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              sourceFilter === source
                ? "text-white"
                : "bg-[#1a1a1a]/60 text-[#a08070] hover:text-[#f0e0d0]"
            }`}
            style={sourceFilter === source ? { backgroundColor: accentHex } : {}}
          >
            {source === "all" ? "Tudo" : source === "spotify" ? "Spotify" : "YouTube"}
          </button>
        ))}
      </div>

      <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto hide-scrollbar">
        {searching && (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e63946] border-t-transparent" />
          </div>
        )}

        {!searching && results.length === 0 && query && (
          <p className="py-20 text-center text-sm text-[#706050]">
            Sem resultados para "{query}"
          </p>
        )}

        {!searching && results.length === 0 && !query && (
          <div className="flex flex-col items-center justify-center py-20 text-[#706050]">
            <Search className="mb-3 h-10 w-10 opacity-40" />
            <p className="text-sm">Pesquisa a tua musica favorita</p>
          </div>
        )}

        {results.map((track) => {
          const badge = getSourceBadge(track.source)
          
          return (
            <div
              key={track.id}
              className="flex w-full items-center gap-3 rounded-xl bg-[#1a1a1a]/60 border border-[#f0e0d0]/10 p-3 text-left transition-all duration-200 hover:bg-[#1a1a1a]"
            >
              <button
                onClick={() => handlePlay(track)}
                className="shrink-0 relative"
              >
                <img
                  src={track.thumbnail}
                  alt={track.title}
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
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
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#f0e0d0]">{track.title}</p>
                <p className="truncate text-xs text-[#a08070]">{track.artist}</p>
              </div>
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
                className="shrink-0 p-2 rounded-full hover:bg-[#f0e0d0]/10 text-[#a08070] transition-colors"
                aria-label="Mais opcoes"
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
