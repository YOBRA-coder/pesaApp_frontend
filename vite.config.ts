import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // ── Auto-update strategy ─────────────────────────────
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      // ── Manifest ─────────────────────────────────────────
      manifest: {
        name: 'PesaApp',
        short_name: 'PesaApp',
        description: "Kenya's Smart Money Platform — Wallet, Games, Sports, Invest",
        theme_color: '#00e57a',
        background_color: '#080c14',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        start_url: '/?source=pwa',
        scope: '/',
        lang: 'en',
        orientation: 'portrait-primary',
        categories: ['finance', 'entertainment'],
        icons: [
          { src: '/icons/icon-72.png',  sizes: '72x72',  type: 'image/png' },
          { src: '/icons/icon-96.png',  sizes: '96x96',  type: 'image/png' },
          { src: '/icons/icon-128.png', sizes: '128x128', type: 'image/png' },
          { src: '/icons/icon-144.png', sizes: '144x144', type: 'image/png' },
          { src: '/icons/icon-152.png', sizes: '152x152', type: 'image/png' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-384.png', sizes: '384x384', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Aviator',  short_name: 'Aviator', url: '/games/aviator', description: 'Play Aviator', icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }] },
          { name: 'Deposit',  short_name: 'Deposit',  url: '/wallet?tab=deposit', description: 'Deposit money' },
          { name: 'Sports',   short_name: 'Sports',   url: '/sports', description: 'Football betting' },
          { name: 'Signals',  short_name: 'Signals',  url: '/invest', description: 'Trading signals' },
        ],
        screenshots: [
          { src: '/screenshots/dashboard.png', sizes: '390x844', type: 'image/png', form_factor: 'narrow', label: 'PesaApp Dashboard' },
          { src: '/screenshots/aviator.png',   sizes: '390x844', type: 'image/png', form_factor: 'narrow', label: 'Aviator Game' },
        ],
        related_applications: [],
        prefer_related_applications: false,
      },

      // ── Workbox (service worker) config ──────────────────
      workbox: {
        // Pre-cache all build assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webp}'],

        // Runtime caching rules
        runtimeCaching: [
          // API responses — network first, fall back to cache (60s TTL)
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Google Fonts — cache first
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Images — stale while revalidate
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          // Cloudinary (KYC photos, avatars) — cache first
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cloudinary-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],

        // SPA fallback — all navigation goes to index.html
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/ws/],

        // Skip waiting so updates apply immediately
        skipWaiting: true,
        clientsClaim: true,
      },

      // ── Dev options ───────────────────────────────────────
      devOptions: {
        enabled: false, // Set true to test SW in dev (can be noisy)
        type: 'module',
      },

      includeAssets: ['favicon.ico', 'favicon.svg', 'icons/*.png', 'screenshots/*.png'],
    }),
  ],

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },

  server: {
    port: 5173,
       // 1. Allow the ngrok host (use true to allow all or a specific string)
    allowedHosts: true, 
    
    // 2. Fix HMR for ngrok (allows live updates via the tunnel)
    hmr: {
      clientPort: 443, // Use 443 for https ngrok tunnels, 80 for http
    },
    proxy: {
      '/api': { 
        target: 'http://localhost:3000', 
        changeOrigin: true,
        secure: false, // If ngrok uses self-signed certs
       },
      '/ws':  { 
        target: 'ws://localhost:3000',
         ws: true
       },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching
        manualChunks: {
          react:  ['react', 'react-dom', 'react-router-dom'],
          query:  ['@tanstack/react-query'],
          charts: ['date-fns'],
          forms:  ['react-hook-form', '@hookform/resolvers', 'zod'],
          state:  ['zustand'],
          ui:     ['lucide-react', 'clsx', 'tailwind-merge', 'react-hot-toast'],
        },
      },
    },
  },
});
