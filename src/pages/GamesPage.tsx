import { useNavigate } from 'react-router-dom';
import { Gamepad2, TrendingUp, Zap, Star } from 'lucide-react';
import clsx from 'clsx';

const GAMES = [
  {
    name: 'Aviator',
    emoji: '✈️',
    desc: 'Cash out before the plane flies away. Up to 1000x.',
    tag: 'HOT',
    tagColor: 'bg-danger/80 text-white',
    to: '/games/aviator',
    bg: 'from-violet-950 via-indigo-950 to-slate-900',
    border: 'border-violet-700/30',
    players: '2,841 playing',
    featured: true,
  },
  {
    name: 'Mines',
    emoji: '💣',
    desc: 'Find hidden gems. Avoid mines. Cash out anytime.',
    tag: 'SKILL',
    tagColor: 'bg-green/80 text-black',
    to: '/games/mines',
    bg: 'from-emerald-950 to-slate-900',
    border: 'border-emerald-700/30',
    players: '1,203 playing',
  },
  {
    name: 'Plinko',
    emoji: '🎯',
    desc: 'Drop the ball. Watch it bounce through pegs.',
    tag: 'NEW',
    tagColor: 'bg-blue/80 text-white',
    to: '/games/plinko',
    bg: 'from-blue-950 to-slate-900',
    border: 'border-blue-700/30',
    players: '876 playing',
  },
  {
    name: 'Dice',
    emoji: '🎲',
    desc: 'Roll over or under. Instant results. Max 98% win.',
    tag: 'CLASSIC',
    tagColor: 'bg-gold/80 text-black',
    to: '/games/dice',
    bg: 'from-amber-950 to-slate-900',
    border: 'border-amber-700/30',
    players: '654 playing',
  },
  {
    name: 'Lucky Wheel',
    emoji: '🎡',
    desc: 'Spin to win. Free daily spin for all users.',
    tag: 'FREE SPIN',
    tagColor: 'bg-purple/80 text-white',
    to: '/games/wheel',
    bg: 'from-purple-950 to-slate-900',
    border: 'border-purple-700/30',
    players: '3,120 played today',
    comingSoon: true,
  },
  {
    name: 'Keno',
    emoji: '🔢',
    desc: 'Pick your numbers. Match more, win more.',
    tag: 'SOON',
    tagColor: 'bg-white/20 text-white',
    to: '/games',
    bg: 'from-rose-950 to-slate-900',
    border: 'border-rose-700/30',
    players: 'Coming soon',
    comingSoon: true,
  },
];

const STATS = [
  { label: 'Total Won Today', value: 'KES 4.2M', icon: '🏆', color: 'text-gold' },
  { label: 'Active Players', value: '8,940', icon: '👥', color: 'text-blue' },
  { label: 'Biggest Win', value: '841x', icon: '🚀', color: 'text-green' },
];

export default function GamesPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gamepad2 size={22} className="text-green" />
          <h1 className="page-header">Games</h1>
        </div>
        <div className="flex items-center gap-1.5 bg-green/10 border border-green/20 rounded-full px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
          <span className="text-green text-xs font-semibold">Live</span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {STATS.map(s => (
          <div key={s.label} className="card text-center py-3">
            <div className="text-xl mb-1">{s.icon}</div>
            <p className={clsx('font-display font-bold text-lg', s.color)}>{s.value}</p>
            <p className="text-[10px] text-subtle mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Featured game */}
      {GAMES.filter(g => g.featured).map(g => (
        <button key={g.name} onClick={() => navigate(g.to)}
          className={clsx('w-full text-left bg-gradient-to-br rounded-2xl border p-6 relative overflow-hidden hover:scale-[1.01] transition-all duration-200', g.bg, g.border)}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(124,58,237,0.4), transparent 60%)' }} />
          <div className="relative z-10 flex items-center gap-4">
            <span className="text-6xl">{g.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display font-black text-2xl text-white">{g.name}</h2>
                <span className={clsx('text-[10px] font-black px-2.5 py-1 rounded-full', g.tagColor)}>{g.tag}</span>
              </div>
              <p className="text-white/60 text-sm">{g.desc}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="w-2 h-2 bg-green rounded-full animate-pulse" />
                <span className="text-green text-xs font-semibold">{g.players}</span>
              </div>
            </div>
            <div className="shrink-0">
              <span className="btn-primary text-sm py-2.5 px-5">Play Now →</span>
            </div>
          </div>
        </button>
      ))}

      {/* Game grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAMES.filter(g => !g.featured).map(g => (
          <button key={g.name} onClick={() => !g.comingSoon && navigate(g.to)}
            className={clsx('text-left bg-gradient-to-br rounded-2xl border p-5 relative overflow-hidden transition-all duration-200',
              g.bg, g.border,
              g.comingSoon ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02] hover:brightness-110')}>
            {g.comingSoon && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl z-20">
                <span className="text-white/70 text-sm font-bold">Coming Soon</span>
              </div>
            )}
            <div className="flex items-start justify-between mb-3">
              <span className="text-4xl">{g.emoji}</span>
              <span className={clsx('text-[10px] font-black px-2 py-0.5 rounded-full', g.tagColor)}>{g.tag}</span>
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-1">{g.name}</h3>
            <p className="text-white/50 text-xs leading-relaxed">{g.desc}</p>
            <div className="flex items-center gap-1.5 mt-3">
              <span className="w-1.5 h-1.5 bg-green/60 rounded-full" />
              <span className="text-white/40 text-[10px]">{g.players}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Responsible gaming */}
      <div className="card bg-gradient-to-r from-white/3 to-transparent border-white/5 text-center py-4">
        <p className="text-xs text-subtle">
          🔒 All games are <span className="text-white">provably fair</span> · 5% house edge ·
          <span className="text-white"> 18+ only</span> · Play responsibly ·
          <button className="text-green hover:underline ml-1">Problem Gambling Help</button>
        </p>
      </div>
    </div>
  );
}
