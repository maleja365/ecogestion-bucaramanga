import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true, // permite probar la instalación también en npm run dev
      },
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Ecosmart Residenciales',
        short_name: 'Ecosmart',
        description:
          'Gestión ambiental inteligente para conjuntos residenciales: reporte de incidentes, campañas ambientales y participación de residentes.',
        lang: 'es',
        theme_color: '#0B6E33',
        background_color: '#F5F8F6',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // El "app shell" (HTML/CSS/JS) queda cacheado para carga offline.
        // Las llamadas a Supabase se dejan siempre en red (no se cachean),
        // porque los datos de incidentes/campañas deben ser siempre actuales.
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      },
    }),
  ],
})
