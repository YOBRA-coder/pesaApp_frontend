import { useState, useEffect, useRef, useCallback } from 'react';
import { TrendingUp, TrendingDown, BarChart2, Globe, Bitcoin, Zap, Lock, Unlock, Star, AlertCircle, RefreshCw } from 'lucide-react';
import { useSignals, useSignalSubscription, useSubscribeSignals } from '@/hooks/useApi';
import { formatKES } from '@/utils/format';
import clsx from 'clsx';
import CandlestickChart from '@/components/charts/CandlestickChart';


// ── Mock live price data ─────────────────────────────────────
interface PricePoint { time: number; open: number; high: number; low: number; close: number; }
interface Ticker { pair: string; price: number; change: number; type: 'forex' | 'crypto' | 'commodity'; }

function generateCandles(basePrice: number, count: number, volatility = 0.002): PricePoint[] {
  let price = basePrice;
  return Array.from({ length: count }, (_, i) => {
    const open = price;
    const move = (Math.random() - 0.48) * volatility * price;
    const close = price + move;
    const high = Math.max(open, close) + Math.random() * volatility * price * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * price * 0.5;
    price = close;
    return { time: Date.now() - (count - i) * 60000, open, high, low, close };
  });
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


// ── Live ticker strip ────────────────────────────────────────
function LiveTicker({ tickers }: { tickers: Ticker[] }) {
  const [prices, setPrices] = useState(tickers);
  useEffect(() => {
    const iv = setInterval(() => {
      setPrices(prev => prev.map(t => {
        const base = PAIRS.forex.find(p => p.pair === t.pair) || PAIRS.crypto.find(p => p.pair === t.pair) || PAIRS.commodity.find(p => p.pair === t.pair);
        const vol = base?.vol || 0.002;
        const move = (Math.random() - 0.48) * vol * t.price;
        const newPrice = t.price + move;
        return { ...t, price: newPrice, change: t.change + (Math.random() - 0.5) * 0.05 };
      }));
    }, 1500);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="overflow-hidden border border-border bg-card2 rounded-xl">
      <div className="flex animate-marquee gap-8 py-2.5 px-4" style={{ animation: 'ticker 30s linear infinite', whiteSpace: 'nowrap' }}>
        {[...prices, ...prices].map((t, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-muted">{t.pair}</span>
            <span className="text-xs font-bold text-white font-mono">
              {t.price > 1000 ? t.price.toFixed(2) : t.price > 10 ? t.price.toFixed(3) : t.price.toFixed(5)}
            </span>
            <span className={clsx('text-[10px] font-bold', t.change >= 0 ? 'text-green' : 'text-danger')}>
              {t.change >= 0 ? '▲' : '▼'} {Math.abs(t.change).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Invest Page ─────────────────────────────────────────
const PLANS = [
  { name: 'BASIC', price: 500, accent: 'text-muted', border: 'border-border', features: ['5 signals/week', 'Forex majors', 'Entry & TP', 'SMS alerts'] },
  { name: 'PRO', price: 1500, accent: 'text-green', border: 'border-green/40', popular: true, features: ['Daily signals', 'Forex + Crypto', 'Full analysis', 'WhatsApp + SMS', 'Signal history'] },
  { name: 'VIP', price: 3000, accent: 'text-gold', border: 'border-gold/40', features: ['Unlimited signals', 'All markets', 'Video analysis', '1-on-1 review', 'Portfolio track', 'Priority support'] },
];

const INITIAL_TICKERS: Ticker[] = [
  { pair: 'EUR/USD', price: 1.0842, change: 0.12, type: 'forex' },
  { pair: 'GBP/USD', price: 1.2680, change: -0.08, type: 'forex' },
  { pair: 'USD/KES', price: 129.40, change: 0.24, type: 'forex' },
  { pair: 'BTC/USDT', price: 67842, change: 2.1, type: 'crypto' },
  { pair: 'ETH/USDT', price: 3521, change: 1.4, type: 'crypto' },
  { pair: 'XAU/USD', price: 2341, change: -0.3, type: 'commodity' },
  { pair: 'GBP/JPY', price: 191.40, change: 0.45, type: 'forex' },
  { pair: 'SOL/USDT', price: 185.20, change: 3.2, type: 'crypto' },
];

export default function InvestPage() {
  const [tab, setTab] = useState<'signals' | 'charts' | 'markets' | 'plans'>('signals');
  const [selectedPair, setSelectedPair] = useState<{ pair: string; base: number; vol: number; type: string }>({ pair: 'BTC/USDT', base: 67842, vol: 0.006, type: 'crypto' });
  const [filterType, setFilterType] = useState<'all' | 'FOREX' | 'CRYPTO' | 'COMMODITY'>('all');
  const { data: signals = [] } = useSignals();
  const { data: sub } = useSignalSubscription();
  const subscribe = useSubscribeSignals();
  const hasAccess = !!(sub?.isActive && new Date(sub.expiresAt) > new Date());

  const allPairs = [
    ...PAIRS.forex.map(p => ({ ...p, type: 'FOREX' })),
    ...PAIRS.crypto.map(p => ({ ...p, type: 'CRYPTO' })),
    ...PAIRS.commodity.map(p => ({ ...p, type: 'COMMODITY' })),
  ];

  //filter signals based on subscription show subscribed and free signals if no active subscription
    const filteredSignals = signals.filter((s: any) => {
      //if (hasAccess) return true;
      return s.targetPlan === sub?.targetPlan ? s.targetPlan === sub?.targetPlan && s.targetPlan === 'FREE' : s.targetPlan === 'FREE';
    });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="page-header flex items-center gap-2"><TrendingUp size={20} className="text-green" /> Invest & Trade</h1>
        {hasAccess
          ? <div className="flex items-center gap-2 bg-green/10 border border-green/20 rounded-full px-4 py-1.5"><Unlock size={13} className="text-green" /><span className="text-green text-xs font-bold">{sub.planName} Active</span></div>
          : <button onClick={() => setTab('plans')} className="flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 hover:bg-gold/15 transition-all"><Lock size={13} className="text-gold" /><span className="text-gold text-xs font-bold">Unlock Signals</span></button>
        }
      </div>

      {/* Live ticker strip */}
      <LiveTicker tickers={INITIAL_TICKERS} />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Signals', value: (filteredSignals as any[]).filter(s => s.status === 'ACTIVE').length, color: 'text-green', icon: '📡' },
          { label: 'Win Rate', value: '84%', color: 'text-gold', icon: '🏆' },
          { label: 'Avg Return', value: '+3.4%', color: 'text-blue', icon: '📈' },
          { label: 'Total Signals', value: (filteredSignals as any[]).length, color: 'text-purple', icon: '📊' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-3 py-3">
            <span className="text-xl">{s.icon}</span>
            <div><p className={clsx('font-display font-bold text-xl', s.color)}>{s.value}</p><p className="text-[10px] text-subtle">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
        {[
          { id: 'signals', label: '📡 Signals' },
          { id: 'charts', label: '📊 Live Charts' },
          { id: 'markets', label: '🌍 Markets' },
          { id: 'plans', label: '⭐ Plans' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={clsx('flex-1 py-2 rounded-lg text-xs font-semibold transition-all',
              tab === t.id ? 'bg-green text-black' : 'text-muted hover:text-white')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── SIGNALS TAB ─────────────────────────────────────── */}
      {tab === 'signals' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {(['all','FOREX','CRYPTO','COMMODITY'] as const).map(f => (
              <button key={f} onClick={() => setFilterType(f)}
                className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                  filterType === f ? 'bg-green/10 border-green/40 text-green' : 'border-border text-muted hover:border-border2')}>
                {f === 'all' ? '🌐 All' : f === 'FOREX' ? '💱 Forex' : f === 'CRYPTO' ? '₿ Crypto' : '🥇 Commodity'}
              </button>
            ))}
          </div>

          {(signals as any[]).filter(s => filterType === 'all' || s.assetType === filterType).length === 0 && (
            <div className="card text-center py-12"><div className="text-4xl mb-3">📭</div><p className="text-muted">No signals yet. Check back soon.</p></div>
          )}

          {(filteredSignals as any[]).filter(s => filterType === 'all' || s.assetType === filterType).map((sig: any) => (
            <div key={sig.id} className={clsx('card border cursor-pointer hover:border-border2 transition-all',
              sig.status === 'CLOSED_TP' ? 'border-green/20 bg-green/3' : sig.status === 'CLOSED_SL' ? 'border-danger/20 bg-danger/3' : 'border-border')}>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                  style={{ background: sig.direction === 'BUY' ? 'rgba(0,229,122,0.1)' : 'rgba(255,77,106,0.1)' }}>
                  {sig.assetType === 'CRYPTO' ? '₿' : sig.assetType === 'COMMODITY' ? '🥇' : '💱'}
                </div>
                <div className="flex-1 min-w-0">
                  {sig.targetPlan && (
                    <span className={clsx('text-[10px] font-bold px-2.5 py-1 rounded-full min-w-[36px] text-center', 
                      sig.targetPlan === 'FREE' ? 'bg-gray-500/15 text-gray-500' :
                      sig.targetPlan === 'BASIC' ? 'bg-green/15 text-green' :
                      sig.targetPlan === 'PRO' ? 'bg-blue/15 text-blue' :
                      sig.targetPlan === 'VIP' ? 'bg-purple/15 text-purple' : 'bg-muted/15 text-muted')}>
                      {sig.targetPlan}
                    </span>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-white">{sig.pair}</span>
                    <span className={clsx('text-[10px] font-black px-2.5 py-0.5 rounded-full', sig.direction === 'BUY' ? 'bg-green/15 text-green' : 'bg-danger/15 text-danger')}>
                      {sig.direction === 'BUY' ? '▲ BUY' : '▼ SELL'}
                    </span>
                    {sig.status === 'ACTIVE' && <span className="flex items-center gap-1 text-[10px] text-gold"><span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />LIVE</span>}
                    {sig.status === 'CLOSED_TP' && <span className="text-[10px] text-green font-bold">✅ TP HIT</span>}
                    {sig.status === 'CLOSED_SL' && <span className="text-[10px] text-danger font-bold">❌ SL HIT</span>}
                  </div>
                  <div className="flex gap-3 mt-1 text-[11px] text-subtle flex-wrap">
                    <span>Entry: <strong className="text-white">{Number(sig.entryPrice).toLocaleString()}</strong></span>
                    <span>TP: <strong className="text-green">{Number(sig.takeProfit1).toLocaleString()}</strong></span>
                    <span>SL: <strong className="text-danger">{Number(sig.stopLoss).toLocaleString()}</strong></span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {sig.pnlPercent !== null && sig.pnlPercent !== undefined && (
                    <p className={clsx('font-display font-bold text-xl', Number(sig.pnlPercent) >= 0 ? 'text-green' : 'text-danger')}>
                      {Number(sig.pnlPercent) > 0 ? '+' : ''}{Number(sig.pnlPercent).toFixed(2)}%
                    </p>
                  )}
                </div>
              </div>
              {sig.analysis && hasAccess && (
                <p className="text-xs text-muted mt-3 pt-3 border-t border-border leading-relaxed">{sig.analysis}</p>
              )}
              {sig.analysis && !hasAccess && (
                <div className="flex items-center gap-2 text-xs text-subtle bg-card rounded-xl p-3 border border-border mt-3">
                  <Lock size={12} className="text-gold" /> Subscribe PRO/VIP to read full analysis & copy trades
                </div>
              )}
            </div>
          ))}

          <div className="card border-blue/20 bg-blue/5">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-blue shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">🚀 Direct Trading — Coming Soon</p>
                <p className="text-xs text-subtle mt-1">Copy trades directly from signals, set take-profits, and track your portfolio P&L — all within PesaApp. Subscribe VIP to get early access.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LIVE CHARTS TAB ────────────────────────────────── */}
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

          {/* Chart */}
          <div className="card p-4">
           <CandlestickChart pair={selectedPair.pair} basePrice={selectedPair.base} volatility={selectedPair.vol} />          
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

      {/* ── MARKETS TAB ─────────────────────────────────────── */}
      {tab === 'markets' && (
        <div className="space-y-3">
          {['forex', 'crypto', 'commodity'].map(type => (
            <div key={type} className="card">
              <h3 className="section-title capitalize mb-3 flex items-center gap-2">
                {type === 'crypto' ? '₿' : type === 'forex' ? '💱' : '🥇'} {type}
              </h3>
              <div className="space-y-2">
                {(PAIRS as any)[type].map((p: any) => {
                  const [livePrice, setLivePrice] = useState(p.base);
                  const [change, setChange] = useState((Math.random() - 0.5) * 2);
                  useEffect(() => {
                    const iv = setInterval(() => {
                      setLivePrice((prev: number) => {
                        const m = (Math.random() - 0.48) * p.vol * prev;
                        return prev + m;
                      });
                      setChange(c => c + (Math.random() - 0.5) * 0.05);
                    }, 2000);
                    return () => clearInterval(iv);
                  }, []);
                  return (
                    <div key={p.pair} onClick={() => { setSelectedPair({ ...p, type: type.toUpperCase() }); setTab('charts'); }}
                      className="flex items-center gap-3 py-2 px-3 hover:bg-white/5 rounded-xl cursor-pointer transition-all group">
                      <span className="font-display font-bold text-sm text-white group-hover:text-green transition-colors">{p.pair}</span>
                      <div className="flex-1" />
                      <span className="font-mono text-sm text-white">{livePrice > 1000 ? livePrice.toFixed(2) : livePrice > 10 ? livePrice.toFixed(4) : livePrice.toFixed(5)}</span>
                      <span className={clsx('text-xs font-bold w-16 text-right', change >= 0 ? 'text-green' : 'text-danger')}>
                        {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                      </span>
                      <span className="text-subtle text-[10px] group-hover:text-green transition-colors">Chart →</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PLANS TAB ───────────────────────────────────────── */}
      {tab === 'plans' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map(plan => {
            const isActive = hasAccess && sub?.planName === plan.name;
            return (
              <div key={plan.name} className={clsx('card flex flex-col relative border', plan.border, plan.popular && 'ring-1 ring-green/30')}>
                {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green text-black text-[10px] font-black px-3 py-1 rounded-full">POPULAR</div>}
                <div className="flex items-center gap-2 mb-2"><Star size={14} className={plan.accent} /><span className={clsx('font-display font-bold', plan.accent)}>{plan.name}</span></div>
                <p className="font-display font-black text-3xl text-white mb-1">{formatKES(plan.price)}<span className="text-xs text-subtle font-sans font-normal">/mo</span></p>
                <ul className="space-y-2 flex-1 mt-3 mb-4">
                  {plan.features.map(f => <li key={f} className="text-xs text-muted flex items-center gap-2"><span className="text-green font-bold">✓</span>{f}</li>)}
                </ul>
                <button onClick={() => !isActive && subscribe.mutate(plan.name)} disabled={isActive || subscribe.isPending}
                  className={clsx('w-full py-2.5 rounded-xl text-sm font-bold transition-all border',
                    isActive ? 'bg-green/10 text-green border-green/30 cursor-default' : plan.popular ? 'bg-green text-black border-transparent' : 'bg-white/5 text-white border-border hover:border-border2')}>
                  {isActive ? '✅ Active' : subscribe.isPending ? '...' : `Subscribe — ${formatKES(plan.price)}`}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
