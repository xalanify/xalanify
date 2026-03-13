import type { Metadata, Viewport } from 'next'

// Server component for metadata
function MetadataComponent() {
  return {
    metadata: {
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
    },
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 1,
      userScalable: false,
      themeColor: '#000000',
      viewportFit: 'cover',
    },
  }
}

export const metadata = MetadataComponent().metadata
export const viewport = MetadataComponent().viewport