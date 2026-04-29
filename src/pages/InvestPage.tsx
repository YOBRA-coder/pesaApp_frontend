import { useState } from 'react';
import { TrendingUp, TrendingDown, Lock, Unlock, Star, AlertCircle, Clock, CheckCircle, XCircle, BarChart2, Globe, Bitcoin } from 'lucide-react';
import { useSignals, useSignalSubscription, useSubscribeSignals } from '@/hooks/useApi';
import { formatKES } from '@/utils/format';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

const PLANS = [
  {
    name: 'BASIC', price: 500, color: 'border-border',
    features: ['5 signals/week', 'Forex majors only', 'Entry & TP levels', 'SMS alerts'],
    accent: 'text-muted',
  },
  {
    name: 'PRO', price: 1500, color: 'border-green/40', popular: true,
    features: ['Daily signals', 'Forex + Crypto', 'Full analysis', 'WhatsApp alerts', 'Signal history'],
    accent: 'text-green',
  },
  {
    name: 'VIP', price: 3000, color: 'border-gold/40',
    features: ['Unlimited signals', 'All markets', 'Video analysis', 'Direct analyst access', '1-on-1 trade review', 'Portfolio tracking'],
    accent: 'text-gold',
  },
];

const MARKET_PRICES = [
  { pair: 'EUR/USD', price: '1.0842', change: '+0.12%', up: true, type: 'forex' },
  { pair: 'GBP/USD', price: '1.2680', change: '-0.08%', up: false, type: 'forex' },
  { pair: 'USD/KES', price: '129.40', change: '+0.24%', up: true, type: 'forex' },
  { pair: 'BTC/USD', price: '67,842', change: '+2.1%', up: true, type: 'crypto' },
  { pair: 'ETH/USD', price: '3,521', change: '+1.4%', up: true, type: 'crypto' },
  { pair: 'XAU/USD', price: '2,341', change: '-0.3%', up: false, type: 'commodity' },
];

function SignalCard({ signal, hasAccess }: { signal: any; hasAccess: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const isBuy = signal.direction === 'BUY';
  const isActive = signal.status === 'ACTIVE';
  const isTP = signal.status === 'CLOSED_TP';
  const isSL = signal.status === 'CLOSED_SL';

  const pnlColor = isTP ? 'text-green' : isSL ? 'text-danger' : 'text-muted';
  const pnlBg = isTP ? 'bg-green/10 border-green/20' : isSL ? 'bg-danger/10 border-danger/20' : 'bg-card2 border-border';

  return (
    <div className={clsx('card border cursor-pointer hover:border-border2 transition-all', pnlBg)} onClick={() => setExpanded(e => !e)}>
      <div className="flex items-center gap-3">
        {/* Asset icon */}
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-sm shrink-0',
          isBuy ? 'bg-green/10 text-green' : 'bg-danger/10 text-danger')}>
          {signal.assetType === 'CRYPTO' ? '₿' : signal.assetType === 'COMMODITY' ? '🥇' : '💱'}
        </div>

        {/* Pair + direction */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display font-bold text-white">{signal.pair}</span>
            <span className={clsx('text-[10px] font-black px-2.5 py-0.5 rounded-full',
              isBuy ? 'bg-green/15 text-green' : 'bg-danger/15 text-danger')}>
              {isBuy ? '▲ BUY' : '▼ SELL'}
            </span>
            <span className="text-[10px] text-subtle">{signal.assetType}</span>
            {isActive && <span className="flex items-center gap-1 text-[10px] text-gold"><span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />LIVE</span>}
            {isTP && <span className="flex items-center gap-1 text-[10px] text-green"><CheckCircle size={10} />TP HIT</span>}
            {isSL && <span className="flex items-center gap-1 text-[10px] text-danger"><XCircle size={10} />SL HIT</span>}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-[11px] text-subtle flex-wrap">
            <span>Entry: <strong className="text-white">{Number(signal.entryPrice).toLocaleString()}</strong></span>
            <span>TP: <strong className="text-green">{Number(signal.takeProfit1).toLocaleString()}</strong></span>
            <span>SL: <strong className="text-danger">{Number(signal.stopLoss).toLocaleString()}</strong></span>
          </div>
        </div>

        {/* P&L */}
        <div className="text-right shrink-0">
          {signal.pnlPercent !== null && signal.pnlPercent !== undefined && (
            <p className={clsx('font-display font-bold text-lg', pnlColor)}>
              {signal.pnlPercent > 0 ? '+' : ''}{Number(signal.pnlPercent).toFixed(2)}%
            </p>
          )}
          <p className="text-[10px] text-subtle">{formatDistanceToNow(new Date(signal.createdAt), { addSuffix: true })}</p>
        </div>
      </div>

      {/* Expanded analysis */}
      {expanded && signal.analysis && (
        <div className="mt-3 pt-3 border-t border-border">
          {hasAccess ? (
            <div className="space-y-2">
              <p className="text-xs text-muted leading-relaxed">{signal.analysis}</p>
              {signal.takeProfit2 && (
                <div className="flex gap-4 text-xs">
                  <span className="text-subtle">TP2: <strong className="text-green">{Number(signal.takeProfit2).toLocaleString()}</strong></span>
                  {signal.takeProfit3 && <span className="text-subtle">TP3: <strong className="text-green">{Number(signal.takeProfit3).toLocaleString()}</strong></span>}
                </div>
              )}
              {/* Future: Copy Trade button */}
              <div className="flex gap-2 mt-2">
                <button className="px-3 py-1.5 text-xs bg-green/10 border border-green/20 rounded-lg text-green font-semibold hover:bg-green/20 transition-all" disabled>
                  📊 Copy Trade (Coming Soon)
                </button>
                <button className="px-3 py-1.5 text-xs bg-card border border-border rounded-lg text-muted hover:text-white transition-all">
                  📤 Share Signal
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-subtle bg-card rounded-xl p-3 border border-border">
              <Lock size={14} className="text-gold" />
              <span>Subscribe to view full analysis & copy trades</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InvestPage() {
  const [tab, setTab] = useState<'signals' | 'markets' | 'plans'>('signals');
  const [filter, setFilter] = useState<'all' | 'FOREX' | 'CRYPTO' | 'COMMODITY'>('all');
  const { data: signals = [] } = useSignals();
  const { data: sub } = useSignalSubscription();
  const subscribe = useSubscribeSignals();

  const hasAccess = !!(sub?.isActive && new Date(sub.expiresAt) > new Date());
  const filteredSignals = filter === 'all' ? signals : signals.filter((s: any) => s.assetType === filter);
  const activeSignals = signals.filter((s: any) => s.status === 'ACTIVE');
  const closedSignals = signals.filter((s: any) => s.status !== 'ACTIVE');
  const winRate = closedSignals.length ? Math.round(closedSignals.filter((s: any) => s.status === 'CLOSED_TP').length / closedSignals.length * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <TrendingUp size={22} className="text-green" />
          <h1 className="page-header">Invest & Signals</h1>
        </div>
        {hasAccess ? (
          <div className="flex items-center gap-2 bg-green/10 border border-green/20 rounded-full px-4 py-1.5">
            <Unlock size={14} className="text-green" />
            <span className="text-green text-xs font-bold">{sub.planName} — Active</span>
          </div>
        ) : (
          <button onClick={() => setTab('plans')} className="flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 hover:bg-gold/15 transition-all">
            <Lock size={14} className="text-gold" />
            <span className="text-gold text-xs font-bold">Subscribe for Full Access</span>
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Signals', value: activeSignals.length, icon: BarChart2, color: 'text-green' },
          { label: 'Win Rate', value: `${winRate}%`, icon: TrendingUp, color: 'text-gold' },
          { label: 'Total Signals', value: signals.length, icon: Globe, color: 'text-blue' },
          { label: 'Avg Return', value: '+3.4%', icon: Star, color: 'text-purple' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-3 py-3">
            <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center bg-current/10', s.color)}>
              <s.icon size={15} className={s.color} />
            </div>
            <div>
              <p className={clsx('font-display font-bold text-lg leading-none', s.color)}>{s.value}</p>
              <p className="text-[10px] text-subtle mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
        {[
          { id: 'signals', label: '📈 Signals' },
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

      {/* Signals tab */}
      {tab === 'signals' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'FOREX', 'CRYPTO', 'COMMODITY'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize',
                  filter === f ? 'bg-green/10 border-green/40 text-green' : 'border-border text-muted hover:border-border2')}>
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
                {filteredSignals.filter((s: any) => s.status === 'ACTIVE').map((s: any) => (
                  <SignalCard key={s.id} signal={s} hasAccess={hasAccess} />
                ))}
              </div>
            </div>
          )}

          {/* Closed signals */}
          {closedSignals.length > 0 && (
            <div>
              <p className="text-xs text-subtle uppercase tracking-wider mb-2 font-semibold mt-2">
                <Clock size={12} className="inline mr-1" />Closed Signals
              </p>
              <div className="space-y-2">
                {filteredSignals.filter((s: any) => s.status !== 'ACTIVE').map((s: any) => (
                  <SignalCard key={s.id} signal={s} hasAccess={hasAccess} />
                ))}
              </div>
            </div>
          )}

          {filteredSignals.length === 0 && (
            <div className="card text-center py-12">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-muted font-semibold">No signals yet</p>
              <p className="text-subtle text-sm mt-1">Our analysts are preparing the next signal</p>
            </div>
          )}

          {/* Coming soon: Direct trading */}
          <div className="card border-blue/20 bg-blue/5">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-blue shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">Direct Trading — Coming Soon</p>
                <p className="text-xs text-subtle mt-1">In the next update, you'll be able to copy trades directly from signals and track your portfolio in real-time — all within PesaApp.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Markets tab */}
      {tab === 'markets' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MARKET_PRICES.map(m => (
              <div key={m.pair} className="card flex items-center gap-3 hover:border-border2 transition-all">
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm',
                  m.type === 'crypto' ? 'bg-gold/10 text-gold' : m.type === 'commodity' ? 'bg-amber-700/20 text-amber-400' : 'bg-blue/10 text-blue')}>
                  {m.type === 'crypto' ? '₿' : m.type === 'commodity' ? '🥇' : '💱'}
                </div>
                <div className="flex-1">
                  <p className="font-display font-bold text-sm text-white">{m.pair}</p>
                  <p className="text-[10px] text-subtle capitalize">{m.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-sm text-white">{m.price}</p>
                  <p className={clsx('text-xs font-semibold', m.up ? 'text-green' : 'text-danger')}>
                    {m.up ? '▲' : '▼'} {m.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="card border-blue/20 bg-blue/5 text-center py-6">
            <TrendingUp size={28} className="text-blue mx-auto mb-2" />
            <p className="font-semibold text-white">Live Charts Coming Soon</p>
            <p className="text-xs text-subtle mt-1">Interactive TradingView charts will be integrated in the next update</p>
          </div>
        </div>
      )}

      {/* Plans tab */}
      {tab === 'plans' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLANS.map(plan => {
              const isActive = hasAccess && sub?.planName === plan.name;
              return (
                <div key={plan.name} className={clsx('card flex flex-col relative', plan.color, plan.popular && 'ring-1 ring-green/30')}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green text-black text-[10px] font-black px-3 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={14} className={plan.accent} />
                    <span className={clsx('font-display font-bold', plan.accent)}>{plan.name}</span>
                  </div>
                  <p className="font-display font-black text-3xl text-white mb-1">
                    {formatKES(plan.price)}
                    <span className="text-xs text-subtle font-sans font-normal">/month</span>
                  </p>
                  <ul className="space-y-2 flex-1 mt-3 mb-4">
                    {plan.features.map(f => (
                      <li key={f} className="text-xs text-muted flex items-center gap-2">
                        <span className="text-green font-bold">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => !isActive && subscribe.mutate(plan.name)}
                    disabled={isActive || subscribe.isPending}
                    className={clsx('w-full py-2.5 rounded-xl text-sm font-bold transition-all border',
                      isActive ? 'bg-green/10 text-green border-green/30 cursor-default'
                      : plan.popular ? 'bg-green text-black border-transparent hover:bg-green-dark'
                      : 'bg-white/5 text-white border-border hover:border-border2')}>
                    {isActive ? '✅ Active Plan' : subscribe.isPending ? 'Processing...' : `Subscribe — ${formatKES(plan.price)}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
