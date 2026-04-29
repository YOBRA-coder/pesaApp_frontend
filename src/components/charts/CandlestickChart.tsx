import { useState, useEffect, useRef, useCallback } from 'react';

interface OHLC { time: number; open: number; high: number; low: number; close: number; volume: number; }

interface Props {
  pair: string;
  basePrice: number;
  volatility?: number;
  height?: number;
  timeFrame?: string;
}

// EMA calculation
function ema(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = [];
  let prev = data[0];
  data.forEach((v, i) => {
    if (i === 0) { result.push(v); return; }
    prev = v * k + prev * (1 - k);
    result.push(prev);
  });
  return result;
}

// RSI calculation
function rsi(closes: number[], period = 14): number[] {
  const gains: number[] = [], losses: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    gains.push(d > 0 ? d : 0);
    losses.push(d < 0 ? -d : 0);
  }
  const result: number[] = Array(period).fill(50);
  let avgG = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgL = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < gains.length; i++) {
    avgG = (avgG * (period - 1) + gains[i]) / period;
    avgL = (avgL * (period - 1) + losses[i]) / period;
    result.push(avgL === 0 ? 100 : 100 - 100 / (1 + avgG / avgL));
  }
  return result;
}

export default function CandlestickChart({ pair, basePrice, volatility = 0.002, height = 320, timeFrame }: Props) {
  const mainRef = useRef<HTMLCanvasElement>(null);
  const rsiRef = useRef<HTMLCanvasElement>(null);
  const volRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [candleData, setCandleData] = useState<OHLC[]>([]);
 // const candlesRef = useRef<OHLC[]>(candleData);
  const [lastPrice, setLastPrice] = useState(basePrice);
  const [change, setChange] = useState(0);
  const [changeAmt, setChangeAmt] = useState(0);
  const [hovIdx, setHovIdx] = useState<number | null>(null);
  const [showEMA9, setShowEMA9] = useState(true);
  const [showEMA21, setShowEMA21] = useState(true);
  const [showRSI, setShowRSI] = useState(false);

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
    fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${timeFrame || '1m'}&limit=100`)
      .then(r => r.json())
      .then(data => {
        const candles = data.map((k: any) => ({
          time: k[0], open: parseFloat(k[1]), high: parseFloat(k[2]),
          low: parseFloat(k[3]), close: parseFloat(k[4]), volume: parseFloat(k[5])
        }));
        setCandleData(candles);
      });
  }, [pair]);

  // Update price tick
  useEffect(() => {
    const iv = setInterval(() => {
      const candles = candleData;
      const last = candles[candles.length - 1];
      const move = (Math.random() - 0.48) * volatility * last.close;
      const newClose = last.close + move;
      const newHigh = Math.max(last.high, newClose);
      const newLow = Math.min(last.low, newClose);

      if (Date.now() - last.time < 60000) {
        last.close = newClose;
        last.high = newHigh;
        last.low = newLow;
        last.volume += 0.01 + Math.random() * 0.05;
      } else {
        candles.push({ time: Date.now(), open: last.close, high: newClose, low: newClose, close: newClose, volume: 0.1 + Math.random() * 0.3 });
        if (candles.length > 100) candles.shift();
      }

      setLastPrice(newClose);
      const open0 = candles[0].open;
      setChange(((newClose - open0) / open0) * 100);
      setChangeAmt(newClose - open0);
    }, 800);
    return () => clearInterval(iv);
  }, [volatility]);

  const draw = useCallback(() => {
    const mCanvas = mainRef.current;
    const vCanvas = volRef.current;
    const rCanvas = rsiRef.current;
    if (!mCanvas) return;

    const mCtx = mCanvas.getContext('2d')!;
    const W = mCanvas.width;
    const H = mCanvas.height;
    const candles = candleData;
    const visible = candles.slice(-80);

    const padL = 8, padR = 60, padT = 12, padB = 8;
    const cW = (W - padL - padR) / visible.length;
    const bodyW = Math.max(1.5, cW * 0.65);

    const prices = visible.flatMap(c => [c.high, c.low]);
    const minP = Math.min(...prices), maxP = Math.max(...prices);
    const rangeP = maxP - minP || 1;
    const toY = (p: number) => padT + (1 - (p - minP) / rangeP) * (H - padT - padB);

    // ── Main canvas ───────────────────────────────────────────
    mCtx.clearRect(0, 0, W, H);

    // Dark background
    const bg = mCtx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#050c16');
    bg.addColorStop(1, '#040911');
    mCtx.fillStyle = bg;
    mCtx.fillRect(0, 0, W, H);

    // Grid lines + price labels
    mCtx.strokeStyle = 'rgba(255,255,255,0.05)';
    mCtx.lineWidth = 1;
    const priceTicks = 6;
    for (let i = 0; i <= priceTicks; i++) {
      const p = minP + (i / priceTicks) * rangeP;
      const y = toY(p);
      mCtx.beginPath(); mCtx.moveTo(padL, y); mCtx.lineTo(W - padR, y); mCtx.stroke();
      // Price label
      mCtx.fillStyle = 'rgba(255,255,255,0.25)';
      mCtx.font = '10px monospace';
      mCtx.textAlign = 'left';
      const label = p > 1000 ? p.toFixed(2) : p > 10 ? p.toFixed(4) : p.toFixed(5);
      mCtx.fillText(label, W - padR + 4, y + 4);
    }

    // EMA data
    const closes = visible.map(c => c.close);
    const e9 = showEMA9 ? ema(closes, 9) : null;
    const e21 = showEMA21 ? ema(closes, 21) : null;

    const drawEMA = (vals: number[], color: string) => {
      mCtx.beginPath();
      vals.forEach((v, i) => {
        const x = padL + i * cW + cW / 2;
        const y = toY(v);
        i === 0 ? mCtx.moveTo(x, y) : mCtx.lineTo(x, y);
      });
      mCtx.strokeStyle = color;
      mCtx.lineWidth = 1.2;
      mCtx.stroke();
    };
    if (e9) drawEMA(e9, 'rgba(240,192,64,0.8)');
    if (e21) drawEMA(e21, 'rgba(77,159,255,0.8)');

    // Candles
    visible.forEach((c, i) => {
      const x = padL + i * cW;
      const cx = x + cW / 2;
      const bx = cx - bodyW / 2;
      const isUp = c.close >= c.open;
      const color = isUp ? '#00e57a' : '#ff4d6a';
      const colorD = isUp ? '#005f36' : '#6b1020';
      const isHov = i === hovIdx;

      // Wick
      mCtx.beginPath();
      mCtx.moveTo(cx, toY(c.high));
      mCtx.lineTo(cx, toY(c.low));
      mCtx.strokeStyle = isHov ? color : `${color}70`;
      mCtx.lineWidth = isHov ? 1.5 : 1;
      mCtx.stroke();

      // Body
      const bodyTop = toY(Math.max(c.open, c.close));
      const bodyBot = toY(Math.min(c.open, c.close));
      const bH = Math.max(1.5, bodyBot - bodyTop);

      if (isHov) {
        // Glow for hovered candle
        mCtx.shadowBlur = 12;
        mCtx.shadowColor = color;
      }

      mCtx.fillStyle = isUp
        ? `linear-gradient(to bottom, ${color}, ${colorD})` // can't use gradient with fillRect directly, use solid
        : `${color}`;

      // Gradient body
      const grad = mCtx.createLinearGradient(bx, bodyTop, bx, bodyTop + bH);
      grad.addColorStop(0, isUp ? '#00e57a' : '#ff4d6a');
      grad.addColorStop(1, isUp ? '#006b40' : '#8b1a2a');
      mCtx.fillStyle = grad;
      mCtx.fillRect(bx, bodyTop, bodyW, bH);

      mCtx.strokeStyle = color;
      mCtx.lineWidth = isHov ? 1.5 : 0.5;
      mCtx.strokeRect(bx, bodyTop, bodyW, bH);

      mCtx.shadowBlur = 0;
    });

    // Current price dashed line
    const currY = toY(visible[visible.length - 1].close);
    const lineColor = visible[visible.length - 1].close >= visible[visible.length - 1].open ? '#00e57a' : '#ff4d6a';
    mCtx.beginPath();
    mCtx.setLineDash([4, 5]);
    mCtx.moveTo(padL, currY); mCtx.lineTo(W - padR, currY);
    mCtx.strokeStyle = `${lineColor}60`;
    mCtx.lineWidth = 1;
    mCtx.stroke();
    mCtx.setLineDash([]);

    // Price tag at right
    const tagW = padR - 4;
    mCtx.fillStyle = lineColor;
    mCtx.fillRect(W - padR, currY - 9, tagW, 18);
    mCtx.fillStyle = '#000';
    mCtx.font = 'bold 9px monospace';
    mCtx.textAlign = 'center';
    const cpLabel = lastPrice > 1000 ? lastPrice.toFixed(2) : lastPrice > 10 ? lastPrice.toFixed(4) : lastPrice.toFixed(5);
    mCtx.fillText(cpLabel, W - padR + tagW / 2, currY + 3);

    // Hover crosshair + tooltip
    if (hovIdx !== null && hovIdx >= 0 && hovIdx < visible.length) {
      const c = visible[hovIdx];
      const hx = padL + hovIdx * cW + cW / 2;
      const hy = toY(c.close);

      mCtx.beginPath();
      mCtx.setLineDash([3, 4]);
      mCtx.moveTo(hx, padT); mCtx.lineTo(hx, H - padB);
      mCtx.moveTo(padL, hy); mCtx.lineTo(W - padR, hy);
      mCtx.strokeStyle = 'rgba(255,255,255,0.15)';
      mCtx.lineWidth = 1;
      mCtx.stroke();
      mCtx.setLineDash([]);

      // Tooltip box
      const fmt = (n: number) => n > 1000 ? n.toFixed(2) : n > 10 ? n.toFixed(4) : n.toFixed(5);
      const lines = [`O: ${fmt(c.open)}`, `H: ${fmt(c.high)}`, `L: ${fmt(c.low)}`, `C: ${fmt(c.close)}`];
      const tx = Math.min(hx + 8, W - 110);
      const ty = Math.max(padT + 4, hy - 52);
      mCtx.fillStyle = 'rgba(10,16,30,0.92)';
      mCtx.strokeStyle = c.close >= c.open ? 'rgba(0,229,122,0.5)' : 'rgba(255,77,106,0.5)';
      mCtx.lineWidth = 1;
      roundRect(mCtx, tx, ty, 100, 64, 6);
      mCtx.fill(); mCtx.stroke();
      mCtx.fillStyle = 'rgba(255,255,255,0.8)';
      mCtx.font = '9px monospace';
      mCtx.textAlign = 'left';
      lines.forEach((l, li) => { mCtx.fillStyle = li === 3 ? (c.close >= c.open ? '#00e57a' : '#ff4d6a') : 'rgba(255,255,255,0.7)'; mCtx.fillText(l, tx + 8, ty + 14 + li * 13); });
    }

    // ── Volume canvas ─────────────────────────────────────────
    if (vCanvas) {
      const vCtx = vCanvas.getContext('2d')!;
      const vH = vCanvas.height;
      vCtx.clearRect(0, 0, W, vH);
      vCtx.fillStyle = '#040911';
      vCtx.fillRect(0, 0, W, vH);
      const maxVol = Math.max(...visible.map(c => c.volume));
      visible.forEach((c, i) => {
        const bx = padL + i * cW + (cW - bodyW) / 2;
        const barH = (c.volume / maxVol) * (vH - 4);
        vCtx.fillStyle = c.close >= c.open ? 'rgba(0,229,122,0.5)' : 'rgba(255,77,106,0.4)';
        vCtx.fillRect(bx, vH - barH - 2, bodyW, barH);
      });
      // Label
      vCtx.fillStyle = 'rgba(255,255,255,0.2)';
      vCtx.font = '9px monospace';
      vCtx.textAlign = 'left';
      vCtx.fillText('VOL', 4, 10);
    }

    // ── RSI canvas ────────────────────────────────────────────
    if (showRSI && rCanvas) {
      const rCtx = rCanvas.getContext('2d')!;
      const rH = rCanvas.height;
      rCtx.clearRect(0, 0, W, rH);
      rCtx.fillStyle = '#040911';
      rCtx.fillRect(0, 0, W, rH);

      const rsiVals = rsi(closes);
      const toRY = (v: number) => 4 + (1 - v / 100) * (rH - 8);

      // 30/50/70 lines
      [30, 50, 70].forEach(lvl => {
        rCtx.beginPath();
        rCtx.setLineDash(lvl === 50 ? [] : [3, 4]);
        rCtx.moveTo(padL, toRY(lvl)); rCtx.lineTo(W - padR, toRY(lvl));
        rCtx.strokeStyle = lvl === 50 ? 'rgba(255,255,255,0.1)' : lvl === 70 ? 'rgba(255,77,106,0.3)' : 'rgba(0,229,122,0.3)';
        rCtx.lineWidth = 1;
        rCtx.stroke();
        rCtx.setLineDash([]);
        rCtx.fillStyle = 'rgba(255,255,255,0.2)';
        rCtx.font = '8px monospace';
        rCtx.textAlign = 'left';
        rCtx.fillText(String(lvl), W - padR + 4, toRY(lvl) + 3);
      });

      // RSI line
      rCtx.beginPath();
      rsiVals.forEach((v, i) => {
        const x = padL + i * cW + cW / 2;
        const y = toRY(v);
        i === 0 ? rCtx.moveTo(x, y) : rCtx.lineTo(x, y);
      });
      rCtx.strokeStyle = '#a855f7';
      rCtx.lineWidth = 1.5;
      rCtx.stroke();

      // RSI label
      rCtx.fillStyle = 'rgba(168,85,247,0.8)';
      rCtx.font = '9px monospace';
      rCtx.fillText(`RSI(14): ${rsiVals[rsiVals.length - 1].toFixed(1)}`, 4, 10);
    }

    animRef.current = requestAnimationFrame(draw);
  }, [showEMA9, showEMA21, showRSI, hovIdx, lastPrice]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  // Mouse hover
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = mainRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const padL = 8;
    const visible = candleData.slice(-80);
    const cW = (canvas.width - padL - 60) / visible.length;
    const idx = Math.floor((x - padL) / cW);
    setHovIdx(idx >= 0 && idx < visible.length ? idx : null);
  };

  const isUp = change >= 0;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-lg text-white">{pair}</span>
          <span className={`font-display font-black text-2xl ${isUp ? 'text-green' : 'text-danger'}`}>
            {lastPrice > 1000 ? lastPrice.toFixed(2) : lastPrice > 10 ? lastPrice.toFixed(4) : lastPrice.toFixed(5)}
          </span>
          <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${isUp ? 'bg-green/10 text-green' : 'bg-danger/10 text-danger'}`}>
            {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(3)}% ({isUp ? '+' : ''}{changeAmt > 1000 ? changeAmt.toFixed(2) : changeAmt.toFixed(5)})
          </span>
        </div>

        {/* Indicator toggles */}
        <div className="flex gap-1.5 flex-wrap">
          {[
            { label: 'EMA 9', active: showEMA9, color: 'text-gold', toggle: () => setShowEMA9(s => !s) },
            { label: 'EMA 21', active: showEMA21, color: 'text-blue', toggle: () => setShowEMA21(s => !s) },
            { label: 'RSI', active: showRSI, color: 'text-purple', toggle: () => setShowRSI(s => !s) },
          ].map(ind => (
            <button key={ind.label} onClick={ind.toggle}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${ind.active ? `${ind.color} border-current bg-current/10` : 'border-border text-subtle hover:border-border2'}`}>
              {ind.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main chart */}
      <canvas ref={mainRef} width={680} height={height} className="w-full rounded-xl border border-white/5 cursor-crosshair"
        onMouseMove={handleMouseMove} onMouseLeave={() => setHovIdx(null)} />

      {/* Volume */}
      <canvas ref={volRef} width={680} height={40} className="w-full rounded-xl border border-white/5" />

      {/* RSI */}
      {showRSI && <canvas ref={rsiRef} width={680} height={60} className="w-full rounded-xl border border-white/5" />}

      <p className="text-[10px] text-subtle text-right">1-min candles · Live prices · EMA overlays available</p>
    </div>
  );
}

// Rounded rect helper
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}