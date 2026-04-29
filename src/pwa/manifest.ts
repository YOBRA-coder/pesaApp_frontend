// ═══════════════════════════════════════════════════════════
// public/manifest.json  (already in your project — update this)
// ═══════════════════════════════════════════════════════════
export const MANIFEST_JSON = {
  "name": "PesaApp",
  "short_name": "PesaApp",
  "description": "Kenya's Smart Money Platform – Wallet, Games, Sports, Invest",
  "start_url": "/",
  "display": "standalone",
  "display_override": ["standalone", "minimal-ui"],
  "background_color": "#080c14",
  "theme_color": "#00e57a",
  "orientation": "portrait-primary",
  "prefer_related_applications": false,
  "categories": ["finance", "entertainment"],
  "icons": [
    { "src": "/icons/icon-72.png",   "sizes": "72x72",   "type": "image/png" },
    { "src": "/icons/icon-96.png",   "sizes": "96x96",   "type": "image/png" },
    { "src": "/icons/icon-128.png",  "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144.png",  "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-152.png",  "sizes": "152x152", "type": "image/png" },
    { "src": "/icons/icon-192.png",  "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-384.png",  "sizes": "384x384", "type": "image/png" },
    { "src": "/icons/icon-512.png",  "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [
    { "src": "/screenshots/home.png",  "sizes": "390x844", "type": "image/png", "form_factor": "narrow",  "label": "PesaApp Dashboard" },
    { "src": "/screenshots/games.png", "sizes": "390x844", "type": "image/png", "form_factor": "narrow",  "label": "Aviator Game" }
  ],
  "shortcuts": [
    { "name": "Aviator",  "url": "/games/aviator", "description": "Play Aviator", "icons": [{"src":"/icons/icon-96.png","sizes":"96x96"}] },
    { "name": "Deposit",  "url": "/wallet?tab=deposit", "description": "Deposit money" },
    { "name": "Sports",   "url": "/sports", "description": "Football betting" }
  ],
  "related_applications": [],
  "scope": "/",
  "lang": "en",
  "dir": "ltr"
};
