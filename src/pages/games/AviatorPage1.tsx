import { useState, useEffect, useRef, useCallback } from 'react';
import { useWallet } from '@/hooks/useApi';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { formatKES } from '@/utils/format';
import toast from 'react-hot-toast';
import clsx from 'clsx';

//const WS_URL = (import.meta.env.VITE_WS_URL || 'ws://localhost:3000') + '/ws';
const WS_URL = 'ws://localhost:3000' + '/ws';

// ── Audio ─────────────────────────────────────────────────────
class GameAudio {
  private ctx: AudioContext | null = null;
  constructor() {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.ctx = new AudioContext();
    }
  }
  private tone(freq: number, dur: number, vol = 0.08, type: OscillatorType = 'sine') {
    if (!this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(); o.stop(this.ctx.currentTime + dur);
    } catch { }
  }
  bet() { this.tone(660, 0.08, 0.06); }
  tick() { this.tone(380 + Math.random() * 100, 0.04, 0.02); }
  cashout() { this.tone(880, 0.1, 0.09); setTimeout(() => this.tone(1100, 0.15, 0.07), 70); }
  crash() { this.tone(120, 0.4, 0.12, 'sawtooth'); setTimeout(() => this.tone(80, 0.6, 0.08, 'square'), 80); }
}

// ── Types ─────────────────────────────────────────────────────
interface RoundHistory { crashPoint: number; roundNumber: number; }
interface LiveBet { id: string; username: string; amount: number; cashOutAt?: number; }

const PLAYER_POOL = ['Kamau 🇰🇪', 'Wanjiku', 'Brian254', 'Omondi', 'GraceW', 'Njoro', 'Achieng', 'PeterK', 'Mary_M', 'John_K', 'Wafula', 'Adhiambo'];

export default function AviatorPage() {
  const { data: wallet, refetch: refetchWallet } = useWallet();
  const accessToken = useAuthStore(s => s.accessToken);

  // Refs that drive animation (no re-renders)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef(new GameAudio());

  // Mutable render state — updated from WS, read by canvas loop
  const stateRef = useRef({
    phase: 'waiting' as 'waiting' | 'flying' | 'crashed',
    mult: 1.0,
    countdown: 5,
    crashPoint: 0,
    planeX: 0,
    planeY: 0,
    trailPts: [] as { x: number; y: number }[],
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }[],
    stars: [] as { x: number; y: number; r: number; op: number; tw: number }[],
    clouds: [] as { x: number; y: number; w: number; h: number; sp: number; op: number }[],
    shake: 0,
    startTime: 0,
    betPlaced: false,
    cashedOut: false,
  });

  // React state (only what JSX needs)
  const [phase, setPhase] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const mult = useRef(1);
  const [countdown, setCountdown] = useState(5);
  const [, setRoundId] = useState<string | null>(null);
  const [history, setHistory] = useState<RoundHistory[]>([]);
  const [liveBets, setLiveBets] = useState<LiveBet[]>([]);
  const [betAmount, setBetAmount] = useState('100');
  const [autoCashout, setAutoCashout] = useState('');
  const [betPlaced, setBetPlaced] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [activeTab, setActiveTab] = useState<'bets' | 'myHistory' | 'stats'>('bets');
  const [myBets, setMyBets] = useState<any[]>([]);

  // Init stars/clouds once
  useEffect(() => {
    const W = 680, H = 340;
    stateRef.current.stars = Array.from({ length: 100 }, () => ({
      x: Math.random() * W, y: Math.random() * H * 0.75,
      r: Math.random() * 1.5 + 0.2, op: Math.random() * 0.5 + 0.15,
      tw: Math.random() * Math.PI * 2,
    }));
    stateRef.current.clouds = Array.from({ length: 6 }, () => ({
      x: Math.random() * W, y: 20 + Math.random() * 130,
      w: 70 + Math.random() * 100, h: 18 + Math.random() * 25,
      sp: 0.15 + Math.random() * 0.3, op: 0.03 + Math.random() * 0.05,
    }));
  }, []);

  // Load persistent history on mount
  useEffect(() => {
    api.get('/games/crash/history/global').then(r => {
      const data = r.data?.data || [];
      if (data.length) setHistory(data.map((d: any) => ({ crashPoint: Number(d.crashPoint), roundNumber: d.roundNumber })));
    }).catch(() => {
      // fallback: load from DB
      api.get('/games/crash/round').then(r => {
        const hist = r.data?.data?.history || [];
        setHistory(hist.map((d: any) => ({ crashPoint: Number(d.crashPoint), roundNumber: d.roundNumber })));
      }).catch(() => { });
    });
    api.get('/games/crash/history').then(r => setMyBets(r.data?.data?.bets || [])).catch(() => { });
  }, []);

  console.log('Game History' + history.map(p => p.crashPoint))
  // ── WebSocket ─────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) return;
    let retryTimer: ReturnType<typeof setTimeout>;
    let retryDelay = 1500;

    const connect = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        retryDelay = 1500;
        ws.send(JSON.stringify({ type: 'auth', token: accessToken }));
      };

      ws.onmessage = (e) => {
        try { handleMsg(JSON.parse(e.data)); } catch { }
      };

      ws.onclose = () => {
        setIsConnected(false);
        retryTimer = setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 1.5, 10000);
      };

      ws.onerror = () => ws.close();
    };

    connect();
    return () => {
      clearTimeout(retryTimer);
      wsRef.current?.close();
      cancelAnimationFrame(animRef.current);
    };
  }, [accessToken]);

  const handleMsg = useCallback((msg: any) => {
    const s = stateRef.current;

    switch (msg.type) {
      case 'round_start': {
        // Reset everything for new round
        s.phase = 'waiting';
        s.mult = 1.0;
        s.countdown = msg.countdown || 5;
        s.trailPts = [];
        s.particles = [];
        s.shake = 0;
        s.betPlaced = false;
        s.cashedOut = false;
        setPhase('waiting');
        //setMult(1.0);
        setCountdown(s.countdown);
        setRoundId(msg.roundId);
        setBetPlaced(false);
        setCashedOut(false);
        setWinAmount(0);
        setLiveBets([]);
        // Add some fake players
        const fakeBets: LiveBet[] = Array.from({ length: 3 + Math.floor(Math.random() * 5) }, (_, i) => ({
          id: `fake-${i}`,
          username: PLAYER_POOL[Math.floor(Math.random() * PLAYER_POOL.length)],
          amount: [50, 100, 200, 500, 1000, 2000][Math.floor(Math.random() * 6)],
        }));
        setLiveBets(fakeBets);
        break;
      }

      case 'countdown': {
        s.countdown = msg.seconds;
        setCountdown(msg.seconds);
        break;
      }

      case 'round_flying': {
        // ── THE FIX: set startTime here so multiplier grows from NOW ──
        s.phase = 'flying';
        s.startTime = performance.now();
        s.mult = 1.0;
        setPhase('flying');
        //setMult(1.0);
        break;
      }

      case 'multiplier': {
        // Server pushes live multiplier — use it directly
        s.mult = msg.value;
        //setMult(msg.value);

        // Sound tick
        if (soundOn && msg.value > 1.05 && Math.random() < 0.08) {
          audioRef.current.tick();
        }

        // Auto-cashout check
        const autoVal = parseFloat(autoCashout);
        if (s.betPlaced && !s.cashedOut && autoVal > 1 && msg.value >= autoVal) {
          sendCashout();
        }

        // Fake player cashouts
        if (Math.random() < 0.03) {
          setLiveBets(prev => {
            const idx = prev.findIndex(b => !b.cashOutAt);
            if (idx < 0) return prev;
            const copy = [...prev];
            copy[idx] = { ...copy[idx], cashOutAt: parseFloat(msg.value.toFixed(2)) };
            return copy;
          });
        }
        break;
      }

      case 'round_crashed': {
        s.phase = 'crashed';
        s.mult = msg.crashPoint;
        s.shake = 18;
        setPhase('crashed');
        //setMult(msg.crashPoint);

        // Spawn explosion
        const cx = s.planeX || 500, cy = s.planeY || 120;
        for (let i = 0; i < 50; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * 6;
          s.particles.push({
            x: cx, y: cy,
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            life: 1,
            color: ['#ff4d6a', '#f0c040', '#ff8c00', '#ffffff', '#ff6b35'][Math.floor(Math.random() * 5)],
            size: 3 + Math.random() * 5,
          });
        }

        if (soundOn) audioRef.current.crash();

        setHistory(h => [{ crashPoint: msg.crashPoint, roundNumber: msg.roundNumber || 0 }, ...h].slice(0, 50));

        if (s.betPlaced && !s.cashedOut) {
          toast.error(`💥 Flew away at ${msg.crashPoint.toFixed(2)}x!`);
          s.betPlaced = false;
          setBetPlaced(false);
        }

        refetchWallet();
        api.get('/games/crash/history').then(r => setMyBets(r.data?.data?.bets || [])).catch(() => { });
        break;
      }

      case 'bet_placed': {
        stateRef.current.betPlaced = true;
        if (soundOn) audioRef.current.bet();
        toast('Bet placed! ✅', { duration: 1500 });
        break;
      }

      case 'cashout_success': {
        stateRef.current.cashedOut = true;
        stateRef.current.betPlaced = false;
        setCashedOut(true);
        setBetPlaced(false);
        setWinAmount(msg.winAmount);
        if (soundOn) audioRef.current.cashout();
        if (!msg.auto) toast.success(`💰 ${formatKES(msg.winAmount)} @ ${Number(msg.multiplier).toFixed(2)}x!`);
        refetchWallet();
        break;
      }

      case 'new_bet': {
        const name = PLAYER_POOL[Math.floor(Math.random() * PLAYER_POOL.length)];
        setLiveBets(b => [{ id: String(Date.now()), username: name, amount: msg.amount }, ...b].slice(0, 30));
        break;
      }

      case 'round_state': {
        // Received on (re)connect — sync state
        s.phase = msg.phase || 'waiting';
        s.mult = msg.multiplier || 1.0;
        setPhase(s.phase);
        // setMult(s.mult);
        setRoundId(msg.roundId);
        if (msg.phase === 'flying') s.startTime = performance.now() - ((s.mult - 1) / 0.00019);
        break;
      }

      case 'error': {
        toast.error(msg.message);
        break;
      }
    }
  }, [soundOn, autoCashout, refetchWallet]);

  // ── Canvas render loop ─────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const loop = (now: number) => {
      animRef.current = requestAnimationFrame(loop);
      const s = stateRef.current;
      const W = canvas.width, H = canvas.height;
      console.log(mult);

      // ── Apply screen shake ────────────────────────────────
      if (s.shake > 0) {
        ctx.save();
        ctx.translate((Math.random() - 0.5) * s.shake, (Math.random() - 0.5) * s.shake);
        s.shake *= 0.83;
      }

      ctx.clearRect(-30, -30, W + 60, H + 60);

      // ── Sky gradient ──────────────────────────────────────
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#020514');
      sky.addColorStop(0.5, '#05091c');
      sky.addColorStop(1, '#060c1a');
      ctx.fillStyle = sky;
      ctx.fillRect(-30, -30, W + 60, H + 60);

      // ── Stars ─────────────────────────────────────────────
      const t = now * 0.001;
      s.stars.forEach(st => {
        const op = st.op * (0.6 + 0.4 * Math.sin(t * 1.8 + st.tw));
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${op})`;
        ctx.fill();
      });

      // ── Clouds ────────────────────────────────────────────
      s.clouds.forEach(c => {
        c.x -= c.sp;
        if (c.x + c.w < 0) c.x = W + c.w;
        const cg = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.w * 0.6);
        cg.addColorStop(0, `rgba(80,130,255,${c.op * 2})`);
        cg.addColorStop(1, 'rgba(80,130,255,0)');
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.w * 0.5, c.h * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = cg;
        ctx.fill();
      });

      // ── Grid ──────────────────────────────────────────────
      ctx.strokeStyle = 'rgba(255,255,255,0.02)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // Ground glow
      const gnd = ctx.createLinearGradient(0, H - 30, 0, H);
      const col = s.phase === 'crashed' ? '255,77,106' : '0,229,122';
      gnd.addColorStop(0, `rgba(${col},0.2)`);
      gnd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gnd;
      ctx.fillRect(0, H - 30, W, 30);

      // ── Curve + plane ─────────────────────────────────────
      if (s.phase !== 'waiting') {
        const m = s.mult;
        const prog = Math.min((m - 1) / 9, 1);

        // Curve endpoint
        const ex = 55 + prog * (W - 90);
        const ey = (H - 42) - prog * (H - 90);

        // Fill under curve
        const aFill = ctx.createLinearGradient(0, H - 42, 0, ey);
        aFill.addColorStop(0, s.phase === 'crashed' ? 'rgba(255,77,106,0.2)' : 'rgba(0,229,122,0.15)');
        aFill.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.moveTo(55, H - 42);
        ctx.quadraticCurveTo(55, ey, ex, ey);
        ctx.lineTo(ex, H - 42);
        ctx.closePath();
        ctx.fillStyle = aFill;
        ctx.fill();

        // Curve line
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = s.phase === 'crashed' ? '#ff4d6a' : '#00e57a';
        ctx.beginPath();
        ctx.moveTo(55, H - 42);
        ctx.quadraticCurveTo(55, ey, ex, ey);
        ctx.strokeStyle = s.phase === 'crashed' ? '#ff4d6a' : '#00e57a';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();

        // Trail
        s.trailPts.push({ x: ex, y: ey });
        if (s.trailPts.length > 80) s.trailPts.shift();
        s.trailPts.forEach((p, i) => {
          const a = (i / s.trailPts.length) * 0.25;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = s.phase === 'crashed' ? `rgba(255,77,106,${a})` : `rgba(0,229,122,${a})`;
          ctx.fill();
        });

        if (s.phase === 'flying') {
          // Store plane position
          s.planeX = ex;
          s.planeY = ey - 14;

          // Angle based on curve direction
          const angle = Math.atan2(ey - (H - 42), ex - 55) * 0.35;

          ctx.save();
          ctx.translate(ex, ey - 14);
          ctx.rotate(-angle);

          // Afterburner
          const burn = ctx.createRadialGradient(-24, 0, 0, -24, 0, 20);
          burn.addColorStop(0, 'rgba(255,160,30,0.9)');
          burn.addColorStop(0.5, 'rgba(255,80,0,0.5)');
          burn.addColorStop(1, 'rgba(255,80,0,0)');
          ctx.beginPath();
          ctx.ellipse(-30, 0, 18 + Math.random() * 4, 6, 0, 0, Math.PI * 2);
          ctx.fillStyle = burn;
          ctx.fill();

          // ── Plane body ────────────────────────────────────
          ctx.shadowBlur = 14;
          ctx.shadowColor = 'rgba(0,200,255,0.5)';

          // Fuselage
          ctx.beginPath();
          ctx.moveTo(30, 0);
          ctx.bezierCurveTo(18, -5, -8, -5, -20, -2);
          ctx.lineTo(-20, 2);
          ctx.bezierCurveTo(-8, 5, 18, 5, 30, 0);
          ctx.fillStyle = '#d4eeff';
          ctx.fill();
          ctx.strokeStyle = '#8bbfdf';
          ctx.lineWidth = 0.5;
          ctx.stroke();

          // Nose cone
          ctx.beginPath();
          ctx.moveTo(30, 0);
          ctx.bezierCurveTo(36, -1.5, 38, 0, 36, 0);
          ctx.bezierCurveTo(38, 0, 36, 1.5, 30, 0);
          ctx.fillStyle = '#a0d8f8';
          ctx.fill();

          // Main wing (top)
          ctx.beginPath();
          ctx.moveTo(6, -2); ctx.lineTo(-2, -20); ctx.lineTo(-14, -18); ctx.lineTo(-9, -2);
          ctx.fillStyle = '#5a9fd4';
          ctx.fill();

          // Main wing (bottom)
          ctx.beginPath();
          ctx.moveTo(6, 2); ctx.lineTo(-2, 20); ctx.lineTo(-14, 18); ctx.lineTo(-9, 2);
          ctx.fillStyle = '#5a9fd4';
          ctx.fill();

          // Tail fin
          ctx.beginPath();
          ctx.moveTo(-16, -2); ctx.lineTo(-22, -12); ctx.lineTo(-20, -2);
          ctx.fillStyle = '#3a7ab4';
          ctx.fill();

          // Cockpit window
          ctx.beginPath();
          ctx.ellipse(14, -1, 5, 3.5, -0.15, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(120,210,255,0.65)';
          ctx.strokeStyle = 'rgba(80,160,220,0.8)';
          ctx.lineWidth = 0.5;
          ctx.fill();
          ctx.stroke();

          // Red stripe
          ctx.beginPath();
          ctx.moveTo(20, -2); ctx.lineTo(-16, -2); ctx.lineTo(-16, 2); ctx.lineTo(20, 2);
          ctx.fillStyle = 'rgba(255,60,60,0.25)';
          ctx.fill();

          ctx.restore();

          // Engine exhaust particles
          if (Math.random() < 0.35) {
            s.particles.push({
              x: ex - 22 * Math.cos(-angle), y: ey - 14 + 22 * Math.sin(-angle),
              vx: -1.2 + (Math.random() - 0.5) * 0.8,
              vy: (Math.random() - 0.5) * 0.8,
              life: 1,
              color: Math.random() < 0.5 ? '#ff8c00' : '#f0c040',
              size: 2 + Math.random() * 3,
            });
          }
        } else if (s.phase === 'crashed') {
          ctx.font = '36px serif';
          ctx.fillText('💥', ex - 18, ey + 18);
        }
      }

      // ── Particles ─────────────────────────────────────────
      s.particles = s.particles.filter(p => p.life > 0.01);
      s.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= 0.022;
        const a = Math.max(0, p.life);
        const hex = Math.floor(a * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2);
        ctx.fillStyle = p.color + hex;
        ctx.fill();
      });

      // ── Multiplier text ───────────────────────────────────
      if (s.phase !== 'waiting') {
        const m = s.mult;
        const mColor = s.phase === 'crashed' ? '#ff4d6a' : m >= 10 ? '#f0c040' : m >= 3 ? '#00e57a' : '#ffffff';
        const fs = Math.min(72, 44 + m * 1.5);
        ctx.save();
        ctx.font = `900 ${fs}px 'Syne', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 30;
        ctx.shadowColor = mColor;
        ctx.fillStyle = mColor;
        ctx.fillText(`${m.toFixed(2)}x`, W / 2, H / 2 + 10);
        if (s.phase === 'crashed') {
          ctx.font = '500 13px "DM Sans", sans-serif';
          ctx.fillStyle = 'rgba(255,100,100,0.7)';
          ctx.fillText('FLEW AWAY', W / 2, H / 2 + 46);
        }
        ctx.restore();
      }

      if (s.shake > 0.1) ctx.restore();
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, []); // no deps — reads from stateRef only

  // ── Actions ───────────────────────────────────────────────
  const sendCashout = useCallback(() => {
    if (!stateRef.current.betPlaced || stateRef.current.cashedOut) return;
    wsRef.current?.send(JSON.stringify({ type: 'cashout' }));
  }, []);

  const placeBet = () => {
    const amt = parseFloat(betAmount);
    if (!amt || amt < 10) return toast.error('Minimum bet KES 10');
    if (amt > Number(wallet?.balance || 0)) return toast.error('Insufficient balance');
    if (wsRef.current?.readyState !== WebSocket.OPEN) return toast.error('Connecting...');
    if (stateRef.current.phase === 'flying') return toast.error('Wait for next round');

    setBetPlaced(true);
    stateRef.current.betPlaced = true;
    wsRef.current!.send(JSON.stringify({
      type: 'bet',
      amount: amt,
      autoCashout: autoCashout ? parseFloat(autoCashout) : undefined,
    }));
  };

  const cashOut = () => sendCashout();

  // Mult color for JSX elements
  //const mc = phase === 'crashed' ? 'text-danger' : mult >= 10 ? 'text-gold' : mult >= 3 ? 'text-green' : 'text-white';

  return (
    <div className="flex flex-col gap-3 max-w-5xl mx-auto select-none">
      {/* History bar */}
      <div className="flex items-center gap-2">
        <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${isConnected ? 'bg-green/10 border-green/20 text-green' : 'bg-danger/10 border-danger/20 text-danger'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green animate-pulse' : 'bg-danger'}`} />
          {isConnected ? 'Live' : 'Reconnecting...'}
        </div>
        <div className="flex gap-1.5 overflow-x-auto flex-1 pb-0.5 scrollbar-thin">
          {history.map((h, i) => (
            <span key={i} className={clsx('shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full cursor-default transition-all hover:scale-105',
              h.crashPoint < 1.5 ? 'bg-danger/20 text-danger' : h.crashPoint < 3 ? 'bg-green/15 text-green' : h.crashPoint < 10 ? 'bg-blue/15 text-blue' : 'bg-gold/20 text-gold')}>
              {h.crashPoint.toFixed(2)}x
            </span>
          ))}
          {history.length === 0 && <span className="text-subtle text-xs py-1">Loading history...</span>}
        </div>
        <button onClick={() => setSoundOn(s => !s)} className={`shrink-0 text-lg transition-all ${soundOn ? 'opacity-70 hover:opacity-100' : 'opacity-30 hover:opacity-60'}`} title="Toggle sound">
          {soundOn ? '🔊' : '🔇'}
        </button>
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Canvas section */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Game canvas */}
          <div className="relative rounded-2xl overflow-hidden border border-white/5" style={{ background: '#020514' }}>
            <canvas ref={canvasRef} width={680} height={340} className="w-full block" style={{ aspectRatio: '680/340' }} />

            {/* Waiting overlay */}
            {phase === 'waiting' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-6xl mb-3" style={{ animation: 'float 2s ease-in-out infinite' }}>✈️</div>
                  <p className="text-white/50 text-sm uppercase tracking-widest font-semibold mb-2">Next round in</p>
                  <p className="font-display font-black text-8xl text-white" style={{ textShadow: '0 0 60px rgba(0,229,122,0.3)' }}>
                    {countdown}
                  </p>
                  {betPlaced && (
                    <div className="mt-4 px-5 py-2 bg-green/20 border border-green/30 rounded-xl text-green text-sm font-bold animate-pulse">
                      ✅ Bet KES {betAmount} placed — ready to fly!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cashout flash */}
            {cashedOut && phase === 'flying' && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="bg-green text-black font-display font-black text-xl px-6 py-3 rounded-2xl shadow-2xl"
                  style={{ boxShadow: '0 0 40px rgba(0,229,122,0.7)' }}>
                  💰 +{formatKES(winAmount)}
                </div>
              </div>
            )}
          </div>

          {/* Bets / History tabs */}
          <div className="card p-0 overflow-hidden">
            <div className="flex border-b border-border">
              {([['bets', `🎮 Live (${liveBets.length})`], ['myHistory', '📋 My Bets'], ['stats', '📊 Stats']] as const).map(([id, label]) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={clsx('flex-1 py-2.5 text-xs font-semibold transition-all border-b-2',
                    activeTab === id ? 'border-green text-green' : 'border-transparent text-subtle hover:text-muted')}>
                  {label}
                </button>
              ))}
            </div>
            <div className="max-h-36 overflow-y-auto p-3">
              {activeTab === 'bets' && (
                <div className="space-y-1">
                  {liveBets.length === 0 && <p className="text-subtle text-xs text-center py-3">No bets yet this round</p>}
                  {liveBets.map(b => (
                    <div key={b.id} className="flex items-center gap-3 text-xs py-1 px-2 rounded-lg hover:bg-white/3 transition-all">
                      <div className="w-5 h-5 rounded-full bg-green/20 flex items-center justify-center text-[9px] font-bold text-green shrink-0">{b.username[0]}</div>
                      <span className="text-muted font-medium truncate">{b.username}</span>
                      <span className="text-subtle shrink-0">{formatKES(b.amount)}</span>
                      <div className="flex-1" />
                      {b.cashOutAt ? <span className="font-bold text-green shrink-0">{b.cashOutAt.toFixed(2)}x ✅</span> : <span className="text-gold/50 text-[10px] animate-pulse shrink-0">flying</span>}
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'myHistory' && (
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
              {activeTab === 'stats' && (() => {
                const won = myBets.filter((b: any) => b.status === 'WON');
                const lost = myBets.filter((b: any) => b.status === 'LOST');
                const netPnl = won.reduce((a: number, b: any) => a + Number(b.winAmount) - Number(b.betAmount), 0) - lost.reduce((a: number, b: any) => a + Number(b.betAmount), 0);
                return (
                  <div className="grid grid-cols-4 gap-3 py-1">
                    {[
                      { label: 'Rounds', value: myBets.length },
                      { label: 'Won', value: won.length, c: 'text-green' },
                      { label: 'Lost', value: lost.length, c: 'text-danger' },
                      { label: 'Net P&L', value: formatKES(netPnl), c: netPnl >= 0 ? 'text-green' : 'text-danger' },
                    ].map(s => (
                      <div key={s.label} className="text-center">
                        <p className={clsx('font-display font-bold text-base leading-none', s.c || 'text-white')}>{s.value}</p>
                        <p className="text-[10px] text-subtle mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full lg:w-60 flex flex-col gap-3 shrink-0">
          <div className="card space-y-4">
            <div className="flex justify-between items-center">
              <p className="section-title text-sm">Bet</p>
              <span className="text-[11px] text-muted">{formatKES(Number(wallet?.balance || 0))}</span>
            </div>

            <div>
              <label className="label text-[10px]">Amount (KES)</label>
              <input type="number" value={betAmount} onChange={e => setBetAmount(e.target.value)}
                className="input text-sm font-bold" min="10" disabled={betPlaced && !cashedOut} />
              <div className="grid grid-cols-4 gap-1 mt-1.5">
                {[50, 100, 500, 1000].map(a => (
                  <button key={a} onClick={() => setBetAmount(String(a))} disabled={betPlaced && !cashedOut}
                    className="py-1.5 text-[10px] font-bold bg-card2 border border-border rounded-lg text-muted hover:text-white hover:border-border2 disabled:opacity-40 transition-all">
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label text-[10px]">Auto Cash Out</label>
              <input type="number" value={autoCashout} onChange={e => setAutoCashout(e.target.value)}
                className="input text-sm" placeholder="e.g. 2.00" step="0.1" min="1.01"
                disabled={betPlaced && !cashedOut} />
              <div className="grid grid-cols-4 gap-1 mt-1.5">
                {[1.5, 2, 5, 10].map(v => (
                  <button key={v} onClick={() => setAutoCashout(String(v))} disabled={betPlaced && !cashedOut}
                    className="py-1.5 text-[10px] font-bold bg-card2 border border-border rounded-lg text-muted hover:text-white disabled:opacity-40 transition-all">
                    {v}x
                  </button>
                ))}
              </div>
            </div>

            {/* Action button */}
            {(!betPlaced || cashedOut) ? (
              <button onClick={placeBet} disabled={phase === 'flying' || !isConnected}
                className="w-full py-4 rounded-xl font-display font-black text-base text-black transition-all disabled:opacity-50 active:scale-95"
                style={{ background: 'linear-gradient(135deg,#00e57a,#00c46a)', boxShadow: '0 4px 20px rgba(0,229,122,0.4)' }}>
                {phase === 'waiting' ? `✈️ BET — KES ${betAmount}` : '🔄 NEXT ROUND'}
              </button>
            ) : (
              <button onClick={cashOut} disabled={phase !== 'flying'}
                className="w-full py-4 rounded-xl font-display font-black text-sm text-black transition-all disabled:opacity-60 active:scale-95"
                style={{ background: 'linear-gradient(135deg,#ff4d6a,#e03050)', boxShadow: '0 4px 24px rgba(255,77,106,0.5)', animation: phase === 'flying' ? 'glowPulse 1s infinite' : 'none' }}>
                💰 CASH OUT<br />
              </button>
            )}
          </div>



          {/* Info */}
          <div className="card text-xs space-y-1.5">
            {[['House edge', '5%'], ['Min bet', 'KES 10'], ['Max bet', 'KES 50,000'], ['Provably fair', '✅ HMAC-SHA256']].map(([k, v]) => (
              <div key={k} className="flex justify-between"><span className="text-subtle">{k}</span><span className="text-muted font-semibold">{v}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
