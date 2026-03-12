"use client"

import { useEffect } from 'react'

export default function MobileOptimizer() {
  useEffect(() => {
    // Mobile PWA Background Playback
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {})
      navigator.mediaSession.setActionHandler('pause', () => {})
      navigator.mediaSession.setActionHandler('previoustrack', () => {})
      navigator.mediaSession.setActionHandler('nexttrack', () => {})
    }

    // Prevent sleep on mobile
    let wakeLock: WakeLockSentinel | null = null
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLock = await navigator.wakeLock.request('screen')
        } catch (err) {
          // Wake lock unsupported or error
        }
      }
    }
    
    requestWakeLock()

    // Force app update on mobile PWA
    window.addEventListener('appinstalled', () => {
      localStorage.setItem('pwaInstalled', 'true')
    })

    // iOS Safari fixes
    if ('standalone' in window.navigator || window.matchMedia('(display-mode: standalone)').matches) {
      document.documentElement.classList.add('pwa')
    }

    return () => {
      wakeLock?.release()
    }
  }, [])

  return null
}
