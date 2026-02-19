"use client"

import { useState, useCallback } from "react"
import { Search, MoreHorizontal } from "lucide-react"
import { searchMusic } from "@/lib/musicApi"
import { usePlayer, type Track } from "@/lib/player-context"

interface SearchTabProps {
  onTrackMenu?: (track: Track) => void
}

export default function SearchTab({ onTrackMenu }: SearchTabProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Track[]>([])
  const [searching, setSearching] = useState(false)
  const { play, setQueue } = usePlayer()

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    setSearching(true)
    const tracks = await searchMusic(query)
    setResults(tracks)
    setSearching(false)
  }, [query])

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

  return (
    <div className="flex flex-1 flex-col px-4 pb-4 pt-2">
      {/* Search Bar */}
      <div className="glass-card-strong flex items-center gap-3 rounded-xl px-4 py-3">
        <Search className="h-5 w-5 shrink-0 text-[#a08070]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pesquisar musicas..."
          className="w-full bg-transparent text-sm text-[#f0e0d0] placeholder-[#706050] focus:outline-none"
        />
      </div>

      {/* Results */}
      <div className="mt-4 flex-1 space-y-2.5 overflow-y-auto hide-scrollbar">
        {searching && (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e63946] border-t-transparent" />
          </div>
        )}

        {!searching && results.length === 0 && query && (
          <p className="py-20 text-center text-sm text-[#706050]">
            Sem resultados para &quot;{query}&quot;
          </p>
        )}

        {!searching && results.length === 0 && !query && (
          <div className="flex flex-col items-center justify-center py-20 text-[#706050]">
            <Search className="mb-3 h-10 w-10 opacity-40" />
            <p className="text-sm">Pesquisa a tua musica favorita</p>
          </div>
        )}

        {results.map((track) => (
          <button
            key={track.id}
            onClick={() => handlePlay(track)}
            className="glass-card flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors active:bg-[rgba(255,255,255,0.08)]"
          >
            <img
              src={track.thumbnail}
              alt={track.title}
              className="h-12 w-12 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#f0e0d0]">{track.title}</p>
              <p className="truncate text-xs text-[#a08070]">{track.artist}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onTrackMenu?.(track)
              }}
              className="shrink-0 p-1.5 text-[#706050] transition-colors hover:text-[#a08070]"
              aria-label="Mais opcoes"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </button>
        ))}
      </div>
    </div>
  )
}
