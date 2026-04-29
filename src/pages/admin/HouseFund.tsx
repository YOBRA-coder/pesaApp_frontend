import { useState, useEffect } from 'react';
import { api, apiGet } from '@/services/api';
import { formatKES, formatDate } from '@/utils/format';
import { DollarSign, TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, Gamepad2, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

// ── House wallet balance component ────────────────────────────
function HouseWallet() {
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [depositAmt, setDepositAmt] = useState('');
  const [withdrawAmt, setWithdrawAmt] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const load = () => {
    setLoading(true);
    apiGet('/admin/house/balance').then(setBalance).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDeposit = async () => {
    const amt = parseFloat(depositAmt);
    if (!amt || amt < 100) return toast.error('Min KES 100');
    setDepositing(true);
    try {
      await api.post('/admin/house/deposit', { amount: amt, description: 'Admin house fund deposit' });
      toast.success(`House fund increased by ${formatKES(amt)}`);
      setDepositAmt(''); setShowDeposit(false); load();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setDepositing(false); }
  };

  const handleWithdraw = async () => {
    const amt = parseFloat(withdrawAmt);
    if (!amt || amt < 100) return toast.error('Min KES 100');
    setWithdrawing(true);
    try {
      await api.post('/admin/house/withdraw', { amount: amt, description: 'Admin profit withdrawal' });
      toast.success(`KES ${formatKES(amt)} withdrawn from house`);
      setWithdrawAmt(''); setShowWithdraw(false); load();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setWithdrawing(false); }
  };

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title flex items-center gap-2"><DollarSign size={16} className="text-green" /> House Fund</h2>
        <button onClick={load} className="text-subtle hover:text-muted"><RefreshCw size={14} /></button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="animate-spin text-green" size={24} /></div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'House Balance', value: formatKES(balance?.balance || 0), color: 'text-green', big: true },
              { label: 'Total Deposited', value: formatKES(balance?.totalDeposited || 0), color: 'text-blue' },
              { label: 'Total Withdrawn', value: formatKES(balance?.totalWithdrawn || 0), color: 'text-gold' },
            ].map(s => (
              <div key={s.label} className="bg-card2 border border-border rounded-xl p-3 text-center">
                <p className={clsx('font-display font-bold leading-none', s.big ? 'text-2xl' : 'text-lg', s.color)}>{s.value}</p>
                <p className="text-[10px] text-subtle mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setShowDeposit(s => !s); setShowWithdraw(false); }} className="btn-primary flex-1 justify-center text-sm py-2.5">
              <ArrowDownLeft size={14} /> Deposit to House
            </button>
            <button onClick={() => { setShowWithdraw(s => !s); setShowDeposit(false); }}
              className="flex-1 justify-center text-sm py-2.5 flex items-center gap-2 font-semibold rounded-xl border border-border text-muted hover:text-white hover:border-border2 transition-all">
              <ArrowUpRight size={14} /> Withdraw Profit
            </button>
          </div>

          {showDeposit && (
            <div className="bg-card2 border border-green/20 rounded-xl p-4 space-y-3 animate-slide-up">
              <p className="text-sm font-semibold text-white">Deposit to House Fund</p>
              <p className="text-xs text-subtle">Add funds to the house wallet. This increases your capacity to pay out winnings.</p>
              <input type="number" value={depositAmt} onChange={e => setDepositAmt(e.target.value)} className="input text-sm" placeholder="Amount (KES)" />
              <div className="flex gap-2">
                <button onClick={() => setShowDeposit(false)} className="btn-ghost flex-1 justify-center text-sm py-2">Cancel</button>
                <button onClick={handleDeposit} disabled={depositing} className="btn-primary flex-1 justify-center text-sm py-2">
                  {depositing ? <Loader2 size={14} className="animate-spin" /> : 'Deposit'}
                </button>
              </div>
            </div>
          )}

          {showWithdraw && (
            <div className="bg-card2 border border-gold/20 rounded-xl p-4 space-y-3 animate-slide-up">
              <p className="text-sm font-semibold text-white">Withdraw Profits</p>
              <p className="text-xs text-subtle">Withdraw accumulated house profits via M-Pesa to admin phone.</p>
              <input type="number" value={withdrawAmt} onChange={e => setWithdrawAmt(e.target.value)} className="input text-sm" placeholder="Amount (KES)" />
              <div className="flex gap-2">
                <button onClick={() => setShowWithdraw(false)} className="btn-ghost flex-1 justify-center text-sm py-2">Cancel</button>
                <button onClick={handleWithdraw} disabled={withdrawing} className="btn-primary flex-1 justify-center text-sm py-2" style={{ background: '#f0c040', color: '#000' }}>
                  {withdrawing ? <Loader2 size={14} className="animate-spin" /> : '💰 Withdraw'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Game Revenue Table ────────────────────────────────────────
function GameRevenueTable() {
  const [data, setData] = useState<any[]>([]);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiGet('/admin/revenue/games', { period }).then((d: any) => setData(d.data || [])).finally(() => setLoading(false));
  }, [period]);

  const totals = data.reduce((acc, r) => ({
    totalBets: acc.totalBets + Number(r.totalBets || 0),
    totalPayout: acc.totalPayout + Number(r.totalPayout || 0),
    houseProfit: acc.houseProfit + Number(r.houseProfit || 0),
  }), { totalBets: 0, totalPayout: 0, houseProfit: 0 });

  const gameIcons: Record<string, string> = { CRASH: '✈️', MINES: '💣', DICE: '🎲', PLINKO: '🎯' };

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="section-title flex items-center gap-2"><Gamepad2 size={16} className="text-green" /> Game Revenue</h2>
        <div className="flex gap-1 bg-card2 border border-border rounded-xl p-1">
          {(['today','week','month'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all', period === p ? 'bg-green text-black' : 'text-muted hover:text-white')}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Bets', value: formatKES(totals.totalBets), color: 'text-blue' },
          { label: 'Total Payout', value: formatKES(totals.totalPayout), color: 'text-muted' },
          { label: 'House Profit', value: formatKES(totals.houseProfit), color: totals.houseProfit >= 0 ? 'text-green' : 'text-danger' },
        ].map(s => (
          <div key={s.label} className="bg-card2 border border-border rounded-xl p-3 text-center">
            <p className={clsx('font-display font-bold text-lg', s.color)}>{s.value}</p>
            <p className="text-[10px] text-subtle mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-4"><Loader2 className="animate-spin text-green" size={20} /></div>
      ) : (
        <div className="space-y-2">
          {data.map((r: any) => (
            <div key={r.gameType} className="flex items-center gap-3 py-2 px-3 bg-card2 border border-border rounded-xl">
              <span className="text-xl shrink-0">{gameIcons[r.gameType] || '🎮'}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm text-white">{r.gameType}</p>
                <p className="text-[10px] text-subtle">{r.roundCount} rounds · {r.playerCount} players</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted">Bets: {formatKES(Number(r.totalBets))}</p>
                <p className={clsx('font-display font-bold text-sm', Number(r.houseProfit) >= 0 ? 'text-green' : 'text-danger')}>
                  {Number(r.houseProfit) >= 0 ? '+' : ''}{formatKES(Number(r.houseProfit))}
                </p>
              </div>
              <div className="w-12 text-right">
                <div className="text-[10px] text-subtle">Margin</div>
                <div className={clsx('text-xs font-bold', Number(r.houseProfit) >= 0 ? 'text-green' : 'text-danger')}>
                  {Number(r.totalBets) > 0 ? ((Number(r.houseProfit) / Number(r.totalBets)) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          ))}
          {data.length === 0 && <p className="text-center text-subtle text-sm py-6">No game data for this period</p>}
        </div>
      )}
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────
export { HouseWallet, GameRevenueTable };
