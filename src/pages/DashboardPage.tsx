import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowDownLeft, ArrowUpRight, Send, Zap, Wifi, Droplets, ChevronRight, AlertTriangle, TrendingUp } from 'lucide-react';
import { useWallet, useTransactions, useSignals } from '@/hooks/useApi';
import { useAuthStore } from '@/store/authStore';
import { formatKES, formatDate, txTypeIcon, txTypeColor } from '@/utils/format';
import { PromoBanner, LiveStatsTicker, GamePreviews, bannerStyles } from '@/components/banners/PromoBanner';
import clsx from 'clsx';

const QUICK_ACTIONS = [
  { icon: ArrowDownLeft, label: 'Deposit', to: '/wallet?tab=deposit', color: 'text-green', bg: 'bg-green/10', border: 'border-green/20' },
  { icon: ArrowUpRight, label: 'Withdraw', to: '/wallet?tab=withdraw', color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20' },
  { icon: Send, label: 'Send', to: '/send', color: 'text-blue', bg: 'bg-blue/10', border: 'border-blue/20' },
  { icon: Zap, label: 'Airtime', to: '/bills?tab=airtime', color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/20' },
  { icon: Wifi, label: 'KPLC', to: '/bills?tab=kplc', color: 'text-purple', bg: 'bg-purple/10', border: 'border-purple/20' },
  { icon: Droplets, label: 'Water', to: '/bills?tab=water', color: 'text-blue', bg: 'bg-blue/10', border: 'border-blue/20' },
];

// ── Balance counter animation ─────────────────────────────────
function AnimatedBalance({ value, show }: { value: number; show: boolean }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    if (!show) return;
    const diff = value - displayed;
    if (Math.abs(diff) < 0.01) return;
    const steps = 30;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(prev => prev + diff / steps);
      if (i >= steps) { clearInterval(iv); setDisplayed(value); }
    }, 16);
    return () => clearInterval(iv);
  }, [value, show]);

  if (!show) return <span>KES ••••••</span>;
  return <span>KES {displayed.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [showBal, setShowBal] = useState(true);
  const { data: wallet } = useWallet();
  const { data: txData } = useTransactions(1);
  const { data: signals } = useSignals();
  const recentTxs = txData?.transactions?.slice(0, 4) || [];

  return (
    <>
      <style>{bannerStyles}</style>
      <div className="space-y-5">

        {/* KYC banner */}
        {user?.kycStatus !== 'APPROVED' && (
          <div onClick={() => navigate('/kyc')}
            className="flex items-center gap-3 bg-gold/5 border border-gold/20 rounded-2xl p-4 cursor-pointer hover:bg-gold/8 transition-all animate-slide-up">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center"><AlertTriangle size={18} className="text-gold" /></div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gold">Complete KYC Verification</p>
              <p className="text-[11px] text-subtle mt-0.5">Verify ID → Unlock deposits up to KES 300,000/day</p>
            </div>
            <ChevronRight size={16} className="text-gold" />
          </div>
        )}

        {/* Live Stats */}
        <LiveStatsTicker />

        {/* Promo Banner */}
        <PromoBanner />

        {/* Balance Hero */}
        <div className="card relative overflow-hidden animate-slide-up" style={{ background: 'linear-gradient(135deg, #0f1623 0%, #0d1522 100%)' }}>
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,229,122,0.06) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green/20 to-transparent" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] text-subtle uppercase tracking-widest font-semibold">Total Balance</p>
              <button onClick={() => setShowBal(s => !s)} className="text-subtle hover:text-muted transition-colors">
                {showBal ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
            </div>

            <h2 className="font-display font-black text-4xl md:text-5xl text-white mb-1" style={{ textShadow: '0 0 30px rgba(0,229,122,0.15)' }}>
              <AnimatedBalance value={Number(wallet?.balance || 0)} show={showBal} />
            </h2>

            <div className="flex items-center gap-3 text-xs text-subtle mb-5 flex-wrap">
              <span className="flex items-center gap-1 bg-green/10 text-green px-2 py-0.5 rounded-full">▲ +12.4% this week</span>
              <span>Locked: {showBal ? formatKES(Number(wallet?.lockedBalance || 0)) : '••••'}</span>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button onClick={() => navigate('/wallet?tab=deposit')} className="btn-primary text-sm py-2.5"><ArrowDownLeft size={14} /> Deposit</button>
              <button onClick={() => navigate('/wallet?tab=withdraw')} className="btn-ghost text-sm py-2.5"><ArrowUpRight size={14} /> Withdraw</button>
              <button onClick={() => navigate('/send')} className="btn-ghost text-sm py-2.5"><Send size={14} /> Send</button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="section-title text-sm">Quick Actions</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {QUICK_ACTIONS.map(a => (
              <button key={a.label} onClick={() => navigate(a.to)}
                className={clsx('flex flex-col items-center gap-2.5 py-4 px-2 rounded-2xl border bg-card hover:bg-card2 transition-all duration-200 active:scale-95 hover:scale-[1.03]', a.border)}>
                <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center', a.bg)}>
                  <a.icon size={18} className={a.color} />
                </div>
                <span className="text-[11px] text-muted font-medium">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Games */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="section-title text-sm flex items-center gap-2">🎮 Games</p>
            <button onClick={() => navigate('/games')} className="text-xs text-green hover:underline flex items-center gap-1">View All <ChevronRight size={12} /></button>
          </div>
          <GamePreviews />
        </div>

        {/* Signals + Transactions */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Active signals */}
          {(signals as any[])?.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <p className="section-title text-sm flex items-center gap-2"><TrendingUp size={14} className="text-green" /> Signals</p>
                <button onClick={() => navigate('/invest')} className="text-xs text-green hover:underline flex items-center gap-1">Trade <ChevronRight size={12} /></button>
              </div>
              <div className="space-y-2">
                {(signals as any[]).slice(0, 3).map((sig: any) => (
                  <div key={sig.id} onClick={() => navigate('/invest')} className="flex items-center gap-3 py-2 px-3 hover:bg-white/5 rounded-xl cursor-pointer transition-all">
                    <span className={clsx('text-[10px] font-black px-2.5 py-1 rounded-full min-w-[36px] text-center', sig.direction === 'BUY' ? 'bg-green/15 text-green' : 'bg-danger/15 text-danger')}>
                      {sig.direction}
                    </span>
                    <div className="flex-1">
                      <p className="font-display font-bold text-sm text-white">{sig.pair}</p>
                      <p className="text-[10px] text-subtle">{sig.assetType} · Entry {Number(sig.entryPrice).toFixed(4)}</p>
                    </div>
                    {sig.pnlPercent !== null && sig.pnlPercent !== undefined && (
                      <span className={clsx('font-bold text-sm', Number(sig.pnlPercent) >= 0 ? 'text-green' : 'text-danger')}>
                        {Number(sig.pnlPercent) > 0 ? '+' : ''}{Number(sig.pnlPercent).toFixed(2)}%
                      </span>
                    )}
           
                    {sig.targetPlan && (
                      <span className={clsx('text-[10px] font-bold px-2.5 py-1 rounded-full min-w-[36px] text-center', 
                        sig.targetPlan === 'FREE' ? 'bg-gray-500/15 text-gray-500' :
                        sig.targetPlan === 'BASIC' ? 'bg-green/15 text-green' :
                        sig.targetPlan === 'PRO' ? 'bg-blue/15 text-blue' :
                        sig.targetPlan === 'VIP' ? 'bg-purple/15 text-purple' : 'bg-muted/15 text-muted')}>
                        {sig.targetPlan}
                      </span>
                    )}

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <p className="section-title text-sm">Recent Activity</p>
              <button onClick={() => navigate('/transactions')} className="text-xs text-green hover:underline flex items-center gap-1">All <ChevronRight size={12} /></button>
            </div>
            <div className="space-y-1">
              {recentTxs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-2">💳</p>
                  <p className="text-subtle text-sm">No transactions yet</p>
                  <button onClick={() => navigate('/wallet?tab=deposit')} className="btn-primary mt-3 mx-auto text-xs py-2 px-4">Make first deposit</button>
                </div>
              ) : recentTxs.map((tx: any) => (
                <div key={tx.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0 hover:bg-white/3 -mx-1 px-1 rounded-lg transition-all">
                  <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0', txTypeColor(tx.type))}>{txTypeIcon(tx.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{tx.description || tx.type.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-subtle mt-0.5">{formatDate(tx.createdAt)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={clsx('font-display font-bold text-xs', ['DEPOSIT','RECEIVE','GAME_WIN','REFERRAL_BONUS'].includes(tx.type) ? 'text-green' : 'text-danger')}>
                      {['DEPOSIT','RECEIVE','GAME_WIN','REFERRAL_BONUS'].includes(tx.type) ? '+' : '-'}{formatKES(Number(tx.amount))}
                    </p>
                    <p className={clsx('text-[10px]', tx.status === 'COMPLETED' ? 'text-green/50' : tx.status === 'FAILED' ? 'text-danger/50' : 'text-gold/50')}>{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Referral CTA */}
        <div className="card bg-gradient-to-br from-green/5 to-blue/5 border-green/10 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 text-8xl opacity-10">👥</div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="text-4xl">👥</div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-white">Earn KES 200 per referral</h3>
              <p className="text-xs text-subtle mt-1">Invite friends. They join. You earn instantly — no limits!</p>
            </div>
            <button onClick={() => navigate('/referrals')} className="btn-primary shrink-0 text-sm">
              Invite Now
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
