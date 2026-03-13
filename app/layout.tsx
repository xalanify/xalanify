import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { useEffect } from 'react'
import { performPWAUpdate } from '@/lib/versions'

// Types for PWA functions
declare global {
  interface Window {
    installPWA?: () => Promise<boolean>
    isPWAInstalled?: () => boolean
    deferredPrompt?: any
  }
}

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Xalanify',
  description: 'Your music, everywhere.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Xalanify',
    startupImage: [
      {
        url: '/icon-512.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Auto-refresh PWA on app load
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if PWA is installed and perform auto-refresh
    if (window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches) {
      
      // Perform PWA update with cache clear
      performPWAUpdate();
    }
  }, []);

  return (
    <html lang="pt">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Xalanify" />
        <meta name="application-name" content="Xalanify" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-TileImage" content="/icon-192.png" />
        <meta name="theme-color" content="#000000" />
        
        {/* PWA Icons */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            let deferredPrompt = null;
            let swRegistration = null;
            
            // Armazena o evento de instalação PWA
            window.addEventListener('beforeinstallprompt', (e) => {
              e.preventDefault();
              deferredPrompt = e;
              window.dispatchEvent(new CustomEvent('pwa-install-available'));
            });
            
            // Função global para instalar a PWA
            window.installPWA = async function() {
              if (!deferredPrompt) return false;
              deferredPrompt.prompt();
              const { outcome } = await deferredPrompt.userChoice;
              if (outcome === 'accepted') {
                deferredPrompt = null;
                window.dispatchEvent(new CustomEvent('pwa-installed'));
              }
              return outcome === 'accepted';
            };
            
            // Verifica se já está instalado
            window.isPWAInstalled = function() {
              return window.matchMedia('(display-mode: standalone)').matches || 
                     window.matchMedia('(display-mode: fullscreen)').matches ||
                     window.matchMedia('(display-mode: minimal-ui)').matches;
            };

            // Helper to notify app UI about available update
            function notifyUpdateAvailable(reg) {
              try {
                window.dispatchEvent(new CustomEvent('pwa-update-available', { detail: { registration: reg || swRegistration || null } }));
              } catch (e) {
                window.dispatchEvent(new CustomEvent('pwa-update-available'));
              }
            }

            // Service Worker Registration
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then((registration) => {
                    console.log('SW registered:', registration.scope);
                    swRegistration = registration;

                    // If there's already a waiting SW (common on reload), prompt immediately.
                    if (registration.waiting) {
                      notifyUpdateAvailable(registration);
                    }

                    // Detect updates and prompt when the new SW reaches "installed" and is waiting.
                    registration.addEventListener('updatefound', () => {
                      const installing = registration.installing;
                      if (!installing) return;
                      installing.addEventListener('statechange', () => {
                        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                          notifyUpdateAvailable(registration);
                        }
                      });
                    });

                    // Verificar atualizações a cada 30 segundos
                    setInterval(() => registration.update(), 30000);
                  })
                  .catch((error) => {
                    console.log('SW registration failed:', error);
                  });
                  
                // Listener para mensagens do SW
                navigator.serviceWorker.addEventListener('message', (event) => {
                  if (!event.data) return;

                  // If SW tells us it updated / should reload, prompt.
                  if (event.data.type === 'sw-updated' || event.data.type === 'NEW_VERSION') {
                    console.log('Nova versao disponivel!');
                    notifyUpdateAvailable(swRegistration);
                  }
                });
              });
            }
          })();
        `}} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
