import crypto from 'crypto'
if (!globalThis.crypto) globalThis.crypto = crypto;
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'LMS Bimbingan Bisnis',
        short_name: 'LMS Bisnis',
        description: 'Platform pembelajaran online Bimbingan Bisnis',
        theme_color: '#6366f1',
        background_color: '#0f0f1a',
        display: 'standalone',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
