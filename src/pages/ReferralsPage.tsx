import { useState } from 'react';
import { useReferralStats } from '@/hooks/useApi';
import { formatKES, formatDate } from '@/utils/format';
import { Copy, Share2, Users, Gift, Trophy, TrendingUp, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const TIERS = [
  { name: 'Starter', min: 0, max: 4, color: 'text-muted', bg: 'bg-white/5', bonus: 200, icon: '🌱' },
  { name: 'Bronze', min: 5, max: 19, color: 'text-amber-600', bg: 'bg-amber-600/10', bonus: 200, icon: '🥉' },
  { name: 'Silver', min: 20, max: 49, color: 'text-muted', bg: 'bg-white/10', bonus: 250, icon: '🥈' },
  { name: 'Gold', min: 50, max: 99, color: 'text-gold', bg: 'bg-gold/10', bonus: 300, icon: '🥇' },
  { name: 'Diamond', min: 100, max: Infinity, color: 'text-blue', bg: 'bg-blue/10', bonus: 400, icon: '💎' },
];

export default function ReferralsPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useReferralStats();
  const [tab, setTab] = useState<'overview' | 'friends' | 'leaderboard'>('overview');

  const total = stats?.totalReferrals || 0;
  const tier = TIERS.find(t => total >= t.min && total <= t.max) || TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(tier) + 1];

  const copy = (text: string, label = 'Copied!') => { navigator.clipboard.writeText(text); toast.success(label); };

  const shareLink = () => {
    if (navigator.share && stats?.referralLink) {
      navigator.share({ title: 'Join PesaApp', text: 'Join Kenya\'s smartest money app!', url: stats.referralLink });
    } else {
      copy(stats?.referralLink || '');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Users size={22} className="text-green" />
        <h1 className="page-header">Referrals</h1>
      </div>

      {/* Tier card */}
      <div className={clsx('card border relative overflow-hidden', tier.bg, 'border-current/20')}>
        <div className="absolute -top-8 -right-8 text-8xl opacity-10">{tier.icon}</div>
        <div className="flex items-center gap-4 relative z-10">
          <div>
            <span className="text-4xl">{tier.icon}</span>
          </div>
          <div className="flex-1">
            <p className={clsx('font-display font-black text-xl', tier.color)}>{tier.name} Agent</p>
            <p className="text-xs text-subtle mt-0.5">
              {total} referral{total !== 1 ? 's' : ''} ·
              {nextTier ? ` ${nextTier.min - total} more for ${nextTier.name}` : ' Max tier reached! 🎉'}
            </p>
            {nextTier && (
              <div className="mt-2">
                <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((total - tier.min) / (nextTier.min - tier.min)) * 100)}%`, background: 'linear-gradient(90deg,#00e57a,#4d9fff)' }} />
                </div>
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-subtle">Bonus/referral</p>
            <p className={clsx('font-display font-bold text-lg', tier.color)}>KES {tier.bonus}</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Referred', value: stats?.totalReferrals || 0, icon: '👤', color: 'text-blue' },
          { label: 'Active Friends', value: stats?.activeReferrals || 0, icon: '✅', color: 'text-green' },
          { label: 'Total Earned', value: formatKES(Number(stats?.totalEarned || 0)), icon: '💰', color: 'text-gold' },
        ].map(s => (
          <div key={s.label} className="card text-center py-3">
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className={clsx('font-display font-bold text-lg', s.color)}>{s.value}</p>
            <p className="text-[10px] text-subtle mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Invite section */}
      <div className="card bg-gradient-to-br from-green/5 to-blue/5 border-green/10 space-y-4">
        <div className="flex items-center gap-3">
          <Gift size={18} className="text-green" />
          <div>
            <p className="font-semibold text-white text-sm">Invite Friends, Earn Together</p>
            <p className="text-xs text-subtle">You earn KES {tier.bonus} · They get instant access</p>
          </div>
        </div>

        {/* Code */}
        <div
          onClick={() => copy(stats?.referralCode || '', 'Code copied!')}
          className="flex items-center justify-between bg-bg border border-dashed border-green/30 rounded-xl px-4 py-3 cursor-pointer hover:border-green/60 transition-all group">
          <span className="font-display font-black text-green text-lg tracking-widest">{stats?.referralCode || '——'}</span>
          <div className="flex items-center gap-2 text-green/60 group-hover:text-green transition-colors">
            <Copy size={14} />
            <span className="text-xs">Tap to copy</span>
          </div>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => copy(stats?.referralLink || '', 'Link copied!')} className="btn-ghost justify-center text-sm py-2.5">
            <Copy size={14} /> Copy Link
          </button>
          <button onClick={shareLink} className="btn-primary justify-center text-sm py-2.5">
            <Share2 size={14} /> Share Now
          </button>
        </div>

        {/* WhatsApp quick share */}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`🇰🇪 Jiunge na PesaApp - app bora ya pesa Kenya!\n✅ Weka pesa M-Pesa\n✅ Lipa bili\n✅ Grama & invest\n\n${stats?.referralLink || ''}`)}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-sm font-semibold hover:bg-[#25D366]/15 transition-all">
          <span>💬</span> Share on WhatsApp
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
        {[{ id: 'overview', label: '📊 Overview' }, { id: 'friends', label: '👥 Friends' }, { id: 'leaderboard', label: '🏆 Leaderboard' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={clsx('flex-1 py-2 rounded-lg text-xs font-semibold transition-all', tab === t.id ? 'bg-green text-black' : 'text-muted hover:text-white')}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-3">
          {/* How it works */}
          <div className="card space-y-4">
            <h2 className="section-title">How It Works</h2>
            {[
              { step: '1', icon: '📤', title: 'Share Your Link', desc: 'Send your invite link to friends via WhatsApp, SMS, or social media' },
              { step: '2', icon: '📱', title: 'Friend Registers', desc: 'They sign up with your referral code and verify their account' },
              { step: '3', icon: '💰', title: 'You Both Earn', desc: `You get KES ${tier.bonus} instantly. Keep earning from their activity!` },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-green/10 border border-green/20 flex items-center justify-center font-display font-bold text-green text-sm shrink-0">
                  {s.step}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{s.icon} {s.title}</p>
                  <p className="text-xs text-subtle mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tier benefits */}
          <div className="card space-y-3">
            <h2 className="section-title">Tier Benefits</h2>
            {TIERS.map(t => (
              <div key={t.name} className={clsx('flex items-center gap-3 py-2 rounded-xl px-3 transition-all', tier.name === t.name ? `${t.bg} border border-current/20` : '')}>
                <span className="text-xl">{t.icon}</span>
                <div className="flex-1">
                  <p className={clsx('text-sm font-semibold', t.color)}>{t.name}</p>
                  <p className="text-[10px] text-subtle">{t.min === 0 ? '0' : t.min}–{t.max === Infinity ? '∞' : t.max} referrals</p>
                </div>
                <span className={clsx('font-display font-bold text-sm', t.color)}>KES {t.bonus}/referral</span>
                {tier.name === t.name && <span className="text-[10px] bg-green text-black font-bold px-2 py-0.5 rounded-full">YOU</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'friends' && (
        <div className="card space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title">Your Friends ({stats?.referrals?.length || 0})</h2>
          </div>
          {(stats?.referrals || []).length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="text-4xl">👥</div>
              <p className="text-muted">No friends yet</p>
              <p className="text-subtle text-sm">Share your invite link to get started</p>
              <button onClick={shareLink} className="btn-primary mx-auto">Share Invite Link</button>
            </div>
          ) : (
            (stats?.referrals || []).map((r: any, i: number) => (
              <div key={r.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                <span className="text-muted text-xs w-5 shrink-0">{i + 1}</span>
                <div className="w-8 h-8 rounded-lg bg-card2 border border-border flex items-center justify-center font-display font-bold text-xs">
                  {r.phone?.slice(-2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.phone?.replace(/(\d{4})\d{4}(\d{3})/, '$1****$2')}</p>
                  <p className="text-[10px] text-subtle">{formatDate(r.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full',
                    r.kycStatus === 'APPROVED' ? 'badge-success' : 'badge-muted')}>
                    {r.kycStatus === 'APPROVED' ? 'Verified' : 'Unverified'}
                  </span>
                  <span className="text-green font-bold text-xs">+KES {tier.bonus}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'leaderboard' && (
        <div className="card">
          <h2 className="section-title flex items-center gap-2 mb-4"><Trophy size={15} className="text-gold" /> Top Referrers This Month</h2>
          <div className="space-y-2">
            {[
              { rank: 1, name: 'David K.', referrals: 142, earned: 28400, icon: '🥇' },
              { rank: 2, name: 'Grace W.', referrals: 98, earned: 19600, icon: '🥈' },
              { rank: 3, name: 'Peter O.', referrals: 76, earned: 15200, icon: '🥉' },
              { rank: 4, name: 'Mary N.', referrals: 54, earned: 10800, icon: '4️⃣' },
              { rank: 5, name: 'James M.', referrals: 41, earned: 8200, icon: '5️⃣' },
            ].map(p => (
              <div key={p.rank} className={clsx('flex items-center gap-3 py-2.5 px-3 rounded-xl', p.rank === 1 && 'bg-gold/5 border border-gold/15')}>
                <span className="text-xl shrink-0">{p.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{p.name}</p>
                  <p className="text-[10px] text-subtle">{p.referrals} referrals</p>
                </div>
                <span className="font-display font-bold text-gold text-sm">{formatKES(p.earned)}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-[10px] text-subtle mt-4">Leaderboard resets monthly. Top 3 win bonus prizes! 🎁</p>
        </div>
      )}
    </div>
  );
}
