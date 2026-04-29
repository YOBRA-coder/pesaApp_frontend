import { useState, useEffect } from 'react';
import { api, apiGet } from '@/services/api';
import { Plus, Loader2, BarChart2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import CandlestickChart from '@/components/charts/CandlestickChart';

// ── Plan tiers ────────────────────────────────────────────────
const PLAN_TIERS = [
  { name: 'FREE', color: 'text-muted', bg: 'bg-white/5', badge: '🌐', label: 'All users' },
  { name: 'BASIC', color: 'text-blue', bg: 'bg-blue/10', badge: '📘', label: 'Basic & above' },
  { name: 'PRO', color: 'text-green', bg: 'bg-green/10', badge: '⚡', label: 'Pro & VIP' },
  { name: 'VIP', color: 'text-gold', bg: 'bg-gold/10', badge: '👑', label: 'VIP only' },
];

const PAIRS_BY_TYPE = {
  FOREX: ['EUR/USD','GBP/USD','USD/JPY','USD/KES','GBP/JPY','AUD/USD','USD/CHF','EUR/GBP','NZD/USD','USD/ZAR'],
  CRYPTO: ['BTC/USDT','ETH/USDT','BNB/USDT','SOL/USDT','XRP/USDT','DOGE/USDT','ADA/USDT','MATIC/USDT'],
  COMMODITY: ['XAU/USD','XAG/USD','WTI/USD','BRENT/USD','NAT_GAS/USD'],
};

const MARKET_DATA: Record<string, { price: number; vol: number }> = {
  'EUR/USD': { price: 1.0842, vol: 0.0015 }, 'GBP/USD': { price: 1.2680, vol: 0.0018 },
  'USD/JPY': { price: 151.40, vol: 0.02 }, 'USD/KES': { price: 129.40, vol: 0.05 },
  'GBP/JPY': { price: 191.40, vol: 0.025 }, 'AUD/USD': { price: 0.6540, vol: 0.001 },
  'USD/CHF': { price: 0.9080, vol: 0.0013 }, 'EUR/GBP': { price: 0.8560, vol: 0.0012 },
  'BTC/USDT': { price: 67842, vol: 0.006 }, 'ETH/USDT': { price: 3521, vol: 0.007 },
  'BNB/USDT': { price: 612, vol: 0.005 }, 'SOL/USDT': { price: 185, vol: 0.009 },
  'XRP/USDT': { price: 0.62, vol: 0.008 }, 'XAU/USD': { price: 2341, vol: 0.003 },
  'XAG/USD': { price: 27.4, vol: 0.004 }, 'WTI/USD': { price: 78.5, vol: 0.004 },
};

// Template analysis texts
const ANALYSIS_TEMPLATES: Record<string, string[]> = {
  BUY: [
    'Price has broken above key resistance at {entry}. RSI shows momentum building from oversold territory (32). EMA 9 crossed above EMA 21 — bullish crossover confirmed. Target TP1 {tp1}, TP2 {tp2}.',
    'Strong support zone at {entry} holding with multiple bounces. Bullish engulfing candle on H4 timeframe. MACD histogram turning positive. Recommend buy with tight SL at {sl}.',
    'Demand zone identified at current levels. Price action shows higher lows forming an ascending structure. Volume increasing on up candles. Bulls in control — TP {tp1}.',
  ],
  SELL: [
    'Price rejected key resistance at {entry} with a bearish pin bar. RSI overbought at 71. EMA crossover to downside confirms selling pressure. SL above {sl}, target TP1 {tp1}.',
    'Head and shoulders pattern completed at {entry}. Neckline broken with strong bearish candle. Risk/reward ratio 1:3 makes this an excellent SELL setup. TP {tp1}.',
    'Double top formed at resistance. Bearish divergence on RSI. Price failing to make new highs — momentum shift to downside confirmed. Target {tp1} below.',
  ],
};

function fillTemplate(template: string, data: { entry: string; sl: string; tp1: string; tp2?: string }): string {
  return template
    .replace(/{entry}/g, data.entry)
    .replace(/{sl}/g, data.sl)
    .replace(/{tp1}/g, data.tp1)
    .replace(/{tp2}/g, data.tp2 || data.tp1);
}

interface SignalForm {
  assetType: 'FOREX' | 'CRYPTO' | 'COMMODITY';
  pair: string;
  direction: 'BUY' | 'SELL';
  entryPrice: string;
  stopLoss: string;
  takeProfit1: string;
  takeProfit2: string;
  takeProfit3: string;
  analysis: string;
  targetPlan: string; // minimum plan to see this signal
}

const defaultForm: SignalForm = {
  assetType: 'FOREX', pair: 'EUR/USD', direction: 'BUY',
  entryPrice: '', stopLoss: '', takeProfit1: '', takeProfit2: '', takeProfit3: '',
  analysis: '', targetPlan: 'FREE',
};

export default function AdminSignalsPage() {
  const [form, setForm] = useState<SignalForm>(defaultForm);
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [previewPair, setPreviewPair] = useState<{ pair: string; price: number; vol: number } | null>(null);

  const marketInfo = MARKET_DATA[form.pair];

  // Load signals
  const loadSignals = () => {
    apiGet('/signals').then((d: any) => setSignals(Array.isArray(d) ? d : [])).catch(() => {});
  };
  useEffect(loadSignals, []);

  // Auto-fill price from market data when pair changes
  useEffect(() => {
    const m = MARKET_DATA[form.pair];
    if (m && !form.entryPrice) {
      const dp = m.price > 100 ? 2 : m.price > 1 ? 4 : 5;
      setForm(f => ({ ...f, entryPrice: m.price.toFixed(dp) }));
    }
    setPreviewPair(m ? { pair: form.pair, price: m.price, vol: m.vol } : null);
  }, [form.pair]);

  // Auto-calculate SL and TPs based on direction + entry
  const autoCalculate = () => {
    const entry = parseFloat(form.entryPrice);
    if (!entry) return toast.error('Enter entry price first');
    const m = MARKET_DATA[form.pair];
    const atr = m ? m.vol * entry * 2 : entry * 0.002;
    const isBuy = form.direction === 'BUY';
    const dp = entry > 100 ? 2 : entry > 1 ? 4 : 5;
    setForm(f => ({
      ...f,
      stopLoss:    (isBuy ? entry - atr : entry + atr).toFixed(dp),
      takeProfit1: (isBuy ? entry + atr*1.5 : entry - atr*1.5).toFixed(dp),
      takeProfit2: (isBuy ? entry + atr*3   : entry - atr*3  ).toFixed(dp),
      takeProfit3: (isBuy ? entry + atr*5   : entry - atr*5  ).toFixed(dp),
    }));
  };

  // Generate AI analysis from template
  const generateAnalysis = () => {
    const templates = ANALYSIS_TEMPLATES[form.direction];
    const tpl = templates[Math.floor(Math.random() * templates.length)];
    const dp = parseFloat(form.entryPrice) > 100 ? 2 : parseFloat(form.entryPrice) > 1 ? 4 : 5;
    const text = fillTemplate(tpl, {
      entry: parseFloat(form.entryPrice).toFixed(dp),
      sl: parseFloat(form.stopLoss || '0').toFixed(dp),
      tp1: parseFloat(form.takeProfit1 || '0').toFixed(dp),
      tp2: parseFloat(form.takeProfit2 || '0').toFixed(dp),
    });
    setForm(f => ({ ...f, analysis: text }));
  };

  const handleSubmit = async () => {
    const { entryPrice, stopLoss, takeProfit1, analysis, pair, assetType, direction, targetPlan } = form;
    if (!pair || !entryPrice || !stopLoss || !takeProfit1) return toast.error('Fill required fields');
    if (!analysis.trim()) return toast.error('Add analysis text');
    setLoading(true);
    try {
      await api.post('/admin/signals', {
        assetType, pair, direction,
        entryPrice: parseFloat(entryPrice),
        stopLoss: parseFloat(stopLoss),
        takeProfit1: parseFloat(takeProfit1),
        takeProfit2: form.takeProfit2 ? parseFloat(form.takeProfit2) : undefined,
        takeProfit3: form.takeProfit3 ? parseFloat(form.takeProfit3) : undefined,
        analysis,
        targetPlan, // stored in metadata
      });
      toast.success(`✅ Signal published to ${PLAN_TIERS.find(p=>p.name===targetPlan)?.label}!`);
      setForm(defaultForm);
      setShowForm(false);
      loadSignals();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to publish');
    } finally { setLoading(false); }
  };

  const closeSignal = async (id: string, status: 'CLOSED_TP' | 'CLOSED_SL', pnl: number) => {
    try {
      await api.patch(`/admin/signals/${id}/close`, { status, pnlPercent: pnl });
      toast.success(`Signal closed (${status})`);
      loadSignals();
    } catch { toast.error('Failed to close'); }
  };

  const deleteSignal = async (id: string) => {
    if (!confirm('Delete this signal?')) return;
    try {
      await api.delete(`/admin/signals/${id}`);
      toast.success('Signal deleted');
      loadSignals();
    } catch { toast.error('Failed'); }
  };

  const pairs = PAIRS_BY_TYPE[form.assetType] || [];
  const rr = (() => {
    const e = parseFloat(form.entryPrice||'0');
    const sl = parseFloat(form.stopLoss||'0');
    const tp = parseFloat(form.takeProfit1||'0');
    if (!e||!sl||!tp) return null;
    const risk = Math.abs(e-sl);
    const reward = Math.abs(tp-e);
    return risk > 0 ? (reward/risk).toFixed(2) : null;
  })();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="section-title flex items-center gap-2"><BarChart2 size={16} className="text-green"/> Signal Management</h2>
        <div className="flex gap-2">
          <button onClick={loadSignals} className="btn-ghost text-xs py-2 px-3"><RefreshCw size={13}/> Refresh</button>
          <button onClick={() => setShowForm(s=>!s)} className="btn-primary text-xs py-2">
            <Plus size={14}/> {showForm ? 'Cancel' : 'New Signal'}
          </button>
        </div>
      </div>

      {/* ── Signal Creation Form ─────────────────────────── */}
      {showForm && (
        <div className="card border-green/20 bg-green/3 space-y-5 animate-slide-up">
          <h3 className="font-display font-bold text-white flex items-center gap-2">📊 Create & Publish Signal</h3>

          {/* Asset type */}
          <div className="flex gap-2">
            {(['FOREX','CRYPTO','COMMODITY'] as const).map(t => (
              <button key={t} onClick={() => setForm(f => ({...f, assetType: t, pair: PAIRS_BY_TYPE[t][0]}))}
                className={clsx('flex-1 py-2 rounded-xl text-xs font-bold border transition-all', form.assetType===t?'bg-green/10 border-green/30 text-green':'border-border text-muted hover:border-border2')}>
                {t==='FOREX'?'💱':''}
                {t==='CRYPTO'?'₿':''}
                {t==='COMMODITY'?'🥇':''} {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Pair */}
            <div>
              <label className="label">Pair *</label>
              <select value={form.pair} onChange={e => setForm(f=>({...f, pair:e.target.value, entryPrice:''}))} className="input text-sm">
                {pairs.map(p => <option key={p}>{p}</option>)}
              </select>
              {marketInfo && (
                <p className="text-[10px] text-subtle mt-1">
                  Market: <span className="text-white font-mono">{marketInfo.price > 100 ? marketInfo.price.toFixed(2) : marketInfo.price.toFixed(5)}</span>
                  <button onClick={() => setPreviewPair(p => p?.pair === form.pair ? null : { pair: form.pair, price: marketInfo.price, vol: marketInfo.vol })} className="ml-2 text-green hover:underline">
                    {previewPair ? 'Hide chart' : 'View chart'}
                  </button>
                </p>
              )}
            </div>

            {/* Direction */}
            <div>
              <label className="label">Direction *</label>
              <div className="flex gap-2">
                {(['BUY','SELL'] as const).map(d => (
                  <button key={d} onClick={() => setForm(f=>({...f, direction:d}))}
                    className={clsx('flex-1 py-3 rounded-xl font-bold border text-sm transition-all',
                      form.direction===d ? (d==='BUY'?'bg-green/10 border-green/40 text-green':'bg-danger/10 border-danger/40 text-danger') : 'border-border text-muted hover:border-border2')}>
                    {d==='BUY'?'▲':'▼'} {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live chart preview */}
          {previewPair && (
            <div className="rounded-xl overflow-hidden border border-border animate-slide-up">
              <CandlestickChart pair={previewPair.pair} basePrice={previewPair.price} volatility={previewPair.vol} height={200} timeFrame='1h'/>
            </div>
          )}

          {/* Price inputs */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {[['entryPrice','Entry Price *'],['stopLoss','Stop Loss *'],['takeProfit1','Take Profit 1 *']].map(([k,l]) => (
                <div key={k}>
                  <label className="label text-[10px]">{l}</label>
                  <input type="number" step="any" className="input text-sm font-mono" placeholder="0.0000"
                    value={(form as any)[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))}/>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[['takeProfit2','TP2 (optional)'],['takeProfit3','TP3 (optional)']].map(([k,l]) => (
                <div key={k}>
                  <label className="label text-[10px]">{l}</label>
                  <input type="number" step="any" className="input text-sm font-mono" placeholder="0.0000"
                    value={(form as any)[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))}/>
                </div>
              ))}
              <div className="flex flex-col justify-end">
                <button onClick={autoCalculate} className="btn-ghost text-xs py-2.5 justify-center w-full">
                  ⚡ Auto-Calculate SL/TP
                </button>
              </div>
            </div>
          </div>

          {/* R:R display */}
          {rr && (
            <div className={clsx('flex items-center gap-2 p-3 rounded-xl border text-sm font-bold', parseFloat(rr)>=2?'bg-green/10 border-green/20 text-green':'bg-gold/10 border-gold/20 text-gold')}>
              📐 Risk:Reward = 1:{rr}
              {parseFloat(rr) < 1.5 && <span className="text-danger text-xs font-normal ml-2">⚠️ Low R:R — consider adjusting targets</span>}
              {parseFloat(rr) >= 2 && <span className="text-green text-xs font-normal ml-2">✅ Good setup</span>}
            </div>
          )}

          {/* Analysis */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label">Analysis / Rationale *</label>
              <button onClick={generateAnalysis} className="text-[10px] text-green hover:underline flex items-center gap-1">
                ✨ Auto-generate from template
              </button>
            </div>
            <textarea value={form.analysis} onChange={e => setForm(f=>({...f,analysis:e.target.value}))}
              className="input resize-none h-28 text-sm leading-relaxed"
              placeholder="Technical analysis, chart patterns, key levels, market context..."/>
            <p className="text-[10px] text-subtle mt-1">{form.analysis.length} chars · Visible to subscribers</p>
          </div>

          {/* Target plan */}
          <div>
            <label className="label">Visible to (minimum plan)</label>
            <div className="grid grid-cols-4 gap-2">
              {PLAN_TIERS.map(tier => (
                <button key={tier.name} onClick={() => setForm(f=>({...f,targetPlan:tier.name}))}
                  className={clsx('flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-bold transition-all',
                    form.targetPlan===tier.name ? `${tier.bg} border-current ${tier.color}` : 'border-border text-muted hover:border-border2')}>
                  <span className="text-base">{tier.badge}</span>
                  <span>{tier.name}</span>
                  <span className="text-[9px] opacity-60 font-normal">{tier.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 justify-center py-3 font-bold">
              {loading ? <Loader2 size={16} className="animate-spin"/> : `📤 Publish to ${PLAN_TIERS.find(p=>p.name===form.targetPlan)?.label}`}
            </button>
          </div>
        </div>
      )}

      {/* ── Signals List ──────────────────────────────────── */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <p className="section-title text-sm">{signals.length} Total Signals</p>
          <div className="flex gap-2 text-[10px] text-subtle">
            <span className="text-green font-bold">{signals.filter(s=>s.status==='ACTIVE').length} Live</span>
            <span>{signals.filter(s=>s.status==='CLOSED_TP').length} TP</span>
            <span>{signals.filter(s=>s.status==='CLOSED_SL').length} SL</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-card2">
                {['Pair','Dir','Entry','SL','TP1','Plan','Status','P&L','Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] text-subtle uppercase tracking-wider px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {signals.length === 0 && (
                <tr><td colSpan={9} className="text-center py-10 text-muted">No signals yet. Create the first one!</td></tr>
              )}
              {signals.map((s: any) => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-white/3 transition-all">
                  <td className="px-4 py-3 font-display font-bold text-white whitespace-nowrap">{s.pair}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('text-[10px] font-black px-2 py-0.5 rounded-full', s.direction==='BUY'?'bg-green/15 text-green':'bg-danger/15 text-danger')}>
                      {s.direction==='BUY'?'▲':'▼'} {s.direction}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-white">{Number(s.entryPrice).toFixed(4)}</td>
                  <td className="px-4 py-3 font-mono text-danger">{Number(s.stopLoss).toFixed(4)}</td>
                  <td className="px-4 py-3 font-mono text-green">{Number(s.takeProfit1).toFixed(4)}</td>
                  <td className="px-4 py-3">
                    {(() => {
                      const plan = s.metadata?.targetPlan || 'FREE';
                      const tier = PLAN_TIERS.find(p=>p.name===plan) || PLAN_TIERS[0];
                      return <span className={clsx('text-[10px] font-bold', tier.color)}>{tier.badge} {plan}</span>;
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full',
                      s.status==='ACTIVE'?'bg-gold/15 text-gold':s.status==='CLOSED_TP'?'bg-green/15 text-green':'bg-danger/15 text-danger')}>
                      {s.status==='ACTIVE'?'● LIVE':s.status==='CLOSED_TP'?'✅ TP':'❌ SL'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold">
                    {s.pnlPercent!=null ? (
                      <span className={Number(s.pnlPercent)>=0?'text-green':'text-danger'}>
                        {Number(s.pnlPercent)>=0?'+':''}{Number(s.pnlPercent).toFixed(2)}%
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {s.status === 'ACTIVE' && (
                        <>
                          <button onClick={() => { const pnl = parseFloat(prompt('P&L % (e.g. 3.5):')||'0'); closeSignal(s.id,'CLOSED_TP',pnl); }}
                            className="px-2 py-1 text-[10px] bg-green/10 border border-green/20 rounded-lg text-green font-bold hover:bg-green/20">TP Hit</button>
                          <button onClick={() => { const pnl = parseFloat(prompt('P&L % (e.g. -1.5):')||'0'); closeSignal(s.id,'CLOSED_SL',pnl); }}
                            className="px-2 py-1 text-[10px] bg-danger/10 border border-danger/20 rounded-lg text-danger font-bold hover:bg-danger/20">SL Hit</button>
                        </>
                      )}
                      <button onClick={() => deleteSignal(s.id)} className="px-2 py-1 text-[10px] bg-white/5 border border-border rounded-lg text-muted hover:text-danger hover:border-danger/30">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
