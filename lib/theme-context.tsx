"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type ThemeColor = "purple" | "green" | "blue" | "orange" | "pink" | "red" | "cyan" | "yellow" | "indigo" | "teal" | "emerald" | "rose" | "lime" | "violet"

type ThemeFont = "inter" | "geist" | "sf-pro" | "system"

type ThemeBackground = "solid-dark" | "gradient" | "shapes" | "glass"

interface ThemePreferences {
  accentColor: ThemeColor
  fontFamily: ThemeFont
  backgroundStyle: ThemeBackground
  navIcons: 'default' | 'minimal' | 'bold'
}

interface ThemeContextType {
  prefs: ThemePreferences
  setAccentColor: (color: ThemeColor) => void
  setFontFamily: (font: ThemeFont) => void
  setBackgroundStyle: (style: ThemeBackground) => void
  setNavIcons: (style: 'default' | 'minimal' | 'bold') => void
  accentHex: string
  fontClass: string
  backgroundClass: string
  navIconClass: string
}

const colorMap: Record<ThemeColor, string> = {
  purple: "#8B5CF6",
  green: "#10B981",
  blue: "#3B82F6",
  orange: "#F97316",
  pink: "#EC4899",
  red: "#EF4444",
  cyan: "#06B6D4",
  yellow: "#EAB308",
  indigo: "#6366F1",
  teal: "#0D9488",
  emerald: "#059669",
  rose: "#F43F5E",
  lime: "#84CC16",
  violet: "#A855F7",
}

const fontMap: Record<ThemeFont, string> = {
  inter: "font-inter",
  geist: "font-geist",
  'sf-pro': "font-sf-pro",
  system: "font-system",
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = "xalanify.theme.v2"

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefsState] = useState<ThemePreferences>({
    accentColor: "purple",
    fontFamily: "inter",
    backgroundStyle: "solid-dark",
    navIcons: 'default'
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setPrefsState({
          accentColor: parsed.accentColor || "purple",
          fontFamily: parsed.fontFamily || "inter",
          backgroundStyle: parsed.backgroundStyle || "solid-dark",
          navIcons: parsed.navIcons || 'default'
        })
      }
    } catch {
      // Fallback to defaults
    }
  }, [])

  const setAccentColor = (color: ThemeColor) => {
    const newPrefs = { ...prefs, accentColor: color }
    setPrefsState(newPrefs)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs))
    window.dispatchEvent(new Event("xalanify-theme-changed"))
  }

  const setFontFamily = (font: ThemeFont) => {
    const newPrefs = { ...prefs, fontFamily: font }
    setPrefsState(newPrefs)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs))
  }

  const setBackgroundStyle = (style: ThemeBackground) => {
    const newPrefs = { ...prefs, backgroundStyle: style }
    setPrefsState(newPrefs)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs))
  }

  const setNavIcons = (style: 'default' | 'minimal' | 'bold') => {
    const newPrefs = { ...prefs, navIcons: style }
    setPrefsState(newPrefs)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs))
  }

  return (
    <ThemeContext.Provider value={{
      prefs,
      setAccentColor,
      setFontFamily,
      setBackgroundStyle,
      setNavIcons,
      accentHex: colorMap[prefs.accentColor],
      fontClass: fontMap[prefs.fontFamily] || 'font-inter',
      backgroundClass: prefs.backgroundStyle,
      navIconClass: prefs.navIcons
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
