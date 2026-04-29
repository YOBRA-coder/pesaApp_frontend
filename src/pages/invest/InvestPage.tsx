
import { useState, useEffect, useRef, useCallback } from 'react';
import { TrendingUp, Lock, Unlock, Star, X, Copy } from 'lucide-react';
import { useSignals, useSignalSubscription, useSubscribeSignals, useWallet } from '@/hooks/useApi';
import { api } from '@/services/api';
import { formatKES } from '@/utils/format';
import clsx from 'clsx';
import toast from 'react-hot-toast';

// ── Types ─────────────────────────────────────────────────────
interface OHLC { time: number; open: number; high: number; low: number; close: number; volume: number; }
type TF = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

const PLAN_ORDER = ['FREE', 'BASIC', 'PRO', 'VIP'];
const TIMEFRAMES: TF[] = ['1m', '5m', '15m', '1h', '4h', '1d'];

const MARKET_INFO: Record<string, { price: number; vol: number }> = {
  'EUR/USD': { price: 1.0842, vol: 0.0015 }, 'GBP/USD': { price: 1.2680, vol: 0.0018 },
  'USD/JPY': { price: 151.40, vol: 0.02 },   'USD/KES': { price: 129.40, vol: 0.05 },
  'GBP/JPY': { price: 191.40, vol: 0.025 },  'AUD/USD': { price: 0.6540, vol: 0.001 },
  'BTC/USDT': { price: 67842, vol: 0.006 },  'ETH/USDT': { price: 3521, vol: 0.007 },
  'SOL/USDT': { price: 185, vol: 0.009 },    'XAU/USD':  { price: 2341, vol: 0.003 },
};
// ── Technical indicators ──────────────────────────────────────
function calcEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  let prev = data[0];
  return data.map((v, i) => { if (i === 0) { prev = v; return v; } prev = v * k + prev * (1 - k); return prev; });
}

function calcRSI(closes: number[], period = 14): number[] {
  const result: number[] = Array(period).fill(50);
  const gains: number[] = [], losses: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    gains.push(d > 0 ? d : 0); losses.push(d < 0 ? -d : 0);
  }
  let ag = gains.slice(0, period).reduce((a, b) => a + b) / period;
  let al = losses.slice(0, period).reduce((a, b) => a + b) / period;
  for (let i = period; i < gains.length; i++) {
    ag = (ag * (period - 1) + gains[i]) / period;
    al = (al * (period - 1) + losses[i]) / period;
    result.push(al === 0 ? 100 : 100 - 100 / (1 + ag / al));
  }
  return result;
}

function calcMACD(closes: number[]): { macd: number[]; signal: number[]; hist: number[] } {
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  const macd  = ema12.map((v, i) => v - ema26[i]);
  const signal = calcEMA(macd, 9);
  const hist   = macd.map((v, i) => v - signal[i]);
  return { macd, signal, hist };
}

function calcBollinger(closes: number[], period = 20, mult = 2): { upper: number[]; mid: number[]; lower: number[] } {
  const mid = closes.map((_, i) => {
    if (i < period - 1) return closes[i];
    const slice = closes.slice(i - period + 1, i + 1);
    return slice.reduce((a, b) => a + b) / period;
  });
  const upper = closes.map((_, i) => {
    if (i < period - 1) return closes[i];
    const slice = closes.slice(i - period + 1, i + 1);
    const mean  = slice.reduce((a, b) => a + b) / period;
    const std   = Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period);
    return mean + mult * std;
  });
  const lower = upper.map((u, i) => 2 * mid[i] - u);
  return { upper, mid, lower };
}

const PAIRS = {
  forex: [
    { pair: 'EUR/USD', base: 1.0842, vol: 0.0015 },
    { pair: 'GBP/USD', base: 1.2680, vol: 0.0018 },
    { pair: 'USD/JPY', base: 151.40, vol: 0.02 },
    { pair: 'USD/KES', base: 129.40, vol: 0.05 },
    { pair: 'GBP/JPY', base: 191.40, vol: 0.025 },
    { pair: 'AUD/USD', base: 0.6540, vol: 0.001 },
  ],
  crypto: [
    { pair: 'BTC/USDT', base: 67842, vol: 0.006 },
    { pair: 'ETH/USDT', base: 3521, vol: 0.007 },
    { pair: 'BNB/USDT', base: 612, vol: 0.005 },
    { pair: 'SOL/USDT', base: 185, vol: 0.009 },
  ],
  commodity: [
    { pair: 'XAU/USD', base: 2341, vol: 0.003 },
    { pair: 'XAG/USD', base: 27.4, vol: 0.004 },
  ],
};


// ── Advanced Chart Component ──────────────────────────────────
function AdvancedChart({ pair, signal }: { pair: string; signal?: any }) {
  const mainRef = useRef<HTMLCanvasElement>(null);
  const rsiRef  = useRef<HTMLCanvasElement>(null);
  const macdRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const info    = MARKET_INFO[pair] || { price: 1.0, vol: 0.002 };
  const [candles, setCandleData] = useState<OHLC[]>([]);
  const [tf, setTF]               = useState<TF>('1h');
  const [hovIdx, setHovIdx]       = useState<number | null>(null);
  const [showRSI, setShowRSI]     = useState(true);
  const [showMACD, setShowMACD]   = useState(false);
  const [showBB, setShowBB]       = useState(true);
  const [showEMA9, setShowEMA9]   = useState(true);
  const [showEMA21, setShowEMA21] = useState(true);
  const [lastPrice, setLastPrice] = useState(info.price);
  const [priceChange, setPriceChange] = useState(0);

  useEffect(() => {
      if (!pair.includes('USDT')) return; // only crypto for Binance
      const symbol = pair.replace('/', '').toLowerCase(); // btcusdt
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@kline_1m`);
  
      ws.onmessage = (e) => {
        const { k } = JSON.parse(e.data);
        const candle: OHLC = {
          time: k.t,
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close: parseFloat(k.c),
          volume: parseFloat(k.v),
        };
        // Update last candle or append new
        setCandleData(prev => {
          const last = prev[prev.length - 1];
          if (last?.time === candle.time) {
            return [...prev.slice(0, -1), candle];
          }
          return [...prev, candle].slice(-200);
        });
      };
  
      return () => ws.close();
    }, [pair]);
  
    // Fetch initial historical data from Binance REST:
    useEffect(() => {
      const symbol = pair.replace('/', '').toUpperCase();
      fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${tf || '1m'}&limit=100`)
        .then(r => r.json())
        .then(data => {
          const candles = data.map((k: any) => ({
            time: k[0], open: parseFloat(k[1]), high: parseFloat(k[2]),
            low: parseFloat(k[3]), close: parseFloat(k[4]), volume: parseFloat(k[5])
          }));
          setCandleData(candles);
        });
    }, [pair]);

  // Live price tick
  useEffect(() => {
    const iv = setInterval(() => {
      const c = candles;
      const last = c[c.length - 1];
      const move = (Math.random() - 0.48) * info.vol * last.close;
      const newClose = last.close + move;
      if (Date.now() - last.time < 60000) {
        last.close = newClose; last.high = Math.max(last.high, newClose); last.low = Math.min(last.low, newClose); last.volume += Math.random() * 0.05;
      } else {
        c.push({ time: Date.now(), open: last.close, high: newClose, low: newClose, close: newClose, volume: 0.1 });
        if (c.length > 200) c.shift();
      }
      setLastPrice(newClose);
      setPriceChange(((newClose - c[0].open) / c[0].open) * 100);
    }, 900);
    return () => clearInterval(iv);
  }, [info.vol]);

  const draw = useCallback(() => {
    const mc = mainRef.current;
    if (!mc) return;
    const ctx = mc.getContext('2d')!;
    const W = mc.width, H = mc.height;
    const visible = candles.slice(-80);
    const closes  = visible.map(c => c.close);

    const padL = 8, padR = 62, padT = 12, padB = 8;
    const cW   = (W - padL - padR) / visible.length;
    const bodyW = Math.max(1.5, cW * 0.65);

    const prices  = visible.flatMap(c => [c.high, c.low]);
    const minP = Math.min(...prices), maxP = Math.max(...prices);
    const range = maxP - minP || 1;
    const toY   = (p: number) => padT + (1 - (p - minP) / range) * (H - padT - padB);

    // Background
    ctx.fillStyle = '#050c16'; ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
    for (let i = 0; i <= 6; i++) {
      const p = minP + (i / 6) * range;
      const y = toY(p);
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
      const lbl = p > 1000 ? p.toFixed(2) : p > 10 ? p.toFixed(4) : p.toFixed(5);
      ctx.fillText(lbl, W - padR + 3, y + 3);
    }

    // Bollinger Bands
    if (showBB) {
      const bb = calcBollinger(closes);
      ['upper', 'lower', 'mid'].forEach((key, ki) => {
        ctx.beginPath();
        (bb as any)[key].forEach((v: number, i: number) => {
          const x = padL + i * cW + cW / 2, y = toY(v);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.strokeStyle = ki === 2 ? 'rgba(168,85,247,0.5)' : 'rgba(168,85,247,0.25)';
        ctx.lineWidth = ki === 2 ? 1 : 0.75;
        ctx.stroke();
      });
      // Shaded band
      ctx.beginPath();
      bb.upper.forEach((v, i) => { const x = padL + i * cW + cW / 2; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
      bb.lower.slice().reverse().forEach((v, i) => { const x = padL + (bb.lower.length - 1 - i) * cW + cW / 2; ctx.lineTo(x, toY(v)); });
      ctx.closePath(); ctx.fillStyle = 'rgba(168,85,247,0.04)'; ctx.fill();
    }

    // EMAs
    if (showEMA9)  { const e = calcEMA(closes, 9);  ctx.beginPath(); e.forEach((v,i) => { const x=padL+i*cW+cW/2; i===0?ctx.moveTo(x,toY(v)):ctx.lineTo(x,toY(v)); }); ctx.strokeStyle='rgba(240,192,64,0.85)'; ctx.lineWidth=1.2; ctx.stroke(); }
    if (showEMA21) { const e = calcEMA(closes, 21); ctx.beginPath(); e.forEach((v,i) => { const x=padL+i*cW+cW/2; i===0?ctx.moveTo(x,toY(v)):ctx.lineTo(x,toY(v)); }); ctx.strokeStyle='rgba(77,159,255,0.85)'; ctx.lineWidth=1.2; ctx.stroke(); }

    // Signal levels
    if (signal) {
      const drawLevel = (price: number, color: string, label: string) => {
        if (price <= 0) return;
        const y = toY(price);
        ctx.beginPath(); ctx.setLineDash([5, 4]); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y);
        ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = color; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'right';
        ctx.fillText(label, W - padR - 2, y - 2);
      };
      drawLevel(Number(signal.entryPrice), 'rgba(255,255,255,0.7)', `Entry ${Number(signal.entryPrice).toFixed(4)}`);
      drawLevel(Number(signal.stopLoss),   'rgba(255,77,106,0.9)',  `SL ${Number(signal.stopLoss).toFixed(4)}`);
      drawLevel(Number(signal.takeProfit1),'rgba(0,229,122,0.9)',   `TP1 ${Number(signal.takeProfit1).toFixed(4)}`);
      if (signal.takeProfit2) drawLevel(Number(signal.takeProfit2), 'rgba(0,229,122,0.65)', `TP2 ${Number(signal.takeProfit2).toFixed(4)}`);
      // R:R shading
      const entryY = toY(Number(signal.entryPrice));
      const tp1Y   = toY(Number(signal.takeProfit1));
      const slY    = toY(Number(signal.stopLoss));
      ctx.fillStyle = 'rgba(0,229,122,0.06)'; ctx.fillRect(padL, Math.min(entryY, tp1Y), W - padL - padR, Math.abs(tp1Y - entryY));
      ctx.fillStyle = 'rgba(255,77,106,0.06)'; ctx.fillRect(padL, Math.min(entryY, slY), W - padL - padR, Math.abs(slY - entryY));
    }

    // Candles
    visible.forEach((c, i) => {
      const x = padL + i * cW, cx = x + cW / 2, bx = cx - bodyW / 2;
      const isUp  = c.close >= c.open;
      const color = isUp ? '#00e57a' : '#ff4d6a';
      const isHov = i === hovIdx;
      const bTop = toY(Math.max(c.open, c.close)), bBot = toY(Math.min(c.open, c.close));
      const bH   = Math.max(1.5, bBot - bTop);

      ctx.beginPath(); ctx.moveTo(cx, toY(c.high)); ctx.lineTo(cx, toY(c.low));
      ctx.strokeStyle = `${color}${isHov ? 'ff' : '80'}`; ctx.lineWidth = 1; ctx.stroke();

      if (isHov) { ctx.shadowBlur = 10; ctx.shadowColor = color; }
      const grad = ctx.createLinearGradient(bx, bTop, bx, bTop + bH);
      grad.addColorStop(0, isUp ? '#00e57a' : '#ff4d6a'); grad.addColorStop(1, isUp ? '#005f36' : '#6b1020');
      ctx.fillStyle = grad; ctx.fillRect(bx, bTop, bodyW, bH);
      ctx.strokeStyle = color; ctx.lineWidth = isHov ? 1.2 : 0.4; ctx.strokeRect(bx, bTop, bodyW, bH);
      ctx.shadowBlur = 0;
    });

    // Current price tag
    const currY = toY(visible[visible.length - 1].close);
    const lineColor = priceChange >= 0 ? '#00e57a' : '#ff4d6a';
    ctx.beginPath(); ctx.setLineDash([4, 5]); ctx.moveTo(padL, currY); ctx.lineTo(W - padR, currY);
    ctx.strokeStyle = `${lineColor}60`; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = lineColor; ctx.fillRect(W - padR, currY - 9, padR - 2, 18);
    ctx.fillStyle = '#000'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
    const cpLabel = lastPrice > 1000 ? lastPrice.toFixed(2) : lastPrice > 10 ? lastPrice.toFixed(4) : lastPrice.toFixed(5);
    ctx.fillText(cpLabel, W - padR + (padR - 2) / 2, currY + 3);

    // Hover crosshair + OHLC tooltip
    if (hovIdx !== null && hovIdx < visible.length) {
      const hc = visible[hovIdx];
      const hx = padL + hovIdx * cW + cW / 2, hy = toY(hc.close);
      ctx.beginPath(); ctx.setLineDash([3, 4]);
      ctx.moveTo(hx, padT); ctx.lineTo(hx, H - padB);
      ctx.moveTo(padL, hy); ctx.lineTo(W - padR, hy);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
      const fmt = (n: number) => n > 1000 ? n.toFixed(2) : n > 10 ? n.toFixed(4) : n.toFixed(5);
      const tx = Math.min(hx + 8, W - 115), ty = Math.max(padT + 4, hy - 58);
      ctx.fillStyle = 'rgba(8,15,26,0.94)'; ctx.strokeStyle = hc.close >= hc.open ? 'rgba(0,229,122,0.5)' : 'rgba(255,77,106,0.5)'; ctx.lineWidth = 1;
      roundRect(ctx, tx, ty, 106, 70, 6); ctx.fill(); ctx.stroke();
      [['O', fmt(hc.open)], ['H', fmt(hc.high)], ['L', fmt(hc.low)], ['C', fmt(hc.close)]].forEach(([k, v], li) => {
        ctx.fillStyle = li === 3 ? lineColor : 'rgba(255,255,255,0.6)'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
        ctx.fillText(`${k}: ${v}`, tx + 8, ty + 14 + li * 14);
      });
    }

    animRef.current = requestAnimationFrame(draw);
  }, [showRSI, showMACD, showBB, showEMA9, showEMA21, hovIdx, lastPrice, priceChange, signal]);

  // RSI sub-chart
  const drawRSI = useCallback(() => {
    const rc = rsiRef.current; if (!rc || !showRSI) return;
    const ctx = rc.getContext('2d')!;
    const W = rc.width, H = rc.height;
    const visible = candles.slice(-80);
    const rsiVals = calcRSI(visible.map(c => c.close));
    const cW = (W - 70) / visible.length;

    ctx.fillStyle = '#040911'; ctx.fillRect(0, 0, W, H);
    const toRY = (v: number) => 4 + (1 - v / 100) * (H - 8);

    [30, 50, 70].forEach(lvl => {
      ctx.beginPath(); ctx.setLineDash(lvl === 50 ? [] : [3, 4]);
      ctx.moveTo(8, toRY(lvl)); ctx.lineTo(W - 62, toRY(lvl));
      ctx.strokeStyle = lvl === 50 ? 'rgba(255,255,255,0.08)' : lvl === 70 ? 'rgba(255,77,106,0.3)' : 'rgba(0,229,122,0.3)'; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.font = '8px monospace'; ctx.textAlign = 'left'; ctx.fillText(String(lvl), W - 58, toRY(lvl) + 3);
    });

    ctx.beginPath();
    rsiVals.forEach((v, i) => { const x = 8 + i * cW + cW / 2; i === 0 ? ctx.moveTo(x, toRY(v)) : ctx.lineTo(x, toRY(v)); });
    ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 1.4; ctx.stroke();

    const lastRSI = rsiVals[rsiVals.length - 1];
    ctx.fillStyle = lastRSI > 70 ? '#ff4d6a' : lastRSI < 30 ? '#00e57a' : '#a855f7';
    ctx.font = 'bold 9px monospace'; ctx.textAlign = 'left'; ctx.fillText(`RSI(14): ${lastRSI.toFixed(1)}`, 8, 10);
  }, [showRSI]);

  // MACD sub-chart
  const drawMACD = useCallback(() => {
    const mc2 = macdRef.current; if (!mc2 || !showMACD) return;
    const ctx = mc2.getContext('2d')!;
    const W = mc2.width, H = mc2.height;
    const visible = candles.slice(-80);
    const { macd, signal: sig, hist } = calcMACD(visible.map(c => c.close));
    const cW = (W - 70) / visible.length;
    const vals = [...macd, ...sig, ...hist].filter(Boolean);
    const minV = Math.min(...vals), maxV = Math.max(...vals);
    const rangeV = maxV - minV || 1;
    const toMY = (v: number) => 4 + (1 - (v - minV) / rangeV) * (H - 8);

    ctx.fillStyle = '#040911'; ctx.fillRect(0, 0, W, H);

    // Zero line
    ctx.beginPath(); ctx.moveTo(8, toMY(0)); ctx.lineTo(W - 62, toMY(0)); ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1; ctx.stroke();

    // Histogram
    hist.forEach((v, i) => {
      const x = 8 + i * cW, bW = Math.max(1, cW * 0.65), bX = x + (cW - bW) / 2;
      const zeroY = toMY(0), barY = toMY(v), barH = Math.abs(barY - zeroY);
      ctx.fillStyle = v >= 0 ? 'rgba(0,229,122,0.6)' : 'rgba(255,77,106,0.6)'; ctx.fillRect(bX, Math.min(barY, zeroY), bW, barH);
    });

    // MACD & signal lines
    ctx.beginPath(); macd.forEach((v, i) => { const x = 8 + i * cW + cW / 2; i === 0 ? ctx.moveTo(x, toMY(v)) : ctx.lineTo(x, toMY(v)); }); ctx.strokeStyle = '#4d9fff'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.beginPath(); sig.forEach((v, i)  => { const x = 8 + i * cW + cW / 2; i === 0 ? ctx.moveTo(x, toMY(v)) : ctx.lineTo(x, toMY(v)); }); ctx.strokeStyle = '#f0c040'; ctx.lineWidth = 1; ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '8px monospace'; ctx.textAlign = 'left'; ctx.fillText('MACD(12,26,9)', 8, 10);
  }, [showMACD]);

  useEffect(() => { animRef.current = requestAnimationFrame(draw); return () => cancelAnimationFrame(animRef.current); }, [draw]);
  useEffect(() => { const iv = setInterval(() => { drawRSI(); drawMACD(); }, 1000); return () => clearInterval(iv); }, [drawRSI, drawMACD]);

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = mainRef.current!.getBoundingClientRect();
    const x = (e.clientX - r.left) * (mainRef.current!.width / r.width);
    const visible = candles.slice(-80);
    const cW = (mainRef.current!.width - 70) / visible.length;
    const idx = Math.floor((x - 8) / cW);
    setHovIdx(idx >= 0 && idx < visible.length ? idx : null);
  };

  const isUp = priceChange >= 0;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-display font-bold text-xl text-white">{pair}</span>
          <span className={clsx('font-display font-black text-2xl', isUp ? 'text-green' : 'text-danger')}>
            {lastPrice > 1000 ? lastPrice.toFixed(2) : lastPrice > 10 ? lastPrice.toFixed(4) : lastPrice.toFixed(5)}
          </span>
          <span className={clsx('flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full', isUp ? 'bg-green/10 text-green' : 'bg-danger/10 text-danger')}>
            {isUp ? '▲' : '▼'} {Math.abs(priceChange).toFixed(3)}%
          </span>
        </div>

        {/* Timeframes */}
        <div className="flex gap-1">
          {TIMEFRAMES.map(t => (
            <button key={t} onClick={() => setTF(t)}
              className={clsx('px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all', tf === t ? 'bg-green/10 border-green/30 text-green' : 'border-border text-subtle hover:border-border2 hover:text-muted')}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Indicator toggles */}
      <div className="flex gap-1.5 flex-wrap">
        {[
          { label: 'EMA 9', active: showEMA9, color: 'text-gold', toggle: () => setShowEMA9(s => !s) },
          { label: 'EMA 21', active: showEMA21, color: 'text-blue', toggle: () => setShowEMA21(s => !s) },
          { label: 'BB', active: showBB, color: 'text-purple', toggle: () => setShowBB(s => !s) },
          { label: 'RSI', active: showRSI, color: 'text-purple', toggle: () => setShowRSI(s => !s) },
          { label: 'MACD', active: showMACD, color: 'text-blue', toggle: () => setShowMACD(s => !s) },
        ].map(ind => (
          <button key={ind.label} onClick={ind.toggle}
            className={clsx('px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all', ind.active ? `${ind.color} border-current bg-current/10` : 'border-border text-subtle hover:border-border2')}>
            {ind.label}
          </button>
        ))}
      </div>

      {/* Signal levels legend */}
      {signal && (
        <div className="flex gap-3 text-[10px] flex-wrap">
          <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-white/60 inline-block" /> Entry: {Number(signal.entryPrice).toFixed(4)}</span>
          <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-green/80 inline-block" /> TP1: {Number(signal.takeProfit1).toFixed(4)}</span>
          <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-danger/80 inline-block" /> SL: {Number(signal.stopLoss).toFixed(4)}</span>
        </div>
      )}

      {/* Main chart */}
      <canvas ref={mainRef} width={680} height={280} className="w-full rounded-xl border border-white/5 cursor-crosshair"
        onMouseMove={onMouseMove} onMouseLeave={() => setHovIdx(null)} />

      {/* RSI */}
      {showRSI && <canvas ref={rsiRef} width={680} height={56} className="w-full rounded-xl border border-white/5" />}
      {/* MACD */}
      {showMACD && <canvas ref={macdRef} width={680} height={56} className="w-full rounded-xl border border-white/5" />}

      <p className="text-[10px] text-subtle text-right">Live simulation · {tf} candles · EMA/BB/RSI/MACD available</p>
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

// ── Chart Modal ───────────────────────────────────────────────
function ChartModal({ signal, onClose }: { signal: any; onClose: () => void }) {
  const { data: wallet, refetch } = useWallet();
  const [copyAmt, setCopyAmt] = useState('100');
  const [copying, setCopying] = useState(false);
  const [tp, setTp] = useState<'tp1' | 'tp2' | 'tp3'>('tp1');

  const handleCopyTrade = async () => {
    const amt = parseFloat(copyAmt);
    if (!amt || amt < 10) return toast.error('Min KES 10');
    if (amt > Number(wallet?.balance || 0)) return toast.error('Insufficient balance');
    setCopying(true);
    try {
      await api.post('/invest/copy-trade', {
        signalId: signal.id,
        amount: amt,
        targetTP: tp,
      });
      toast.success(`Trade copied! Tracking ${tp.toUpperCase()}...`);
      refetch();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Copy trade failed');
    } finally { setCopying(false); }
  };

  const rr = (() => {
    const e = Number(signal.entryPrice), sl = Number(signal.stopLoss), tp1 = Number(signal.takeProfit1);
    const risk = Math.abs(e - sl), reward = Math.abs(tp1 - e);
    return risk > 0 ? (reward / risk).toFixed(2) : '—';
  })();

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-6" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className={clsx('text-[11px] font-black px-3 py-1 rounded-full', signal.direction === 'BUY' ? 'bg-green/15 text-green' : 'bg-danger/15 text-danger')}>
              {signal.direction === 'BUY' ? '▲ BUY' : '▼ SELL'}
            </span>
            <span className="font-display font-bold text-white text-lg">{signal.pair}</span>
            <span className="text-subtle text-xs">{signal.assetType}</span>
          </div>
          <button onClick={onClose} className="text-subtle hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <div className="p-4 grid md:grid-cols-3 gap-4">
          {/* Chart */}
          <div className="md:col-span-2 space-y-3">
            <AdvancedChart pair={signal.pair} signal={signal} />
          </div>

          {/* Signal details + copy trade */}
          <div className="space-y-3">
            {/* Levels */}
            <div className="card space-y-2">
              <p className="section-title text-xs">Signal Levels</p>
              {[
                { label: 'Entry', value: Number(signal.entryPrice), color: 'text-white' },
                { label: 'Stop Loss', value: Number(signal.stopLoss), color: 'text-danger' },
                { label: 'Take Profit 1', value: Number(signal.takeProfit1), color: 'text-green' },
                signal.takeProfit2 && { label: 'Take Profit 2', value: Number(signal.takeProfit2), color: 'text-green' },
                signal.takeProfit3 && { label: 'Take Profit 3', value: Number(signal.takeProfit3), color: 'text-green' },
              ].filter(Boolean).map((lvl: any) => (
                <div key={lvl.label} className="flex justify-between text-xs">
                  <span className="text-subtle">{lvl.label}</span>
                  <span className={clsx('font-mono font-bold', lvl.color)}>{lvl.value.toFixed(lvl.value > 100 ? 2 : 4)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex justify-between text-xs">
                <span className="text-subtle">Risk : Reward</span>
                <span className={clsx('font-bold', parseFloat(rr) >= 2 ? 'text-green' : 'text-gold')}>1 : {rr}</span>
              </div>
            </div>

            {/* Analysis */}
            {signal.analysis && (
              <div className="card">
                <p className="section-title text-xs mb-2">Analysis</p>
                <p className="text-xs text-muted leading-relaxed">{signal.analysis}</p>
              </div>
            )}

            {/* Copy Trade */}
            <div className="card border-green/20 bg-green/3 space-y-3">
              <p className="section-title text-xs flex items-center gap-2"><Copy size={12} className="text-green" /> Copy Trade</p>
              <div>
                <label className="label text-[10px]">Amount (KES)</label>
                <input type="number" value={copyAmt} onChange={e => setCopyAmt(e.target.value)} className="input text-sm" min="10" />
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {[100, 500, 1000].map(a => <button key={a} onClick={() => setCopyAmt(String(a))} className="px-2 py-1 text-[10px] bg-card border border-border rounded-lg text-muted hover:text-white">{a}</button>)}
                </div>
              </div>
              <div>
                <label className="label text-[10px]">Target Take Profit</label>
                <div className="flex gap-1">
                  {['tp1', 'tp2', 'tp3'].filter(t => signal[`takeProfit${t.slice(2)}`]).map(t => (
                    <button key={t} onClick={() => setTp(t as any)}
                      className={clsx('flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all', tp === t ? 'bg-green/10 border-green/30 text-green' : 'border-border text-muted')}>
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-xs text-subtle bg-card rounded-xl p-2.5 space-y-1">
                <div className="flex justify-between"><span>Potential return</span><span className="text-green font-bold">{(parseFloat(rr) * parseFloat(copyAmt || '0')).toFixed(2)} KES</span></div>
                <div className="flex justify-between"><span>Max loss</span><span className="text-danger font-bold">{copyAmt} KES</span></div>
              </div>
              <button onClick={handleCopyTrade} disabled={copying} className="btn-primary w-full justify-center text-sm">
                {copying ? '...' : '📋 Copy This Trade'}
              </button>
              <p className="text-[10px] text-subtle text-center">Trade managed manually. Results depend on market. Not financial advice.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Plans ─────────────────────────────────────────────────────
const PLANS = [
  { name: 'BASIC', price: 500, color: 'border-border', accent: 'text-muted', features: ['5 signals/week', 'Forex only', 'Entry & TP', 'SMS alerts'] },
  { name: 'PRO',   price: 1500, color: 'border-green/40', accent: 'text-green', popular: true, features: ['Daily signals', 'Forex + Crypto', 'Full analysis', 'Chart view', 'WhatsApp alerts'] },
  { name: 'VIP',   price: 3000, color: 'border-gold/40', accent: 'text-gold', features: ['Unlimited signals', 'All markets', 'Copy trades', 'Portfolio tracking', '1-on-1 support', 'Priority alerts'] },
];

// ── Main Invest Page ──────────────────────────────────────────
export default function InvestPage() {
  const [tab, setTab] = useState<'signals' | 'charts' | 'markets' | 'plans'>('signals');
  const [filter, setFilter] = useState<'all' | 'FOREX' | 'CRYPTO' | 'COMMODITY'>('all');
  const [openChart, setOpenChart] = useState<any>(null);
  const [openChartPair, setOpenChartPair] = useState<string | null>(null);
  const { data: allSignals = [] } = useSignals();
  const { data: sub } = useSignalSubscription();
  const subscribe = useSubscribeSignals();
  const [subLoading, setSubLoading] = useState<string | null>(null);

    const [selectedPair, setSelectedPair] = useState<{ pair: string; base: number; vol: number; type: string }>({ pair: 'BTC/USDT', base: 67842, vol: 0.006, type: 'crypto' });
    const allPairs = [
    ...PAIRS.forex.map(p => ({ ...p, type: 'FOREX' })),
    ...PAIRS.crypto.map(p => ({ ...p, type: 'CRYPTO' })),
    ...PAIRS.commodity.map(p => ({ ...p, type: 'COMMODITY' })),
  ];
  // Determine user's plan tier
  const userPlan = sub?.isActive && new Date(sub.expiresAt) > new Date() ? sub.planName : 'FREE';
  const userTier = PLAN_ORDER.indexOf(userPlan);
  const hasAccess = userTier > 0;

  // Filter signals by plan — FREE users see FREE signals, subscribers see more
  const visibleSignals = (allSignals as any[]).filter((s: any) => {
    const sigPlan = s.metadata?.targetPlan || 'FREE';
    const sigTier = PLAN_ORDER.indexOf(sigPlan);
    return sigTier <= userTier;
  });

  const filtered = filter === 'all' ? visibleSignals : visibleSignals.filter((s: any) => s.assetType === filter);
  const activeSignals = filtered.filter((s: any) => s.status === 'ACTIVE');
  const closedSignals = filtered.filter((s: any) => s.status !== 'ACTIVE');

  const handleSubscribe = async (plan: string) => {
    setSubLoading(plan);
    try { await subscribe.mutateAsync(plan); }
    finally { setSubLoading(null); }
  };

  return (
    <>
      {/* Chart modal */}
      {openChart && <ChartModal signal={openChart} onClose={() => setOpenChart(null)} />}
      {/* Standalone chart modal for market pairs */}
      {openChartPair && !openChart && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-6" onClick={() => setOpenChartPair(null)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-display font-bold text-white">{openChartPair} — Live Chart</span>
              <button onClick={() => setOpenChartPair(null)}><X size={18} className="text-subtle hover:text-white" /></button>
            </div>
            <div className="p-4">
              <AdvancedChart pair={openChartPair} />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="page-header flex items-center gap-2"><TrendingUp size={20} className="text-green" /> Invest & Signals</h1>
          {hasAccess
            ? <div className="flex items-center gap-2 bg-green/10 border border-green/20 rounded-full px-4 py-1.5"><Unlock size={13} className="text-green" /><span className="text-green text-xs font-bold">{userPlan} Plan</span></div>
            : <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1.5"><Lock size={13} className="text-subtle" /><span className="text-subtle text-xs">Free Plan — <button onClick={() => setTab('plans')} className="text-green hover:underline">Upgrade</button></span></div>
          }
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
          {[['signals', '📡 Signals'], ['charts', '📊 Charts'], ['markets', '🌍 Markets'], ['plans', '⭐ Plans']].map(([id, lbl]) => (
            <button key={id} onClick={() => setTab(id as any)}
              className={clsx('flex-1 py-2 rounded-lg text-xs font-semibold transition-all', tab === id ? 'bg-green text-black' : 'text-muted hover:text-white')}>
              {lbl}
            </button>
          ))}
        </div>

        {/* SIGNALS TAB */}
        {tab === 'signals' && (
          <div className="space-y-4">
            {/* Plan gate notice */}
            {!hasAccess && (
              <div className="flex items-center gap-3 bg-gold/5 border border-gold/20 rounded-2xl p-4">
                <Lock size={18} className="text-gold shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gold">Showing free signals only</p>
                  <p className="text-xs text-subtle mt-0.5">Subscribe to BASIC, PRO or VIP to unlock all signals, analysis & chart views</p>
                </div>
                <button onClick={() => setTab('plans')} className="btn-primary text-xs py-2 shrink-0">Upgrade</button>
              </div>
            )}

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'FOREX', 'CRYPTO', 'COMMODITY'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all', filter === f ? 'bg-green/10 border-green/40 text-green' : 'border-border text-muted hover:border-border2')}>
                  {f === 'all' ? '🌐 All' : f === 'FOREX' ? '💱 Forex' : f === 'CRYPTO' ? '₿ Crypto' : '🥇 Commodity'}
                </button>
              ))}
            </div>

            {/* Active signals */}
            {activeSignals.length > 0 && (
              <div>
                <p className="text-xs text-subtle uppercase tracking-wider mb-2 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-green rounded-full animate-pulse" /> Live Signals ({activeSignals.length})
                </p>
                <div className="space-y-3">
                  {activeSignals.map((sig: any) => (
                    <div key={sig.id}
                      className="card border border-border hover:border-border2 transition-all cursor-pointer group"
                      onClick={() => hasAccess ? setOpenChart(sig) : setTab('plans')}>
                      <div className="flex items-center gap-3">
                        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0', sig.direction === 'BUY' ? 'bg-green/10 text-green' : 'bg-danger/10 text-danger')}>
                          {sig.assetType === 'CRYPTO' ? '₿' : sig.assetType === 'COMMODITY' ? '🥇' : '💱'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display font-bold text-white">{sig.pair}</span>
                            <span className={clsx('text-[10px] font-black px-2.5 py-0.5 rounded-full', sig.direction === 'BUY' ? 'bg-green/15 text-green' : 'bg-danger/15 text-danger')}>
                              {sig.direction === 'BUY' ? '▲ BUY' : '▼ SELL'}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-gold"><span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />LIVE</span>
                            <span className="text-[10px] text-subtle ml-auto">{sig.metadata?.targetPlan || 'FREE'} plan</span>
                          </div>
                          <div className="flex gap-3 mt-1 text-[11px] text-subtle flex-wrap">
                            <span>Entry: <strong className="text-white">{Number(sig.entryPrice).toFixed(4)}</strong></span>
                            <span>TP: <strong className="text-green">{Number(sig.takeProfit1).toFixed(4)}</strong></span>
                            <span>SL: <strong className="text-danger">{Number(sig.stopLoss).toFixed(4)}</strong></span>
                          </div>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-1">
                          {sig.pnlPercent != null && <p className={clsx('font-display font-bold text-lg', Number(sig.pnlPercent) >= 0 ? 'text-green' : 'text-danger')}>{Number(sig.pnlPercent) > 0 ? '+' : ''}{Number(sig.pnlPercent).toFixed(2)}%</p>}
                          <span className="text-[10px] text-green/70 group-hover:text-green transition-colors">
                            {hasAccess ? '📊 View Chart →' : '🔒 Subscribe'}
                          </span>
                        </div>
                      </div>
                      {sig.analysis && hasAccess && (
                        <p className="text-xs text-muted mt-3 pt-3 border-t border-border leading-relaxed line-clamp-2">{sig.analysis}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Closed signals */}
            {closedSignals.length > 0 && (
              <div>
                <p className="text-xs text-subtle uppercase tracking-wider mb-2 font-semibold">Closed Signals</p>
                <div className="space-y-2">
                  {closedSignals.map((sig: any) => (
                    <div key={sig.id} onClick={() => hasAccess && setOpenChart(sig)}
                      className={clsx('card flex items-center gap-3 cursor-pointer hover:border-border2 transition-all', sig.status === 'CLOSED_TP' ? 'border-green/15' : 'border-danger/15')}>
                      <span className={clsx('text-[10px] font-black px-2 py-0.5 rounded-full', sig.direction === 'BUY' ? 'bg-green/15 text-green' : 'bg-danger/15 text-danger')}>{sig.direction}</span>
                      <span className="font-display font-bold text-sm text-white">{sig.pair}</span>
                      <span className={clsx('text-[10px] font-bold', sig.status === 'CLOSED_TP' ? 'text-green' : 'text-danger')}>{sig.status === 'CLOSED_TP' ? '✅ TP HIT' : '❌ SL HIT'}</span>
                      <div className="flex-1" />
                      {sig.pnlPercent != null && <span className={clsx('font-bold text-sm', Number(sig.pnlPercent) >= 0 ? 'text-green' : 'text-danger')}>{Number(sig.pnlPercent) > 0 ? '+' : ''}{Number(sig.pnlPercent).toFixed(2)}%</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filtered.length === 0 && (
              <div className="card text-center py-12"><div className="text-4xl mb-3">📭</div><p className="text-muted">No signals yet. Check back soon.</p></div>
            )}
          </div>
        )}

        {/* CHARTS TAB */}
        {tab === 'charts' && (
          <div className="space-y-4">
          {/* Pair selector */}
          <div className="flex gap-2 flex-wrap">
            {allPairs.map(p => (
              <button key={p.pair} onClick={() => setSelectedPair({ ...p, type: p.type })}
                className={clsx('px-3 py-1.5 text-xs font-bold rounded-lg border transition-all',
                  selectedPair.pair === p.pair ? 'bg-green/10 border-green/30 text-green' : 'border-border text-subtle hover:border-border2 hover:text-muted')}>
                {p.pair}
              </button>
            ))}
          </div>

           {/* Sample chart for signals */}
           <div className="card p-4">
            <AdvancedChart pair={selectedPair.pair} signal={{
              entryPrice: selectedPair.base,
              takeProfit1: selectedPair.base * (1 + (selectedPair.type === 'crypto' ? 0.02 : 0.005)),
              stopLoss: selectedPair.base * (1 - (selectedPair.type === 'crypto' ? 0.02 : 0.005)),
            }} />
          </div>

          {/* Chart controls legend */}
          <div className="flex gap-4 text-xs text-subtle justify-center">
            <span className="flex items-center gap-1"><span className="w-3 h-2 bg-green/70 rounded-sm inline-block" /> Bullish</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2 bg-danger/70 rounded-sm inline-block" /> Bearish</span>
            <span className="flex items-center gap-1"><span className="border-t-2 border-dashed border-white/30 w-6 inline-block" /> Current price</span>
            <span>1-min candles · Auto-updating</span>
          </div>

          <div className="card border-gold/20 bg-gold/5 text-center py-4">
            <p className="text-gold font-semibold text-sm">📊 TradingView Full Charts</p>
            <p className="text-subtle text-xs mt-1">Advanced charts with indicators (RSI, MACD, Bollinger) coming in next update. Subscribe VIP for early access.</p>
          </div>
        </div>
        )}

        {/* MARKETS TAB — now opens chart modal on click */}
        {tab === 'markets' && (
          <div className="space-y-4">
            {Object.entries({
              '💱 Forex':      ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/KES', 'GBP/JPY', 'AUD/USD'],
              '₿ Crypto':     ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
              '🥇 Commodity': ['XAU/USD'],
            }).map(([sectionLabel, pairs]) => (
              <div key={sectionLabel} className="card">
                <h3 className="section-title mb-3">{sectionLabel}</h3>
                <div className="space-y-2">
                  {pairs.map(pair => {
                    const info = MARKET_INFO[pair];
                    return (
                      <button key={pair} onClick={() => setOpenChartPair(pair)}
                        className="w-full flex items-center gap-3 py-2.5 px-3 hover:bg-white/5 rounded-xl transition-all text-left group">
                        <span className="font-display font-bold text-sm text-white group-hover:text-green transition-colors">{pair}</span>
                        <div className="flex-1" />
                        <LivePrice pair={pair} info={info} />
                        <span className="text-[10px] text-subtle group-hover:text-green transition-colors ml-2">Chart →</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PLANS TAB */}
        {tab === 'plans' && (
          <div className="space-y-4">
            {/* Current plan */}
            {hasAccess && (
              <div className="flex items-center gap-3 bg-green/5 border border-green/20 rounded-2xl p-4">
                <Unlock size={18} className="text-green" />
                <div>
                  <p className="text-sm font-semibold text-green">{userPlan} Plan Active</p>
                  <p className="text-xs text-subtle">Expires {new Date(sub!.expiresAt).toLocaleDateString()} · Auto-renew by resubscribing</p>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-3 gap-4">
              {PLANS.map(plan => {
                const isActive = hasAccess && sub?.planName === plan.name;
                return (
                  <div key={plan.name} className={clsx('card flex flex-col relative border', plan.color, plan.popular && 'ring-1 ring-green/30')}>
                    {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green text-black text-[10px] font-black px-3 py-1 rounded-full">POPULAR</div>}
                    <div className="flex items-center gap-2 mb-2"><Star size={14} className={plan.accent} /><span className={clsx('font-display font-bold', plan.accent)}>{plan.name}</span></div>
                    <p className="font-display font-black text-3xl text-white mb-1">{formatKES(plan.price)}<span className="text-xs text-subtle font-sans font-normal">/mo</span></p>
                    <ul className="space-y-2 flex-1 mt-3 mb-4">
                      {plan.features.map(f => <li key={f} className="text-xs text-muted flex items-center gap-2"><span className="text-green font-bold">✓</span>{f}</li>)}
                    </ul>
                    <button onClick={() => !isActive && handleSubscribe(plan.name)}
                      disabled={isActive || subLoading === plan.name}
                      className={clsx('w-full py-2.5 rounded-xl text-sm font-bold transition-all border',
                        isActive ? 'bg-green/10 text-green border-green/30 cursor-default'
                        : plan.popular ? 'bg-green text-black border-transparent'
                        : 'bg-white/5 text-white border-border hover:border-border2')}>
                      {isActive ? '✅ Current Plan' : subLoading === plan.name ? '...' : `Subscribe — ${formatKES(plan.price)}`}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="card border-blue/20 bg-blue/5">
              <p className="text-sm font-semibold text-white">ℹ️ One Plan at a Time</p>
              <p className="text-xs text-muted mt-1">You can only hold one active plan. Subscribing to a new plan replaces the old one. Your balance is charged immediately. Plans last 30 days.</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Live price component for Markets tab ─────────────────────
function LivePrice({ pair, info }: { pair: string; info: { price: number; vol: number } }) {
  const [price, setPrice] = useState(info?.price || 0);
  const [change, setChange] = useState(0);
  console.log(pair)
  useEffect(() => {
    if (!info) return;
    const iv = setInterval(() => {
      setPrice(p => { const m = (Math.random() - 0.48) * (info.vol || 0.002) * p; const next = p + m; setChange(c => c + (Math.random() - 0.5) * 0.02); return next; });
    }, 1500);
    return () => clearInterval(iv);
  }, [info]);
  const isUp = change >= 0;
  if (!info) return <span className="text-subtle text-xs">N/A</span>;
  return (
    <div className="text-right">
      <p className="font-mono text-sm text-white">{price > 1000 ? price.toFixed(2) : price > 10 ? price.toFixed(4) : price.toFixed(5)}</p>
      <p className={clsx('text-[10px] font-bold', isUp ? 'text-green' : 'text-danger')}>{isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%</p>
    </div>
  );
}