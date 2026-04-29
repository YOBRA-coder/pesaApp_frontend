import { useState, useEffect, useRef, useCallback } from 'react';
import { useWallet } from '@/hooks/useApi';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { formatKES } from '@/utils/format';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Volume2, VolumeX, Plus, X } from 'lucide-react';
import clsx from 'clsx';

const WS_URL =  'ws://localhost:3000' + '/ws';

// ── Audio — cleanup on unmount ────────────────────────────────
class GameAudio {
  ctx: AudioContext | null = null;
  private activeNodes: AudioNode[] = [];

  init() {
    if (!this.ctx) {
      try { this.ctx = new AudioContext(); } catch {}
    }
    return this;
  }

  tone(f: number, d: number, v = 0.07, t: OscillatorType = 'sine') {
    if (!this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = t; o.frequency.value = f;
      g.gain.setValueAtTime(v, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + d);
      o.connect(g); g.connect(this.ctx.destination);
      this.activeNodes.push(o, g);
      o.start(); o.stop(this.ctx.currentTime + d);
      o.onended = () => { this.activeNodes = this.activeNodes.filter(n => n !== o && n !== g); };
    } catch {}
  }

  // Continuous engine hum during flight — returns stop function
  startEngineHum(): () => void {
    if (!this.ctx) return () => {};
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();

      o.type = 'sawtooth'; o.frequency.value = 80;
      lfo.type = 'sine'; lfo.frequency.value = 8;
      lfoGain.gain.value = 15;
      lfo.connect(lfoGain); lfoGain.connect(o.frequency);
      g.gain.value = 0.04;
      o.connect(g); g.connect(this.ctx.destination);

      o.start(); lfo.start();
      this.activeNodes.push(o, g, lfo, lfoGain);

      return () => {
        try {
          g.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + 0.3);
          o.stop(this.ctx!.currentTime + 0.3);
          lfo.stop(this.ctx!.currentTime + 0.3);
        } catch {}
        this.activeNodes = this.activeNodes.filter(n => n !== o && n !== g && n !== lfo && n !== lfoGain);
      };
    } catch { return () => {}; }
  }

  stopAll() {
    this.activeNodes.forEach(n => { try { (n as OscillatorNode).stop?.(); } catch {} });
    this.activeNodes = [];
    if (this.ctx) { try { this.ctx.close(); } catch {} this.ctx = null; }
  }

  bet() { this.tone(660, 0.08); }
  cashout() { this.tone(880, 0.1); setTimeout(() => this.tone(1100, 0.12, 0.06), 70); }
  crash() { this.tone(110, 0.45, 0.1, 'sawtooth'); setTimeout(() => this.tone(70, 0.6, 0.07, 'square'), 90); }
}

// ── Types ──────────────────────────────────────────────────────
interface BetSlot {
  id: 'A' | 'B';
  amount: string;
  autoCashout: string;
  placed: boolean;
  cashedOut: boolean;
  winAmount: number;
  loading: boolean;
}

interface LiveBet {
  id: string;
  display: string; // shortened phone/username
  amount: number;
  cashOutAt?: number;
  isMe: boolean;
}

interface RoundHistory { crashPoint: number; roundNumber: number; }

const defaultSlot = (id: 'A' | 'B'): BetSlot => ({
  id, amount: id === 'A' ? '100' : '200',
  autoCashout: '', placed: false, cashedOut: false, winAmount: 0, loading: false,
});

export default function AviatorPage() {
  const { data: wallet, refetch: refetchWallet } = useWallet();
  const accessToken = useAuthStore(s => s.accessToken);
  const currentUser = useAuthStore(s => s.user);

  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const animRef    = useRef<number>(0);
  const wsRef      = useRef<WebSocket | null>(null);
  const audioRef   = useRef(new GameAudio());
  const stopHumRef = useRef<(() => void) | null>(null);
  const historySet = useRef<Set<number>>(new Set());

  // All render-driving state in one ref — zero re-renders from canvas
  const R = useRef({
    phase: 'waiting' as 'waiting' | 'flying' | 'crashed',
    mult: 1.0,
    countdown: 5,
    trailPts: [] as { x: number; y: number }[],
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string; sz: number }[],
    stars: [] as { x: number; y: number; r: number; op: number; tw: number }[],
    clouds: [] as { x: number; y: number; w: number; h: number; sp: number; op: number }[],
    shake: 0,
    planeX: 350, planeY: 180,
    slotA: { placed: false, cashedOut: false },
    slotB: { placed: false, cashedOut: false },
  });

  // React state (only what JSX needs)
  const [phase, setPhase]         = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const [mult, setMult]           = useState(1.0);
  const [countdown, setCountdown] = useState(5);
  const [, setRoundId]     = useState<string | null>(null);
  const [history, setHistory]     = useState<RoundHistory[]>([]);
  const [liveBets, setLiveBets]   = useState<LiveBet[]>([]);
  const [slots, setSlots]         = useState<[BetSlot, BetSlot]>([defaultSlot('A'), defaultSlot('B')]);
  const [showSlotB, setShowSlotB] = useState(false);
  const [isConnected, setIsConn]  = useState(false);
  const [soundOn, setSoundOn]     = useState(true);
  const [showBal, setShowBal]     = useState(true);
  const [tab, setTab]             = useState<'bets' | 'myHistory' | 'stats'>('bets');
  const [myBets, setMyBets]       = useState<any[]>([]);

  // ── Helper: shorten phone/username for display ────────────
  const shortenDisplay = (phone: string, username?: string): string => {
    if (username && username !== phone) return username.slice(0, 8);
    // Show format: 07**1234
    if (phone && phone.length >= 8) {
      return phone.slice(0, 2) + '**' + phone.slice(-4);
    }
    return phone?.slice(0, 8) || 'Player';
  };

  // ── Init scene ────────────────────────────────────────────
  useEffect(() => {
    const W = 700, H = 360;
    R.current.stars  = Array.from({ length: 90 }, () => ({ x: Math.random() * W, y: Math.random() * H * 0.75, r: Math.random() * 1.4 + 0.3, op: Math.random() * 0.5 + 0.15, tw: Math.random() * Math.PI * 2 }));
    R.current.clouds = Array.from({ length: 7 }, () => ({ x: Math.random() * W, y: 20 + Math.random() * 130, w: 70 + Math.random() * 100, h: 18 + Math.random() * 25, sp: 0.15 + Math.random() * 0.3, op: 0.03 + Math.random() * 0.05 }));
  }, []);

  // ── Load history + my bets ────────────────────────────────
  useEffect(() => {
    api.get('/games/crash/history/global').then(r => {
      const data: any[] = r.data?.data || [];
      const items: RoundHistory[] = [];
      data.forEach(d => {
        const rn = Number(d.roundNumber);
        if (!historySet.current.has(rn)) {
          historySet.current.add(rn);
          items.push({ crashPoint: Number(d.crashPoint), roundNumber: rn });
        }
      });
      setHistory(items.slice(0, 50));
    }).catch(() => {
      api.get('/games/crash/round').then(r => {
        const hist: any[] = r.data?.data?.history || [];
        hist.forEach(d => historySet.current.add(Number(d.roundNumber)));
        setHistory(hist.map(d => ({ crashPoint: Number(d.crashPoint), roundNumber: Number(d.roundNumber) })));
      }).catch(() => {});
    });
    api.get('/games/crash/history').then(r => setMyBets(r.data?.data?.bets || [])).catch(() => {});
  }, []);

  // ── WebSocket ─────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) return;
    audioRef.current.init();
    let retryTimer: ReturnType<typeof setTimeout>;
    let delay = 1500;

    const connect = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      ws.onopen  = () => { setIsConn(true); delay = 1500; ws.send(JSON.stringify({ type: 'auth', token: accessToken })); };
      ws.onclose = () => { setIsConn(false); retryTimer = setTimeout(connect, delay); delay = Math.min(delay * 1.5, 10000); };
      ws.onerror = () => ws.close();
      ws.onmessage = e => { try { handleMsg(JSON.parse(e.data)); } catch {} };
    };
    connect();

    // ── CLEANUP: stop sound + canvas + ws on unmount ──────
    return () => {
      clearTimeout(retryTimer);
      wsRef.current?.close();
      cancelAnimationFrame(animRef.current);
      stopHumRef.current?.();       // stop engine hum
      audioRef.current.stopAll();  // stop all audio
    };
  }, [accessToken]);

  const handleMsg = useCallback((msg: any) => {
    const r = R.current;
    switch (msg.type) {

      case 'round_start': {
        // Stop engine hum from previous round
        stopHumRef.current?.();
        stopHumRef.current = null;

        r.phase = 'waiting'; r.mult = 1.0; r.countdown = msg.countdown ?? 5;
        r.trailPts = []; r.particles = []; r.shake = 0;
        r.slotA = { placed: false, cashedOut: false };
        r.slotB = { placed: false, cashedOut: false };

        setPhase('waiting'); setMult(1.0); setCountdown(r.countdown);
        setRoundId(msg.roundId);
        setSlots([defaultSlot('A'), defaultSlot('B')]);

        // Build live bets — show real users from server if sent
        const serverBets: any[] = msg.currentBets || [];
        const fakeBets: LiveBet[] = Array.from({ length: 4 + Math.floor(Math.random() * 5) }, (_, i) => ({
          id: `fake-${i}`,
          display: `07**${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
          amount: [50, 100, 200, 500, 1000, 2000][Math.floor(Math.random() * 6)],
          isMe: false,
        }));
        const realBets: LiveBet[] = serverBets.map((b: any) => ({
          id: b.userId,
          display: shortenDisplay(b.phone || '', b.username),
          amount: b.betAmount,
          cashOutAt: b.cashOutAt,
          isMe: b.userId === currentUser?.id,
        }));
        setLiveBets([...realBets, ...fakeBets].slice(0, 30));
        break;
      }

      case 'countdown':
        R.current.countdown = msg.seconds;
        setCountdown(msg.seconds);
        break;

      case 'round_flying':
        R.current.phase = 'flying'; R.current.mult = 1.0;
        setPhase('flying'); setMult(1.0);
        // Start engine hum
        if (soundOn) {
          stopHumRef.current?.();
          stopHumRef.current = audioRef.current.startEngineHum();
        }
        break;

      case 'multiplier':
        R.current.mult = msg.value;
        setMult(msg.value);
        // Simulate random cashouts
        if (Math.random() < 0.03) {
          setLiveBets(prev => {
            const idx = prev.findIndex(b => !b.cashOutAt && !b.isMe);
            if (idx < 0) return prev;
            const copy = [...prev];
            copy[idx] = { ...copy[idx], cashOutAt: parseFloat(msg.value.toFixed(2)) };
            return copy;
          });
        }
        break;

      case 'round_crashed': {
        const cp = msg.crashPoint;
        const rn = msg.roundNumber;

        // Stop engine hum
        stopHumRef.current?.();
        stopHumRef.current = null;

        R.current.phase = 'crashed'; R.current.mult = cp; R.current.shake = 20;

        // Deduplicated history
        if (rn && !historySet.current.has(rn)) {
          historySet.current.add(rn);
          setHistory(h => [{ crashPoint: cp, roundNumber: rn }, ...h].slice(0, 50));
        }
        setPhase('crashed'); setMult(cp);

        // Explosion particles
        const cx = R.current.planeX, cy = R.current.planeY;
        for (let i = 0; i < 55; i++) {
          const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 7;
          R.current.particles.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1, life: 1, color: ['#ff4d6a', '#f0c040', '#ff8c00', '#fff', '#ff6b35'][i % 5], sz: 3 + Math.random() * 5 });
        }
        if (soundOn) audioRef.current.crash();

        // Notify losing slots
        setSlots(prev => {
          const copy = [...prev] as [BetSlot, BetSlot];
          if (copy[0].placed && !copy[0].cashedOut) { toast.error(`Slot A: Lost at ${cp.toFixed(2)}x`); copy[0] = { ...copy[0], placed: false, loading: false }; R.current.slotA.placed = false; }
          if (copy[1].placed && !copy[1].cashedOut) { toast.error(`Slot B: Lost at ${cp.toFixed(2)}x`); copy[1] = { ...copy[1], placed: false, loading: false }; R.current.slotB.placed = false; }
          return copy;
        });

        refetchWallet();
        api.get('/games/crash/history').then(r2 => setMyBets(r2.data?.data?.bets || [])).catch(() => {});
        break;
      }

      case 'bet_placed': {
        const slot = msg.slot || 'A';
        if (slot === 'A') R.current.slotA.placed = true;
        else R.current.slotB.placed = true;
        setSlots(prev => {
          const copy = [...prev] as [BetSlot, BetSlot];
          const idx = slot === 'A' ? 0 : 1;
          copy[idx] = { ...copy[idx], placed: true, loading: false };
          return copy;
        });
        if (soundOn) audioRef.current.bet();
        // Add me to live bets
        const myDisplay = shortenDisplay(currentUser?.phone || '', currentUser?.username);
        setLiveBets(prev => [{ id: `me-${slot}`, display: `${myDisplay} (you)`, amount: parseFloat(slot === 'A' ? slots[0].amount : slots[1].amount), isMe: true }, ...prev.filter(b => !(b.isMe && b.id === `me-${slot}`))]);
        break;
      }

      case 'cashout_success': {
        const slot = msg.slot || 'A';
        if (slot === 'A') { R.current.slotA.cashedOut = true; R.current.slotA.placed = false; }
        else { R.current.slotB.cashedOut = true; R.current.slotB.placed = false; }
        setSlots(prev => {
          const copy = [...prev] as [BetSlot, BetSlot];
          const idx = slot === 'A' ? 0 : 1;
          copy[idx] = { ...copy[idx], placed: false, cashedOut: true, winAmount: msg.winAmount, loading: false };
          return copy;
        });
        if (soundOn) audioRef.current.cashout();
        if (!msg.auto) toast.success(`💰 Slot ${slot}: ${formatKES(msg.winAmount)} @ ${Number(msg.multiplier).toFixed(2)}x!`);
        setLiveBets(prev => prev.map(b => b.isMe && b.id === `me-${slot}` ? { ...b, cashOutAt: Number(msg.multiplier) } : b));
        refetchWallet();
        break;
      }

      case 'new_bet': {
        // Real user joined — server should send phone/username
        const display = msg.phone ? shortenDisplay(msg.phone, msg.username) : `07**${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
        setLiveBets(prev => [{ id: String(Date.now()), display, amount: msg.amount, isMe: false }, ...prev].slice(0, 35));
        break;
      }

      case 'player_cashout':
        setLiveBets(prev => {
          const idx = prev.findIndex(b => !b.cashOutAt && !b.isMe);
          if (idx < 0) return prev;
          const copy = [...prev];
          copy[idx] = { ...copy[idx], cashOutAt: parseFloat(msg.multiplier.toFixed(2)) };
          return copy;
        });
        break;

      case 'round_state':
        R.current.phase = msg.phase || 'waiting';
        R.current.mult = msg.multiplier || 1.0;
        setPhase(R.current.phase); setMult(R.current.mult);
        setRoundId(msg.roundId);
        // If rejoining a flying round, start hum
        if (msg.phase === 'flying' && soundOn && !stopHumRef.current) {
          stopHumRef.current = audioRef.current.startEngineHum();
        }
        break;

      case 'error': toast.error(msg.message); break;
    }
  }, [soundOn, currentUser, slots]);

  // ── Sound toggle — start/stop hum immediately ──────────────
  const toggleSound = () => {
    setSoundOn(prev => {
      const next = !prev;
      if (!next) { stopHumRef.current?.(); stopHumRef.current = null; }
      else if (R.current.phase === 'flying') {
        stopHumRef.current = audioRef.current.init().startEngineHum();
      }
      return next;
    });
  };

  // ── Canvas loop (starts once, never restarts) ─────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const loop = (now: number) => {
      animRef.current = requestAnimationFrame(loop);
      const { phase: ph, mult: m, clouds, stars, shake, trailPts, particles } = R.current;
      const W = canvas.width, H = canvas.height;

      if (shake > 0.1) { ctx.save(); ctx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake); R.current.shake *= 0.82; }
      ctx.clearRect(-20, -20, W + 40, H + 40);

      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#020514'); sky.addColorStop(.5, '#050920'); sky.addColorStop(1, '#060c1a');
      ctx.fillStyle = sky; ctx.fillRect(-20, -20, W + 40, H + 40);

      // Stars
      const t = now * .001;
      stars.forEach(s => { ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,255,255,${s.op * (0.6 + 0.4 * Math.sin(t * 1.8 + s.tw))})`; ctx.fill(); });

      // Clouds
      clouds.forEach(c => { c.x -= c.sp; if (c.x + c.w < 0) c.x = W + c.w; const cg = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.w * .6); cg.addColorStop(0, `rgba(80,130,255,${c.op * 2})`); cg.addColorStop(1, 'rgba(80,130,255,0)'); ctx.beginPath(); ctx.ellipse(c.x, c.y, c.w * .5, c.h * .5, 0, 0, Math.PI * 2); ctx.fillStyle = cg; ctx.fill(); });

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.022)'; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // Ground glow
      const gnd = ctx.createLinearGradient(0, H - 30, 0, H);
      gnd.addColorStop(0, ph === 'crashed' ? 'rgba(255,77,106,0.2)' : 'rgba(0,229,122,0.18)'); gnd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gnd; ctx.fillRect(0, H - 30, W, 30);

      if (ph !== 'waiting') {
        const prog = Math.min((m - 1) / 9, 1);
        const ex = 55 + prog * (W - 90), ey = (H - 42) - prog * (H - 90);

        // Fill
        const af = ctx.createLinearGradient(0, H - 42, 0, ey);
        af.addColorStop(0, ph === 'crashed' ? 'rgba(255,77,106,0.18)' : 'rgba(0,229,122,0.12)'); af.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.moveTo(55, H - 42); ctx.quadraticCurveTo(55, ey, ex, ey); ctx.lineTo(ex, H - 42); ctx.closePath(); ctx.fillStyle = af; ctx.fill();

        // Curve
        ctx.save(); ctx.shadowBlur = 14; ctx.shadowColor = ph === 'crashed' ? '#ff4d6a' : '#00e57a';
        ctx.beginPath(); ctx.moveTo(55, H - 42); ctx.quadraticCurveTo(55, ey, ex, ey);
        ctx.strokeStyle = ph === 'crashed' ? '#ff4d6a' : '#00e57a'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();

        // Trail
        trailPts.push({ x: ex, y: ey }); if (trailPts.length > 80) trailPts.shift();
        trailPts.forEach((p, i) => { const a = (i / trailPts.length) * .22; ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2); ctx.fillStyle = ph === 'crashed' ? `rgba(255,77,106,${a})` : `rgba(0,229,122,${a})`; ctx.fill(); });

        if (ph === 'flying') {
          R.current.planeX = ex; R.current.planeY = ey - 14;
          const ang = Math.atan2(ey - (H - 42), ex - 55) * 0.35;
          ctx.save(); ctx.translate(ex, ey - 14); ctx.rotate(-ang);
          // Afterburner
          const burn = ctx.createRadialGradient(-28, 0, 0, -28, 0, 22);
          burn.addColorStop(0, 'rgba(255,160,30,0.9)'); burn.addColorStop(.5, 'rgba(255,80,0,0.5)'); burn.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath(); ctx.ellipse(-32, 0, 18 + Math.random() * 5, 6, 0, 0, Math.PI * 2); ctx.fillStyle = burn; ctx.fill();
          ctx.shadowBlur = 14; ctx.shadowColor = 'rgba(0,200,255,0.5)';
          // Body
          ctx.beginPath(); ctx.moveTo(30, 0); ctx.bezierCurveTo(18, -5, -8, -5, -20, -2); ctx.lineTo(-20, 2); ctx.bezierCurveTo(-8, 5, 18, 5, 30, 0); ctx.fillStyle = '#d4eeff'; ctx.fill(); ctx.strokeStyle = '#8bbfdf'; ctx.lineWidth = 0.5; ctx.stroke();
          // Nose
          ctx.beginPath(); ctx.moveTo(30, 0); ctx.bezierCurveTo(36, -1.5, 38, 0, 36, 0); ctx.bezierCurveTo(38, 0, 36, 1.5, 30, 0); ctx.fillStyle = '#a0d8f8'; ctx.fill();
          // Wings
          ctx.beginPath(); ctx.moveTo(6, -2); ctx.lineTo(-2, -20); ctx.lineTo(-14, -18); ctx.lineTo(-9, -2); ctx.fillStyle = '#5a9fd4'; ctx.fill();
          ctx.beginPath(); ctx.moveTo(6, 2); ctx.lineTo(-2, 20); ctx.lineTo(-14, 18); ctx.lineTo(-9, 2); ctx.fillStyle = '#5a9fd4'; ctx.fill();
          // Tail
          ctx.beginPath(); ctx.moveTo(-16, -2); ctx.lineTo(-22, -12); ctx.lineTo(-20, -2); ctx.fillStyle = '#3a7ab4'; ctx.fill();
          // Window
          ctx.beginPath(); ctx.ellipse(14, -1, 5, 3.5, -0.15, 0, Math.PI * 2); ctx.fillStyle = 'rgba(120,210,255,0.65)'; ctx.strokeStyle = 'rgba(80,160,220,0.8)'; ctx.lineWidth = 0.5; ctx.fill(); ctx.stroke();
          ctx.restore();
          // Exhaust particles
          if (Math.random() < .35) R.current.particles.push({ x: ex - 24 * Math.cos(-ang), y: ey - 14 + 24 * Math.sin(-ang), vx: -1.2 + (Math.random() - .5) * .8, vy: (Math.random() - .5) * .8, life: 1, color: Math.random() < .5 ? '#ff8c00' : '#f0c040', sz: 2 + Math.random() * 3 });
        } else if (ph === 'crashed') {
          ctx.font = '36px serif'; ctx.fillText('💥', ex - 18, ey + 18);
        }
      }

      // Particles
      R.current.particles = particles.filter(p => p.life > 0.01);
      particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= 0.022; const a = Math.max(0, p.life); ctx.beginPath(); ctx.arc(p.x, p.y, p.sz * a, 0, Math.PI * 2); ctx.fillStyle = p.color + Math.floor(a * 255).toString(16).padStart(2, '0'); ctx.fill(); });

      // Multiplier
      if (ph !== 'waiting') {
        const mc = ph === 'crashed' ? '#ff4d6a' : m >= 10 ? '#f0c040' : m >= 3 ? '#00e57a' : '#fff';
        const fs = Math.min(72, 44 + m * 1.5);
        ctx.save(); ctx.font = `900 ${fs}px Syne,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowBlur = 28; ctx.shadowColor = mc; ctx.fillStyle = mc;
        ctx.fillText(`${m.toFixed(2)}x`, W / 2, H / 2 + 8);
        if (ph === 'crashed') { ctx.font = '500 13px DM Sans,sans-serif'; ctx.fillStyle = 'rgba(255,100,100,0.65)'; ctx.fillText('FLEW AWAY', W / 2, H / 2 + 46); }
        ctx.restore();
      }

      if (R.current.shake > 0.1) ctx.restore();
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // ── Actions ───────────────────────────────────────────────
  const placeBet = (idx: 0 | 1) => {
    const slot = slots[idx];
    const amt = parseFloat(slot.amount);
    if (!amt || amt < 10) return toast.error('Min bet KES 10');
    if (amt > Number(wallet?.balance || 0)) return toast.error('Insufficient balance');
    if (wsRef.current?.readyState !== WebSocket.OPEN) return toast.error('Not connected');
    if (R.current.phase === 'flying') return toast.error('Wait for next round to start');
    // Check the OTHER slot isn't also in a loading/placed state on same round
    // Both slots CAN be placed — this is the intended behavior
    const slotId = idx === 0 ? 'A' : 'B';
    if (idx === 0) R.current.slotA.placed = true;
    else R.current.slotB.placed = true;
    setSlots(prev => { const c = [...prev] as [BetSlot, BetSlot]; c[idx] = { ...c[idx], loading: true }; return c; });
    wsRef.current!.send(JSON.stringify({ type: 'bet', amount: amt, slot: slotId, autoCashout: slot.autoCashout ? parseFloat(slot.autoCashout) : undefined }));
  };

  const cashOut = (idx: 0 | 1) => {
    const s = slots[idx];
    if (!s.placed || s.cashedOut || R.current.phase !== 'flying') return;
    wsRef.current?.send(JSON.stringify({ type: 'cashout', slot: idx === 0 ? 'A' : 'B' }));
  };

  const updateSlot = (idx: 0 | 1, fields: Partial<BetSlot>) => {
    setSlots(prev => { const c = [...prev] as [BetSlot, BetSlot]; c[idx] = { ...c[idx], ...fields }; return c; });
  };

  const mc = phase === 'crashed' ? 'text-danger' : mult >= 10 ? 'text-gold' : mult >= 3 ? 'text-green' : 'text-white';

  // ── Slot renderer ─────────────────────────────────────────
  const renderSlot = (idx: 0 | 1) => {
    const s = slots[idx];
    const label = idx === 0 ? 'A' : 'B';
    const disabled = s.placed && !s.cashedOut;

    return (
      <div className={clsx('card space-y-3', idx === 1 && 'border-blue/20 bg-blue/3')}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted">BET SLOT {label}</span>
          {idx === 1 && <button onClick={() => setShowSlotB(false)} className="text-subtle hover:text-danger text-xs"><X size={12} /></button>}
        </div>

        <div>
          <label className="label text-[10px]">Amount (KES)</label>
          <input type="number" value={s.amount} onChange={e => updateSlot(idx, { amount: e.target.value })}
            className="input text-sm font-bold" min="10" disabled={disabled} />
          <div className="grid grid-cols-4 gap-1 mt-1.5">
            {[50, 100, 500, 1000].map(a => (
              <button key={a} onClick={() => updateSlot(idx, { amount: String(a) })} disabled={disabled}
                className="py-1 text-[10px] font-bold bg-card2 border border-border rounded-lg text-muted hover:text-white disabled:opacity-40">{a}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="label text-[10px]">Auto Cash Out (optional)</label>
          <input type="number" value={s.autoCashout} onChange={e => updateSlot(idx, { autoCashout: e.target.value })}
            className="input text-sm" placeholder="e.g. 2.00" step="0.1" min="1.01" disabled={disabled} />
          <div className="grid grid-cols-4 gap-1 mt-1">
            {[1.5, 2, 5, 10].map(v => (
              <button key={v} onClick={() => updateSlot(idx, { autoCashout: String(v) })} disabled={disabled}
                className="py-1 text-[10px] font-bold bg-card2 border border-border rounded-lg text-muted hover:text-white disabled:opacity-40">{v}x</button>
            ))}
          </div>
        </div>

        {!s.placed || s.cashedOut ? (
          <button onClick={() => placeBet(idx as 0 | 1)}
            disabled={s.loading || phase === 'flying' || !isConnected}
            className="w-full py-3.5 rounded-xl font-display font-black text-sm text-black transition-all disabled:opacity-50 active:scale-95"
            style={{ background: 'linear-gradient(135deg,#00e57a,#00c46a)', boxShadow: '0 4px 20px rgba(0,229,122,0.35)' }}>
            {s.loading ? '...' : phase === 'waiting' ? `✈️ BET ${label} — KES ${s.amount}` : '🔄 BET NEXT ROUND'}
          </button>
        ) : (
          <button onClick={() => cashOut(idx as 0 | 1)} disabled={phase !== 'flying'}
            className="w-full py-3.5 rounded-xl font-display font-black text-sm text-black transition-all disabled:opacity-60 active:scale-95"
            style={{ background: 'linear-gradient(135deg,#ff4d6a,#e03050)', boxShadow: '0 4px 24px rgba(255,77,106,0.45)', animation: phase === 'flying' ? 'glowPulse 1s infinite' : 'none' }}>
            💰 CASH OUT {label}<br />
            <span className="text-[11px] font-bold opacity-90">{formatKES(parseFloat(s.amount || '0') * mult)} @ {mult.toFixed(2)}x</span>
          </button>
        )}

        {s.cashedOut && <p className="text-center text-xs text-green font-bold">✅ Won {formatKES(s.winAmount)}</p>}
      </div>
    );
  };

  // Session stats
  const wonBets  = myBets.filter((b: any) => b.status === 'WON');
  const lostBets = myBets.filter((b: any) => b.status === 'LOST');
  const netPnl   = wonBets.reduce((a: number, b: any) => a + Number(b.winAmount) - Number(b.betAmount), 0)
                 - lostBets.reduce((a: number, b: any) => a + Number(b.betAmount), 0);

  return (
    <div className="flex flex-col gap-3 max-w-5xl mx-auto select-none">
      {/* Top bar */}
      <div className="flex items-center gap-2">
        <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${isConnected ? 'bg-green/10 border-green/20 text-green' : 'bg-danger/10 border-danger/20 text-danger'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green animate-pulse' : 'bg-danger'}`} />
          {isConnected ? 'Live' : 'Reconnecting...'}
        </div>

        {/* History — keyed by roundNumber, no dupes */}
        <div className="flex gap-1.5 overflow-x-auto flex-1 pb-0.5 scrollbar-thin">
          {history.map(h => (
            <span key={h.roundNumber}
              title={`Round #${h.roundNumber}`}
              className={clsx('shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full cursor-default hover:scale-105 transition-transform',
                h.crashPoint < 1.5 ? 'bg-danger/20 text-danger' : h.crashPoint < 3 ? 'bg-green/15 text-green' : h.crashPoint < 10 ? 'bg-blue/15 text-blue' : 'bg-gold/20 text-gold')}>
              {h.crashPoint.toFixed(2)}x
            </span>
          ))}
          {history.length === 0 && <span className="text-subtle text-xs py-1 px-2">Loading history...</span>}
        </div>

        <button onClick={toggleSound} className={`shrink-0 transition-all ${soundOn ? 'opacity-80 hover:opacity-100' : 'opacity-30 hover:opacity-60'}`}>
          {soundOn ? <Volume2 size={16} className="text-muted" /> : <VolumeX size={16} className="text-muted" />}
        </button>
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Canvas + tabs */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="relative rounded-2xl overflow-hidden border border-white/5" style={{ background: '#020514' }}>
            <canvas ref={canvasRef} width={700} height={360} className="w-full block" style={{ aspectRatio: '700/360' }} />

            {phase === 'waiting' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-6xl mb-3" style={{ animation: 'float 2s ease-in-out infinite' }}>✈️</div>
                  <p className="text-white/50 text-sm uppercase tracking-widest font-semibold mb-2">Next round in</p>
                  <p className="font-display font-black text-8xl text-white" style={{ textShadow: '0 0 60px rgba(0,229,122,0.3)' }}>{countdown}</p>
                  {(slots[0].placed || slots[1].placed) && (
                    <div className="mt-3 px-5 py-2 bg-green/20 border border-green/30 rounded-xl text-green text-sm font-bold animate-pulse">
                      ✅ Bet placed — ready to fly!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Win flash */}
            {phase === 'flying' && (slots[0].cashedOut || slots[1].cashedOut) && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none animate-bounce">
                <div className="bg-green text-black font-display font-black text-xl px-6 py-3 rounded-2xl" style={{ boxShadow: '0 0 40px rgba(0,229,122,0.7)' }}>
                  💰 +{formatKES((slots[0].winAmount || 0) + (slots[1].winAmount || 0))}
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="card p-0 overflow-hidden">
            <div className="flex border-b border-border">
              {[['bets', `🎮 Live (${liveBets.length})`], ['myHistory', '📋 My Bets'], ['stats', '📊 Stats']] .map(([id, lbl]) => (
                <button key={id} onClick={() => setTab(id as any)}
                  className={clsx('flex-1 py-2.5 text-xs font-semibold transition-all border-b-2', tab === id ? 'border-green text-green' : 'border-transparent text-subtle hover:text-muted')}>
                  {lbl}
                </button>
              ))}
            </div>
            <div className="max-h-40 overflow-y-auto p-3">
              {tab === 'bets' && (
                <div className="space-y-1">
                  {liveBets.length === 0 && <p className="text-subtle text-xs text-center py-3">No bets yet this round</p>}
                  {liveBets.map(b => (
                    <div key={b.id} className={clsx('flex items-center gap-3 text-xs py-1.5 px-2 rounded-lg', b.isMe && 'bg-green/5 border border-green/10')}>
                      <div className={clsx('w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0', b.isMe ? 'bg-green/20 text-green' : 'bg-white/8 text-muted')}>
                        {b.display.slice(0, 1).toUpperCase()}
                      </div>
                      <span className={clsx('font-medium flex-1 truncate', b.isMe ? 'text-green' : 'text-muted')}>{b.display}</span>
                      <span className="text-subtle shrink-0">{formatKES(b.amount)}</span>
                      {b.cashOutAt ? <span className="font-bold text-green shrink-0">{b.cashOutAt.toFixed(2)}x ✅</span> : <span className="text-gold/50 text-[10px] animate-pulse shrink-0">flying</span>}
                    </div>
                  ))}
                </div>
              )}
              {tab === 'myHistory' && (
                <div className="space-y-1">
                  {myBets.length === 0 && <p className="text-subtle text-xs text-center py-3">No bets yet</p>}
                  {myBets.slice(0, 15).map((b: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-xs py-1.5">
                      <span className="text-subtle w-4">{i + 1}</span>
                      <span className="text-muted">{formatKES(Number(b.betAmount))}</span>
                      {b.status === 'WON' ? <span className="text-green font-bold">✅ {Number(b.cashOutAt).toFixed(2)}x → {formatKES(Number(b.winAmount))}</span>
                        : b.status === 'LOST' ? <span className="text-danger font-bold">❌ Lost</span>
                        : <span className="text-gold">⏳ Pending</span>}
                    </div>
                  ))}
                </div>
              )}
              {tab === 'stats' && (
                <div className="grid grid-cols-4 gap-3 py-1">
                  {[{ l: 'Rounds', v: myBets.length }, { l: 'Won', v: wonBets.length, c: 'text-green' }, { l: 'Lost', v: lostBets.length, c: 'text-danger' }, { l: 'Net P&L', v: formatKES(netPnl), c: netPnl >= 0 ? 'text-green' : 'text-danger' }].map(s => (
                    <div key={s.l} className="text-center"><p className={clsx('font-display font-bold text-sm', (s as any).c || 'text-white')}>{s.v}</p><p className="text-[10px] text-subtle mt-0.5">{s.l}</p></div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full lg:w-64 flex flex-col gap-3 shrink-0">
          {/* Balance */}
          <div className="card flex items-center justify-between py-3">
            <div>
              <p className="text-[10px] text-subtle uppercase tracking-wider">Balance</p>
              <p className="font-display font-bold text-lg text-white">
                {showBal ? formatKES(Number(wallet?.balance || 0)) : 'KES ••••••'}
              </p>
            </div>
            <button onClick={() => setShowBal(s => !s)} className="text-subtle hover:text-muted transition-colors">
              {showBal ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {renderSlot(0)}

          {showSlotB ? renderSlot(1) : (
            <button onClick={() => setShowSlotB(true)}
              className="btn-ghost text-xs py-2.5 justify-center border-dashed hover:border-blue/40 hover:text-blue">
              <Plus size={13} /> Add Second Bet
            </button>
          )}

          {phase !== 'waiting' && (
            <div className="card text-center border"
              style={{ borderColor: phase === 'crashed' ? 'rgba(255,77,106,0.3)' : 'rgba(0,229,122,0.2)', background: phase === 'crashed' ? 'rgba(255,77,106,0.04)' : 'rgba(0,229,122,0.04)' }}>
              <p className="text-[10px] text-subtle uppercase tracking-widest mb-1">{phase === 'crashed' ? 'Crashed' : 'Multiplier'}</p>
              <p className={clsx('font-display font-black text-5xl', mc)}>{mult.toFixed(2)}x</p>
            </div>
          )}

          <div className="card text-xs space-y-1.5">
            {[['House edge', '5%'], ['Min / Max', 'KES 10 / 50,000'], ['Provably fair', '✅ HMAC-SHA256']].map(([k, v]) => (
              <div key={k} className="flex justify-between"><span className="text-subtle">{k}</span><span className="text-muted font-semibold">{v}</span></div>
            ))}
          </div>
          //verif
        </div>
      </div>
    </div>
  );
}