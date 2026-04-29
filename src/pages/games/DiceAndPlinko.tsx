// ═══════════════════════════════════════════════════════════════
// DicePage.tsx — Real backend dice game
// ═══════════════════════════════════════════════════════════════
import { useState, useCallback } from 'react';
import { useWallet } from '@/hooks/useApi';
import { api } from '@/services/api';
import { formatKES } from '@/utils/format';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

function calcDiceMult(target: number, mode: 'OVER' | 'UNDER') {
  const winChance = mode === 'OVER' ? (100 - target) : target;
  return parseFloat(((100 / winChance) * 0.97).toFixed(4));
}

export function DicePage() {
  const { data: wallet, refetch } = useWallet();
  const [bet, setBet] = useState('100');
  const [target, setTarget] = useState(50);
  const [mode, setMode] = useState<'OVER' | 'UNDER'>('OVER');
  const [rolling, setRolling] = useState(false);
  const [animRoll, setAnimRoll] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);
  const [history, setHistory] = useState<{ roll: number; won: boolean; mult: number; pnl: number }[]>([]);
  const [sessionStats, setSessionStats] = useState({ wins: 0, losses: 0, pnl: 0 });

  const mult = calcDiceMult(target, mode);
  const winChance = mode === 'OVER' ? (100 - target) : target;
  const potentialWin = parseFloat(bet || '0') * mult;

  const roll = useCallback(async () => {
    const amt = parseFloat(bet);
    if (!amt || amt < 10) return toast.error('Min bet KES 10');
    if (amt > Number(wallet?.balance || 0)) return toast.error('Insufficient balance');

    setRolling(true);
    setAnimRoll(null);

    // Animate fake rolls
    let ticks = 0;
    const anim = setInterval(() => {
      setAnimRoll(Math.floor(Math.random() * 100) + 1);
      if (++ticks >= 12) clearInterval(anim);
    }, 50);

    try {
      const res = await api.post('/games/dice/roll', { betAmount: amt, target, mode });
      const data = res.data.data;

      setTimeout(() => {
        setAnimRoll(data.roll);
        setLastResult(data);
        setHistory(h => [{ roll: data.roll, won: data.won, mult: data.multiplier, pnl: data.pnl }, ...h].slice(0, 25));
        setSessionStats(s => ({
          wins: s.wins + (data.won ? 1 : 0),
          losses: s.losses + (data.won ? 0 : 1),
          pnl: s.pnl + data.pnl,
        }));
        refetch();
        if (data.won) toast.success(`🎲 ${data.roll} — Won ${formatKES(data.winAmount)}!`);
        else toast.error(`🎲 ${data.roll} — Lost ${formatKES(amt)}`);
        setRolling(false);
      }, 700);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Roll failed');
      setRolling(false);
    }
  }, [bet, target, mode, wallet, refetch]);

  const rollColor = lastResult ? (lastResult.won ? '#00e57a' : '#ff4d6a') : 'rgba(255,255,255,0.2)';

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🎲</span>
        <div>
          <h1 className="page-header">Dice</h1>
          <p className="text-xs text-subtle">Roll over or under. Instant, provably fair results.</p>
        </div>
      </div>

      {/* Dice display */}
      <div className="card text-center py-8 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(0,229,122,0.04), transparent 70%)' }} />
        <div className="font-display font-black relative z-10" style={{ fontSize: 96, color: rollColor, textShadow: `0 0 40px ${rollColor}40`, lineHeight: 1 }}>
          {animRoll !== null ? String(animRoll).padStart(2, '0') : '??'}
        </div>
        {lastResult && (
          <p className="text-sm font-semibold mt-2 relative z-10" style={{ color: rollColor }}>
            {lastResult.won ? `✅ WIN +${formatKES(Math.abs(lastResult.pnl))}` : `❌ LOSS -${formatKES(Math.abs(lastResult.pnl))}`}
          </p>
        )}

        {/* Roll track */}
        <div className="mt-5 mx-auto max-w-sm relative h-10 bg-card2 rounded-full overflow-hidden border border-border">
          <div className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${mode === 'UNDER' ? target : 100 - target}%`, background: 'linear-gradient(90deg,#00e57a22,#00e57a44)', borderRight: '2px solid #00e57a' }} />
          <div className="absolute inset-y-0 flex items-center text-[10px] font-bold px-3 text-subtle w-full justify-between">
            <span>1</span><span>50</span><span>100</span>
          </div>
          {animRoll !== null && (
            <div className="absolute top-1 bottom-1 w-8 flex items-center justify-center rounded-full text-xs font-bold transition-all duration-300"
              style={{ left: `calc(${animRoll}% - 16px)`, background: rollColor, color: '#000' }}>
              {animRoll}
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Controls */}
        <div className="card space-y-4">
          <div className="flex gap-2">
            {(['UNDER','OVER'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={clsx('flex-1 py-2.5 rounded-xl text-sm font-bold border capitalize transition-all',
                  mode === m ? (m === 'OVER' ? 'bg-green/10 border-green/40 text-green' : 'bg-danger/10 border-danger/40 text-danger') : 'border-border text-muted hover:border-border2')}>
                Roll {m.toLowerCase()} {mode === m && (m === 'OVER' ? '▲' : '▼')}
              </button>
            ))}
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="label text-[10px]">Target: {target}</label>
              <span className="text-[10px] text-subtle">{winChance}% win chance</span>
            </div>
            <input type="range" min="2" max="98" value={target} onChange={e => setTarget(Number(e.target.value))} className="w-full accent-green" />
          </div>

          <div>
            <label className="label text-[10px]">Bet (KES)</label>
            <input type="number" value={bet} onChange={e => setBet(e.target.value)} className="input text-sm" />
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {[50,100,500,1000].map(a => (
                <button key={a} onClick={() => setBet(String(a))} className="px-2 py-1 text-[10px] bg-card2 border border-border rounded-lg text-muted hover:text-white">{a}</button>
              ))}
              <button onClick={() => setBet(b => String(Math.max(10, Math.floor(parseFloat(b||'10')/2))))} className="px-2 py-1 text-[10px] bg-card2 border border-border rounded-lg text-muted hover:text-white">½</button>
              <button onClick={() => setBet(b => String(Math.min(parseFloat(b||'100')*2, Number(wallet?.balance||0))))} className="px-2 py-1 text-[10px] bg-card2 border border-border rounded-lg text-muted hover:text-white">2x</button>
            </div>
          </div>

          <button onClick={roll} disabled={rolling}
            className="btn-primary w-full justify-center py-3 text-base font-bold">
            {rolling ? <Loader2 size={18} className="animate-spin" /> : '🎲 Roll Dice'}
          </button>
        </div>

        <div className="space-y-3">
          {/* Stats */}
          <div className="card space-y-2">
            {[
              { label: 'Multiplier', value: `${mult}x`, color: 'text-gold' },
              { label: 'Profit if win', value: formatKES(potentialWin - parseFloat(bet||'0')), color: 'text-green' },
              { label: 'Balance', value: formatKES(Number(wallet?.balance||0)), color: 'text-white' },
              { label: 'Session W/L', value: `${sessionStats.wins}W/${sessionStats.losses}L`, color: sessionStats.wins >= sessionStats.losses ? 'text-green' : 'text-danger' },
              { label: 'Net P&L', value: formatKES(sessionStats.pnl), color: sessionStats.pnl >= 0 ? 'text-green' : 'text-danger' },
            ].map(s => (
              <div key={s.label} className="flex justify-between text-xs">
                <span className="text-subtle">{s.label}</span>
                <span className={`font-bold ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* History */}
          <div className="card p-3">
            <p className="text-[10px] text-subtle uppercase tracking-wider mb-2">History</p>
            <div className="flex flex-wrap gap-1.5">
              {history.map((h, i) => (
                <span key={i} className={clsx('w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold',
                  h.won ? 'bg-green/20 text-green' : 'bg-danger/20 text-danger')}>
                  {h.roll}
                </span>
              ))}
              {history.length === 0 && <p className="text-subtle text-xs">No rolls yet</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PlinkoPage.tsx — Real backend Plinko
// ═══════════════════════════════════════════════════════════════
import { useState as useS, useRef as useR, useEffect as useE, useCallback as useCB } from 'react';

const PLINKO_MULTS = {
  LOW:    [1.5, 1.2, 1.1, 1.0, 0.5, 0.3, 0.5, 1.0, 1.1, 1.2, 1.5],
  MEDIUM: [5.6, 2.1, 1.4, 1.1, 0.6, 0.3, 0.6, 1.1, 1.4, 2.1, 5.6],
  HIGH:   [110, 41, 10, 5, 3, 0.5, 3, 5, 10, 41, 110],
};

export function PlinkoPage() {
  const { data: wallet, refetch } = useWallet();
  const [bet, setBet] = useS('100');
  const [risk, setRisk] = useS<'LOW'|'MEDIUM'|'HIGH'>('MEDIUM');
  const [dropping, setDropping] = useS(false);
  const [history, setHistory] = useS<{ mult: number; win: number; slot: number }[]>([]);
  const [lastResult, setLastResult] = useS<any>(null);
  const canvasRef = useR<HTMLCanvasElement>(null);
  const ballsRef = useR<any[]>([]);
  const animRef = useR<number>(0);
  const ballIdRef = useR(0);

  const ROWS = 12, W = 420, H = 480;
  const colSpacing = W / (ROWS + 3);
  const rowSpacing = (H - 80) / (ROWS + 1);
  const pegs: {x:number;y:number}[] = [];
  for (let r = 0; r < ROWS; r++) {
    const cols = r + 3;
    const startX = W/2 - (cols-1)*colSpacing/2;
    for (let c = 0; c < cols; c++) pegs.push({ x: startX + c*colSpacing, y: 60 + (r+1)*rowSpacing });
  }
  const slots = PLINKO_MULTS[risk];
  const slotW = W / slots.length;

  const draw = useCB(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#07090f'; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(255,255,255,0.03)'; ctx.lineWidth=1;
    for(let x=0;x<W;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    pegs.forEach(p=>{ ctx.beginPath();ctx.arc(p.x,p.y,5,0,Math.PI*2);ctx.fillStyle='#ffffff18';ctx.fill();ctx.strokeStyle='#ffffff30';ctx.stroke(); });
    slots.forEach((m,i)=>{
      const x=i*slotW;
      const c=m>=10?'#f0c040':m>=2?'#00e57a':m<1?'#ff4d6a':'#4d9fff';
      ctx.fillStyle=`${c}18`;ctx.fillRect(x+2,H-36,slotW-4,34);
      ctx.strokeStyle=`${c}40`;ctx.strokeRect(x+2,H-36,slotW-4,34);
      ctx.fillStyle=c;ctx.font=`bold ${m>=10?8:10}px monospace`;ctx.textAlign='center';ctx.fillText(`${m}x`,x+slotW/2,H-14);
    });
    ballsRef.current.forEach(b=>{
      if(b.done)return;
      ctx.beginPath();ctx.arc(b.x,b.y,8,0,Math.PI*2);
      ctx.fillStyle=b.color;ctx.shadowBlur=12;ctx.shadowColor=b.color;ctx.fill();ctx.shadowBlur=0;
    });
  }, [pegs, slots, slotW]);

  const animate = useCB(() => {
    ballsRef.current.forEach(ball=>{
      if(ball.done)return;
      ball.vy+=0.35; ball.x+=ball.vx; ball.y+=ball.vy;
      pegs.forEach(peg=>{
        const dx=ball.x-peg.x,dy=ball.y-peg.y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<14){ball.vx=(Math.random()>.5?1:-1)*(1.5+Math.random()*.5);ball.vy=Math.abs(ball.vy)*.3+1;ball.x=peg.x+(dx/d)*15;ball.y=peg.y+(dy/d)*15;}
      });
      if(ball.x<8){ball.x=8;ball.vx=Math.abs(ball.vx);}
      if(ball.x>W-8){ball.x=W-8;ball.vx=-Math.abs(ball.vx);}
      if(ball.y>=H-36-8){ball.done=true;}
    });
    draw();
    animRef.current=requestAnimationFrame(animate);
  }, [pegs, draw]);

  useE(()=>{ animRef.current=requestAnimationFrame(animate); return()=>cancelAnimationFrame(animRef.current); },[animate]);

  const dropBall = async () => {
    const amt = parseFloat(bet);
    if(!amt||amt<10) return toast.error('Min KES 10');
    if(amt>Number(wallet?.balance||0)) return toast.error('Insufficient balance');
    setDropping(true);
    try {
      const res = await api.post('/games/plinko/drop', { betAmount: amt, risk });
      const data = res.data.data;
      setLastResult(data);
      setHistory(h=>[{mult:data.multiplier,win:data.winAmount,slot:data.slot},...h].slice(0,15));
      refetch();

      // Animate ball using server path
      const path: number[] = data.path || [];
      const ball = {
        id: ++ballIdRef.current,
        x: W/2 + (Math.random()-.5)*10,
        y: 20, vx: (Math.random()-.5)*.5, vy: 2,
        done: false,
        color: data.multiplier >= 5 ? '#f0c040' : data.multiplier >= 1 ? '#00e57a' : '#ff4d6a',
      };
      ballsRef.current=[...ballsRef.current.filter(b=>b.done),ball];

      setTimeout(() => {
        if(data.multiplier >= 1) toast.success(`🎯 ${data.multiplier}x — Won ${formatKES(data.winAmount)}`);
        else toast.error(`🎯 ${data.multiplier}x — ${formatKES(data.winAmount)}`);
        setDropping(false);
      }, 2000);
    } catch(e:any) {
      toast.error(e.response?.data?.message||'Failed');
      setDropping(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🎯</span>
        <div>
          <h1 className="page-header">Plinko</h1>
          <p className="text-xs text-subtle">Drop balls. Watch them bounce. Multipliers are real.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 card p-2 overflow-hidden">
          <canvas ref={canvasRef} width={W} height={H} className="w-full rounded-xl" style={{aspectRatio:`${W}/${H}`}} />
          {lastResult && (
            <div className="text-center mt-2">
              <span className={clsx('font-display font-black text-2xl', lastResult.multiplier>=5?'text-gold':lastResult.multiplier>=1?'text-green':'text-danger')}>
                {lastResult.multiplier}x
              </span>
              <span className="text-subtle text-xs ml-2">{formatKES(lastResult.winAmount)}</span>
            </div>
          )}
        </div>

        <div className="w-full lg:w-52 space-y-3">
          <div className="card space-y-3">
            <div>
              <label className="label text-[10px]">Risk</label>
              <div className="flex flex-col gap-1.5">
                {(['LOW','MEDIUM','HIGH'] as const).map(r=>(
                  <button key={r} onClick={()=>setRisk(r)}
                    className={clsx('py-2 rounded-xl text-xs font-bold border transition-all',
                      risk===r?(r==='HIGH'?'border-danger bg-danger/10 text-danger':r==='MEDIUM'?'border-gold bg-gold/10 text-gold':'border-green bg-green/10 text-green'):'border-border text-muted hover:border-border2')}>
                    {r} {r==='HIGH'?'⚡':r==='MEDIUM'?'🔶':'🟢'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label text-[10px]">Bet (KES)</label>
              <input type="number" value={bet} onChange={e=>setBet(e.target.value)} className="input text-sm" />
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {[50,100,500].map(a=>(
                  <button key={a} onClick={()=>setBet(String(a))} className="px-2 py-1 text-[10px] bg-card2 border border-border rounded-lg text-muted hover:text-white">{a}</button>
                ))}
              </div>
            </div>
            <button onClick={dropBall} disabled={dropping} className="btn-primary w-full justify-center py-3 font-bold">
              {dropping ? <Loader2 size={14} className="animate-spin"/> : '🎯 Drop Ball'}
            </button>
          </div>

          <div className="card p-3">
            <p className="text-[10px] text-subtle uppercase tracking-wider mb-2">History</p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {history.map((h,i)=>(
                <div key={i} className="flex justify-between text-xs">
                  <span className={clsx('font-bold',h.mult>=5?'text-gold':h.mult>=1?'text-green':'text-danger')}>{h.mult}x</span>
                  <span className={h.win>=parseFloat(bet||'0')?'text-green':'text-danger'}>{formatKES(h.win)}</span>
                </div>
              ))}
              {history.length===0&&<p className="text-subtle text-xs">No drops yet</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
