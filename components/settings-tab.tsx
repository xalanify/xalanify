"use client"

import { User, Palette, Info, LogOut, ChevronRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function SettingsTab() {
  const { user, signOut } = useAuth()

  const menuItems = [
    { icon: User, label: "Perfil e Conta", color: "#e63946" },
    { icon: Palette, label: "Personalizacao", color: "#e63946" },
    { icon: Info, label: "Creditos", color: "#e63946" },
  ]

  return (
    <div className="flex flex-1 flex-col px-4 pb-4 pt-2">
      <h1 className="mb-6 text-3xl font-bold text-[#f0e0d0]">Ajustes</h1>

      <div className="glass-card-strong overflow-hidden rounded-2xl">
        {menuItems.map((item, idx) => (
          <div
            key={item.label}
            className="flex w-full items-center gap-4 px-5 py-4 text-left"
            style={{
              borderBottom:
                idx < menuItems.length
                  ? "1px solid rgba(255,255,255,0.05)"
                  : "none",
            }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ background: `${item.color}25` }}
            >
              <item.icon className="h-5 w-5" style={{ color: item.color }} />
            </div>
            <span className="flex-1 text-sm font-medium text-[#f0e0d0]">
              {item.label}
            </span>
            <ChevronRight className="h-5 w-5 text-[#504030]" />
          </div>
        ))}

        <button
          onClick={signOut}
          className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors active:bg-[rgba(255,255,255,0.05)]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(230,57,70,0.15)]">
            <LogOut className="h-5 w-5 text-[#e63946]" />
          </div>
          <span className="flex-1 text-sm font-medium text-[#e63946]">
            Terminar Sessao
          </span>
          <ChevronRight className="h-5 w-5 text-[#504030]" />
        </button>
      </div>

      <p className="mt-8 text-center text-xs tracking-[0.2em] text-[#504030]">
        MUSIFY V3.0.0
      </p>
    </div>
  )
}
