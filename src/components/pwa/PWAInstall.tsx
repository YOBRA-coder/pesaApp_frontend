import { useState, useEffect, useRef } from 'react';
import { Download, X, Smartphone, Bell, Wifi, BatteryCharging, Share } from 'lucide-react';
import toast from 'react-hot-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// ── Hook: register service worker + track updates ─────────────
export function useServiceWorker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const regRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        regRef.current = reg;

        reg.addEventListener('updatefound', () => {
          const newSW = reg.installing;
          if (!newSW) return;
          newSW.addEventListener('statechange', () => {
            if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });

        // Listen for controllerchange (after skipWaiting)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });

        // Periodic update check
        setInterval(() => reg.update().catch(() => {}), 10 * 60 * 1000);
      } catch (err) {
        // SW registration failed — app still works, just no offline support
        console.warn('[SW] Registration failed:', err);
      }
    };

    register();
  }, []);

  const applyUpdate = () => {
    const sw = regRef.current?.waiting;
    if (sw) {
      sw.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
  };

  return { updateAvailable, applyUpdate };
}

// ── PWA Install Banner ────────────────────────────────────────
export function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow]     = useState(false);
  const [isIOS, setIsIOS]   = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSSteps, setShowIOSSteps] = useState(false);

  useEffect(() => {
    // Check if already running as standalone PWA
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(standalone);
    if (standalone) return; // Already installed — don't show banner

    // Detect iOS (Safari on iPhone/iPad)
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) &&
                !(window as any).MSStream &&
                !window.matchMedia('(display-mode: standalone)').matches;
    setIsIOS(ios);

    // iOS — show after 4 seconds if not dismissed
    if (ios) {
      const dismissed = localStorage.getItem('pwa-ios-dismissed');
      if (!dismissed) {
        setTimeout(() => setShow(true), 4000);
      }
      return;
    }

    // Android/Chrome — listen for native install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      const dismissed = localStorage.getItem('pwa-dismissed');
      if (!dismissed) {
        setTimeout(() => setShow(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setShow(false);
      setPrompt(null);
      toast.success('✅ PesaApp installed! Open from your home screen.', { duration: 4000 });
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSSteps(true);
      return;
    }
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    setPrompt(null);
  };

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(isIOS ? 'pwa-ios-dismissed' : 'pwa-dismissed', '1');
  };

  // Don't show if standalone or not triggered
  if (isStandalone || !show) return null;

  return (
    <>
      {/* Install Banner */}
      <div className="fixed bottom-20 md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:w-80 z-50 animate-slide-up">
        <div className="card border-green/30 shadow-2xl" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 gradient-green rounded-xl flex items-center justify-center font-display font-black text-black text-xl shrink-0 glow-green">P</div>
            <div className="flex-1">
              <p className="font-display font-bold text-white text-sm">Install PesaApp</p>
              <p className="text-xs text-muted mt-0.5 leading-relaxed">
                Works offline, loads instantly, push alerts — like a native app, free!
              </p>
            </div>
            <button onClick={dismiss} className="text-subtle hover:text-white shrink-0 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Feature pills */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { icon: Wifi, label: 'Offline', color: 'text-green' },
              { icon: Bell, label: 'Alerts', color: 'text-blue' },
              { icon: BatteryCharging, label: 'Fast', color: 'text-gold' },
            ].map(f => (
              <div key={f.label} className="flex flex-col items-center gap-1 py-2 bg-card2 rounded-xl">
                <f.icon size={14} className={f.color} />
                <span className="text-[9px] text-subtle">{f.label}</span>
              </div>
            ))}
          </div>

          <button onClick={handleInstall}
            className="btn-primary w-full justify-center text-sm py-2.5">
            <Download size={14} />
            {isIOS ? 'How to Install on iPhone' : 'Install — Free'}
          </button>
        </div>
      </div>

      {/* iOS Step-by-step guide */}
      {showIOSSteps && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-[60] p-4">
          <div className="card w-full max-w-sm mb-2 animate-slide-up space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="section-title flex items-center gap-2">
                <Smartphone size={16} /> Install on iPhone / iPad
              </h3>
              <button onClick={() => { setShowIOSSteps(false); dismiss(); }}><X size={16} className="text-subtle" /></button>
            </div>

            <div className="space-y-3">
              {[
                { step: '1', icon: Share, text: 'Tap the Share icon at the bottom of Safari (the box with an arrow pointing up)' },
                { step: '2', icon: null, emoji: '📜', text: 'Scroll down in the Share menu and tap "Add to Home Screen"' },
                { step: '3', icon: null, emoji: '✏️', text: 'Tap "Add" in the top-right corner (you can rename it first)' },
                { step: '4', icon: null, emoji: '✅', text: 'PesaApp icon appears on your home screen — tap to open!' },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-green/20 text-green text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {s.step}
                  </div>
                  <div className="flex items-start gap-2 flex-1">
                    {s.icon ? <s.icon size={14} className="text-muted mt-0.5 shrink-0" /> : <span className="text-sm shrink-0">{s.emoji}</span>}
                    <p className="text-sm text-muted leading-relaxed">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card2 border border-border rounded-xl p-3 text-xs text-subtle">
              💡 Only works in Safari. If using Chrome on iPhone, switch to Safari first.
            </div>

            <button onClick={() => { setShowIOSSteps(false); dismiss(); }}
              className="btn-primary w-full justify-center">
              Got it! 👍
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Update banner ─────────────────────────────────────────────
export function UpdateBanner({ onUpdate }: { onUpdate: () => void }) {
  return (
    <div
      onClick={onUpdate}
      className="fixed top-0 left-0 right-0 z-[70] cursor-pointer bg-green text-black text-xs font-bold py-2.5 text-center flex items-center justify-center gap-2 hover:bg-green-dark transition-colors"
    >
      🔄 New version available — tap to update
    </div>
  );
}