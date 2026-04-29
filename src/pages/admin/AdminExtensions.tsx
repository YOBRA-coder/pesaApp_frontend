// ── Add these imports to your existing AdminPage.tsx ─────────
// import { HouseWallet, GameRevenueTable } from './admin/HouseFund';
//
// ── Add these tabs to the existing TABS array ─────────────────
// { id: 'house', label: '💰 House Fund' },
// { id: 'revenue', label: '📊 Revenue' },
//
// ── Add these tab panels in the render ───────────────────────

// House Fund tab:
/*
{activeTab === 'house' && (
  <div className="space-y-5">
    <HouseWallet />

    <div className="card">
      <h2 className="section-title mb-4">House Fund Transactions</h2>
      <HouseTransactions />
    </div>
  </div>
)}

{activeTab === 'revenue' && (
  <div className="space-y-5">
    <RevenueSummary />
    <GameRevenueTable />
  </div>
)}
*/

// ── Revenue Summary component (add to AdminPage.tsx) ─────────
import { useState, useEffect } from 'react';
import { apiGet } from '@/services/api';
import { formatKES } from '@/utils/format';
import { HouseWallet, GameRevenueTable } from './admin/HouseFund';
import clsx from 'clsx';

export function RevenueSummary() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { apiGet('/admin/revenue/summary').then(setData); }, []);

  if (!data) return null;

  return (
    <div className="card space-y-4">
      <h2 className="section-title">💰 All-Time Revenue</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Game Profits', value: formatKES(data.totalGameProfit), color: 'text-green', desc: 'House edge earnings' },
          { label: 'Transaction Fees', value: formatKES(data.totalFees), color: 'text-blue', desc: 'Withdrawal & send fees' },
          { label: 'Signal Revenue', value: formatKES(data.totalSignalRev), color: 'text-purple', desc: 'Subscription income' },
          { label: 'Total Revenue', value: formatKES(data.totalRevenue), color: 'text-gold', desc: 'Combined all streams' },
          { label: 'Game Volume', value: formatKES(data.totalGameVolume), color: 'text-muted', desc: 'Total bets placed' },
          { label: 'Net Cash', value: formatKES(data.netCash), color: data.netCash >= 0 ? 'text-green' : 'text-danger', desc: 'After deposits/withdrawals' },
        ].map(s => (
          <div key={s.label} className="bg-card2 border border-border rounded-xl p-3">
            <p className={clsx('font-display font-bold text-xl', s.color)}>{s.value}</p>
            <p className="text-xs text-white font-semibold mt-0.5">{s.label}</p>
            <p className="text-[10px] text-subtle">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HouseTransactions() {
  const [txs, setTxs] = useState<any[]>([]);
  useEffect(() => {
    apiGet('/admin/transactions', { type: 'HOUSE_DEPOSIT,HOUSE_WITHDRAWAL' }).then((d: any) => setTxs(d?.transactions || []));
  }, []);

  return (
    <div className="space-y-2">
      {txs.length === 0 && <p className="text-subtle text-sm text-center py-6">No house fund transactions yet</p>}
      {txs.map((tx: any) => (
        <div key={tx.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
          <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center text-sm',
            tx.type === 'HOUSE_DEPOSIT' ? 'bg-green/10 text-green' : 'bg-gold/10 text-gold')}>
            {tx.type === 'HOUSE_DEPOSIT' ? '⬇️' : '⬆️'}
          </div>
          <div className="flex-1">
            <p className="text-sm text-white font-medium">{tx.description}</p>
            <p className="text-[10px] text-subtle">{new Date(tx.createdAt).toLocaleString()}</p>
          </div>
          <span className={clsx('font-display font-bold text-sm', tx.type === 'HOUSE_DEPOSIT' ? 'text-green' : 'text-gold')}>
            {tx.type === 'HOUSE_DEPOSIT' ? '+' : '-'}{formatKES(Number(tx.amount))}
          </span>
        </div>
      ))}
    </div>
  );
}
