import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  to: string;
  emoji: string;
  gradient: string;
  glow: string;
  badge?: string;
  badgeColor?: string;
}

const BANNERS: Banner[] = [
  {
    id: 'aviator',
    title: 'Aviator is LIVE',
    subtitle: 'Cash out before the plane flies away. Win up to 1000x your bet!',
    cta: 'Play Now →',
    to: '/games/aviator',
    emoji: '✈️',
    gradient: 'linear-gradient(135deg, #1a0a3a 0%, #0d0626 50%, #180838 100%)',
    glow: 'rgba(124,58,237,0.4)',
    badge: '🔥 HOT',
    badgeColor: '#ff4d6a',
  },
  {
    id: 'signals',
    title: 'Live Forex Signals',
    subtitle: 'Professional trading signals with 84% win rate. Forex, Crypto & Commodities.',
    cta: 'View Signals →',
    to: '/invest',
    emoji: '📈',
    gradient: 'linear-gradient(135deg, #051a0a 0%, #021008 50%, #041505 100%)',
    glow: 'rgba(0,229,122,0.3)',
    badge: '💹 84% WIN RATE',
    badgeColor: '#00e57a',
  },
  {
    id: 'referral',
    title: 'Earn KES 200',
    subtitle: 'Invite friends to PesaApp. You earn KES 200 for every friend who joins and deposits!',
    cta: 'Invite Friends →',
    to: '/referrals',
    emoji: '👥',
    gradient: 'linear-gradient(135deg, #1a1000 0%, #0d0800 50%, #1a1200 100%)',
    glow: 'rgba(240,192,64,0.3)',
    badge: '🎁 FREE MONEY',
    badgeColor: '#f0c040',
  },
  {
    id: 'mines',
    title: 'Mines Challenge',
    subtitle: 'Find hidden gems. Avoid the mines. Multipliers grow with every safe cell!',
    cta: 'Play Mines →',
    to: '/games/mines',
    emoji: '💣',
    gradient: 'linear-gradient(135deg, #001a0a 0%, #00100a 50%, #001505 100%)',
    glow: 'rgba(0,229,122,0.2)',
    badge: '💎 NEW',
    badgeColor: '#4d9fff',
  },
];

export function PromoBanner() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>();

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setActive(a => (a + 1) % BANNERS.length);
      }, 4000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPaused]);

  const banner = BANNERS[active];

  return (
    <div className="relative rounded-2xl overflow-hidden cursor-pointer select-none"
      style={{ background: banner.gradient, minHeight: 140 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={() => navigate(banner.to)}>

      {/* Glow */}
      <div className="absolute inset-0 opacity-60" style={{ background: `radial-gradient(ellipse at 80% 50%, ${banner.glow} 0%, transparent 60%)` }} />

      {/* Stars/particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="absolute w-1 h-1 rounded-full bg-white opacity-20 animate-twinkle"
          style={{ left: `${Math.random() * 70}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`, animationDuration: `${2 + Math.random() * 3}s` }} />
      ))}

      <div className="relative z-10 flex items-center gap-4 p-5">
        {/* Emoji */}
        <div className="text-6xl shrink-0 animate-float">{banner.emoji}</div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          {banner.badge && (
            <span className="inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full mb-2 text-black"
              style={{ background: banner.badgeColor }}>
              {banner.badge}
            </span>
          )}
          <h3 className="font-display font-black text-white text-xl leading-tight">{banner.title}</h3>
          <p className="text-white/60 text-xs mt-1 leading-relaxed max-w-xs">{banner.subtitle}</p>
        </div>

        {/* CTA */}
        <div className="shrink-0">
          <div className="bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all">
            {banner.cta}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
        {!isPaused && (
          <div className="h-full bg-white/40 animate-progress" key={active}
            style={{ animation: 'progressBar 4s linear forwards' }} />
        )}
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 right-4 flex gap-1.5">
        {BANNERS.map((_, i) => (
          <button key={i} onClick={(e) => { e.stopPropagation(); setActive(i); }}
            className={clsx('w-1.5 h-1.5 rounded-full transition-all', i === active ? 'bg-white w-4' : 'bg-white/30')} />
        ))}
      </div>
    </div>
  );
}

// ── Live stats ticker ────────────────────────────────────────
interface LiveStat { label: string; value: string; icon: string; color: string; }

export function LiveStatsTicker() {
  const [stats, setStats] = useState<LiveStat[]>([
    { label: 'Total Won Today', value: 'KES 4.2M', icon: '🏆', color: 'text-gold' },
    { label: 'Active Players', value: '3,841', icon: '👥', color: 'text-blue' },
    { label: 'Biggest Win Today', value: '841x', icon: '🚀', color: 'text-green' },
    { label: 'Live Signals', value: '7 Active', icon: '📡', color: 'text-purple' },
    { label: 'Withdrawals Today', value: 'KES 1.8M', icon: '💸', color: 'text-green' },
    { label: 'New Members Today', value: '284', icon: '🌟', color: 'text-gold' },
  ]);

  useEffect(() => {
    const iv = setInterval(() => {
      setStats(prev => prev.map(s => {
        if (s.label === 'Active Players') {
          const n = parseInt(s.value.replace(/,/g, '')) + Math.floor((Math.random() - 0.3) * 5);
          return { ...s, value: n.toLocaleString() };
        }
        return s;
      }));
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="overflow-hidden">
      <div className="flex gap-6 animate-marquee-slow" style={{ animation: 'ticker 20s linear infinite' }}>
        {[...stats, ...stats].map((s, i) => (
          <div key={i} className="flex items-center gap-2.5 shrink-0 bg-card border border-border rounded-xl px-3 py-2">
            <span className="text-base">{s.icon}</span>
            <div>
              <p className={clsx('font-display font-bold text-sm leading-none', s.color)}>{s.value}</p>
              <p className="text-[10px] text-subtle mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mini game preview cards for dashboard ────────────────────
export function GamePreviews() {
  const navigate = useNavigate();
  const [activePlayers] = useState({
    aviator: 2841 + Math.floor(Math.random() * 50),
    mines: 1203,
    dice: 654,
    plinko: 876,
  });

  const games = [
    { name: 'Aviator', emoji: '✈️', to: '/games/aviator', players: activePlayers.aviator, tag: 'HOT', tagColor: 'bg-danger/80 text-white', gradient: 'from-violet-950 to-indigo-950', mult: '1000x max' },
    { name: 'Mines', emoji: '💣', to: '/games/mines', players: activePlayers.mines, tag: 'SKILL', tagColor: 'bg-green/80 text-black', gradient: 'from-emerald-950 to-slate-900', mult: 'Cash anytime' },
    { name: 'Plinko', emoji: '🎯', to: '/games/plinko', players: activePlayers.plinko, tag: 'FUN', tagColor: 'bg-blue/80 text-white', gradient: 'from-blue-950 to-slate-900', mult: 'Up to 110x' },
    { name: 'Dice', emoji: '🎲', to: '/games/dice', players: activePlayers.dice, tag: 'CLASSIC', tagColor: 'bg-gold/80 text-black', gradient: 'from-amber-950 to-slate-900', mult: 'Instant win' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {games.map(g => (
        <button key={g.name} onClick={() => navigate(g.to)}
          className={clsx('relative bg-gradient-to-br rounded-2xl border border-white/5 p-4 text-left hover:scale-[1.03] hover:border-white/10 transition-all duration-200 active:scale-95', g.gradient)}>
          <span className={clsx('absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full', g.tagColor)}>{g.tag}</span>
          <div className="text-3xl mb-2">{g.emoji}</div>
          <p className="font-display font-bold text-sm text-white">{g.name}</p>
          <p className="text-[10px] text-white/40 mt-0.5">{g.mult}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            <span className="text-[10px] text-white/40">{g.players.toLocaleString()}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

// ── CSS additions for animations ─────────────────────────────
export const bannerStyles = `
@keyframes progressBar {
  from { width: 0%; }
  to { width: 100%; }
}
@keyframes ticker {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-6px) rotate(3deg); }
}
@keyframes twinkle {
  0%, 100% { opacity: 0.1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.5); }
}
.animate-float { animation: float 3s ease-in-out infinite; }
.animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
`;
