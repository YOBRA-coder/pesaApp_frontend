import { useState, useRef, useEffect, useCallback } from 'react';
import { useWallet } from '@/hooks/useApi';
import { formatKES } from '@/utils/format';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const ROWS = 12;
const MULTIPLIERS: Record<string, number[]> = {
  low:    [1.5, 1.2, 1.1, 1.0, 0.5, 0.3, 0.5, 1.0, 1.1, 1.2, 1.5],
  medium: [5.6, 2.1, 1.4, 1.1, 0.6, 0.3, 0.6, 1.1, 1.4, 2.1, 5.6],
  high:   [110, 41, 10, 5, 3, 0.5, 3, 5, 10, 41, 110],
};

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  done: boolean;
  slot?: number;
  color: string;
}

const COLORS = ['#00e57a','#4d9fff','#f0c040','#a855f7','#ff4d6a'];

export default function PlinkoPage() {
  const { data: wallet, refetch } = useWallet();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballsRef = useRef<Ball[]>([]);
  const animRef = useRef<number>(0);
  const ballIdRef = useRef(0);

  const [betAmount, setBetAmount] = useState('100');
  const [risk, setRisk] = useState<'low'|'medium'|'high'>('medium');
  const [lastSlot, setLastSlot] = useState<number | null>(null);
  const [lastMult, setLastMult] = useState<number | null>(null);
  const [dropping, setDropping] = useState(false);
  const [history, setHistory] = useState<{ mult: number; win: number }[]>([]);

  const W = 420, H = 480;
  const pegR = 5, ballR = 8;
  const rowSpacing = (H - 80) / (ROWS + 1);
  const colSpacing = W / (ROWS + 3);

  // Peg positions
  const pegs: { x: number; y: number }[] = [];
  for (let r = 0; r < ROWS; r++) {
    const cols = r + 3;
    const startX = W / 2 - (cols - 1) * colSpacing / 2;
    for (let c = 0; c < cols; c++) {
      pegs.push({ x: startX + c * colSpacing, y: 60 + (r + 1) * rowSpacing });
    }
  }

  // Slot positions
  const slots = MULTIPLIERS[risk];
  const slotW = W / slots.length;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#070b12';
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    // Pegs
    pegs.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, pegR, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff15';
      ctx.fill();
      ctx.strokeStyle = '#ffffff30';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Slots
    slots.forEach((m, i) => {
      const x = i * slotW;
      const isHigh = m >= 10;
      const isMed = m >= 2;
      const color = isHigh ? '#f0c040' : isMed ? '#00e57a' : m < 1 ? '#ff4d6a' : '#4d9fff';
      ctx.fillStyle = `${color}18`;
      ctx.fillRect(x + 2, H - 36, slotW - 4, 34);
      ctx.strokeStyle = `${color}40`;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 2, H - 36, slotW - 4, 34);
      ctx.fillStyle = color;
      ctx.font = `bold ${m >= 10 ? 9 : 10}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`${m}x`, x + slotW / 2, H - 14);
    });

    // Balls
    ballsRef.current.forEach(ball => {
      if (ball.done) return;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ballR, 0, Math.PI * 2);
      ctx.fillStyle = ball.color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = ball.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }, [pegs, slots, slotW]);

  const animate = useCallback(() => {
    const balls = ballsRef.current;
    balls.forEach(ball => {
      if (ball.done) return;
      ball.vy += 0.35; // gravity
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Peg collision
      pegs.forEach(peg => {
        const dx = ball.x - peg.x, dy = ball.y - peg.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < pegR + ballR + 1) {
          ball.vx = (Math.random() > 0.5 ? 1 : -1) * (1.5 + Math.random() * 0.5);
          ball.vy = Math.abs(ball.vy) * 0.3 + 1;
          ball.x = peg.x + (dx/dist) * (pegR + ballR + 2);
          ball.y = peg.y + (dy/dist) * (pegR + ballR + 2);
        }
      });

      // Walls
      if (ball.x < ballR) { ball.x = ballR; ball.vx = Math.abs(ball.vx); }
      if (ball.x > W - ballR) { ball.x = W - ballR; ball.vx = -Math.abs(ball.vx); }

      // Landed
      if (ball.y >= H - 36 - ballR) {
        ball.done = true;
        const slot = Math.min(slots.length - 1, Math.max(0, Math.floor(ball.x / slotW)));
        ball.slot = slot;
        const mult = slots[slot];
        const win = parseFloat(ball.betAmount||'100') * mult;
        setLastSlot(slot);
        setLastMult(mult);
        setHistory(h => [{ mult, win }, ...h].slice(0, 15));
        setDropping(false);
        refetch();
        if (mult >= 1) toast.success(`🎯 ${mult}x — Won ${formatKES(win)}!`);
        else toast.error(`🎯 ${mult}x — Lost ${formatKES(parseFloat(ball.betAmount||'100') * (1-mult))}`);
      }
    });

    draw();
    animRef.current = requestAnimationFrame(animate);
  }, [pegs, slots, slotW, refetch, draw]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);

  const dropBall = () => {
    const amt = parseFloat(betAmount);
    if (!amt || amt < 10) return toast.error('Min KES 10');
    if (amt > Number(wallet?.balance || 0)) return toast.error('Insufficient balance');
    setDropping(true);
    const ball: Ball & { betAmount?: string } = {
      id: ++ballIdRef.current,
      x: W / 2 + (Math.random() - 0.5) * 10,
      y: 20,
      vx: (Math.random() - 0.5) * 0.5,
      vy: 2,
      done: false,
      color: COLORS[ballIdRef.current % COLORS.length],
      betAmount,
    };
    (ball as any).betAmount = betAmount;
    ballsRef.current = [...ballsRef.current.filter(b => !b.done), ball];
  };

  const riskColors: Record<string, string> = { low: 'text-green', medium: 'text-gold', high: 'text-danger' };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🎯</span>
        <div>
          <h1 className="page-header">Plinko</h1>
          <p className="text-xs text-subtle">Drop the ball. Watch it bounce. Win big.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Canvas */}
        <div className="flex-1 card p-2 overflow-hidden">
          <canvas ref={canvasRef} width={W} height={H} className="w-full rounded-xl" style={{ aspectRatio: `${W}/${H}` }} />
          {lastMult !== null && (
            <div className="text-center mt-2">
              <span className={clsx('font-display font-black text-2xl', lastMult >= 5 ? 'text-gold' : lastMult >= 1 ? 'text-green' : 'text-danger')}>
                {lastMult}x
              </span>
              <span className="text-subtle text-xs ml-2">last drop</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="w-full lg:w-52 space-y-3 shrink-0">
          <div className="card space-y-3">
            <div>
              <label className="label text-[10px]">Risk Level</label>
              <div className="flex flex-col gap-1.5">
                {(['low','medium','high'] as const).map(r => (
                  <button key={r} onClick={() => setRisk(r)}
                    className={clsx('py-2 rounded-xl text-xs font-bold border capitalize transition-all',
                      risk === r ? `${riskColors[r]} border-current bg-current/10` : 'border-border text-muted hover:border-border2')}>
                    {r} risk {r === 'high' ? '⚠️' : r === 'medium' ? '⚡' : '🟢'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label text-[10px]">Bet (KES)</label>
              <input type="number" value={betAmount} onChange={e => setBetAmount(e.target.value)} className="input text-sm" />
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {[50,100,500].map(a => (
                  <button key={a} onClick={() => setBetAmount(String(a))}
                    className="px-2 py-1 text-[10px] bg-card2 border border-border rounded-lg text-muted hover:text-white">
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={dropBall} disabled={dropping}
              className="btn-primary w-full justify-center py-3 font-bold">
              {dropping ? '⏳ Dropping...' : '🎯 Drop Ball'}
            </button>
          </div>

          {/* History */}
          <div className="card p-3">
            <p className="text-[10px] text-subtle uppercase tracking-wider mb-2">History</p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className={clsx('font-bold', h.mult >= 5 ? 'text-gold' : h.mult >= 1 ? 'text-green' : 'text-danger')}>{h.mult}x</span>
                  <span className={h.win >= parseFloat(betAmount||'0') ? 'text-green' : 'text-danger'}>{formatKES(h.win)}</span>
                </div>
              ))}
              {history.length === 0 && <p className="text-subtle text-xs">Drop a ball to start</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
