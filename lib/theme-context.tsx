"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type ThemeColor = "purple" | "green" | "blue" | "orange" | "pink" | "red" | "cyan" | "yellow"

interface ThemeContextType {
  accentColor: ThemeColor
  setAccentColor: (color: ThemeColor) => void
  accentHex: string
}

const colorMap: Record<ThemeColor, string> = {
  purple: "#8B5CF6",
  green: "#1DB954",
  blue: "#3B82F6",
  orange: "#F97316",
  pink: "#EC4899",
  red: "#EF4444",
  cyan: "#06B6D4",
  yellow: "#EAB308",
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = "xalanify.theme"

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [accentColor, setAccentColorState] = useState<ThemeColor>("purple")

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && stored in colorMap) {
      setAccentColorState(stored as ThemeColor)
    }
  }, [])

  const setAccentColor = (color: ThemeColor) => {
    setAccentColorState(color)
    localStorage.setItem(STORAGE_KEY, color)
    // Dispatch event for components that need to react
    window.dispatchEvent(new Event("xalanify-theme-changed"))
  }

  return (
    <ThemeContext.Provider value={{ 
      accentColor, 
      setAccentColor, 
      accentHex: colorMap[accentColor] 
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
