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
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

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

type SettingsView = "menu" | "profile" | "customization" | "credits"

export default function SettingsTab() {
  const { user, signOut } = useAuth()
  const [activeView, setActiveView] = useState<SettingsView>("menu")
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES)

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
  }, [preferences])

  const initials = useMemo(() => {
    if (!user?.email) return "X"
    return user.email.charAt(0).toUpperCase()
  }, [user?.email])

  function updatePreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPreferences((prev) => ({ ...prev, [key]: value }))
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
