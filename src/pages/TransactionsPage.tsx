import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '@/hooks/useApi';
import { formatKES, formatDate, txTypeIcon, txTypeColor } from '@/utils/format';
import { ArrowLeft, X, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

type TxType = '' | 'DEPOSIT' | 'WITHDRAWAL' | 'SEND' | 'RECEIVE' | 'GAME_BET' | 'GAME_WIN' | 'BILL_PAYMENT' | 'REFERRAL_BONUS' | 'SIGNAL_SUBSCRIPTION';

// ── Transaction Detail Modal ──────────────────────────────────
function TxDetailModal({ tx, onClose }: { tx: any; onClose: () => void }) {
  const isCredit = ['DEPOSIT', 'RECEIVE', 'GAME_WIN', 'REFERRAL_BONUS'].includes(tx.type);

  const StatusIcon = tx.status === 'COMPLETED' ? CheckCircle : tx.status === 'FAILED' ? XCircle : Clock;
  const statusColor = tx.status === 'COMPLETED' ? 'text-green' : tx.status === 'FAILED' ? 'text-danger' : 'text-gold';

  const meta = tx.metadata || {};

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="section-title">Transaction Details</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-card2 flex items-center justify-center text-subtle hover:text-white transition-all">
            <X size={14} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Amount hero */}
          <div className="text-center py-4">
            <div className={clsx('w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3', txTypeColor(tx.type))}>
              {txTypeIcon(tx.type)}
            </div>
            <p className="text-[11px] text-subtle uppercase tracking-widest mb-2">{tx.type.replace(/_/g, ' ')}</p>
            <p className={clsx('font-display font-black text-4xl', isCredit ? 'text-green' : 'text-danger')}>
              {isCredit ? '+' : '-'}{formatKES(Number(tx.amount))}
            </p>
            {Number(tx.fee) > 0 && <p className="text-xs text-subtle mt-1">Fee: {formatKES(Number(tx.fee))}</p>}
          </div>

          {/* Status badge */}
          <div className={clsx('flex items-center justify-center gap-2 py-2.5 rounded-xl border',
            tx.status === 'COMPLETED' ? 'bg-green/5 border-green/20' : tx.status === 'FAILED' ? 'bg-danger/5 border-danger/20' : 'bg-gold/5 border-gold/20')}>
            <StatusIcon size={16} className={statusColor} />
            <span className={clsx('font-bold text-sm', statusColor)}>{tx.status}</span>
          </div>

          {/* Details table */}
          <div className="space-y-2 bg-card2 border border-border rounded-xl p-4">
            {[
              { label: 'Reference', value: tx.reference?.slice(0, 20) + '...' },
              tx.externalRef && { label: 'External Ref', value: tx.externalRef },
              { label: 'Date', value: formatDate(tx.createdAt) },
              tx.completedAt && { label: 'Completed', value: formatDate(tx.completedAt) },
              { label: 'Balance Before', value: formatKES(Number(tx.balanceBefore)) },
              { label: 'Balance After', value: formatKES(Number(tx.balanceAfter)) },
              tx.provider && { label: 'Provider', value: tx.provider },
              meta.phone && { label: 'Phone', value: meta.phone },
              meta.mpesaReceiptNo && { label: 'M-Pesa Receipt', value: meta.mpesaReceiptNo },
              meta.billType && { label: 'Bill Type', value: meta.billType },
              meta.accountNumber && { label: 'Account', value: meta.accountNumber },
              meta.multiplier && { label: 'Multiplier', value: `${Number(meta.multiplier).toFixed(2)}x` },
              meta.gameType && { label: 'Game', value: meta.gameType },
            ].filter(Boolean).map((row: any) => (
              <div key={row.label} className="flex items-start justify-between gap-4 text-xs">
                <span className="text-subtle shrink-0">{row.label}</span>
                <span className="text-white font-medium text-right break-all">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          {tx.description && (
            <div className="bg-card2 border border-border rounded-xl p-3">
              <p className="text-[10px] text-subtle uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-muted">{tx.description}</p>
            </div>
          )}

          {/* Failure reason */}
          {tx.status === 'FAILED' && tx.failureReason && (
            <div className="bg-danger/5 border border-danger/20 rounded-xl p-3">
              <p className="text-[10px] text-danger uppercase tracking-wider mb-1">Failure Reason</p>
              <p className="text-sm text-muted">{tx.failureReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const TX_TYPES: { value: TxType; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'DEPOSIT', label: '⬇ Deposit' },
  { value: 'WITHDRAWAL', label: '⬆ Withdraw' },
  { value: 'SEND', label: '📤 Send' },
  { value: 'RECEIVE', label: '📥 Receive' },
  { value: 'GAME_BET', label: '🎮 Bets' },
  { value: 'GAME_WIN', label: '🏆 Wins' },
  { value: 'BILL_PAYMENT', label: '⚡ Bills' },
  { value: 'REFERRAL_BONUS', label: '👥 Referral' },
];

export default function TransactionsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [type, setType] = useState<TxType>('');
  const [selected, setSelected] = useState<any | null>(null);
  const { data, isLoading } = useTransactions(page, type || undefined);

  const txs = data?.transactions || [];

  return (
    <>
      {selected && <TxDetailModal tx={selected} onClose={() => setSelected(null)} />}

      <div className="space-y-5 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-subtle hover:text-white transition-all">
            <ArrowLeft size={15} />
          </button>
          <h1 className="page-header">Transactions</h1>
        </div>

        {/* Type filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {TX_TYPES.map(t => (
            <button key={t.value || 'all'} onClick={() => { setType(t.value); setPage(1); }}
              className={clsx('shrink-0 px-3 py-1.5 text-xs rounded-lg border font-semibold transition-all whitespace-nowrap',
                type === t.value ? 'bg-green/10 border-green/30 text-green' : 'border-border text-muted hover:border-border2')}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Transactions list */}
        <div className="card p-0 overflow-hidden">
          {isLoading && (
            <div className="text-center py-10 text-subtle text-sm">Loading...</div>
          )}

          {!isLoading && txs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">💳</div>
              <p className="text-muted font-semibold">No transactions yet</p>
              <p className="text-subtle text-sm mt-1">Make a deposit to get started</p>
            </div>
          )}

          <div className="divide-y divide-border">
            {txs.map((tx: any) => {
              const isCredit = ['DEPOSIT', 'RECEIVE', 'GAME_WIN', 'REFERRAL_BONUS'].includes(tx.type);
              return (
                <button key={tx.id} onClick={() => setSelected(tx)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-white/3 transition-all text-left group">
                  {/* Icon */}
                  <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0', txTypeColor(tx.type))}>
                    {txTypeIcon(tx.type)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {tx.description || tx.type.replace(/_/g, ' ')}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[11px] text-subtle">{formatDate(tx.createdAt)}</p>
                      <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                        tx.status === 'COMPLETED' ? 'bg-green/10 text-green' : tx.status === 'FAILED' ? 'bg-danger/10 text-danger' : 'bg-gold/10 text-gold')}>
                        {tx.status}
                      </span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <p className={clsx('font-display font-bold text-sm', isCredit ? 'text-green' : 'text-danger')}>
                      {isCredit ? '+' : '-'}{formatKES(Number(tx.amount))}
                    </p>
                    <p className="text-[10px] text-subtle mt-0.5 group-hover:text-green/60 transition-colors">Tap for details</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex justify-center items-center gap-3">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="btn-ghost text-xs py-2 px-4 disabled:opacity-30">← Prev</button>
            <span className="text-sm text-muted">Page {page} of {data.totalPages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= (data.totalPages || 1)}
              className="btn-ghost text-xs py-2 px-4 disabled:opacity-30">Next →</button>
          </div>
        )}
      </div>
    </>
  );
}