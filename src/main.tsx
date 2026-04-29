import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import './animations.css';

// ── Register PWA service worker ──────────────────────────────
// Using vite-plugin-pwa (recommended) — add to vite.config.ts:
//
//   import { VitePWA } from 'vite-plugin-pwa'
//   plugins: [react(), VitePWA({ registerType: 'autoUpdate', ... })]
//
// OR manual registration (fallback if not using plugin):
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => {
        console.log('[PWA] Service worker registered:', reg.scope);
        // Check for updates every 10 minutes
        setInterval(() => reg.update(), 10 * 60 * 1000);
      })
      .catch(err => console.warn('[PWA] SW registration failed:', err));
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0f1623',
            color: '#f0f4ff',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#00e57a', secondary: '#000' } },
          error:   { iconTheme: { primary: '#ff4d6a', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);