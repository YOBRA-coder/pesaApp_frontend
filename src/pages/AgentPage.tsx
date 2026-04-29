import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { apiGet, api } from '@/services/api';
import { formatKES, formatDate } from '@/utils/format';
import { Users, TrendingUp, DollarSign, Copy, QrCode, Share2, ArrowRight, Loader2 } from 'lucide-react';
import { useReferralStats } from '@/hooks/useApi';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function AgentPage() {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const { data: referralStats } = useReferralStats();
  const [tab, setTab] = useState<'overview' | 'customers' | 'earnings' | 'tools'>('overview');
  const [earningsData, setEarningsData] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === 'AGENT' || user?.role === 'ADMIN') {
      apiGet('/referrals/stats').then((d: any) => {
        if (d?.referrals) setEarningsData(d.referrals);
      }).catch(() => {});
    }
  }, [user]);

  if (user?.role !== 'AGENT' && user?.role !== 'ADMIN') {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <h1 className="page-header">Become an Agent</h1>
        <div className="card border-green/20 bg-green/5 space-y-4">
          <div className="text-4xl">🤝</div>
          <h2 className="font-display font-bold text-xl text-white">Earn More as an Agent</h2>
          <p className="text-muted text-sm leading-relaxed">
            PesaApp agents earn commission on every transaction made by their registered customers.
            Register merchants, help users onboard, and earn recurring income.
          </p>
          <ul className="space-y-2">
            {[
              'KES 200 per new customer signup',
              '0.5% commission on all customer transactions',
              'Priority customer support',
              'Agent dashboard & analytics',
              'Dedicated account manager',
            ].map(b => (
              <li key={b} className="flex items-center gap-2 text-sm text-muted">
                <span className="text-green font-bold">✓</span> {b}
              </li>
            ))}
          </ul>
          <button onClick={() => toast.success('Application submitted! We\'ll contact you within 24hrs.')} className="btn-primary w-full justify-center">
            Apply to Become Agent <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Customers', value: referralStats?.totalReferrals || 0, icon: Users, color: 'text-blue', bg: 'bg-blue/10' },
    { label: 'Active Customers', value: referralStats?.activeReferrals || 0, icon: TrendingUp, color: 'text-green', bg: 'bg-green/10' },
    { label: 'Total Earned', value: formatKES(Number(referralStats?.totalEarned || 0)), icon: DollarSign, color: 'text-gold', bg: 'bg-gold/10' },
    { label: 'This Month', value: formatKES(Number(referralStats?.totalEarned || 0) * 0.3), icon: TrendingUp, color: 'text-purple', bg: 'bg-purple/10' },
  ];

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copied!'); };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center">🤝</div>
        <div>
          <h1 className="page-header">Agent Dashboard</h1>
          <p className="text-subtle text-xs">Earn commissions by growing PesaApp</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'customers', label: '👥 Customers' },
          { id: 'earnings', label: '💰 Earnings' },
          { id: 'tools', label: '🛠 Tools' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={clsx('flex-1 py-2 rounded-lg text-xs font-semibold transition-all',
              tab === t.id ? 'bg-green text-black' : 'text-muted hover:text-white')}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {stats.map(s => (
              <div key={s.label} className="card flex items-center gap-3">
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', s.bg)}>
                  <s.icon size={18} className={s.color} />
                </div>
                <div>
                  <p className={clsx('font-display font-bold text-xl leading-none', s.color)}>{s.value}</p>
                  <p className="text-[10px] text-subtle mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Commission rates */}
          <div className="card">
            <h2 className="section-title mb-4">Commission Structure</h2>
            <div className="space-y-3">
              {[
                { action: 'New customer signup', rate: 'KES 200 flat', color: 'text-green' },
                { action: 'Customer deposit', rate: '0.5% of amount', color: 'text-blue' },
                { action: 'Customer withdrawal', rate: '0.3% of amount', color: 'text-gold' },
                { action: 'Bill payment', rate: 'KES 5 flat', color: 'text-purple' },
                { action: 'Game bet (customer)', rate: '0.2% of bet', color: 'text-blue' },
              ].map(r => (
                <div key={r.action} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted">{r.action}</span>
                  <span className={clsx('font-bold text-sm', r.color)}>{r.rate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'customers' && (
        <div className="card space-y-2">
          <h2 className="section-title mb-3">Your Customers ({referralStats?.referrals?.length || 0})</h2>
          {(referralStats?.referrals || []).length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted">No customers yet. Share your invite link!</p>
            </div>
          ) : (referralStats?.referrals || []).map((r: any, i: number) => (
            <div key={r.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
              <span className="text-subtle text-xs w-5">{i + 1}</span>
              <div className="w-8 h-8 rounded-lg bg-card2 flex items-center justify-center text-xs font-bold text-muted">
                {r.phone?.slice(-2)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{r.phone?.replace(/(\d{4})\d{4}(\d{3})/, '$1****$2')}</p>
                <p className="text-[10px] text-subtle">{formatDate(r.createdAt)}</p>
              </div>
              <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full',
                r.kycStatus === 'APPROVED' ? 'badge-success' : r.status === 'ACTIVE' ? 'badge-blue' : 'badge-muted')}>
                {r.kycStatus === 'APPROVED' ? 'Verified' : r.status === 'ACTIVE' ? 'Active' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === 'earnings' && (
        <div className="space-y-4">
          <div className="card bg-gradient-to-br from-gold/5 to-green/5 border-gold/20">
            <p className="label">Total Commissions Earned</p>
            <p className="font-display font-black text-4xl text-gold">{formatKES(Number(referralStats?.totalEarned || 0))}</p>
            <p className="text-xs text-subtle mt-2">Paid directly to your PesaApp wallet</p>
          </div>

          {/* Earnings breakdown */}
          <div className="card">
            <h2 className="section-title mb-4">Earnings History</h2>
            <div className="space-y-2">
              {(referralStats?.referrals || []).slice(0, 10).map((r: any, i: number) => (
                <div key={r.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0 text-sm">
                  <span className="text-xl">👤</span>
                  <div className="flex-1">
                    <p className="text-muted text-xs">{r.phone?.replace(/(\d{4})\d{4}(\d{3})/, '$1****$2')}</p>
                    <p className="text-subtle text-[10px]">Signup bonus</p>
                  </div>
                  <span className="text-green font-bold text-sm">+KES 200</span>
                </div>
              ))}
              {!referralStats?.referrals?.length && (
                <p className="text-muted text-sm text-center py-6">No earnings yet. Invite customers to start earning!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'tools' && (
        <div className="space-y-4">
          {/* Invite link */}
          <div className="card space-y-3">
            <h2 className="section-title flex items-center gap-2"><Share2 size={15} /> Your Invite Link</h2>
            <div
              onClick={() => copy(referralStats?.referralLink || '')}
              className="flex items-center gap-3 bg-bg border border-dashed border-green/30 rounded-xl px-4 py-3 cursor-pointer hover:border-green/60 transition-all">
              <span className="flex-1 text-green font-mono text-sm truncate">{referralStats?.referralLink || 'Loading...'}</span>
              <Copy size={14} className="text-green shrink-0" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => copy(referralStats?.referralCode || '')} className="btn-ghost justify-center text-sm">
                <Copy size={14} /> Copy Code
              </button>
              <button onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'Join PesaApp', url: referralStats?.referralLink || '' });
                } else {
                  copy(referralStats?.referralLink || '');
                }
              }} className="btn-primary justify-center text-sm">
                <Share2 size={14} /> Share Link
              </button>
            </div>
          </div>

          {/* Marketing materials */}
          <div className="card space-y-3">
            <h2 className="section-title">Marketing Messages</h2>
            <p className="text-subtle text-xs">Copy these messages to share on WhatsApp, SMS, or social media</p>
            {[
              {
                label: 'WhatsApp (Swahili)',
                msg: `Jiunge na PesaApp! App bora ya pesa Kenya 🇰🇪\n✅ Weka pesa kupitia M-Pesa\n✅ Lipa bili za KPLC & maji\n✅ Grama mchezo wa Aviator\n✅ Pata ishara za forex & crypto\n\nJiunge ukitumia link yangu: ${referralStats?.referralLink || '[link]'}\nCode: ${referralStats?.referralCode || '—'}`,
              },
              {
                label: 'English SMS',
                msg: `Try PesaApp - Kenya's smartest money app! Deposit via M-Pesa, pay bills, earn from games & invest. Join using my link: ${referralStats?.referralLink || '[link]'}`,
              },
            ].map(m => (
              <div key={m.label} className="bg-card2 border border-border rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-semibold text-muted">{m.label}</p>
                  <button onClick={() => copy(m.msg)} className="text-[10px] text-green hover:underline flex items-center gap-1">
                    <Copy size={10} /> Copy
                  </button>
                </div>
                <p className="text-xs text-subtle leading-relaxed whitespace-pre-line">{m.msg}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
